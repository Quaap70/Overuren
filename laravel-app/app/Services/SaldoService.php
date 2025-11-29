<?php

namespace App\Services;

use App\Models\Overuren;
use App\Models\Saldo;

class SaldoService
{
    /**
     * Get or create saldo for user and year
     */
    public function getOrCreateSaldo(int $userId, int $jaar): Saldo
    {
        return Saldo::firstOrCreate(
            [
                'user_id' => $userId,
                'jaar' => $jaar,
            ],
            [
                'overgedragen_saldo' => 0,
                'gebruikt_saldo' => 0,
                'huidig_saldo' => 0,
                'laatst_bijgewerkt' => now(),
            ]
        );
    }

    /**
     * Recalculate saldo for user
     */
    public function recalculateSaldo(int $userId, int $jaar): Saldo
    {
        $goedgekeurdeUren = Overuren::where('user_id', $userId)
            ->where('jaar', $jaar)
            ->where('status', 'GOEDGEKEURD')
            ->get();

        $totaalMinuten = $goedgekeurdeUren->sum('minuten');

        $saldo = $this->getOrCreateSaldo($userId, $jaar);
        $saldo->huidig_saldo = $saldo->overgedragen_saldo + $totaalMinuten - $saldo->gebruikt_saldo;
        $saldo->laatst_bijgewerkt = now();
        $saldo->save();

        return $saldo;
    }

    /**
     * Get week number from date
     */
    public function getWeekNumber(\DateTimeInterface $date): int
    {
        return (int) $date->format('W');
    }
}
