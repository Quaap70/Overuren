<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MustChangePassword
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user is authenticated and must change password
        if ($user && $user->must_change_password) {
            // Allow access to password change page and logout
            if (
                !$request->is('wachtwoord-wijzigen') &&
                !$request->is('logout') &&
                !$request->is('profiel/wachtwoord')
            ) {
                return redirect()->route('wachtwoord-wijzigen');
            }
        }

        return $next($request);
    }
}
