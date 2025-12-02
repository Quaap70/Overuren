<?php

use App\Models\User;
use App\Models\Overuren;
use App\Models\Saldo;

beforeEach(function () {
    $this->hr = User::factory()->create(['role' => 'HR']);
    $this->medewerker = User::factory()->create(['role' => 'MEDEWERKER']);
});

test('HR can access medewerkers page', function () {
    $response = $this->actingAs($this->hr)->get('/hr/medewerkers');

    $response->assertOk();
});

test('medewerker cannot access HR pages', function () {
    $response = $this->actingAs($this->medewerker)->get('/hr/medewerkers');

    $response->assertForbidden();
});

test('HR can search medewerkers by name', function () {
    $jan = User::factory()->create([
        'role' => 'MEDEWERKER',
        'voornaam' => 'Jan',
        'achternaam' => 'Jansen'
    ]);

    $piet = User::factory()->create([
        'role' => 'MEDEWERKER',
        'voornaam' => 'Piet',
        'achternaam' => 'Pietersen'
    ]);

    $response = $this->actingAs($this->hr)->get('/hr/medewerkers?zoek=Jan');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/Medewerkers')
            ->has('medewerkers.data', 1)
    );
});

test('HR can filter medewerkers by afdeling', function () {
    $afdelingen = (array) config('afdelingen.lijst', []);
    $afd1 = $afdelingen[0] ?? 'Algemeen';
    $afd2 = $afdelingen[1] ?? $afd1;

    User::factory()->create([
        'role' => 'MEDEWERKER',
        'afdeling' => $afd1,
    ]);

    User::factory()->create([
        'role' => 'MEDEWERKER',
        'afdeling' => $afd2,
    ]);

    $response = $this->actingAs($this->hr)->get('/hr/medewerkers?afdeling=' . urlencode($afd1));

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/Medewerkers')
            ->has('medewerkers.data', 1)
    );
});

test('HR can see te beoordelen overuren', function () {
    $overuren = Overuren::factory()->create([
        'user_id' => $this->medewerker->id,
        'status' => 'INGEDIEND',
        'ingediend_op' => now()
    ]);

    $response = $this->actingAs($this->hr)->get('/hr/te-beoordelen');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/TeBeoordelen')
            ->has('indieningen.data', 1)
    );
});

test('HR can filter te beoordelen by medewerker', function () {
    $user1 = User::factory()->create(['role' => 'MEDEWERKER']);
    $user2 = User::factory()->create(['role' => 'MEDEWERKER']);

    Overuren::factory()->create([
        'user_id' => $user1->id,
        'status' => 'INGEDIEND',
        'ingediend_op' => now()
    ]);

    Overuren::factory()->create([
        'user_id' => $user2->id,
        'status' => 'INGEDIEND',
        'ingediend_op' => now()
    ]);

    $response = $this->actingAs($this->hr)->get("/hr/te-beoordelen?medewerker={$user1->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/TeBeoordelen')
            ->has('indieningen.data', 1)
    );
});

test('HR can approve overuren', function () {
    $overuren = Overuren::factory()->create([
        'user_id' => $this->medewerker->id,
        'status' => 'INGEDIEND',
        'ingediend_op' => now(),
        'minuten' => 120,
        'jaar' => now()->year
    ]);

    // Create saldo for user
    Saldo::factory()->create([
        'user_id' => $this->medewerker->id,
        'jaar' => now()->year,
        'huidig_saldo' => 0
    ]);

    $response = $this->actingAs($this->hr)->post("/hr/uren/{$overuren->id}/goedkeuren");

    $response->assertRedirect();

    $overuren->refresh();
    expect($overuren->status)->toBe('GOEDGEKEURD');
    expect($overuren->goedgekeurd_door)->toBe($this->hr->id);
    expect($overuren->goedgekeurd_op)->not->toBeNull();
});

test('HR can reject overuren with reason', function () {
    $overuren = Overuren::factory()->create([
        'user_id' => $this->medewerker->id,
        'status' => 'INGEDIEND',
        'ingediend_op' => now()
    ]);

    $response = $this->actingAs($this->hr)->post("/hr/uren/{$overuren->id}/afkeuren", [
        'reden' => 'Niet goedgekeurd omdat...'
    ]);

    $response->assertRedirect();

    $overuren->refresh();
    expect($overuren->status)->toBe('AFGEKEURD');
    expect($overuren->afkeur_reden)->toBe('Niet goedgekeurd omdat...');
});

test('HR can adjust medewerker saldo', function () {
    $saldo = Saldo::factory()->create([
        'user_id' => $this->medewerker->id,
        'jaar' => now()->year,
        'huidig_saldo' => 100
    ]);

    $response = $this->actingAs($this->hr)->post("/hr/medewerkers/{$this->medewerker->id}/saldo", [
        'minuten' => 60,
        'reden' => 'Correctie'
    ]);

    $response->assertRedirect();

    $saldo->refresh();
    expect($saldo->huidig_saldo)->toBe(160);
});
