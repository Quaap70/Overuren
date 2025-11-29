<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Saldo extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'jaar',
        'overgedragen_saldo',
        'gebruikt_saldo',
        'huidig_saldo',
        'laatst_bijgewerkt',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'laatst_bijgewerkt' => 'datetime',
    ];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'saldo';

    /**
     * Get the user that owns the balance
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get formatted saldo string (e.g., "24u 30m")
     */
    public function getFormattedSaldoAttribute(): string
    {
        $absMinuten = abs($this->huidig_saldo);
        $uren = floor($absMinuten / 60);
        $minuten = $absMinuten % 60;
        $prefix = $this->huidig_saldo < 0 ? '-' : '';

        return "{$prefix}{$uren}u {$minuten}m";
    }

    /**
     * Update saldo based on approved hours
     */
    public function updateSaldo(int $minuten): void
    {
        $this->huidig_saldo += $minuten;
        $this->laatst_bijgewerkt = now();
        $this->save();
    }
}
