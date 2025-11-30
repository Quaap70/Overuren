<?php

use App\Models\User;
use App\Models\Overuren;

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'MEDEWERKER']);
});

test('medewerker can view their overuren', function () {
    Overuren::factory()->count(3)->create([
        'user_id' => $this->user->id
    ]);

    $response = $this->actingAs($this->user)->get('/overuren');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('Overuren/Index')
            ->has('overuren.data', 3)
    );
});

test('medewerker can create overuren in concept', function () {
    $data = [
        'datum' => now()->format('Y-m-d'),
        'minuten' => 120,
        'reden' => 'Extra werk'
    ];

    $response = $this->actingAs($this->user)->post('/overuren', $data);

    $response->assertRedirect();

    expect(Overuren::where('user_id', $this->user->id)->count())->toBe(1);
    expect(Overuren::first()->status)->toBe('CONCEPT');
});

test('formatted time shows correct format', function () {
    $overuren = Overuren::factory()->create([
        'minuten' => 150  // 2u 30m
    ]);

    expect($overuren->formatted_time)->toBe('2u 30m');
});

test('negative formatted time shows correct format', function () {
    $overuren = Overuren::factory()->create([
        'minuten' => -90  // -1u 30m
    ]);

    expect($overuren->formatted_time)->toBe('-1u 30m');
});
