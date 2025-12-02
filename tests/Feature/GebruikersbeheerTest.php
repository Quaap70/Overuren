<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

beforeEach(function () {
    $this->hrUser = User::factory()->hr()->create();
    $this->employee = User::factory()->medewerker()->create();
    // Dynamische afdelingen uit config, met veilige fallback
    $afdelingen = (array) config('afdelingen.lijst', []);
    $this->afd1 = $afdelingen[0] ?? 'Algemeen';
    $this->afd2 = $afdelingen[1] ?? $this->afd1;
});

test('hr can view new user form', function () {
    $this->actingAs($this->hrUser);

    $response = $this->get('/hr/gebruikers/nieuw');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/Gebruikers/Nieuw')
    );
});

test('hr can create new employee', function () {
    $this->actingAs($this->hrUser);

    $response = $this->post('/hr/gebruikers', [
        'username' => 'testnew1',
        'email' => 'testnew@overuren.nl',
        'password' => 'Welkom123!',
        'password_confirmation' => 'Welkom123!',
        'voornaam' => 'Test',
        'achternaam' => 'Gebruiker',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd1,
        'startdatum' => '2025-11-30',
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $this->assertDatabaseHas('users', [
        'username' => 'testnew1',
        'email' => 'testnew@overuren.nl',
        'voornaam' => 'Test',
        'achternaam' => 'Gebruiker',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd1,
        'is_active' => true,
    ]);
});

test('hr can create new hr user', function () {
    $this->actingAs($this->hrUser);

    $response = $this->post('/hr/gebruikers', [
        'username' => 'testhr1',
        'email' => 'testhr@overuren.nl',
        'password' => 'Welkom123!',
        'password_confirmation' => 'Welkom123!',
        'voornaam' => 'HR',
        'achternaam' => 'Medewerker',
        'role' => 'HR',
        // Gebruik een geldige afdeling uit config (maakt niet uit voor rol)
        'afdeling' => $this->afd1,
        'startdatum' => '2025-11-30',
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $this->assertDatabaseHas('users', [
        'username' => 'testhr1',
        'role' => 'HR',
    ]);
});

test('hr cannot create user with duplicate username', function () {
    $this->actingAs($this->hrUser);

    $response = $this->post('/hr/gebruikers', [
        'username' => $this->employee->username,
        'email' => 'newunique@overuren.nl',
        'password' => 'Welkom123!',
        'password_confirmation' => 'Welkom123!',
        'voornaam' => 'Test',
        'achternaam' => 'Gebruiker',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd1,
        'startdatum' => '2025-11-30',
    ]);

    $response->assertSessionHasErrors('username');
});

test('hr cannot create user with duplicate email', function () {
    $this->actingAs($this->hrUser);

    $response = $this->post('/hr/gebruikers', [
        'username' => 'uniqueusername',
        'email' => $this->employee->email,
        'password' => 'Welkom123!',
        'password_confirmation' => 'Welkom123!',
        'voornaam' => 'Test',
        'achternaam' => 'Gebruiker',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd1,
        'startdatum' => '2025-11-30',
    ]);

    $response->assertSessionHasErrors('email');
});

test('hr cannot create user with missing required fields', function () {
    $this->actingAs($this->hrUser);

    $response = $this->post('/hr/gebruikers', [
        'username' => 'incomplete',
    ]);

    $response->assertSessionHasErrors(['email', 'password', 'voornaam', 'achternaam', 'role', 'afdeling', 'startdatum']);
});

test('hr cannot create user with mismatched password confirmation', function () {
    $this->actingAs($this->hrUser);

    $response = $this->post('/hr/gebruikers', [
        'username' => 'testnew1',
        'email' => 'testnew@overuren.nl',
        'password' => 'Welkom123!',
        'password_confirmation' => 'WrongPassword!',
        'voornaam' => 'Test',
        'achternaam' => 'Gebruiker',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd1,
        'startdatum' => '2025-11-30',
    ]);

    $response->assertSessionHasErrors('password');
});

test('hr can view edit user form', function () {
    $this->actingAs($this->hrUser);

    $response = $this->get("/hr/gebruikers/{$this->employee->id}/bewerken");

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/Gebruikers/Bewerken')
             ->has('gebruiker')
             ->where('gebruiker.id', $this->employee->id)
    );
});

test('hr can update user details', function () {
    $this->actingAs($this->hrUser);

    $response = $this->put("/hr/gebruikers/{$this->employee->id}", [
        'email' => 'updated@overuren.nl',
        'voornaam' => 'Updated',
        'achternaam' => 'Name',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd2,
        'startdatum' => '2024-01-01',
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $this->assertDatabaseHas('users', [
        'id' => $this->employee->id,
        'email' => 'updated@overuren.nl',
        'voornaam' => 'Updated',
        'achternaam' => 'Name',
        'afdeling' => $this->afd2,
    ]);
});

test('hr can change user role from medewerker to hr', function () {
    $this->actingAs($this->hrUser);

    $response = $this->put("/hr/gebruikers/{$this->employee->id}", [
        'email' => $this->employee->email,
        'voornaam' => $this->employee->voornaam,
        'achternaam' => $this->employee->achternaam,
        'role' => 'HR',
        // Gebruik geldige afdeling
        'afdeling' => $this->afd1,
        'startdatum' => $this->employee->startdatum,
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $this->assertDatabaseHas('users', [
        'id' => $this->employee->id,
        'role' => 'HR',
    ]);
});

test('hr cannot update user with duplicate email', function () {
    $this->actingAs($this->hrUser);

    $otherUser = User::factory()->medewerker()->create();

    $response = $this->put("/hr/gebruikers/{$this->employee->id}", [
        'email' => $otherUser->email,
        'voornaam' => $this->employee->voornaam,
        'achternaam' => $this->employee->achternaam,
        'role' => 'MEDEWERKER',
        'afdeling' => $this->employee->afdeling,
        'startdatum' => $this->employee->startdatum,
    ]);

    $response->assertSessionHasErrors('email');
});

test('hr can deactivate user', function () {
    $this->actingAs($this->hrUser);

    expect($this->employee->is_active)->toBeTrue();

    $response = $this->post("/hr/gebruikers/{$this->employee->id}/deactiveren");

    $response->assertRedirect();

    $this->employee->refresh();
    expect($this->employee->is_active)->toBeFalse();
});

test('hr can activate user', function () {
    $this->actingAs($this->hrUser);

    $this->employee->update(['is_active' => false]);

    $response = $this->post("/hr/gebruikers/{$this->employee->id}/activeren");

    $response->assertRedirect();

    $this->employee->refresh();
    expect($this->employee->is_active)->toBeTrue();
});

test('hr can reset user password', function () {
    $this->actingAs($this->hrUser);

    $oldPasswordHash = $this->employee->password;

    $response = $this->post("/hr/gebruikers/{$this->employee->id}/wachtwoord-reset", [
        'new_password' => 'NieuwWachtwoord123!',
        'new_password_confirmation' => 'NieuwWachtwoord123!',
    ]);

    $response->assertRedirect();

    $this->employee->refresh();
    expect($this->employee->password)->not->toBe($oldPasswordHash);
    expect(Hash::check('NieuwWachtwoord123!', $this->employee->password))->toBeTrue();
});

test('hr cannot reset password with mismatched confirmation', function () {
    $this->actingAs($this->hrUser);

    $response = $this->post("/hr/gebruikers/{$this->employee->id}/wachtwoord-reset", [
        'new_password' => 'NieuwWachtwoord123!',
        'new_password_confirmation' => 'VerkeerdeBevestiging!',
    ]);

    $response->assertSessionHasErrors('new_password');
});

test('employee cannot access new user form', function () {
    $this->actingAs($this->employee);

    $response = $this->get('/hr/gebruikers/nieuw');

    $response->assertForbidden();
});

test('employee cannot create new user', function () {
    $this->actingAs($this->employee);

    $response = $this->post('/hr/gebruikers', [
        'username' => 'testnew1',
        'email' => 'testnew@overuren.nl',
        'password' => 'Welkom123!',
        'password_confirmation' => 'Welkom123!',
        'voornaam' => 'Test',
        'achternaam' => 'Gebruiker',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd1,
        'startdatum' => '2025-11-30',
    ]);

    $response->assertForbidden();
});

test('employee cannot access edit user form', function () {
    $this->actingAs($this->employee);

    $otherUser = User::factory()->medewerker()->create();

    $response = $this->get("/hr/gebruikers/{$otherUser->id}/bewerken");

    $response->assertForbidden();
});

test('employee cannot update user', function () {
    $this->actingAs($this->employee);

    $otherUser = User::factory()->medewerker()->create();

    $response = $this->put("/hr/gebruikers/{$otherUser->id}", [
        'email' => 'hacked@overuren.nl',
        'voornaam' => 'Hacked',
        'achternaam' => 'User',
        'role' => 'HR',
        'afdeling' => 'HR',
        'startdatum' => '2025-01-01',
    ]);

    $response->assertForbidden();
});

test('employee cannot deactivate user', function () {
    $this->actingAs($this->employee);

    $otherUser = User::factory()->medewerker()->create();

    $response = $this->post("/hr/gebruikers/{$otherUser->id}/deactiveren");

    $response->assertForbidden();
});

test('employee cannot activate user', function () {
    $this->actingAs($this->employee);

    $otherUser = User::factory()->medewerker()->create(['is_active' => false]);

    $response = $this->post("/hr/gebruikers/{$otherUser->id}/activeren");

    $response->assertForbidden();
});

test('employee cannot reset user password', function () {
    $this->actingAs($this->employee);

    $otherUser = User::factory()->medewerker()->create();

    $response = $this->post("/hr/gebruikers/{$otherUser->id}/wachtwoord-reset", [
        'new_password' => 'Hacked123!',
        'new_password_confirmation' => 'Hacked123!',
    ]);

    $response->assertForbidden();
});

// ============================================
// OVERGEDRAGEN SALDO TESTS
// ============================================

test('hr can create new employee with overgedragen saldo in minuten', function () {
    $this->actingAs($this->hrUser);

    $response = $this->post('/hr/gebruikers', [
        'username' => 'testwithoverdracht',
        'email' => 'testoverdracht@overuren.nl',
        'password' => 'Welkom123!',
        'password_confirmation' => 'Welkom123!',
        'voornaam' => 'Test',
        'achternaam' => 'Overdracht',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd1,
        'startdatum' => '2025-11-30',
        'overgedragen_saldo' => 480, // 8 uur in minuten
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $newUser = \App\Models\User::where('username', 'testwithoverdracht')->first();
    expect($newUser)->not->toBeNull();

    // Controleer saldo in database
    $huidigJaar = now()->year;
    $this->assertDatabaseHas('saldos', [
        'user_id' => $newUser->id,
        'jaar' => $huidigJaar,
        'overgedragen_saldo' => 480,
    ]);
});

test('hr can create new employee with overgedragen saldo in uren (wordt omgerekend)', function () {
    $this->actingAs($this->hrUser);

    // Simuleer dat frontend 40 uren heeft omgerekend naar 2400 minuten
    $response = $this->post('/hr/gebruikers', [
        'username' => 'testuren',
        'email' => 'testuren@overuren.nl',
        'password' => 'Welkom123!',
        'password_confirmation' => 'Welkom123!',
        'voornaam' => 'Test',
        'achternaam' => 'Uren',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd1,
        'startdatum' => '2025-11-30',
        'overgedragen_saldo' => 2400, // 40 uur × 60 = 2400 minuten (al omgerekend door frontend)
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $newUser = \App\Models\User::where('username', 'testuren')->first();
    expect($newUser)->not->toBeNull();

    // Controleer dat 2400 minuten (40 uur) correct is opgeslagen
    $huidigJaar = now()->year;
    $this->assertDatabaseHas('saldos', [
        'user_id' => $newUser->id,
        'jaar' => $huidigJaar,
        'overgedragen_saldo' => 2400,
    ]);
});

test('hr can create new employee with zero overgedragen saldo', function () {
    $this->actingAs($this->hrUser);

    $response = $this->post('/hr/gebruikers', [
        'username' => 'testzero',
        'email' => 'testzero@overuren.nl',
        'password' => 'Welkom123!',
        'password_confirmation' => 'Welkom123!',
        'voornaam' => 'Test',
        'achternaam' => 'Zero',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd1,
        'startdatum' => '2025-11-30',
        'overgedragen_saldo' => 0,
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $newUser = \App\Models\User::where('username', 'testzero')->first();
    expect($newUser)->not->toBeNull();

    // Geen saldo record moet aangemaakt zijn (of wel maar met 0)
    $huidigJaar = now()->year;
    $saldo = \App\Models\Saldo::where('user_id', $newUser->id)
        ->where('jaar', $huidigJaar)
        ->first();

    // Als er een saldo record is, moet overgedragen_saldo 0 zijn
    if ($saldo) {
        expect($saldo->overgedragen_saldo)->toBe(0);
    }
});

test('hr can create new employee with negative overgedragen saldo', function () {
    $this->actingAs($this->hrUser);

    $response = $this->post('/hr/gebruikers', [
        'username' => 'testnegative',
        'email' => 'testnegative@overuren.nl',
        'password' => 'Welkom123!',
        'password_confirmation' => 'Welkom123!',
        'voornaam' => 'Test',
        'achternaam' => 'Negative',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd1,
        'startdatum' => '2025-11-30',
        'overgedragen_saldo' => -240, // -4 uur (tekort)
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $newUser = \App\Models\User::where('username', 'testnegative')->first();
    expect($newUser)->not->toBeNull();

    $huidigJaar = now()->year;
    $this->assertDatabaseHas('saldos', [
        'user_id' => $newUser->id,
        'jaar' => $huidigJaar,
        'overgedragen_saldo' => -240,
    ]);
});

test('hr can update employee overgedragen saldo in minuten', function () {
    $this->actingAs($this->hrUser);

    // Maak eerst een gebruiker
    $user = User::factory()->medewerker()->create([
        'afdeling' => $this->afd1,
    ]);

    // Update met overgedragen saldo
    $response = $this->put("/hr/gebruikers/{$user->id}", [
        'email' => $user->email,
        'voornaam' => $user->voornaam,
        'achternaam' => $user->achternaam,
        'role' => $user->role,
        'afdeling' => $user->afdeling,
        'startdatum' => $user->startdatum,
        'overgedragen_saldo' => 960, // 16 uur
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $huidigJaar = now()->year;
    $this->assertDatabaseHas('saldos', [
        'user_id' => $user->id,
        'jaar' => $huidigJaar,
        'overgedragen_saldo' => 960,
    ]);
});

test('hr can update employee overgedragen saldo to zero', function () {
    $this->actingAs($this->hrUser);

    // Maak gebruiker met saldo
    $user = User::factory()->medewerker()->create([
        'afdeling' => $this->afd1,
    ]);

    $huidigJaar = now()->year;
    \App\Models\Saldo::create([
        'user_id' => $user->id,
        'jaar' => $huidigJaar,
        'overgedragen_saldo' => 500,
    ]);

    // Update naar 0
    $response = $this->put("/hr/gebruikers/{$user->id}", [
        'email' => $user->email,
        'voornaam' => $user->voornaam,
        'achternaam' => $user->achternaam,
        'role' => $user->role,
        'afdeling' => $user->afdeling,
        'startdatum' => $user->startdatum,
        'overgedragen_saldo' => 0,
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $this->assertDatabaseHas('saldos', [
        'user_id' => $user->id,
        'jaar' => $huidigJaar,
        'overgedragen_saldo' => 0,
    ]);
});

test('medewerkers lijst toont overgedragen saldo en huidig saldo correct', function () {
    $this->actingAs($this->hrUser);

    // Maak medewerker met overgedragen saldo
    $user = User::factory()->medewerker()->create([
        'voornaam' => 'Jan',
        'achternaam' => 'Jansen',
        'afdeling' => $this->afd1,
    ]);

    $huidigJaar = now()->year;
    $saldo = \App\Models\Saldo::create([
        'user_id' => $user->id,
        'jaar' => $huidigJaar,
        'overgedragen_saldo' => 1200, // 20 uur
        'overuren_saldo' => 300,      // +5 uur
        'opgenomen_saldo' => -180,    // -3 uur
        'laatst_bijgewerkt' => now(),
    ]);

    $response = $this->get('/hr/medewerkers');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/Medewerkers')
            ->has('medewerkers.data', fn ($medewerkers) =>
                $medewerkers->where('id', $user->id)
                    ->where('overgedragen_saldo', 1200)
                    ->where('formatted_overgedragen_saldo', '20u 0m')
                    ->where('huidig_saldo', 1320) // 1200 + 300 - 180
                    ->where('formatted_saldo', '22u 0m')
                    ->etc()
            )
    );
});

test('medewerkers lijst toont negatief overgedragen saldo correct', function () {
    $this->actingAs($this->hrUser);

    $user = User::factory()->medewerker()->create([
        'afdeling' => $this->afd1,
    ]);

    $huidigJaar = now()->year;
    \App\Models\Saldo::create([
        'user_id' => $user->id,
        'jaar' => $huidigJaar,
        'overgedragen_saldo' => -480, // -8 uur (tekort)
        'overuren_saldo' => 0,
        'opgenomen_saldo' => 0,
        'laatst_bijgewerkt' => now(),
    ]);

    $response = $this->get('/hr/medewerkers');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/Medewerkers')
            ->has('medewerkers.data', fn ($medewerkers) =>
                $medewerkers->where('id', $user->id)
                    ->where('overgedragen_saldo', -480)
                    ->where('formatted_overgedragen_saldo', '-8u 0m')
                    ->etc()
            )
    );
});

test('medewerkers lijst toont correct geformatteerd overgedragen saldo met minuten', function () {
    $this->actingAs($this->hrUser);

    $user = User::factory()->medewerker()->create([
        'afdeling' => $this->afd1,
    ]);

    $huidigJaar = now()->year;
    \App\Models\Saldo::create([
        'user_id' => $user->id,
        'jaar' => $huidigJaar,
        'overgedragen_saldo' => 1337, // 22u 17m
        'overuren_saldo' => 0,
        'opgenomen_saldo' => 0,
        'laatst_bijgewerkt' => now(),
    ]);

    $response = $this->get('/hr/medewerkers');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/Medewerkers')
            ->has('medewerkers.data', fn ($medewerkers) =>
                $medewerkers->where('id', $user->id)
                    ->where('overgedragen_saldo', 1337)
                    ->where('formatted_overgedragen_saldo', '22u 17m')
                    ->etc()
            )
    );
});

test('nieuwe gebruiker zonder overgedragen saldo toont 0u 0m', function () {
    $this->actingAs($this->hrUser);

    // Gebruiker zonder saldo record
    $user = User::factory()->medewerker()->create([
        'afdeling' => $this->afd1,
    ]);

    $response = $this->get('/hr/medewerkers');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('HR/Medewerkers')
            ->has('medewerkers.data', fn ($medewerkers) =>
                $medewerkers->where('id', $user->id)
                    ->where('overgedragen_saldo', 0)
                    ->where('formatted_overgedragen_saldo', '0u 0m')
                    ->where('huidig_saldo', 0)
                    ->where('formatted_saldo', '0u 0m')
                    ->etc()
            )
    );
});
