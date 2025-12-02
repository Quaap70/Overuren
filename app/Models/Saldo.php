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
        // Backward-compatible virtual attributes used in tests/fixtures
        'huidig_saldo',
        'gebruikt_saldo',
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
    protected $table = 'saldo_cache';

    /**
     * Get the user that owns the balance
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Backward-compatible accessor: huidig_saldo (computed)
     * huidig_saldo = overgedragen_saldo + overuren_saldo - opgenomen_saldo
     */
    public function getHuidigSaldoAttribute(): int
    {
        $overgedragen = (int) ($this->attributes['overgedragen_saldo'] ?? 0);
        $overuren = (int) ($this->attributes['overuren_saldo'] ?? 0);
        $opgenomen = (int) ($this->attributes['opgenomen_saldo'] ?? 0);

        return $overgedragen + $overuren - $opgenomen;
    }

    /**
     * Backward-compatible mutator: allow setting huidig_saldo on fixtures/tests.
     * We infer overuren_saldo so that the computed huidig_saldo matches the provided value.
     */
    public function setHuidigSaldoAttribute($value): void
    {
        $target = (int) $value;
        $overgedragen = (int) ($this->attributes['overgedragen_saldo'] ?? 0);
        $opgenomen = (int) ($this->attributes['opgenomen_saldo'] ?? 0);
        $this->attributes['overuren_saldo'] = $target - $overgedragen + $opgenomen;
    }

    /**
     * Backward-compatible accessor/mutator for gebruikt_saldo → opgenomen_saldo
     */
    public function getGebruiktSaldoAttribute(): int
    {
        return (int) ($this->attributes['opgenomen_saldo'] ?? 0);
    }

    public function setGebruiktSaldoAttribute($value): void
    {
        $this->attributes['opgenomen_saldo'] = (int) $value;
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
