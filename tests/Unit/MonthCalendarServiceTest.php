<?php

use App\Models\Overuren;
use App\Models\UrenBaseline;
use App\Models\UrenMutatie;
use App\Models\User;
use App\Services\MonthCalendarService;
use App\Services\SaldoService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->service = app(MonthCalendarService::class);
    $this->saldoService = app(SaldoService::class);
    $this->year = 2025; // fixed year for deterministic assertions
    $this->month = 3;   // March has 31 days, week starts Monday (ISO)

    $this->hrUser = User::factory()->create(['role' => 'HR']);
    $this->actingAs($this->hrUser);
});

test('returns visible=false when year not started (no baseline)', function () {
    $data = $this->service->getUserMonth($this->user->id, $this->year, $this->month);

    expect($data['visible'])->toBeFalse();
    expect($data['calendar']['year'])->toBe($this->year);
    expect($data['calendar']['month'])->toBe($this->month);
    expect($data['days'])->toBe([]);
});

test('returns visible=false when previous year is not closed', function () {
    // Seed previous OPEN baseline and current OPEN baseline (manual/invalid state)
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->year - 1,
        'start_saldo' => 0,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now()->setYear($this->year - 1),
    ]);

    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->year,
        'start_saldo' => 0,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now()->setYear($this->year),
    ]);

    $data = $this->service->getUserMonth($this->user->id, $this->year, $this->month);
    expect($data['visible'])->toBeFalse();
});

test('calendar metadata contains correct daysInMonth and firstWeekday', function () {
    // Make year visible: previous CLOSED, current OPEN
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->year - 1,
        'start_saldo' => 0,
        'status' => UrenBaseline::STATUS_CLOSED,
        'asof' => now()->setYear($this->year - 1),
    ]);
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->year,
        'start_saldo' => 0,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now()->setYear($this->year),
    ]);

    $dataMarch = $this->service->getUserMonth($this->user->id, $this->year, 3);
    expect($dataMarch['visible'])->toBeTrue()
        ->and($dataMarch['calendar']['daysInMonth'])->toBe(31)
        ->and($dataMarch['calendar']['firstWeekday'])->toBeInt()
        ->and($dataMarch['calendar']['firstWeekday'])->toBeGreaterThanOrEqual(1)
        ->and($dataMarch['calendar']['firstWeekday'])->toBeLessThanOrEqual(7);

    $dataFeb = $this->service->getUserMonth($this->user->id, $this->year, 2);
    // 2025 is not a leap year → February has 28 days
    expect($dataFeb['calendar']['daysInMonth'])->toBe(28);
});

test('groups overuren by status per day and lists opnames separately', function () {
    // Visible year setup
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->year - 1,
        'start_saldo' => 0,
        'status' => UrenBaseline::STATUS_CLOSED,
        'asof' => now()->setYear($this->year - 1),
    ]);
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->year,
        'start_saldo' => 0,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now()->setYear($this->year),
    ]);

    $d1 = sprintf('%04d-%02d-05', $this->year, $this->month);
    $d2 = sprintf('%04d-%02d-15', $this->year, $this->month);
    $d3 = sprintf('%04d-%02d-20', $this->year, $this->month);

    // Overuren in diverse statussen
    Overuren::create([
        'user_id' => $this->user->id,
        'datum' => $d1,
        'minuten' => 60,
        'status' => 'CONCEPT',
        'jaar' => $this->year,
        'week_nummer' => 10,
    ]);
    Overuren::create([
        'user_id' => $this->user->id,
        'datum' => $d1,
        'minuten' => 45,
        'status' => 'INGEDIEND',
        'jaar' => $this->year,
        'week_nummer' => 10,
    ]);
    Overuren::create([
        'user_id' => $this->user->id,
        'datum' => $d2,
        'minuten' => 120,
        'status' => 'GOEDGEKEURD',
        'jaar' => $this->year,
        'week_nummer' => 11,
    ]);
    Overuren::create([
        'user_id' => $this->user->id,
        'datum' => $d3,
        'minuten' => 30,
        'status' => 'AFGEKEURD',
        'jaar' => $this->year,
        'week_nummer' => 12,
    ]);

    // Opname via journaal (negatief, definitief) op dag 15
    UrenMutatie::create([
        'user_id' => $this->user->id,
        'datum' => $d2,
        'minuten' => -90,
        'type' => UrenMutatie::TYPE_OPNAME,
        'status' => UrenMutatie::STATUS_DEFINITIEF,
        'bron' => 'TEST',
        'geboekt_op' => now(),
    ]);

    $data = $this->service->getUserMonth($this->user->id, $this->year, $this->month);
    expect($data['visible'])->toBeTrue();

    $day1 = 5; $day2 = 15; $day3 = 20;
    expect(count($data['days'][$day1]['concept']))->toBe(1)
        ->and(count($data['days'][$day1]['ingediend']))->toBe(1)
        ->and(count($data['days'][$day2]['goedgekeurd']))->toBe(1)
        ->and(count($data['days'][$day3]['afgekeurd']))->toBe(1)
        ->and(count($data['days'][$day2]['opnames']))->toBe(1);
});

test('clamps invalid month and year and still returns structure', function () {
    // Visible year setup
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->year - 1,
        'start_saldo' => 0,
        'status' => UrenBaseline::STATUS_CLOSED,
        'asof' => now()->setYear($this->year - 1),
    ]);
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->year,
        'start_saldo' => 0,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now()->setYear($this->year),
    ]);

    $data = $this->service->getUserMonth($this->user->id, -1, 99);
    expect($data['visible'])->toBeTrue()
        ->and($data['calendar']['year'])->toBeGreaterThanOrEqual(1970)
        ->and($data['calendar']['month'])->toBeLessThanOrEqual(12)
        ->and($data['calendar']['month'])->toBeGreaterThanOrEqual(1)
        ->and($data['days'])->toBeArray();
});
