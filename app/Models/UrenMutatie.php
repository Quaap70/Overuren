<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UrenMutatie extends Model
{
    use HasFactory;

    public const TYPE_OPBOUW = 'OPBOUW';
    public const TYPE_OPNAME = 'OPNAME';
    public const TYPE_CORRECTIE = 'CORRECTIE';
    public const TYPE_OVERDRACHT = 'OVERDRACHT';

    public const STATUS_CONCEPT = 'CONCEPT';
    public const STATUS_DEFINITIEF = 'DEFINITIEF';
    public const STATUS_GEANNULEERD = 'GEANNULEERD';

    protected $table = 'uren_mutaties';

    protected $fillable = [
        'user_id',
        'datum',
        'minuten',
        'type',
        'status',
        'bron',
        'bron_id',
        'geboekt_op',
    ];

    protected $casts = [
        'datum' => 'date',
        'geboekt_op' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeDefinitief($query)
    {
        return $query->where('status', self::STATUS_DEFINITIEF);
    }

    public function scopeInJaar($query, int $jaar)
    {
        return $query->whereYear('datum', $jaar);
    }
}
