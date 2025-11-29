<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('unauthenticated users are redirected to login', function () {
    $response = $this->get('/dashboard');
    $response->assertRedirect('/login');
});

test('guest can view login page', function () {
    $response = $this->get('/login');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Auth/Login'));
});

test('user can login with valid credentials', function () {
    $user = User::factory()->create([
        'username' => 'testuser',
        'password' => bcrypt('password123'),
        'role' => 'MEDEWERKER',
    ]);

    $response = $this->post('/login', [
        'username' => 'testuser',
        'password' => 'password123',
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($user);
});

test('user cannot login with invalid credentials', function () {
    User::factory()->create([
        'username' => 'testuser',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->post('/login', [
        'username' => 'testuser',
        'password' => 'wrongpassword',
    ]);

    $response->assertSessionHasErrors(['username']);
    $this->assertGuest();
});

test('authenticated user can logout', function () {
    $user = User::factory()->create();

    $this->actingAs($user);
    $response = $this->post('/logout');

    $response->assertRedirect('/login');
    $this->assertGuest();
});

test('hr user is redirected to hr dashboard after login', function () {
    $hrUser = User::factory()->create([
        'username' => 'hruser',
        'password' => bcrypt('password123'),
        'role' => 'HR',
    ]);

    $response = $this->post('/login', [
        'username' => 'hruser',
        'password' => 'password123',
    ]);

    $response->assertRedirect('/hr/dashboard');
    $this->assertAuthenticatedAs($hrUser);
});

test('employee user is redirected to employee dashboard after login', function () {
    $employee = User::factory()->create([
        'username' => 'employee',
        'password' => bcrypt('password123'),
        'role' => 'MEDEWERKER',
    ]);

    $response = $this->post('/login', [
        'username' => 'employee',
        'password' => 'password123',
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($employee);
});
