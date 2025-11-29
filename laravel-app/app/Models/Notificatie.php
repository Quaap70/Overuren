<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificatie extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'type',
        'titel',
        'bericht',
        'gelezen',
        'gerelateerd_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'gelezen' => 'boolean',
    ];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'notificaties';

    /**
     * Get the user that owns the notification
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(): void
    {
        $this->gelezen = true;
        $this->save();
    }

    /**
     * Get icon based on notification type
     */
    public function getIconAttribute(): string
    {
        return match($this->type) {
            'GOEDKEURING' => '✅',
            'AFKEURING' => '❌',
            'SALDO_WIJZIGING' => '💰',
            'HERINNERING' => '⏰',
            'INFO' => 'ℹ️',
            default => 'ℹ️',
        };
    }
}
