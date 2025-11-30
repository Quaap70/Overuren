<?php

namespace Database\Factories;

use App\Models\Overuren;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OverurenFactory extends Factory
{
    protected $model = Overuren::class;

    public function definition(): array
    {
        $datum = fake()->dateTimeBetween('-3 months', 'now');
        $date = new \DateTime($datum->format('Y-m-d'));

        return [
            'user_id' => User::factory(),
            'datum' => $datum->format('Y-m-d'),
            'minuten' => fake()->randomElement([-120, -60, 0, 30, 60, 90, 120, 150, 180, 240]),
            'reden' => fake()->sentence(),
            'week_nummer' => (int) $date->format('W'),
            'jaar' => (int) $date->format('Y'),
            'status' => 'CONCEPT',
            'ingediend_op' => null,
            'goedgekeurd_op' => null,
            'goedgekeurd_door' => null,
            'afkeur_reden' => null,
        ];
    }

    public function concept(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'CONCEPT',
            'ingediend_op' => null,
            'goedgekeurd_op' => null,
            'goedgekeurd_door' => null,
            'afkeur_reden' => null,
        ]);
    }

    public function ingediend(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'INGEDIEND',
            'ingediend_op' => now(),
            'goedgekeurd_op' => null,
            'goedgekeurd_door' => null,
            'afkeur_reden' => null,
        ]);
    }

    public function goedgekeurd(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'GOEDGEKEURD',
            'ingediend_op' => now()->subDays(2),
            'goedgekeurd_op' => now(),
            'goedgekeurd_door' => User::factory()->hr(),
            'afkeur_reden' => null,
        ]);
    }

    public function afgekeurd(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'AFGEKEURD',
            'ingediend_op' => now()->subDays(2),
            'goedgekeurd_op' => null,
            'goedgekeurd_door' => null,
            'afkeur_reden' => fake()->sentence(),
        ]);
    }
}
