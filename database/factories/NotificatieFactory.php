<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Notificatie>
 */
class NotificatieFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['GOEDKEURING', 'AFKEURING', 'SALDO_WIJZIGING', 'HERINNERING', 'INFO'];
        $type = $this->faker->randomElement($types);

        $messages = [
            'GOEDKEURING' => [
                'titel' => 'Overuren Goedgekeurd',
                'bericht' => 'Je overuren van ' . $this->faker->date() . ' zijn goedgekeurd.',
            ],
            'AFKEURING' => [
                'titel' => 'Overuren Afgekeurd',
                'bericht' => 'Je overuren van ' . $this->faker->date() . ' zijn helaas afgekeurd.',
            ],
            'SALDO_WIJZIGING' => [
                'titel' => 'Saldo Aangepast',
                'bericht' => 'Je overuren saldo is handmatig aangepast door HR.',
            ],
            'HERINNERING' => [
                'titel' => 'Herinnering',
                'bericht' => 'Vergeet niet je overuren in te dienen!',
            ],
            'INFO' => [
                'titel' => 'Informatie',
                'bericht' => 'Dit is een informatieve melding.',
            ],
        ];

        return [
            'user_id' => User::factory(),
            'type' => $type,
            'titel' => $messages[$type]['titel'],
            'bericht' => $messages[$type]['bericht'],
            'gelezen' => $this->faker->boolean(30), // 30% chance of being read
            'gerelateerd_id' => null,
        ];
    }

    /**
     * Indicate that the notification is unread.
     */
    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'gelezen' => false,
        ]);
    }

    /**
     * Indicate that the notification is read.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'gelezen' => true,
        ]);
    }

    /**
     * Create a goedkeuring notification.
     */
    public function goedkeuring(int $overurenId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'GOEDKEURING',
            'titel' => 'Overuren Goedgekeurd',
            'bericht' => 'Je overuren zijn goedgekeurd!',
            'gerelateerd_id' => $overurenId,
        ]);
    }

    /**
     * Create an afkeuring notification.
     */
    public function afkeuring(int $overurenId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'AFKEURING',
            'titel' => 'Overuren Afgekeurd',
            'bericht' => 'Je overuren zijn helaas afgekeurd.',
            'gerelateerd_id' => $overurenId,
        ]);
    }

    /**
     * Create a saldo wijziging notification.
     */
    public function saldoWijziging(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'SALDO_WIJZIGING',
            'titel' => 'Saldo Aangepast',
            'bericht' => 'Je overuren saldo is aangepast door HR.',
        ]);
    }
}
