<?php

namespace Database\Factories;

use App\Models\Saldo;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SaldoFactory extends Factory
{
    protected $model = Saldo::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'jaar' => now()->year,
            'overgedragen_saldo' => fake()->randomElement([-1200, -600, 0, 600, 1200, 1800, 2400]),
            // Nieuwe kolomnamen na migratie
            'opgenomen_saldo' => 0,
            'overuren_saldo' => 0,
            'laatst_bijgewerkt' => now(),
        ];
    }
}
