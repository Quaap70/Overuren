<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Overuren;
use App\Models\Saldo;
use App\Models\Notificatie;
use App\Services\SaldoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HRController extends Controller
{
    public function __construct(
        private SaldoService $saldoService
    ) {}

    /**
     * HR Dashboard
     */
    public function dashboard()
    {
        $huidigJaar = now()->year;

        // Pending approvals count
        $teBeoordelenCount = Overuren::where('status', 'INGEDIEND')->count();

        // This week submissions
        $dezeWeekStart = now()->startOfWeek();
        $dezeWeekCount = Overuren::where('ingediend_op', '>=', $dezeWeekStart)->count();

        // Active employees count
        $medewerkersCount = User::where('role', 'MEDEWERKER')
            ->where('is_active', true)
            ->count();

        // Total approved hours this year
        $totaalMinuten = Overuren::where('status', 'GOEDGEKEURD')
            ->where('jaar', $huidigJaar)
            ->sum('minuten');

        // Recent submissions
        $recenteIndieningen = Overuren::where('status', 'INGEDIEND')
            ->with('user:id,voornaam,achternaam')
            ->orderBy('ingediend_op', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'medewerker' => $o->user->full_name,
                'medewerker_id' => $o->user->id,
                'datum' => $o->datum->format('Y-m-d'),
                'minuten' => $o->minuten,
                'formatted' => $o->formatted_time,
                'reden' => $o->reden,
                'ingediend_op' => $o->ingediend_op?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('HR/Dashboard', [
            'statistieken' => [
                'te_beoordelen' => $teBeoordelenCount,
                'deze_week' => $dezeWeekCount,
                'medewerkers' => $medewerkersCount,
                'totaal_uren' => round($totaalMinuten / 60),
            ],
            'recente_indieningen' => $recenteIndieningen,
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
            ->through(fn ($m) => [
                'id' => $m->id,
                'username' => $m->username,
                'email' => $m->email,
                'voornaam' => $m->voornaam,
                'achternaam' => $m->achternaam,
                'full_name' => $m->full_name,
                'afdeling' => $m->afdeling,
                'startdatum' => $m->startdatum?->format('Y-m-d'),
                'is_active' => $m->is_active,
                'huidig_saldo' => $m->saldo->first()?->totaal_saldo ?? 0,
                'formatted_saldo' => $m->saldo->first()?->formatted_saldo ?? '0u 0m',
            ]);

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
            'afdelingen' => ['Zakelijk', 'Particulier', 'Schade', 'ICT', 'HR'],
        ]);
    }

    /**
     * Maak nieuwe gebruiker aan
     */
    public function gebruikerStore(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|unique:users,username|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'password' => 'required|string|min:8|confirmed',
            'voornaam' => 'required|string|max:255',
            'achternaam' => 'required|string|max:255',
            'role' => 'required|in:MEDEWERKER,HR',
            'afdeling' => 'required|in:Zakelijk,Particulier,Schade,ICT,HR',
            'startdatum' => 'required|date',
        ]);

        User::create([
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

        return redirect()->route('hr.medewerkers')->with('success', 'Gebruiker succesvol aangemaakt. De gebruiker moet het wachtwoord wijzigen bij eerste login.');
    }

    /**
     * Toon formulier voor gebruiker bewerken
     */
    public function gebruikerBewerken(User $user)
    {
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
            ],
            'afdelingen' => ['Zakelijk', 'Particulier', 'Schade', 'ICT', 'HR'],
        ]);
    }

    /**
     * Wijzig gebruiker gegevens
     */
    public function gebruikerUpdate(Request $request, User $user)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'voornaam' => 'required|string|max:255',
            'achternaam' => 'required|string|max:255',
            'role' => 'required|in:MEDEWERKER,HR',
            'afdeling' => 'required|in:Zakelijk,Particulier,Schade,ICT,HR',
            'startdatum' => 'required|date',
        ]);

        $user->update($validated);

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
}
