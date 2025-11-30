<?php

namespace Database\Factories;

use App\Models\Notificatie;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificatieFactory extends Factory
{
    protected $model = Notificatie::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['GOEDKEURING', 'AFKEURING', 'SALDO_WIJZIGING', 'HERINNERING', 'INFO']);

        $titels = [
            'GOEDKEURING' => 'Overuren goedgekeurd',
            'AFKEURING' => 'Overuren afgekeurd',
            'SALDO_WIJZIGING' => 'Saldo aangepast',
            'HERINNERING' => 'Herinnering: overuren indienen',
            'INFO' => 'Nieuwe informatie',
        ];

        $berichten = [
            'GOEDKEURING' => 'Je overuren zijn goedgekeurd en toegevoegd aan je saldo.',
            'AFKEURING' => 'Je overuren zijn helaas afgekeurd. Zie de reden bij de registratie.',
            'SALDO_WIJZIGING' => 'Je saldo is handmatig aangepast door HR.',
            'HERINNERING' => 'Vergeet niet je overuren van deze week in te dienen.',
            'INFO' => 'Er is nieuwe informatie beschikbaar over het overuren systeem.',
        ];

        return [
            'user_id' => User::factory(),
            'type' => $type,
            'titel' => $titels[$type],
            'bericht' => $berichten[$type],
            'gelezen' => fake()->boolean(30),
            'gerelateerd_id' => null,
        ];
    }

    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'gelezen' => false,
        ]);
    }

    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'gelezen' => true,
        ]);
    }
}
