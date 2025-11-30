<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

beforeEach(function () {
    $this->hrUser = User::factory()->hr()->create();
    $this->employee = User::factory()->medewerker()->create();
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
        'afdeling' => 'Productie',
        'startdatum' => '2025-11-30',
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $this->assertDatabaseHas('users', [
        'username' => 'testnew1',
        'email' => 'testnew@overuren.nl',
        'voornaam' => 'Test',
        'achternaam' => 'Gebruiker',
        'role' => 'MEDEWERKER',
        'afdeling' => 'Productie',
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
        'afdeling' => 'HR',
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
        'afdeling' => 'Productie',
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
        'afdeling' => 'Productie',
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
        'afdeling' => 'Productie',
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
        'afdeling' => 'Montage',
        'startdatum' => '2024-01-01',
    ]);

    $response->assertRedirect('/hr/medewerkers');

    $this->assertDatabaseHas('users', [
        'id' => $this->employee->id,
        'email' => 'updated@overuren.nl',
        'voornaam' => 'Updated',
        'achternaam' => 'Name',
        'afdeling' => 'Montage',
    ]);
});

test('hr can change user role from medewerker to hr', function () {
    $this->actingAs($this->hrUser);

    $response = $this->put("/hr/gebruikers/{$this->employee->id}", [
        'email' => $this->employee->email,
        'voornaam' => $this->employee->voornaam,
        'achternaam' => $this->employee->achternaam,
        'role' => 'HR',
        'afdeling' => 'HR',
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
        'afdeling' => 'Productie',
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
