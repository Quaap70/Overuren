<?php

use App\Models\User;
use App\Models\Overuren;
use App\Models\Saldo;
use App\Services\SaldoService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->saldoService = new SaldoService();
    $this->user = User::factory()->create();
});

test('getOrCreateSaldo creates new saldo if not exists', function () {
    $saldo = $this->saldoService->getOrCreateSaldo($this->user->id, 2025);

    expect($saldo)->toBeInstanceOf(Saldo::class);
    expect($saldo->user_id)->toBe($this->user->id);
    expect($saldo->jaar)->toBe(2025);
    expect($saldo->huidig_saldo)->toBe(0);
});

test('getOrCreateSaldo returns existing saldo', function () {
    $existingSaldo = Saldo::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'huidig_saldo' => 120,
    ]);

    $saldo = $this->saldoService->getOrCreateSaldo($this->user->id, 2025);

    expect($saldo->id)->toBe($existingSaldo->id);
    expect($saldo->huidig_saldo)->toBe(120);
});

test('recalculateSaldo calculates correctly with no overtime', function () {
    $saldo = $this->saldoService->recalculateSaldo($this->user->id, 2025);

    expect($saldo->huidig_saldo)->toBe(0);
});

test('recalculateSaldo calculates correctly with goedgekeurde uren', function () {
    Saldo::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'overgedragen_saldo' => 100,
        'gebruikt_saldo' => 50,
    ]);

    Overuren::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'status' => 'GOEDGEKEURD',
        'minuten' => 120,
    ]);

    Overuren::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'status' => 'GOEDGEKEURD',
        'minuten' => 60,
    ]);

    $saldo = $this->saldoService->recalculateSaldo($this->user->id, 2025);

    // 100 (overgedragen) + 180 (goedgekeurde uren) - 50 (gebruikt) = 230
    expect($saldo->huidig_saldo)->toBe(230);
});

test('recalculateSaldo ignores non-goedgekeurde uren', function () {
    Saldo::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'overgedragen_saldo' => 0,
        'gebruikt_saldo' => 0,
    ]);

    Overuren::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'status' => 'CONCEPT',
        'minuten' => 120,
    ]);

    Overuren::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'status' => 'INGEDIEND',
        'minuten' => 60,
    ]);

    Overuren::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'status' => 'AFGEKEURD',
        'minuten' => 30,
    ]);

    $saldo = $this->saldoService->recalculateSaldo($this->user->id, 2025);

    expect($saldo->huidig_saldo)->toBe(0);
});

test('recalculateSaldo handles negative hours correctly', function () {
    Saldo::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'overgedragen_saldo' => 100,
        'gebruikt_saldo' => 0,
    ]);

    Overuren::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'status' => 'GOEDGEKEURD',
        'minuten' => -60,
    ]);

    $saldo = $this->saldoService->recalculateSaldo($this->user->id, 2025);

    // 100 + (-60) - 0 = 40
    expect($saldo->huidig_saldo)->toBe(40);
});

test('recalculateSaldo only calculates for specific year', function () {
    Saldo::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'overgedragen_saldo' => 0,
        'gebruikt_saldo' => 0,
    ]);

    // 2025 overtime
    Overuren::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'status' => 'GOEDGEKEURD',
        'minuten' => 120,
    ]);

    // 2024 overtime (should be ignored)
    Overuren::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2024,
        'status' => 'GOEDGEKEURD',
        'minuten' => 60,
    ]);

    $saldo = $this->saldoService->recalculateSaldo($this->user->id, 2025);

    expect($saldo->huidig_saldo)->toBe(120);
});

test('getWeekNumber returns correct week number', function () {
    $date = new DateTime('2025-01-15'); // Week 3 of 2025
    $weekNumber = $this->saldoService->getWeekNumber($date);

    expect($weekNumber)->toBe(3);
});

test('getWeekNumber handles different dates', function () {
    $testCases = [
        '2025-01-01' => 1,  // First week
        '2025-12-31' => 53, // Last week (varies by year)
        '2025-07-01' => 27, // Mid year
    ];

    foreach ($testCases as $dateString => $expectedWeek) {
        $date = new DateTime($dateString);
        $weekNumber = $this->saldoService->getWeekNumber($date);

        expect($weekNumber)->toBeInt();
        expect($weekNumber)->toBeGreaterThan(0);
        expect($weekNumber)->toBeLessThanOrEqual(53);
    }
});

test('recalculateSaldo updates laatst_bijgewerkt timestamp', function () {
    $saldo = Saldo::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
    ]);

    $oldTimestamp = $saldo->laatst_bijgewerkt;

    sleep(1);

    $this->saldoService->recalculateSaldo($this->user->id, 2025);

    $saldo->refresh();

    expect($saldo->laatst_bijgewerkt->timestamp)
        ->toBeGreaterThan($oldTimestamp->timestamp);
});

test('recalculateSaldo with gebruikt_saldo reduces balance', function () {
    Saldo::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'overgedragen_saldo' => 100,
        'gebruikt_saldo' => 150,
    ]);

    Overuren::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'status' => 'GOEDGEKEURD',
        'minuten' => 200,
    ]);

    $saldo = $this->saldoService->recalculateSaldo($this->user->id, 2025);

    // 100 (overgedragen) + 200 (goedgekeurd) - 150 (gebruikt) = 150
    expect($saldo->huidig_saldo)->toBe(150);
});

test('recalculateSaldo can result in negative balance', function () {
    Saldo::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'overgedragen_saldo' => 0,
        'gebruikt_saldo' => 200,
    ]);

    Overuren::factory()->create([
        'user_id' => $this->user->id,
        'jaar' => 2025,
        'status' => 'GOEDGEKEURD',
        'minuten' => 50,
    ]);

    $saldo = $this->saldoService->recalculateSaldo($this->user->id, 2025);

    // 0 + 50 - 200 = -150
    expect($saldo->huidig_saldo)->toBe(-150);
});
