<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

beforeEach(function () {
    $this->user = User::factory()->medewerker()->create([
        'password' => Hash::make('OudWachtwoord123!'),
        'must_change_password' => false,
    ]);
    // Dynamische afdeling uit config voor gebruik in POSTs
    $afdelingen = (array) config('afdelingen.lijst', []);
    $this->afd1 = $afdelingen[0] ?? 'Algemeen';
});

test('user with must_change_password is redirected to change password page', function () {
    $this->user->update(['must_change_password' => true]);
    $this->actingAs($this->user);

    $response = $this->get('/dashboard');

    $response->assertRedirect('/wachtwoord-wijzigen');
});

test('user without must_change_password can access dashboard', function () {
    $this->actingAs($this->user);

    $response = $this->get('/dashboard');

    $response->assertOk();
});

test('user can view change password page', function () {
    $this->user->update(['must_change_password' => true]);
    $this->actingAs($this->user);

    $response = $this->get('/wachtwoord-wijzigen');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('WachtwoordWijzigen')
    );
});

test('user can change password successfully', function () {
    $this->user->update(['must_change_password' => true]);
    $this->actingAs($this->user);

    $response = $this->post('/wachtwoord-wijzigen', [
        'current_password' => 'OudWachtwoord123!',
        'new_password' => 'NieuwWachtwoord123!',
        'new_password_confirmation' => 'NieuwWachtwoord123!',
    ]);

    $response->assertRedirect('/dashboard');

    $this->user->refresh();
    expect($this->user->must_change_password)->toBeFalse();
    expect(Hash::check('NieuwWachtwoord123!', $this->user->password))->toBeTrue();
});

test('user cannot change password with wrong current password', function () {
    $this->user->update(['must_change_password' => true]);
    $this->actingAs($this->user);

    $response = $this->post('/wachtwoord-wijzigen', [
        'current_password' => 'VerkeerdeWachtwoord!',
        'new_password' => 'NieuwWachtwoord123!',
        'new_password_confirmation' => 'NieuwWachtwoord123!',
    ]);

    $response->assertSessionHasErrors('current_password');

    $this->user->refresh();
    expect($this->user->must_change_password)->toBeTrue();
});

test('user cannot change password with mismatched confirmation', function () {
    $this->user->update(['must_change_password' => true]);
    $this->actingAs($this->user);

    $response = $this->post('/wachtwoord-wijzigen', [
        'current_password' => 'OudWachtwoord123!',
        'new_password' => 'NieuwWachtwoord123!',
        'new_password_confirmation' => 'AnderWachtwoord123!',
    ]);

    $response->assertSessionHasErrors('new_password');
});

test('user cannot change password with weak password', function () {
    $this->user->update(['must_change_password' => true]);
    $this->actingAs($this->user);

    $response = $this->post('/wachtwoord-wijzigen', [
        'current_password' => 'OudWachtwoord123!',
        'new_password' => '123',
        'new_password_confirmation' => '123',
    ]);

    $response->assertSessionHasErrors('new_password');
});

test('newly created user has must_change_password set to true', function () {
    $this->actingAs(User::factory()->hr()->create());

    $response = $this->post('/hr/gebruikers', [
        'username' => 'newuser',
        'email' => 'newuser@overuren.nl',
        'password' => 'TempPassword123!',
        'password_confirmation' => 'TempPassword123!',
        'voornaam' => 'New',
        'achternaam' => 'User',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->afd1,
        'startdatum' => '2025-11-30',
    ]);

    $newUser = User::where('username', 'newuser')->first();
    expect($newUser->must_change_password)->toBeTrue();
});

test('user after password reset by hr has must_change_password set to true', function () {
    $hrUser = User::factory()->hr()->create();
    $this->actingAs($hrUser);

    $response = $this->post("/hr/gebruikers/{$this->user->id}/wachtwoord-reset", [
        'new_password' => 'ResetPassword123!',
        'new_password_confirmation' => 'ResetPassword123!',
    ]);

    $this->user->refresh();
    expect($this->user->must_change_password)->toBeTrue();
});

test('user can logout even with must_change_password', function () {
    $this->user->update(['must_change_password' => true]);
    $this->actingAs($this->user);

    $response = $this->post('/logout');

    $response->assertRedirect('/login');
});

test('middleware does not redirect on change password page itself', function () {
    $this->user->update(['must_change_password' => true]);
    $this->actingAs($this->user);

    $response = $this->get('/wachtwoord-wijzigen');

    $response->assertOk();
});

test('middleware does not redirect on logout route', function () {
    $this->user->update(['must_change_password' => true]);
    $this->actingAs($this->user);

    $response = $this->post('/logout');

    $response->assertRedirect('/login');
});

test('user can change own password from profile without must_change_password', function () {
    $this->actingAs($this->user);

    $response = $this->post('/profiel/wachtwoord', [
        'current_password' => 'OudWachtwoord123!',
        'new_password' => 'NieuwWachtwoord123!',
        'new_password_confirmation' => 'NieuwWachtwoord123!',
    ]);

    $response->assertRedirect();

    $this->user->refresh();
    expect(Hash::check('NieuwWachtwoord123!', $this->user->password))->toBeTrue();
});

test('user can access profile page', function () {
    $this->actingAs($this->user);

    $response = $this->get('/profiel');

    $response->assertOk();
    $response->assertInertia(fn ($page) =>
        $page->component('Profiel')
    );
});
