<?php

use App\Models\User;
use App\Models\Overuren;
use App\Models\Saldo;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'MEDEWERKER']);
});

test('employee can view their overtime records', function () {
    $this->actingAs($this->user);

    Overuren::factory()->count(3)->create(['user_id' => $this->user->id]);

    $response = $this->get('/overuren');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('Overuren/Index')
             ->has('overuren.data', 3)
    );
});

test('employee can create overtime in concept status', function () {
    $this->actingAs($this->user);

    $overtimeData = [
        'datum' => now()->format('Y-m-d'),
        'minuten' => 120,
        'reden' => 'Extra project werk',
        'status' => 'CONCEPT',
    ];

    $response = $this->post('/overuren', $overtimeData);

    $response->assertRedirect();
    $this->assertDatabaseHas('overuren', [
        'user_id' => $this->user->id,
        'minuten' => 120,
        'status' => 'CONCEPT',
    ]);
});

test('employee can submit overtime for approval', function () {
    $this->actingAs($this->user);

    $overtimeData = [
        'datum' => now()->format('Y-m-d'),
        'minuten' => 120,
        'reden' => 'Extra project werk',
        'status' => 'INGEDIEND',
    ];

    $response = $this->post('/overuren', $overtimeData);

    $response->assertRedirect();
    $this->assertDatabaseHas('overuren', [
        'user_id' => $this->user->id,
        'status' => 'INGEDIEND',
    ]);
});

test('overtime minutes must be multiple of 10', function () {
    $this->actingAs($this->user);

    $response = $this->post('/overuren', [
        'datum' => now()->format('Y-m-d'),
        'minuten' => 125, // Not a multiple of 10
        'status' => 'CONCEPT',
    ]);

    $response->assertSessionHasErrors(['minuten']);
});

test('overtime minutes cannot exceed 720', function () {
    $this->actingAs($this->user);

    $response = $this->post('/overuren', [
        'datum' => now()->format('Y-m-d'),
        'minuten' => 800, // More than 12 hours
        'status' => 'CONCEPT',
    ]);

    $response->assertSessionHasErrors(['minuten']);
});

test('overtime minutes cannot be less than negative 720', function () {
    $this->actingAs($this->user);

    $response = $this->post('/overuren', [
        'datum' => now()->format('Y-m-d'),
        'minuten' => -800, // Less than -12 hours
        'status' => 'CONCEPT',
    ]);

    $response->assertSessionHasErrors(['minuten']);
});

test('employee can update overtime in concept status', function () {
    $this->actingAs($this->user);

    $overtime = Overuren::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'CONCEPT',
        'minuten' => 60,
    ]);

    $response = $this->put("/overuren/{$overtime->id}", [
        'datum' => $overtime->datum,
        'minuten' => 120,
        'reden' => 'Updated reason',
        'status' => 'CONCEPT',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('overuren', [
        'id' => $overtime->id,
        'minuten' => 120,
    ]);
});

test('employee cannot update overtime in goedgekeurd status', function () {
    $this->actingAs($this->user);

    $overtime = Overuren::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'GOEDGEKEURD',
    ]);

    $response = $this->put("/overuren/{$overtime->id}", [
        'datum' => $overtime->datum,
        'minuten' => 120,
        'status' => 'GOEDGEKEURD',
    ]);

    $response->assertForbidden();
});

test('employee can delete overtime in concept status', function () {
    $this->actingAs($this->user);

    $overtime = Overuren::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'CONCEPT',
    ]);

    $response = $this->delete("/overuren/{$overtime->id}");

    $response->assertRedirect();
    $this->assertDatabaseMissing('overuren', [
        'id' => $overtime->id,
    ]);
});

test('employee cannot delete overtime in ingediend status', function () {
    $this->actingAs($this->user);

    $overtime = Overuren::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'INGEDIEND',
    ]);

    $response = $this->delete("/overuren/{$overtime->id}");

    $response->assertForbidden();
});

test('employee cannot view other employees overtime', function () {
    $this->actingAs($this->user);

    $otherUser = User::factory()->create(['role' => 'MEDEWERKER']);
    $overtime = Overuren::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->get('/overuren');

    $response->assertInertia(fn ($page) =>
        $page->component('Overuren/Index')
             ->has('overuren.data', 0)
    );
});

test('week number is automatically calculated', function () {
    $this->actingAs($this->user);

    $datum = '2025-01-15'; // Week 3 of 2025

    $response = $this->post('/overuren', [
        'datum' => $datum,
        'minuten' => 60,
        'status' => 'CONCEPT',
    ]);

    $this->assertDatabaseHas('overuren', [
        'user_id' => $this->user->id,
        'week_nummer' => 3,
        'jaar' => 2025,
    ]);
});
