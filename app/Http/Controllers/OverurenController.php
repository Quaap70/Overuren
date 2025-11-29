<?php

namespace App\Http\Controllers;

use App\Models\Overuren;
use App\Models\User;
use App\Models\Notificatie;
use App\Services\SaldoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OverurenController extends Controller
{
    public function __construct(
        private SaldoService $saldoService
    ) {}

    /**
     * Display overuren history page
     */
    public function index(Request $request)
    {
        $query = Overuren::where('user_id', $request->user()->id)
            ->with('goedkeurder:id,voornaam,achternaam');

        // Filters
        if ($request->filled('jaar')) {
            $query->where('jaar', $request->jaar);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $overuren = $query->orderBy('datum', 'desc')
            ->paginate(50)
            ->through(fn ($o) => [
                'id' => $o->id,
                'datum' => $o->datum->format('Y-m-d'),
                'minuten' => $o->minuten,
                'formatted_time' => $o->formatted_time,
                'reden' => $o->reden,
                'status' => $o->status,
                'kan_wijzigen' => $o->canBeModified(),
                'afkeur_reden' => $o->afkeur_reden,
                'goedgekeurd_op' => $o->goedgekeurd_op?->format('Y-m-d H:i'),
                'goedgekeurd_door' => $o->goedkeurder ? $o->goedkeurder->full_name : null,
            ]);

        return Inertia::render('Overuren/Index', [
            'overuren' => $overuren,
        ]);
    }

    /**
     * Store new overuren entry
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'datum' => 'required|date',
            'minuten' => 'required|integer',
            'reden' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:CONCEPT,INGEDIEND',
        ]);

        // Validate minutes
        if (!Overuren::validateMinuten($validated['minuten'])) {
            return back()->withErrors([
                'minuten' => 'Minuten moeten een veelvoud van 10 zijn en max ±12 uur (720 minuten)',
            ]);
        }

        $datum = new \DateTime($validated['datum']);
        $weekNummer = $this->saldoService->getWeekNumber($datum);
        $jaar = (int) $datum->format('Y');

        // Check if entry exists for this date
        $bestaand = Overuren::where('user_id', $request->user()->id)
            ->where('datum', $validated['datum'])
            ->exists();

        if ($bestaand) {
            return back()->withErrors([
                'datum' => 'Je hebt al een invoer voor deze datum',
            ]);
        }

        $status = $validated['status'] ?? 'INGEDIEND';

        // Create entry
        $overuren = Overuren::create([
            'user_id' => $request->user()->id,
            'datum' => $validated['datum'],
            'minuten' => $validated['minuten'],
            'reden' => $validated['reden'],
            'week_nummer' => $weekNummer,
            'jaar' => $jaar,
            'status' => $status,
            'ingediend_op' => $status === 'INGEDIEND' ? now() : null,
        ]);

        // Notify HR if submitted
        if ($status === 'INGEDIEND') {
            $hrUsers = User::where('role', 'HR')
                ->where('is_active', true)
                ->get();

            foreach ($hrUsers as $hr) {
                Notificatie::create([
                    'user_id' => $hr->id,
                    'type' => 'INFO',
                    'titel' => 'Nieuwe overuren ingediend',
                    'bericht' => "{$request->user()->full_name} heeft overuren ingediend voor {$validated['datum']}",
                    'gerelateerd_id' => $overuren->id,
                ]);
            }
        }

        return back()->with('success', $status === 'INGEDIEND' ? 'Uren succesvol ingediend' : 'Uren opgeslagen als concept');
    }

    /**
     * Update overuren entry
     */
    public function update(Request $request, Overuren $overuren)
    {
        // Check ownership
        if ($overuren->user_id !== $request->user()->id) {
            abort(403);
        }

        if (!$overuren->canBeModified()) {
            return back()->withErrors([
                'status' => 'Alleen concept of afgekeurde uren kunnen worden gewijzigd',
            ]);
        }

        $validated = $request->validate([
            'minuten' => 'sometimes|integer',
            'reden' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:CONCEPT,INGEDIEND',
        ]);

        // Validate minutes if provided
        if (isset($validated['minuten']) && !Overuren::validateMinuten($validated['minuten'])) {
            return back()->withErrors([
                'minuten' => 'Minuten moeten een veelvoud van 10 zijn en max ±12 uur (720 minuten)',
            ]);
        }

        // Update fields
        if (isset($validated['minuten'])) {
            $overuren->minuten = $validated['minuten'];
        }
        if (array_key_exists('reden', $validated)) {
            $overuren->reden = $validated['reden'];
        }
        if (isset($validated['status'])) {
            $overuren->status = $validated['status'];
            if ($validated['status'] === 'INGEDIEND') {
                $overuren->ingediend_op = now();

                // Notify HR
                $hrUsers = User::where('role', 'HR')
                    ->where('is_active', true)
                    ->get();

                foreach ($hrUsers as $hr) {
                    Notificatie::create([
                        'user_id' => $hr->id,
                        'type' => 'INFO',
                        'titel' => 'Overuren opnieuw ingediend',
                        'bericht' => "{$request->user()->full_name} heeft overuren opnieuw ingediend voor {$overuren->datum->format('Y-m-d')}",
                        'gerelateerd_id' => $overuren->id,
                    ]);
                }
            }
        }

        $overuren->save();

        return back()->with('success', 'Uren succesvol bijgewerkt');
    }

    /**
     * Delete overuren entry (only CONCEPT)
     */
    public function destroy(Request $request, Overuren $overuren)
    {
        // Check ownership
        if ($overuren->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($overuren->status !== 'CONCEPT') {
            return back()->withErrors([
                'status' => 'Alleen concept uren kunnen worden verwijderd',
            ]);
        }

        $overuren->delete();

        return back()->with('success', 'Uren succesvol verwijderd');
    }

    /**
     * Get week overview
     */
    public function weekOverview(Request $request, int $jaar, int $weeknummer)
    {
        $uren = Overuren::where('user_id', $request->user()->id)
            ->where('jaar', $jaar)
            ->where('week_nummer', $weeknummer)
            ->orderBy('datum', 'asc')
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'datum' => $o->datum->format('Y-m-d'),
                'minuten' => $o->minuten,
                'formatted_time' => $o->formatted_time,
                'reden' => $o->reden,
                'status' => $o->status,
                'kan_wijzigen' => $o->canBeModified(),
            ]);

        return response()->json([
            'jaar' => $jaar,
            'week' => $weeknummer,
            'uren' => $uren,
            'totaal_minuten' => $uren->sum('minuten'),
        ]);
    }
}
