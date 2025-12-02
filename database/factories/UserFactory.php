<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'username' => fake()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'voornaam' => fake()->firstName(),
            'achternaam' => fake()->lastName(),
            'role' => 'MEDEWERKER',
            // Gebruik afdelingen dynamisch vanuit config, met veilige fallback
            'afdeling' => function () {
                $lijst = (array) config('afdelingen.lijst', []);
                if (empty($lijst)) {
                    $lijst = ['Algemeen'];
                }
                return fake()->randomElement($lijst);
            },
            'startdatum' => fake()->dateTimeBetween('-5 years', 'now'),
            'is_active' => true,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the user is HR.
     */
    public function hr(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'HR',
        ]);
    }

    /**
     * Indicate that the user is a regular employee (MEDEWERKER).
     * Added to keep tests compatible that call ->medewerker().
     */
    public function medewerker(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'MEDEWERKER',
        ]);
    }

    /**
     * Indicate that the user is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
