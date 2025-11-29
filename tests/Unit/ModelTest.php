<?php

use App\Models\User;
use App\Models\Overuren;
use App\Models\Saldo;
use App\Models\Notificatie;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// User Model Tests
test('user has full name accessor', function () {
    $user = User::factory()->make([
        'voornaam' => 'Jan',
        'achternaam' => 'Jansen',
    ]);

    expect($user->full_name)->toBe('Jan Jansen');
});

test('user has overuren relationship', function () {
    $user = User::factory()->create();
    Overuren::factory()->count(3)->create(['user_id' => $user->id]);

    expect($user->overuren)->toHaveCount(3);
    expect($user->overuren->first())->toBeInstanceOf(Overuren::class);
});

test('user has saldo relationship', function () {
    $user = User::factory()->create();
    Saldo::factory()->create(['user_id' => $user->id]);

    expect($user->saldo)->toHaveCount(1);
    expect($user->saldo->first())->toBeInstanceOf(Saldo::class);
});

test('user has notificaties relationship', function () {
    $user = User::factory()->create();
    Notificatie::factory()->count(5)->create(['user_id' => $user->id]);

    expect($user->notificaties)->toHaveCount(5);
    expect($user->notificaties->first())->toBeInstanceOf(Notificatie::class);
});

test('user can be HR or MEDEWERKER', function () {
    $hrUser = User::factory()->create(['role' => 'HR']);
    $employee = User::factory()->create(['role' => 'MEDEWERKER']);

    expect($hrUser->role)->toBe('HR');
    expect($employee->role)->toBe('MEDEWERKER');
});

// Overuren Model Tests
test('overuren formatted_time accessor formats minutes correctly', function () {
    $overtime = Overuren::factory()->make(['minuten' => 125]);

    expect($overtime->formatted_time)->toBe('2u 5m');
});

test('overuren formatted_time handles negative minutes', function () {
    $overtime = Overuren::factory()->make(['minuten' => -90]);

    expect($overtime->formatted_time)->toBe('-1u 30m');
});

test('overuren formatted_time handles zero', function () {
    $overtime = Overuren::factory()->make(['minuten' => 0]);

    expect($overtime->formatted_time)->toBe('0u 0m');
});

test('overuren belongs to user', function () {
    $user = User::factory()->create();
    $overtime = Overuren::factory()->create(['user_id' => $user->id]);

    expect($overtime->user)->toBeInstanceOf(User::class);
    expect($overtime->user->id)->toBe($user->id);
});

test('overuren belongs to goedkeurder', function () {
    $hrUser = User::factory()->create(['role' => 'HR']);
    $overtime = Overuren::factory()->create([
        'goedgekeurd_door' => $hrUser->id,
        'status' => 'GOEDGEKEURD',
    ]);

    expect($overtime->goedkeurder)->toBeInstanceOf(User::class);
    expect($overtime->goedkeurder->id)->toBe($hrUser->id);
});

test('overuren has correct fillable fields', function () {
    $fillable = (new Overuren())->getFillable();

    expect($fillable)->toContain('user_id', 'datum', 'minuten', 'reden', 'status');
});

test('overuren casts dates correctly', function () {
    $overtime = Overuren::factory()->create([
        'ingediend_op' => now(),
    ]);

    expect($overtime->ingediend_op)->toBeInstanceOf(\Illuminate\Support\Carbon::class);
});

// Saldo Model Tests
test('saldo formatted_saldo accessor formats correctly', function () {
    $saldo = Saldo::factory()->make(['huidig_saldo' => 185]);

    expect($saldo->formatted_saldo)->toBe('3u 5m');
});

test('saldo formatted_saldo handles negative balance', function () {
    $saldo = Saldo::factory()->make(['huidig_saldo' => -120]);

    expect($saldo->formatted_saldo)->toBe('-2u 0m');
});

test('saldo belongs to user', function () {
    $user = User::factory()->create();
    $saldo = Saldo::factory()->create(['user_id' => $user->id]);

    expect($saldo->user)->toBeInstanceOf(User::class);
    expect($saldo->user->id)->toBe($user->id);
});

test('saldo has correct default values', function () {
    $user = User::factory()->create();
    $saldo = Saldo::create([
        'user_id' => $user->id,
        'jaar' => 2025,
    ]);

    expect($saldo->overgedragen_saldo)->toBe(0);
    expect($saldo->gebruikt_saldo)->toBe(0);
    expect($saldo->huidig_saldo)->toBe(0);
});

test('saldo casts laatst_bijgewerkt as datetime', function () {
    $saldo = Saldo::factory()->create();

    expect($saldo->laatst_bijgewerkt)->toBeInstanceOf(\Illuminate\Support\Carbon::class);
});

// Notificatie Model Tests
test('notificatie belongs to user', function () {
    $user = User::factory()->create();
    $notificatie = Notificatie::factory()->create(['user_id' => $user->id]);

    expect($notificatie->user)->toBeInstanceOf(User::class);
    expect($notificatie->user->id)->toBe($user->id);
});

test('notificatie has correct types', function () {
    $types = ['GOEDKEURING', 'AFKEURING', 'SALDO_WIJZIGING', 'HERINNERING', 'INFO'];

    foreach ($types as $type) {
        $notificatie = Notificatie::factory()->create(['type' => $type]);
        expect($notificatie->type)->toBe($type);
    }
});

test('notificatie gelezen is boolean', function () {
    $notificatie = Notificatie::factory()->create(['gelezen' => true]);

    expect($notificatie->gelezen)->toBeBool();
    expect($notificatie->gelezen)->toBeTrue();
});

test('notificatie created_at is cast to datetime', function () {
    $notificatie = Notificatie::factory()->create();

    expect($notificatie->created_at)->toBeInstanceOf(\Illuminate\Support\Carbon::class);
});

// Model Relationships Chain Tests
test('user can access overuren through saldo year', function () {
    $user = User::factory()->create();
    $currentYear = now()->year;

    Overuren::factory()->count(3)->create([
        'user_id' => $user->id,
        'jaar' => $currentYear,
        'status' => 'GOEDGEKEURD',
    ]);

    Overuren::factory()->count(2)->create([
        'user_id' => $user->id,
        'jaar' => $currentYear - 1,
        'status' => 'GOEDGEKEURD',
    ]);

    $currentYearOvertime = $user->overuren()
        ->where('jaar', $currentYear)
        ->where('status', 'GOEDGEKEURD')
        ->count();

    expect($currentYearOvertime)->toBe(3);
});

test('user unread notifications count', function () {
    $user = User::factory()->create();

    Notificatie::factory()->count(5)->create([
        'user_id' => $user->id,
        'gelezen' => false,
    ]);

    Notificatie::factory()->count(2)->create([
        'user_id' => $user->id,
        'gelezen' => true,
    ]);

    $unreadCount = $user->notificaties()->where('gelezen', false)->count();

    expect($unreadCount)->toBe(5);
});
