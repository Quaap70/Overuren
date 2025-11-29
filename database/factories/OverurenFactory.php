<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Overuren>
 */
class OverurenFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $datum = $this->faker->dateTimeBetween('-6 months', 'now');

        return [
            'user_id' => User::factory(),
            'datum' => $datum->format('Y-m-d'),
            'minuten' => $this->faker->randomElement([30, 60, 90, 120, 150, 180, 240, -30, -60]),
            'reden' => $this->faker->optional(0.7)->sentence(),
            'week_nummer' => (int) $datum->format('W'),
            'jaar' => (int) $datum->format('Y'),
            'status' => $this->faker->randomElement(['CONCEPT', 'INGEDIEND', 'GOEDGEKEURD', 'AFGEKEURD']),
            'afkeur_reden' => null,
            'ingediend_op' => null,
            'goedgekeurd_op' => null,
            'goedgekeurd_door' => null,
        ];
    }

    /**
     * Indicate that the overtime is in concept status.
     */
    public function concept(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'CONCEPT',
            'ingediend_op' => null,
            'goedgekeurd_op' => null,
            'goedgekeurd_door' => null,
        ]);
    }

    /**
     * Indicate that the overtime is submitted.
     */
    public function ingediend(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'INGEDIEND',
            'ingediend_op' => now(),
            'goedgekeurd_op' => null,
            'goedgekeurd_door' => null,
        ]);
    }

    /**
     * Indicate that the overtime is approved.
     */
    public function goedgekeurd(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'GOEDGEKEURD',
            'ingediend_op' => now()->subDays(2),
            'goedgekeurd_op' => now(),
            'goedgekeurd_door' => User::factory()->create(['role' => 'HR'])->id,
        ]);
    }

    /**
     * Indicate that the overtime is rejected.
     */
    public function afgekeurd(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'AFGEKEURD',
            'ingediend_op' => now()->subDays(2),
            'afkeur_reden' => $this->faker->sentence(),
        ]);
    }
}
