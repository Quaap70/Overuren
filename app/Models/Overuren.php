<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Overuren extends Model
{
    use HasFactory;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'datum',
        'minuten',
        'reden',
        'week_nummer',
        'jaar',
        'status',
        'afkeur_reden',
        'ingediend_op',
        'goedgekeurd_op',
        'goedgekeurd_door',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'datum' => 'date',
        'ingediend_op' => 'datetime',
        'goedgekeurd_op' => 'datetime',
    ];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'overuren';

    /**
     * Get the user that owns the overtime entry
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user that approved this entry
     */
    public function goedkeurder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'goedgekeurd_door');
    }

    /**
     * Get formatted time string (e.g., "2u 30m")
     */
    public function getFormattedTimeAttribute(): string
    {
        $absMinuten = abs($this->minuten);
        $uren = floor($absMinuten / 60);
        $minuten = $absMinuten % 60;
        $prefix = $this->minuten < 0 ? '-' : '';

        return "{$prefix}{$uren}u {$minuten}m";
    }

    /**
     * Check if entry can be modified
     */
    public function canBeModified(): bool
    {
        return in_array($this->status, ['CONCEPT', 'AFGEKEURD']);
    }

    /**
     * Validate minutes (must be multiple of 10 and max ±720)
     */
    public static function validateMinuten(int $minuten): bool
    {
        return $minuten % 10 === 0 && abs($minuten) <= 720;
    }
}
