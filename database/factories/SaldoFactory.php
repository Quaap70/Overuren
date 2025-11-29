<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Saldo>
 */
class SaldoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'jaar' => now()->year,
            'overgedragen_saldo' => $this->faker->randomElement([0, 60, 120, 180, 240, -60, -120]),
            'gebruikt_saldo' => $this->faker->randomElement([0, 30, 60, 90, 120]),
            'huidig_saldo' => $this->faker->randomElement([0, 60, 120, 180, 240, 300, -60, -120]),
            'laatst_bijgewerkt' => now(),
        ];
    }

    /**
     * Indicate that the saldo is for a specific year.
     */
    public function forYear(int $jaar): static
    {
        return $this->state(fn (array $attributes) => [
            'jaar' => $jaar,
        ]);
    }

    /**
     * Indicate that the saldo has zero balance.
     */
    public function zero(): static
    {
        return $this->state(fn (array $attributes) => [
            'overgedragen_saldo' => 0,
            'gebruikt_saldo' => 0,
            'huidig_saldo' => 0,
        ]);
    }

    /**
     * Indicate that the saldo has positive balance.
     */
    public function positive(): static
    {
        $overgedragen = $this->faker->numberBetween(0, 240);
        $gebruikt = $this->faker->numberBetween(0, 120);
        $huidig = $overgedragen - $gebruikt + $this->faker->numberBetween(60, 300);

        return $this->state(fn (array $attributes) => [
            'overgedragen_saldo' => $overgedragen,
            'gebruikt_saldo' => $gebruikt,
            'huidig_saldo' => $huidig,
        ]);
    }

    /**
     * Indicate that the saldo has negative balance.
     */
    public function negative(): static
    {
        $overgedragen = $this->faker->numberBetween(-120, 0);
        $gebruikt = $this->faker->numberBetween(60, 180);
        $huidig = $overgedragen - $gebruikt;

        return $this->state(fn (array $attributes) => [
            'overgedragen_saldo' => $overgedragen,
            'gebruikt_saldo' => $gebruikt,
            'huidig_saldo' => $huidig,
        ]);
    }
}
