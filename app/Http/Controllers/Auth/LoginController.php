<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class LoginController extends Controller
{
    /**
     * Show the login page
     */
    public function show()
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Handle login request
     */
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Find user by username
        $user = User::where('username', $credentials['username'])->first();

        // Check if user exists and is active
        if (!$user) {
            throw ValidationException::withMessages([
                'username' => ['Ongeldige gebruikersnaam of wachtwoord'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Account is gedeactiveerd'],
            ]);
        }

        // Verify password
        if (!Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Ongeldige gebruikersnaam of wachtwoord'],
            ]);
        }

        // Log the user in
        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();

        // Redirect based on role
        return redirect()->intended(
            $user->isHR() ? '/hr/dashboard' : '/dashboard'
        );
    }
}
