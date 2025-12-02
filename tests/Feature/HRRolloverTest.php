<?php

use App\Models\User;
use App\Models\Overuren;
use App\Models\UrenBaseline;
use App\Models\Saldo;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->hr = User::factory()->create(['role' => 'HR']);
    $this->medewerker = User::factory()->create(['role' => 'MEDEWERKER']);
    $this->jaar = (int) now()->year;
    $this->prev = $this->jaar - 1;
});

test('rollover is blocked when previous year has pending submissions', function () {
    // Vorig jaar baseline OPEN
    UrenBaseline::create([
        'user_id' => $this->medewerker->id,
        'jaar' => $this->prev,
        'start_saldo' => 600,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now()->setYear($this->prev),
    ]);

    // Pending indiening in vorig jaar
    Overuren::factory()->create([
        'user_id' => $this->medewerker->id,
        'jaar' => $this->prev,
        'status' => 'INGEDIEND',
        'minuten' => 120,
        'ingediend_op' => now()->setYear($this->prev),
        'datum' => now()->setYear($this->prev)->toDateString(),
    ]);

    $response = $this->actingAs($this->hr)->post('/hr/jaar/rollover', [ 'jaar' => $this->jaar ]);

    // Verwacht: redirect met foutmelding en geen baseline voor huidig jaar
    $response->assertRedirect();
    expect(UrenBaseline::where('jaar', $this->jaar)->exists())->toBeFalse();
    // Vorig jaar blijft OPEN
    $prev = UrenBaseline::where('user_id', $this->medewerker->id)->where('jaar', $this->prev)->first();
    expect($prev->status)->toBe(UrenBaseline::STATUS_OPEN);
});

test('successful rollover closes previous year and starts current year, and updates saldo_cache', function () {
    // Vorig jaar baseline OPEN, geen pending
    UrenBaseline::create([
        'user_id' => $this->medewerker->id,
        'jaar' => $this->prev,
        'start_saldo' => 480,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now()->setYear($this->prev),
    ]);

    // Geen pending overuren in vorig jaar

    $response = $this->actingAs($this->hr)->post('/hr/jaar/rollover', [ 'jaar' => $this->jaar ]);
    $response->assertRedirect();

    // Controleer dat vorig jaar is gesloten en huidig jaar gestart
    $this->assertDatabaseHas('uren_baselines', [
        'user_id' => $this->medewerker->id,
        'jaar' => $this->prev,
        'status' => UrenBaseline::STATUS_CLOSED,
    ]);

    $this->assertDatabaseHas('uren_baselines', [
        'user_id' => $this->medewerker->id,
        'jaar' => $this->jaar,
        'status' => UrenBaseline::STATUS_OPEN,
    ]);

    // saldo_cache moet na rollover bestaan met overgedragen_saldo gelijk aan start_saldo van baseline(Y)
    $baselineY = UrenBaseline::where('user_id', $this->medewerker->id)->where('jaar', $this->jaar)->first();
    $this->assertNotNull($baselineY);

    $this->assertDatabaseHas('saldo_cache', [
        'user_id' => $this->medewerker->id,
        'jaar' => $this->jaar,
        'overgedragen_saldo' => $baselineY->start_saldo,
    ]);
});

test('HR dashboard shows rollover button when baseline for current year is missing and hides it after rollover', function () {
    // Setup: vorig jaar OPEN, geen baseline voor huidig jaar en geen pending
    UrenBaseline::create([
        'user_id' => $this->medewerker->id,
        'jaar' => $this->prev,
        'start_saldo' => 300,
        'status' => UrenBaseline::STATUS_OPEN,
        'asof' => now()->setYear($this->prev),
    ]);

    // Initial dashboard: baseline(Y) ontbreekt -> knop zichtbaar
    $resp1 = $this->actingAs($this->hr)->get('/hr/dashboard');
    $resp1->assertOk();
    $page1 = $resp1->viewData('page');
    expect(($page1['props']['jaarActies']['baselineHuidigBestaat'] ?? null))->toBeFalse();

    // Rollover uitvoeren
    $this->actingAs($this->hr)->post('/hr/jaar/rollover', [ 'jaar' => $this->jaar ])->assertRedirect();

    // Dashboard na rollover: baseline(Y) bestaat -> knop verborgen
    $resp2 = $this->actingAs($this->hr)->get('/hr/dashboard');
    $resp2->assertOk();
    $page2 = $resp2->viewData('page');
    expect(($page2['props']['jaarActies']['baselineHuidigBestaat'] ?? null))->toBeTrue();
});

