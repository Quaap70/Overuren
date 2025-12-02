<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Prepare one HR and one Medewerker
    $this->hr = User::factory()->hr()->create();
    $this->medewerker = User::factory()->medewerker()->create();
});

/**
 * HR/Gebruikers/Nieuw: bij validatiefouten moeten errors zichtbaar zijn in Inertia props
 */
test('nieuw-gebruiker form shows validation errors via inertia props', function () {
    $this->actingAs($this->hr);

    // Ontbrekende verplichte velden om validatie te triggeren
    $response = $this->from('/hr/gebruikers/nieuw')->post('/hr/gebruikers', [
        'username' => 'incomplete',
        // overige verplichte velden ontbreken expres
    ]);

    $response->assertSessionHasErrors(['email', 'password', 'voornaam', 'achternaam', 'role', 'afdeling', 'startdatum']);

    // Na redirect terug naar formulier horen errors in props te zitten
    $page = $this->get('/hr/gebruikers/nieuw');
    $page->assertOk();
    $page->assertInertia(fn ($page) =>
        $page->component('HR/Gebruikers/Nieuw')
             ->has('errors')
             ->has('errors.email')
             ->has('errors.password')
             ->has('errors.voornaam')
             ->has('errors.achternaam')
             ->has('errors.role')
             ->has('errors.afdeling')
             ->has('errors.startdatum')
    );
});

/**
 * HR/Gebruikers/Bewerken: bij validatiefouten moeten errors zichtbaar zijn in Inertia props
 */
test('gebruiker-bewerken form shows validation errors via inertia props', function () {
    $this->actingAs($this->hr);

    $response = $this->from("/hr/gebruikers/{$this->medewerker->id}/bewerken")->put("/hr/gebruikers/{$this->medewerker->id}", [
        // Een foutieve email om validatie te triggeren
        'email' => 'geen-geldige-email',
        'voornaam' => '',
        'achternaam' => '',
        'role' => 'MEDEWERKER',
        'afdeling' => $this->medewerker->afdeling ?? ((array) config('afdelingen.lijst'))[0] ?? 'Algemeen',
        'startdatum' => 'not-a-date',
    ]);

    $response->assertSessionHasErrors(['email', 'voornaam', 'achternaam', 'startdatum']);

    $page = $this->get("/hr/gebruikers/{$this->medewerker->id}/bewerken");
    $page->assertOk();
    $page->assertInertia(fn ($page) =>
        $page->component('HR/Gebruikers/Bewerken')
             ->has('errors')
             ->has('errors.email')
             ->has('errors.voornaam')
             ->has('errors.achternaam')
             ->has('errors.startdatum')
    );
});

/**
 * Overuren/Index: aanmaken met foutieve data moet errors in props geven
 */
test('overuren aanmaken toont validation errors via inertia props', function () {
    $this->actingAs($this->medewerker);

    // Beide velden ongeldig zodat validator faalt
    $response = $this->from('/overuren')->post('/overuren', [
        'datum' => '',
        'minuten' => 'abc',
        'reden' => str_repeat('x', 10),
    ]);

    $response->assertSessionHasErrors(['datum', 'minuten']);

    $page = $this->get('/overuren');
    $page->assertOk();
    $page->assertInertia(fn ($page) =>
        $page->component('Overuren/Index')
             ->has('errors')
             ->has('errors.datum')
             ->has('errors.minuten')
    );
});

/**
 * Profiel pagina: foutieve email update moet errors in props geven
 */
test('profiel email update shows validation errors via inertia props', function () {
    $this->actingAs($this->medewerker);

    $response = $this->from('/profiel')->post('/profiel/email', [
        'email' => 'niet-geldig',
    ]);

    $response->assertSessionHasErrors(['email']);

    $page = $this->get('/profiel');
    $page->assertOk();
    $page->assertInertia(fn ($page) =>
        $page->component('Profiel')
             ->has('errors')
             ->has('errors.email')
    );
});

/**
 * Profiel wachtwoord update: mismatch confirmeert error in props
 */
test('profiel wachtwoord update shows validation errors via inertia props for weak password', function () {
    $this->actingAs($this->medewerker);

    $response = $this->from('/profiel')->post('/profiel/wachtwoord', [
        'current_password' => 'verkeerd',
        'new_password' => 'korte',
        'new_password_confirmation' => 'anders',
    ]);

    $response->assertSessionHasErrors(['new_password']);

    $page = $this->get('/profiel');
    $page->assertOk();
    $page->assertInertia(fn ($page) =>
        $page->component('Profiel')
             ->has('errors')
             ->has('errors.new_password')
    );
});

/**
 * WachtwoordWijzigen pagina: verkeerde input moet errors tonen in props
 */
test('wachtwoord-wijzigen form shows validation errors via inertia props for weak password', function () {
    // Forceer must_change_password true zodat route logisch is
    $this->medewerker->update(['must_change_password' => true]);
    $this->actingAs($this->medewerker);

    $response = $this->from('/wachtwoord-wijzigen')->post('/wachtwoord-wijzigen', [
        'current_password' => 'fout',
        'new_password' => '123',
        'new_password_confirmation' => '456',
    ]);

    $response->assertSessionHasErrors(['new_password']);

    $page = $this->get('/wachtwoord-wijzigen');
    $page->assertOk();
    $page->assertInertia(fn ($page) =>
        $page->component('WachtwoordWijzigen')
             ->has('errors')
             ->has('errors.new_password')
    );
});

test('wachtwoord-wijzigen shows current_password error when wrong current is provided', function () {
    $this->medewerker->update(['must_change_password' => true]);
    $this->actingAs($this->medewerker);

    // Valide nieuw wachtwoord, maar fout huidige wachtwoord om controller-specifieke fout te triggeren
    $response = $this->from('/wachtwoord-wijzigen')->post('/wachtwoord-wijzigen', [
        'current_password' => 'fout',
        'new_password' => 'SterkWachtwoord123!',
        'new_password_confirmation' => 'SterkWachtwoord123!',
    ]);

    $response->assertSessionHasErrors(['current_password']);

    $page = $this->get('/wachtwoord-wijzigen');
    $page->assertOk();
    $page->assertInertia(fn ($page) =>
        $page->component('WachtwoordWijzigen')
             ->has('errors')
             ->has('errors.current_password')
    );
});
