<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Saldo extends Model
{
    use HasFactory;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'jaar',
        'overgedragen_saldo',
        'opgenomen_saldo',
        'overuren_saldo',
        'laatst_bijgewerkt',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'overgedragen_saldo' => 0,
        'opgenomen_saldo' => 0,
        'overuren_saldo' => 0,
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
     * Calculate total saldo
     * Formula: overgedragen + overuren - opgenomen
     */
    public function getTotaalSaldoAttribute(): int
    {
        return $this->overgedragen_saldo + $this->overuren_saldo - $this->opgenomen_saldo;
    }

    /**
     * Get formatted total saldo string (e.g., "24u 30m")
     */
    public function getFormattedSaldoAttribute(): string
    {
        $totaal = $this->totaal_saldo;
        $absMinuten = abs($totaal);
        $uren = floor($absMinuten / 60);
        $minuten = $absMinuten % 60;
        $prefix = $totaal < 0 ? '-' : '';

        return "{$prefix}{$uren}u {$minuten}m";
    }
}
