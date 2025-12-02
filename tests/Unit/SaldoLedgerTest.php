<?php

use App\Models\User;
use App\Models\UrenBaseline;
use App\Models\UrenMutatie;
use App\Models\Saldo;
use App\Services\SaldoService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = new SaldoService();
    $this->user = User::factory()->create();
    $this->jaar = (int) now()->year;
});

test('canShowYear false when baseline for year missing', function () {
    expect($this->service->canShowYear($this->user->id, $this->jaar))->toBeFalse();
});

test('canShowYear true for initial seeded year without previous closed', function () {
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->jaar,
        'start_saldo' => 0,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now(),
    ]);

    expect($this->service->canShowYear($this->user->id, $this->jaar))->toBeTrue();
});

test('canShowYear requires previous year closed for non-initial', function () {
    $prev = $this->jaar - 1;
    // Seed previous baseline but leave OPEN
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $prev,
        'start_saldo' => 120,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now()->setYear($prev),
    ]);
    // Create current year baseline (simulate manual creation)
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->jaar,
        'start_saldo' => 0,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now(),
    ]);

    // Not initial (minYear < jaar) and prev not CLOSED -> expect false
    expect($this->service->canShowYear($this->user->id, $this->jaar))->toBeFalse();

    // Close previous year
    UrenBaseline::where('user_id', $this->user->id)->where('jaar', $prev)->update(['status' => UrenBaseline::STATUS_CLOSED]);
    expect($this->service->canShowYear($this->user->id, $this->jaar))->toBeTrue();
});

test('getJaarOverzicht sums baseline + positive and negative mutaties', function () {
    $prev = $this->jaar - 1;
    // Setup previous closed and current open baselines
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $prev,
        'start_saldo' => 300,
        'status' => UrenBaseline::STATUS_CLOSED,
        'asof' => now()->setYear($prev),
    ]);
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->jaar,
        'start_saldo' => 600,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now(),
    ]);

    // Mutations in current year: +180, -90
    UrenMutatie::create([
        'user_id' => $this->user->id,
        'datum' => now()->toDateString(),
        'minuten' => 180,
        'type' => UrenMutatie::TYPE_OPBOUW,
        'status' => UrenMutatie::STATUS_DEFINITIEF,
        'bron' => 'TEST',
        'geboekt_op' => now(),
    ]);
    UrenMutatie::create([
        'user_id' => $this->user->id,
        'datum' => now()->toDateString(),
        'minuten' => -90,
        'type' => UrenMutatie::TYPE_OPNAME,
        'status' => UrenMutatie::STATUS_DEFINITIEF,
        'bron' => 'TEST',
        'geboekt_op' => now(),
    ]);

    $overzicht = $this->service->getJaarOverzicht($this->user->id, $this->jaar);
    expect($overzicht['zichtbaar'])->toBeTrue()
        ->and($overzicht['overgenomen_uren'])->toBe(600)
        ->and($overzicht['opgebouwd_dit_jaar'])->toBe(180)
        ->and($overzicht['opgenomen_dit_jaar'])->toBe(-90)
        ->and($overzicht['huidig_saldo'])->toBe(600 + 180 - 90);
});

test('saldoTotEindeJaar uses baseline + jaar som', function () {
    $prev = $this->jaar - 1;
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $prev,
        'start_saldo' => 200,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now()->setYear($prev),
    ]);

    // prev year mutaties: +120, -30 => net +90 → expected 290
    UrenMutatie::create([
        'user_id' => $this->user->id,
        'datum' => now()->setYear($prev)->toDateString(),
        'minuten' => 120,
        'type' => UrenMutatie::TYPE_OPBOUW,
        'status' => UrenMutatie::STATUS_DEFINITIEF,
        'bron' => 'TEST',
        'geboekt_op' => now(),
    ]);
    UrenMutatie::create([
        'user_id' => $this->user->id,
        'datum' => now()->setYear($prev)->toDateString(),
        'minuten' => -30,
        'type' => UrenMutatie::TYPE_OPNAME,
        'status' => UrenMutatie::STATUS_DEFINITIEF,
        'bron' => 'TEST',
        'geboekt_op' => now(),
    ]);

    $tot = $this->service->saldoTotEindeJaar($this->user->id, $prev);
    expect($tot)->toBe(290);
});

test('rebuildCacheForUserYear writes saldo_cache using baseline + mutaties', function () {
    $prev = $this->jaar - 1;
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $prev,
        'start_saldo' => 0,
        'status' => UrenBaseline::STATUS_CLOSED,
        'asof' => now()->setYear($prev),
    ]);
    UrenBaseline::create([
        'user_id' => $this->user->id,
        'jaar' => $this->jaar,
        'start_saldo' => 480,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now(),
    ]);

    // Mutaties in huidig jaar: +150, -60
    UrenMutatie::create([
        'user_id' => $this->user->id,
        'datum' => now()->toDateString(),
        'minuten' => 150,
        'type' => UrenMutatie::TYPE_OPBOUW,
        'status' => UrenMutatie::STATUS_DEFINITIEF,
        'bron' => 'TEST',
        'geboekt_op' => now(),
    ]);
    UrenMutatie::create([
        'user_id' => $this->user->id,
        'datum' => now()->toDateString(),
        'minuten' => -60,
        'type' => UrenMutatie::TYPE_OPNAME,
        'status' => UrenMutatie::STATUS_DEFINITIEF,
        'bron' => 'TEST',
        'geboekt_op' => now(),
    ]);

    $saldo = $this->service->rebuildCacheForUserYear($this->user->id, $this->jaar);
    expect($saldo)->toBeInstanceOf(Saldo::class)
        ->and($saldo->overgedragen_saldo)->toBe(480)
        ->and($saldo->overuren_saldo)->toBe(150)
        ->and($saldo->opgenomen_saldo)->toBe(60)
        ->and($saldo->huidig_saldo)->toBe(480 + 150 - 60);
});
