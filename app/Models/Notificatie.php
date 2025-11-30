<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificatie extends Model
{
    use HasFactory;
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
     * Get icon name based on notification type
     * Returns the icon component name for use with HeroIcons
     */
    public function getIconAttribute(): string
    {
        return match($this->type) {
            'GOEDKEURING' => 'CheckCircleIcon',
            'AFKEURING' => 'XCircleIcon',
            'SALDO_WIJZIGING' => 'CurrencyDollarIcon',
            'HERINNERING' => 'BellIcon',
            'INFO' => 'InformationCircleIcon',
            default => 'InformationCircleIcon',
        };
    }
}
