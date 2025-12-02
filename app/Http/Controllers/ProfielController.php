<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfielController extends Controller
{
    /**
     * Toon profiel pagina
     */
    public function index()
    {
        return Inertia::render('Profiel', [
            'user' => [
                'id' => auth()->user()->id,
                'username' => auth()->user()->username,
                'email' => auth()->user()->email,
                'voornaam' => auth()->user()->voornaam,
                'achternaam' => auth()->user()->achternaam,
                'full_name' => auth()->user()->full_name,
                'afdeling' => auth()->user()->afdeling,
                'startdatum' => auth()->user()->startdatum?->format('Y-m-d'),
                'role' => auth()->user()->role,
            ],
            'afdelingen' => ['Zakelijk', 'Particulier', 'Schade', 'ICT', 'HR'],
        ]);
    }

    /**
     * Toon wachtwoord wijzigen pagina (forced)
     */
    public function wachtwoordWijzigenPagina()
    {
        return Inertia::render('WachtwoordWijzigen', [
            'mustChange' => auth()->user()->must_change_password,
        ]);
    }

    /**
     * Wijzig wachtwoord (forced change)
     */
    public function wachtwoordWijzigen(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = auth()->user();

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors([
                'current_password' => 'Het huidige wachtwoord is onjuist.',
            ]);
        }

        // Update password and clear must_change_password flag
        $user->update([
            'password' => Hash::make($validated['new_password']),
            'must_change_password' => false,
        ]);

        return redirect()->route('dashboard')->with('success', 'Wachtwoord succesvol gewijzigd');
    }

    /**
     * Wijzig wachtwoord vanuit profiel (optional)
     */
    public function updateWachtwoord(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = auth()->user();

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors([
                'current_password' => 'Het huidige wachtwoord is onjuist.',
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return back()->with('success', 'Wachtwoord succesvol gewijzigd');
    }

    /**
     * Wijzig email adres vanuit profiel
     */
    public function updateEmail(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update([
            'email' => $validated['email'],
        ]);

        return back()->with('success', 'E-mailadres succesvol gewijzigd');
    }

    /**
     * Wijzig persoonlijke gegevens (alleen voor HR - eigen profiel)
     */
    public function updateProfiel(Request $request)
    {
        $user = auth()->user();

        // Only HR can update personal details via profile
        if (!$user->isHR()) {
            abort(403, 'Alleen HR mag persoonlijke gegevens wijzigen.');
        }

        $validated = $request->validate([
            'voornaam' => 'required|string|max:255',
            'achternaam' => 'required|string|max:255',
            'afdeling' => 'required|in:Zakelijk,Particulier,Schade,ICT,HR',
        ]);

        $user->update($validated);

        return back()->with('success', 'Persoonlijke gegevens succesvol bijgewerkt');
    }
}
