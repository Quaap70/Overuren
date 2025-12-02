<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Overuren;
use App\Models\Saldo;
use App\Models\UrenMutatie;
use App\Models\UrenBaseline;
use App\Models\Notificatie;
use App\Services\SaldoService;
use App\Services\MonthCalendarService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HRController extends Controller
{
    public function __construct(
        private SaldoService $saldoService,
        private MonthCalendarService $monthCalendarService,
    ) {}

    /**
     * HR Dashboard
     */
    public function dashboard(Request $request)
    {
        $huidigJaar = now()->year;
        $huidigeMaand = now()->month;
        $vorigJaar = $huidigJaar - 1;

        // Jaaracties (HR) status
        $baselineHuidigBestaat = UrenBaseline::where('jaar', $huidigJaar)->exists();
        $openVorigJaarCount = UrenBaseline::where('jaar', $vorigJaar)
            ->where('status', UrenBaseline::STATUS_OPEN)
            ->count();
        // Aantal openstaande (niet‑goedgekeurde) overuren in vorig jaar
        $pendingPrevYearCount = Overuren::where('status', 'INGEDIEND')
            ->where('jaar', $vorigJaar)
            ->count();

        // Medewerker selectie (live search)
        $zoek = (string) $request->query('zoek', '');
        $commit = (bool) $request->boolean('commit', false);
        $medewerkerId = $request->integer('medewerker');
        $jaar = (int) ($request->query('year', $huidigJaar));
        $maand = (int) ($request->query('month', $huidigeMaand));

        $medewerkerQuery = User::query()
            ->where('role', 'MEDEWERKER')
            ->where('is_active', true);
        if ($zoek !== '') {
            $medewerkerQuery->where(function ($q) use ($zoek) {
                $q->where('voornaam', 'like', "%{$zoek}%")
                    ->orWhere('achternaam', 'like', "%{$zoek}%")
                    ->orWhere('username', 'like', "%{$zoek}%")
                    ->orWhere('email', 'like', "%{$zoek}%");

                // Extra: match "voornaam achternaam" of "achternaam voornaam" wanneer beide worden getypt
                $parts = preg_split('/\s+/', trim($zoek));
                if (is_array($parts) && count($parts) >= 2) {
                    $first = $parts[0];
                    $last = $parts[count($parts) - 1];
                    $q->orWhere(function ($qq) use ($first, $last) {
                        $qq->where('voornaam', 'like', "%{$first}%")
                           ->where('achternaam', 'like', "%{$last}%");
                    })->orWhere(function ($qq) use ($first, $last) {
                        $qq->where('achternaam', 'like', "%{$first}%")
                           ->where('voornaam', 'like', "%{$last}%");
                    });
                }
            });
        }
        $medewerkerOptions = $medewerkerQuery
            ->orderBy('achternaam')
            ->orderBy('voornaam')
            ->limit(50)
            ->get(['id', 'voornaam', 'achternaam', 'afdeling'])
            ->map(fn ($u) => [
                'id' => $u->id,
                'naam' => $u->full_name,
                'afdeling' => $u->afdeling,
            ]);

        // If Enter committed from client with a typed name, try exact match first (case-insensitive)
        if (!$medewerkerId && $commit && $zoek !== '' && $medewerkerOptions->count() > 0) {
            $exact = $medewerkerOptions->first(function ($opt) use ($zoek) {
                return mb_strtolower($opt['naam']) === mb_strtolower($zoek);
            });
            if ($exact) {
                $medewerkerId = $exact['id'];
            }
        }

        // Auto-select when there is exactly one match and no explicit medewerker is chosen yet (fallback)
        if (!$medewerkerId && $zoek !== '' && $medewerkerOptions->count() === 1) {
            $medewerkerId = $medewerkerOptions->first()['id'];
        }

        $calendar = null;
        $selectedMedewerker = null;
        if ($medewerkerId) {
            $exists = User::where('id', $medewerkerId)->where('role', 'MEDEWERKER')->exists();
            if ($exists) {
                $calendar = $this->monthCalendarService->getUserMonth($medewerkerId, $jaar, $maand);
                $user = User::find($medewerkerId, ['id', 'voornaam', 'achternaam', 'afdeling']);
                if ($user) {
                    $selectedMedewerker = [
                        'id' => $user->id,
                        'naam' => $user->full_name,
                        'afdeling' => $user->afdeling,
                    ];
                }
            }
        }

        return Inertia::render('HR/Dashboard', [
            'jaarActies' => [
                'huidigJaar' => $huidigJaar,
                'vorigJaar' => $vorigJaar,
                'baselineHuidigBestaat' => $baselineHuidigBestaat,
                'openVorigJaarCount' => $openVorigJaarCount,
                'pendingPrevYearCount' => $pendingPrevYearCount,
            ],
            'filters' => [
                'medewerker' => $medewerkerId,
                'zoek' => $zoek,
                'year' => $jaar,
                'month' => $maand,
            ],
            'medewerkerOptions' => $medewerkerOptions,
            'calendar' => $calendar,
            'selectedMedewerker' => $selectedMedewerker,
        ]);
    }

    /**
     * Get employees list
     */
    public function medewerkers(Request $request)
    {
        $huidigJaar = now()->year;
        $query = User::where('role', 'MEDEWERKER')
            ->with(['saldo' => fn ($q) => $q->where('jaar', $huidigJaar)]);

        if ($request->filled('actief')) {
            $query->where('is_active', $request->actief === 'true');
        }

        if ($request->filled('zoek')) {
            $zoek = $request->zoek;
            $query->where(function ($q) use ($zoek) {
                $q->where('voornaam', 'like', "%{$zoek}%")
                    ->orWhere('achternaam', 'like', "%{$zoek}%")
                    ->orWhere('username', 'like', "%{$zoek}%")
                    ->orWhere('email', 'like', "%{$zoek}%");
            });
        }

        if ($request->filled('afdeling')) {
            $query->where('afdeling', $request->afdeling);
        }

        $medewerkers = $query->orderBy('achternaam')
            ->orderBy('voornaam')
            ->paginate(20)
            ->through(function ($m) use ($huidigJaar) {
                // Nieuw: probeer eerst de nieuwe berekening op basis van baseline + mutaties
                $overzicht = $this->saldoService->getJaarOverzicht($m->id, $huidigJaar);

                if (($overzicht['zichtbaar'] ?? false) === true) {
                    $huidigSaldo = (int) ($overzicht['huidig_saldo'] ?? 0);
                    $overgenomen = (int) ($overzicht['overgenomen_uren'] ?? 0);

                    return [
                        'id' => $m->id,
                        'username' => $m->username,
                        'email' => $m->email,
                        'voornaam' => $m->voornaam,
                        'achternaam' => $m->achternaam,
                        'full_name' => $m->full_name,
                        'afdeling' => $m->afdeling,
                        'startdatum' => $m->startdatum?->format('Y-m-d'),
                        'is_active' => $m->is_active,
                        'huidig_saldo' => $huidigSaldo,
                        'formatted_saldo' => $this->formatMinutesToHoursMinutes($huidigSaldo),
                        'overgedragen_saldo' => $overgenomen,
                        'formatted_overgedragen_saldo' => $this->formatMinutesToHoursMinutes($overgenomen),
                    ];
                }

                // Fallback (backward compatible): gebruik legacy saldo-cache als zichtbaar=false of ontbreekt
                $legacySaldo = $m->saldo->first();
                $totaal = $legacySaldo?->totaal_saldo ?? 0;
                $overgedragen = $legacySaldo?->overgedragen_saldo ?? 0;

                return [
                    'id' => $m->id,
                    'username' => $m->username,
                    'email' => $m->email,
                    'voornaam' => $m->voornaam,
                    'achternaam' => $m->achternaam,
                    'full_name' => $m->full_name,
                    'afdeling' => $m->afdeling,
                    'startdatum' => $m->startdatum?->format('Y-m-d'),
                    'is_active' => $m->is_active,
                    'huidig_saldo' => $totaal,
                    'formatted_saldo' => $legacySaldo?->formatted_saldo ?? $this->formatMinutesToHoursMinutes(0),
                    'overgedragen_saldo' => $overgedragen,
                    'formatted_overgedragen_saldo' => $this->formatMinutesToHoursMinutes($overgedragen),
                ];
            });

        return Inertia::render('HR/Medewerkers', [
            'medewerkers' => $medewerkers,
            'filters' => [
                'zoek' => $request->zoek,
                'afdeling' => $request->afdeling,
                'actief' => $request->actief,
            ],
        ]);
    }

    /**
     * Get entries to review
     */
    public function teBeoordelen(Request $request)
    {
        $query = Overuren::where('status', 'INGEDIEND')
            ->with('user:id,voornaam,achternaam,afdeling');

        // Filter by specific employee if requested
        if ($request->filled('medewerker')) {
            $query->where('user_id', $request->medewerker);
        }

        $indieningen = $query->orderBy('ingediend_op', 'asc')
            ->paginate(50)
            ->through(fn ($o) => [
                'id' => $o->id,
                'medewerker' => [
                    'id' => $o->user->id,
                    'naam' => $o->user->full_name,
                    'afdeling' => $o->user->afdeling,
                ],
                'datum' => $o->datum->format('Y-m-d'),
                'minuten' => $o->minuten,
                'formatted' => $o->formatted_time,
                'reden' => $o->reden,
                'week_nummer' => $o->week_nummer,
                'jaar' => $o->jaar,
                'ingediend_op' => $o->ingediend_op?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('HR/TeBeoordelen', [
            'indieningen' => $indieningen,
            'highlight' => $request->highlight,
            'filters' => [
                'medewerker' => $request->medewerker,
            ],
        ]);
    }

    /**
     * Approve overuren entry
     */
    public function goedkeuren(Request $request, Overuren $overuren)
    {
        if ($overuren->status !== 'INGEDIEND') {
            return back()->withErrors([
                'status' => 'Alleen ingediende uren kunnen worden goedgekeurd',
            ]);
        }

        $overuren->status = 'GOEDGEKEURD';
        $overuren->goedgekeurd_op = now();
        $overuren->goedgekeurd_door = $request->user()->id;
        $overuren->afkeur_reden = null;
        $overuren->save();

        // Boek in journaal als definitieve mutatie (opbouw/opname) met originele datum
        UrenMutatie::create([
            'user_id' => $overuren->user_id,
            'datum' => $overuren->datum,
            'minuten' => $overuren->minuten,
            'type' => $overuren->minuten >= 0 ? UrenMutatie::TYPE_OPBOUW : UrenMutatie::TYPE_OPNAME,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'OVERUREN',
            'bron_id' => $overuren->id,
            'geboekt_op' => now(),
        ]);

        // Recalculate saldo
        $saldo = $this->saldoService->recalculateSaldo($overuren->user_id, $overuren->jaar);

        // Notify employee
        $isOpname = $overuren->minuten < 0;
        $typeText = $isOpname ? 'Opname' : 'Overuren';

        Notificatie::create([
            'user_id' => $overuren->user_id,
            'type' => 'GOEDKEURING',
            'titel' => "{$typeText} goedgekeurd",
            'bericht' => "Je {$typeText} van {$overuren->datum->format('Y-m-d')} ({$overuren->formatted_time}) zijn goedgekeurd. Je nieuwe saldo is {$saldo->formatted_saldo}.",
            'gerelateerd_id' => $overuren->id,
        ]);

        return back()->with('success', 'Uren succesvol goedgekeurd');
    }

    /**
     * HR action: sluit vorig jaar (indien open) en start nieuw jaar in één actie (rollover)
     */
    public function rollover(Request $request)
    {
        $validated = $request->validate([
            'jaar' => 'required|integer|min:2000|max:2100',
        ]);

        $jaar = (int) $validated['jaar'];
        // Laat rollover alleen toe als er geen openstaande (INGEDIEND) verzoeken meer zijn in vorig jaar
        $prev = $jaar - 1;
        $pendingPrev = Overuren::where('status', 'INGEDIEND')
            ->where('jaar', $prev)
            ->count();
        if ($pendingPrev > 0) {
            return back()->withErrors([
                'rollover' => "Kan boekjaar {$jaar} niet starten: er zijn {$pendingPrev} ingediende overuren in jaar {$prev} die eerst beoordeeld moeten worden.",
            ]);
        }

        $result = $this->saldoService->rolOverNaarJaar($jaar);

        return back()->with('success', sprintf(
            'Boekjaar %d gestart voor %d medewerkers. Vorig jaar gesloten: %d.',
            $jaar,
            $result['started'] ?? 0,
            $result['closed_prev'] ?? 0
        ));
    }

    /**
     * HR action: start jaar voor alle medewerkers (legt start_saldo vast)
     */
    public function startJaar(Request $request)
    {
        $validated = $request->validate([
            'jaar' => 'required|integer|min:2000|max:2100',
        ]);

        $aantal = $this->saldoService->startJaar((int) $validated['jaar']);
        return back()->with('success', "Jaar {$validated['jaar']} gestart voor {$aantal} medewerkers (waar toegestaan).");
    }

    /**
     * HR action: sluit jaar (zet baseline status CLOSED)
     */
    public function sluitJaar(Request $request)
    {
        $validated = $request->validate([
            'jaar' => 'required|integer|min:2000|max:2100',
        ]);
        $aantal = $this->saldoService->sluitJaar((int) $validated['jaar']);
        return back()->with('success', "Jaar {$validated['jaar']} afgesloten ({$aantal} records bijgewerkt).");
    }

    /**
     * Reject overuren entry
     */
    public function afkeuren(Request $request, Overuren $overuren)
    {
        $validated = $request->validate([
            'reden' => 'required|string|min:3|max:500',
        ]);

        if ($overuren->status !== 'INGEDIEND') {
            return back()->withErrors([
                'status' => 'Alleen ingediende uren kunnen worden afgekeurd',
            ]);
        }

        $overuren->status = 'AFGEKEURD';
        $overuren->afkeur_reden = $validated['reden'];
        $overuren->save();

        // Notify employee
        $isOpname = $overuren->minuten < 0;
        $typeText = $isOpname ? 'Opname' : 'Overuren';

        Notificatie::create([
            'user_id' => $overuren->user_id,
            'type' => 'AFKEURING',
            'titel' => "{$typeText} afgekeurd",
            'bericht' => "Je {$typeText} van {$overuren->datum->format('Y-m-d')} ({$overuren->formatted_time}) zijn afgekeurd. Reden: {$validated['reden']}",
            'gerelateerd_id' => $overuren->id,
        ]);

        return back()->with('success', 'Uren afgekeurd');
    }

    /**
     * Manually adjust employee saldo
     */
    public function saldoAanpassen(Request $request, User $user)
    {
        if ($user->role !== 'MEDEWERKER') {
            abort(404);
        }

        $validated = $request->validate([
            'minuten' => 'required|integer',
            'reden' => 'required|string|min:3|max:500',
        ]);

        $huidigJaar = now()->year;
        $saldo = $this->saldoService->getOrCreateSaldo($user->id, $huidigJaar);

        // Adjust overgedragen_saldo (manual correction by HR)
        $saldo->overgedragen_saldo += $validated['minuten'];
        $saldo->laatst_bijgewerkt = now();
        $saldo->save();

        // Notify employee
        $prefix = $validated['minuten'] > 0 ? '+' : '';
        $absMinuten = abs($validated['minuten']);
        $uren = floor($absMinuten / 60);
        $minuten = $absMinuten % 60;

        Notificatie::create([
            'user_id' => $user->id,
            'type' => 'SALDO_WIJZIGING',
            'titel' => 'Saldo aangepast door HR',
            'bericht' => "Je saldo is met {$prefix}{$uren}u {$minuten}m aangepast. Reden: {$validated['reden']}. Je nieuwe saldo is {$saldo->formatted_saldo}.",
        ]);

        return back()->with('success', 'Saldo succesvol aangepast');
    }

    /**
     * Get employee details
     */
    public function medewerkerDetail(User $user)
    {
        if ($user->role !== 'MEDEWERKER') {
            abort(404);
        }

        $huidigJaar = now()->year;
        $saldo = $this->saldoService->getOrCreateSaldo($user->id, $huidigJaar);

        $recenteUren = Overuren::where('user_id', $user->id)
            ->where('jaar', $huidigJaar)
            ->orderBy('datum', 'desc')
            ->limit(20)
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'datum' => $o->datum->format('Y-m-d'),
                'minuten' => $o->minuten,
                'formatted' => $o->formatted_time,
                'reden' => $o->reden,
                'status' => $o->status,
            ]);

        return Inertia::render('HR/MedewerkerDetail', [
            'medewerker' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'voornaam' => $user->voornaam,
                'achternaam' => $user->achternaam,
                'naam' => $user->full_name,
                'role' => $user->role,
                'afdeling' => $user->afdeling,
                'startdatum' => $user->startdatum?->format('Y-m-d'),
                'is_active' => $user->is_active,
                'saldo' => [
                    'minuten' => $saldo->totaal_saldo,
                    'formatted' => $saldo->formatted_saldo,
                    'overgedragen' => $saldo->overgedragen_saldo,
                    'overuren' => $saldo->overuren_saldo,
                    'opgenomen' => $saldo->opgenomen_saldo,
                ],
            ],
            'recente_overuren' => $recenteUren,
        ]);
    }

    /**
     * Toon formulier voor nieuwe gebruiker
     */
    public function gebruikerNieuw()
    {
        return Inertia::render('HR/Gebruikers/Nieuw', [
            'afdelingen' => config('afdelingen.lijst'),
        ]);
    }

    /**
     * Maak nieuwe gebruiker aan
     */
    public function gebruikerStore(Request $request)
    {
        $afdelingen = implode(',', config('afdelingen.lijst'));

        $validated = $request->validate([
            'username' => 'required|string|unique:users,username|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => 'required|string|min:8|confirmed',
            'voornaam' => 'required|string|max:255',
            'achternaam' => 'required|string|max:255',
            'role' => 'required|in:MEDEWERKER,HR',
            'afdeling' => "required|in:{$afdelingen}",
            'startdatum' => 'required|date',
            'overgedragen_saldo' => 'nullable|integer',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'voornaam' => $validated['voornaam'],
            'achternaam' => $validated['achternaam'],
            'role' => $validated['role'],
            'afdeling' => $validated['afdeling'],
            'startdatum' => $validated['startdatum'],
            'is_active' => true,
            'must_change_password' => true,
        ]);

        // Als er een overgedragen saldo is opgegeven, maak/update het saldo
        if (isset($validated['overgedragen_saldo']) && $validated['overgedragen_saldo'] != 0) {
            $huidigJaar = now()->year;
            $saldo = $this->saldoService->getOrCreateSaldo($user->id, $huidigJaar);
            $saldo->overgedragen_saldo = $validated['overgedragen_saldo'];
            $saldo->laatst_bijgewerkt = now();
            $saldo->save();
        }

        return redirect()->route('hr.medewerkers')->with('success', 'Gebruiker succesvol aangemaakt. De gebruiker moet het wachtwoord wijzigen bij eerste login.');
    }

    /**
     * Toon formulier voor gebruiker bewerken
     */
    public function gebruikerBewerken(User $user)
    {
        $huidigJaar = now()->year;
        $saldo = $this->saldoService->getOrCreateSaldo($user->id, $huidigJaar);

        return Inertia::render('HR/Gebruikers/Bewerken', [
            'gebruiker' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'voornaam' => $user->voornaam,
                'achternaam' => $user->achternaam,
                'role' => $user->role,
                'afdeling' => $user->afdeling,
                'startdatum' => $user->startdatum?->format('Y-m-d'),
                'is_active' => $user->is_active,
                'overgedragen_saldo' => $saldo->overgedragen_saldo,
            ],
            'afdelingen' => config('afdelingen.lijst'),
        ]);
    }

    /**
     * Wijzig gebruiker gegevens
     */
    public function gebruikerUpdate(Request $request, User $user)
    {
        $afdelingen = implode(',', config('afdelingen.lijst'));

        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'voornaam' => 'required|string|max:255',
            'achternaam' => 'required|string|max:255',
            'role' => 'required|in:MEDEWERKER,HR',
            'afdeling' => "required|in:{$afdelingen}",
            'startdatum' => 'required|date',
            'overgedragen_saldo' => 'nullable|integer',
        ]);

        $user->update([
            'email' => $validated['email'],
            'voornaam' => $validated['voornaam'],
            'achternaam' => $validated['achternaam'],
            'role' => $validated['role'],
            'afdeling' => $validated['afdeling'],
            'startdatum' => $validated['startdatum'],
        ]);

        // Update overgedragen saldo als deze is meegegeven
        if (isset($validated['overgedragen_saldo'])) {
            $huidigJaar = now()->year;
            $saldo = $this->saldoService->getOrCreateSaldo($user->id, $huidigJaar);
            $saldo->overgedragen_saldo = $validated['overgedragen_saldo'];
            $saldo->laatst_bijgewerkt = now();
            $saldo->save();
        }

        return redirect()->route('hr.medewerkers')->with('success', 'Gebruiker succesvol bijgewerkt');
    }

    /**
     * Deactiveer gebruiker
     */
    public function gebruikerDeactiveren(User $user)
    {
        $user->update(['is_active' => false]);

        return back()->with('success', 'Gebruiker gedeactiveerd');
    }

    /**
     * Activeer gebruiker
     */
    public function gebruikerActiveren(User $user)
    {
        $user->update(['is_active' => true]);

        return back()->with('success', 'Gebruiker geactiveerd');
    }

    /**
     * Reset gebruiker wachtwoord
     */
    public function gebruikerWachtwoordReset(Request $request, User $user)
    {
        $validated = $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => bcrypt($validated['new_password']),
            'must_change_password' => true,
        ]);

        return back()->with('success', 'Wachtwoord succesvol gereset. De gebruiker moet het wachtwoord wijzigen bij volgende login.');
    }

    /**
     * Format minutes to hours and minutes
     */
    private function formatMinutesToHoursMinutes(int $minuten): string
    {
        $uren = floor(abs($minuten) / 60);
        $mins = abs($minuten) % 60;
        $sign = $minuten < 0 ? '-' : '';
        return "{$sign}{$uren}u {$mins}m";
    }
}
