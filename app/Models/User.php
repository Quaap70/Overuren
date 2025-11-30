<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'voornaam',
        'achternaam',
        'afdeling',
        'startdatum',
        'is_active',
        'must_change_password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'startdatum' => 'date',
            'is_active' => 'boolean',
            'must_change_password' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /**
     * Get user's full name
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->voornaam} {$this->achternaam}";
    }

    /**
     * Get if user is HR (accessor for frontend)
     */
    public function getIsHrAttribute(): bool
    {
        return $this->role === 'HR';
    }

    /**
     * Check if user is HR
     */
    public function isHR(): bool
    {
        return $this->role === 'HR';
    }

    /**
     * Check if user is employee
     */
    public function isMedewerker(): bool
    {
        return $this->role === 'MEDEWERKER';
    }

    /**
     * Get user's overtime entries
     */
    public function overuren()
    {
        return $this->hasMany(Overuren::class);
    }

    /**
     * Get user's balance records
     */
    public function saldo()
    {
        return $this->hasMany(Saldo::class);
    }

    /**
     * Get user's notifications
     */
    public function notificaties()
    {
        return $this->hasMany(Notificatie::class);
    }

    /**
     * Get overtime entries approved by this user
     */
    public function goedgekeurdeOveruren()
    {
        return $this->hasMany(Overuren::class, 'goedgekeurd_door');
    }
}