test('rollover from initial state derives start_saldo from previous-year approved overuren (no baselines yet)', function () {
    // Geen baselines aanwezig (initial state)
    // Maak een overuren in vorig jaar en keur die goed via HR endpoint
    $overuren = \App\Models\Overuren::factory()->create([
        'user_id' => $this->medewerker->id,
        'status' => 'INGEDIEND',
        'jaar' => $this->prev,
        'datum' => now()->setYear($this->prev)->setMonth(12)->setDay(15)->toDateString(),
        'minuten' => 120,
    ]);

    // Keur goed als HR → dit boekt ook een definitieve UrenMutatie op de opgegeven datum
    $this->actingAs($this->hr)->post("/hr/uren/{$overuren->id}/goedkeuren")->assertRedirect();

    // Nu rollover uitvoeren naar huidig jaar (prev sluiten + huidig starten)
    $this->actingAs($this->hr)->post('/hr/jaar/rollover', [ 'jaar' => $this->jaar ])->assertRedirect();

    // Controle: baseline voor huidig jaar moet bestaan en start_saldo = 120
    $baselineY = UrenBaseline::where('user_id', $this->medewerker->id)
        ->where('jaar', $this->jaar)
        ->first();
    expect($baselineY)->not->toBeNull();
    expect((int) $baselineY->start_saldo)->toBe(120);

    // En de saldo_cache moet direct gesynchroniseerd zijn
    $this->assertDatabaseHas('saldo_cache', [
        'user_id' => $this->medewerker->id,
        'jaar' => $this->jaar,
        'overgedragen_saldo' => 120,
    ]);
});

test('rollover from initial state uses net sum of previous-year mutaties for start_saldo', function () {
    // Approval van meerdere vorige-jaar entries (definitieve mutaties resulteren in +200 en -50 => netto 150)
    $o1 = \App\Models\Overuren::factory()->create([
        'user_id' => $this->medewerker->id,
        'status' => 'INGEDIEND',
        'jaar' => $this->prev,
        'datum' => now()->setYear($this->prev)->setMonth(6)->setDay(10)->toDateString(),
        'minuten' => 200,
    ]);
    $o2 = \App\Models\Overuren::factory()->create([
        'user_id' => $this->medewerker->id,
        'status' => 'INGEDIEND',
        'jaar' => $this->prev,
        'datum' => now()->setYear($this->prev)->setMonth(9)->setDay(5)->toDateString(),
        'minuten' => -50,
    ]);

    $this->actingAs($this->hr)->post("/hr/uren/{$o1->id}/goedkeuren")->assertRedirect();
    $this->actingAs($this->hr)->post("/hr/uren/{$o2->id}/goedkeuren")->assertRedirect();

    // Rollover uitvoeren
    $this->actingAs($this->hr)->post('/hr/jaar/rollover', [ 'jaar' => $this->jaar ])->assertRedirect();

    $baselineY = UrenBaseline::where('user_id', $this->medewerker->id)
        ->where('jaar', $this->jaar)
        ->first();
    expect($baselineY)->not->toBeNull();
    expect((int) $baselineY->start_saldo)->toBe(150);

    $this->assertDatabaseHas('saldo_cache', [
        'user_id' => $this->medewerker->id,
        'jaar' => $this->jaar,
        'overgedragen_saldo' => 150,
    ]);
});
