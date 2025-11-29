<?php

use App\Models\User;
use App\Models\Overuren;
use App\Models\Saldo;
use App\Models\Notificatie;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->hrUser = User::factory()->create(['role' => 'HR']);
    $this->employee = User::factory()->create(['role' => 'MEDEWERKER']);
});

test('hr can view dashboard', function () {
    $this->actingAs($this->hrUser);

    $response = $this->get('/hr/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/Dashboard')
             ->has('statistieken')
             ->has('recente_indieningen')
    );
});

test('employee cannot access hr dashboard', function () {
    $this->actingAs($this->employee);

    $response = $this->get('/hr/dashboard');

    $response->assertForbidden();
});

test('hr can view list of employees', function () {
    $this->actingAs($this->hrUser);

    User::factory()->count(5)->create(['role' => 'MEDEWERKER']);

    $response = $this->get('/hr/medewerkers');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/Medewerkers')
             ->has('medewerkers.data', 5)
    );
});

test('hr can view submitted overtime', function () {
    $this->actingAs($this->hrUser);

    Overuren::factory()->count(3)->create([
        'user_id' => $this->employee->id,
        'status' => 'INGEDIEND',
    ]);

    $response = $this->get('/hr/te-beoordelen');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/TeBeoordelen')
             ->has('indieningen.data', 3)
    );
});

test('hr can approve overtime', function () {
    $this->actingAs($this->hrUser);

    $overtime = Overuren::factory()->create([
        'user_id' => $this->employee->id,
        'status' => 'INGEDIEND',
        'minuten' => 120,
    ]);

    $response = $this->post("/hr/uren/{$overtime->id}/goedkeuren");

    $response->assertRedirect();
    $this->assertDatabaseHas('overuren', [
        'id' => $overtime->id,
        'status' => 'GOEDGEKEURD',
        'goedgekeurd_door' => $this->hrUser->id,
    ]);

    // Check notification was created
    $this->assertDatabaseHas('notificaties', [
        'user_id' => $this->employee->id,
        'type' => 'GOEDKEURING',
    ]);
});

test('hr can reject overtime with reason', function () {
    $this->actingAs($this->hrUser);

    $overtime = Overuren::factory()->create([
        'user_id' => $this->employee->id,
        'status' => 'INGEDIEND',
    ]);

    $response = $this->post("/hr/uren/{$overtime->id}/afkeuren", [
        'reden' => 'Onvoldoende onderbouwing',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('overuren', [
        'id' => $overtime->id,
        'status' => 'AFGEKEURD',
        'afkeur_reden' => 'Onvoldoende onderbouwing',
    ]);

    // Check notification was created
    $this->assertDatabaseHas('notificaties', [
        'user_id' => $this->employee->id,
        'type' => 'AFKEURING',
    ]);
});

test('hr cannot reject overtime without reason', function () {
    $this->actingAs($this->hrUser);

    $overtime = Overuren::factory()->create([
        'user_id' => $this->employee->id,
        'status' => 'INGEDIEND',
    ]);

    $response = $this->post("/hr/uren/{$overtime->id}/afkeuren", [
        'reden' => '',
    ]);

    $response->assertSessionHasErrors(['reden']);
});

test('approving overtime updates employee saldo', function () {
    $this->actingAs($this->hrUser);

    $saldo = Saldo::factory()->create([
        'user_id' => $this->employee->id,
        'jaar' => now()->year,
        'huidig_saldo' => 0,
    ]);

    $overtime = Overuren::factory()->create([
        'user_id' => $this->employee->id,
        'status' => 'INGEDIEND',
        'minuten' => 120,
        'jaar' => now()->year,
    ]);

    $this->post("/hr/uren/{$overtime->id}/goedkeuren");

    $saldo->refresh();
    expect($saldo->huidig_saldo)->toBe(120);
});

test('hr can manually adjust employee saldo', function () {
    $this->actingAs($this->hrUser);

    $saldo = Saldo::factory()->create([
        'user_id' => $this->employee->id,
        'jaar' => now()->year,
        'huidig_saldo' => 100,
    ]);

    $response = $this->post("/hr/medewerkers/{$this->employee->id}/saldo", [
        'minuten' => 60,
        'reden' => 'Correctie administratie',
    ]);

    $response->assertRedirect();
    $saldo->refresh();
    expect($saldo->huidig_saldo)->toBe(160);

    // Check notification was created
    $this->assertDatabaseHas('notificaties', [
        'user_id' => $this->employee->id,
        'type' => 'SALDO_WIJZIGING',
    ]);
});

test('hr can view employee detail page', function () {
    $this->actingAs($this->hrUser);

    Overuren::factory()->count(5)->create([
        'user_id' => $this->employee->id,
    ]);

    $response = $this->get("/hr/medewerkers/{$this->employee->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/MedewerkerDetail')
             ->has('medewerker')
             ->has('recente_overuren', 5)
             ->has('saldo')
    );
});

test('employee cannot approve overtime', function () {
    $this->actingAs($this->employee);

    $overtime = Overuren::factory()->create([
        'status' => 'INGEDIEND',
    ]);

    $response = $this->post("/hr/uren/{$overtime->id}/goedkeuren");

    $response->assertForbidden();
});

test('employee cannot adjust saldo', function () {
    $this->actingAs($this->employee);

    $otherEmployee = User::factory()->create(['role' => 'MEDEWERKER']);

    $response = $this->post("/hr/medewerkers/{$otherEmployee->id}/saldo", [
        'minuten' => 60,
        'reden' => 'Test',
    ]);

    $response->assertForbidden();
});

test('hr dashboard shows correct statistics', function () {
    $this->actingAs($this->hrUser);

    // Create test data
    Overuren::factory()->count(5)->create(['status' => 'INGEDIEND']);
    Overuren::factory()->count(3)->create([
        'status' => 'GOEDGEKEURD',
        'datum' => now(),
    ]);
    User::factory()->count(10)->create(['role' => 'MEDEWERKER']);

    $response = $this->get('/hr/dashboard');

    $response->assertInertia(fn ($page) =>
        $page->component('HR/Dashboard')
             ->where('statistieken.te_beoordelen', 5)
             ->where('statistieken.medewerkers', 11) // 10 + 1 created in beforeEach
    );
});
