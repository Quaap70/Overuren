<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UrenBaseline extends Model
{
    use HasFactory;

    public const STATUS_OPEN = 'OPEN';
    public const STATUS_CLOSED = 'CLOSED';

    protected $table = 'uren_baselines';

    protected $fillable = [
        'user_id',
        'jaar',
        'start_saldo',
        'status',
        'asof',
        'locked',
    ];

    protected $casts = [
        'asof' => 'datetime',
        'locked' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
