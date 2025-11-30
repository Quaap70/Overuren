<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OverurenController;
use App\Http\Controllers\SaldoController;
use App\Http\Controllers\HRController;
use App\Http\Controllers\NotificatieController;
use App\Http\Controllers\ProfielController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/', function () {
        return redirect('/login');
    });

    Route::get('/login', [LoginController::class, 'show'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', LogoutController::class)->name('logout');

    // Wachtwoord wijzigen (forced)
    Route::get('/wachtwoord-wijzigen', [ProfielController::class, 'wachtwoordWijzigenPagina'])->name('wachtwoord-wijzigen');
    Route::post('/wachtwoord-wijzigen', [ProfielController::class, 'wachtwoordWijzigen']);

    // Profiel
    Route::get('/profiel', [ProfielController::class, 'index'])->name('profiel');
    Route::post('/profiel/wachtwoord', [ProfielController::class, 'updateWachtwoord'])->name('profiel.wachtwoord');

    // Employee dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Overuren routes (Employee)
    Route::prefix('overuren')->name('overuren.')->group(function () {
        Route::get('/', [OverurenController::class, 'index'])->name('index');
        Route::post('/', [OverurenController::class, 'store'])->name('store');
        Route::put('/{overuren}', [OverurenController::class, 'update'])->name('update');
        Route::delete('/{overuren}', [OverurenController::class, 'destroy'])->name('destroy');
        Route::get('/week/{jaar}/{weeknummer}', [OverurenController::class, 'weekOverview'])->name('week');
    });

    // Saldo routes
    Route::get('/saldo', [SaldoController::class, 'index'])->name('saldo.index');
    Route::get('/api/saldo/current', [SaldoController::class, 'current'])->name('saldo.current');

    // Notificaties routes
    Route::prefix('notificaties')->name('notificaties.')->group(function () {
        Route::get('/', [NotificatieController::class, 'index'])->name('index');
        Route::post('/{notificatie}/gelezen', [NotificatieController::class, 'markAsRead'])->name('mark-read');
        Route::post('/alles-gelezen', [NotificatieController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/{notificatie}', [NotificatieController::class, 'destroy'])->name('destroy');
        Route::get('/ongelezen-count', [NotificatieController::class, 'unreadCount'])->name('unread-count');
    });

    // HR routes (alleen voor HR gebruikers)
    Route::prefix('hr')->name('hr.')->middleware('hr')->group(function () {
        Route::get('/dashboard', [HRController::class, 'dashboard'])->name('dashboard');
        Route::get('/medewerkers', [HRController::class, 'medewerkers'])->name('medewerkers');
        Route::get('/medewerkers/{user}', [HRController::class, 'medewerkerDetail'])->name('medewerker.detail');
        Route::get('/te-beoordelen', [HRController::class, 'teBeoordelen'])->name('te-beoordelen');
        Route::post('/uren/{overuren}/goedkeuren', [HRController::class, 'goedkeuren'])->name('goedkeuren');
        Route::post('/uren/{overuren}/afkeuren', [HRController::class, 'afkeuren'])->name('afkeuren');
        Route::post('/medewerkers/{user}/saldo', [HRController::class, 'saldoAanpassen'])->name('saldo.aanpassen');

        // Gebruikersbeheer routes
        Route::get('/gebruikers/nieuw', [HRController::class, 'gebruikerNieuw'])->name('gebruikers.nieuw');
        Route::post('/gebruikers', [HRController::class, 'gebruikerStore'])->name('gebruikers.store');
        Route::get('/gebruikers/{user}/bewerken', [HRController::class, 'gebruikerBewerken'])->name('gebruikers.bewerken');
        Route::put('/gebruikers/{user}', [HRController::class, 'gebruikerUpdate'])->name('gebruikers.update');
        Route::post('/gebruikers/{user}/deactiveren', [HRController::class, 'gebruikerDeactiveren'])->name('gebruikers.deactiveren');
        Route::post('/gebruikers/{user}/activeren', [HRController::class, 'gebruikerActiveren'])->name('gebruikers.activeren');
        Route::post('/gebruikers/{user}/wachtwoord-reset', [HRController::class, 'gebruikerWachtwoordReset'])->name('gebruikers.wachtwoord-reset');
    });
});
