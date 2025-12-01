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
                'opgenomen_saldo' => 0,
                'overuren_saldo' => 0,
                'laatst_bijgewerkt' => now(),
            ]
        );
    }

    /**
     * Recalculate saldo for user
     *
     * Nieuwe berekening:
     * - overuren_saldo = som van positieve minuten (overuren gemaakt)
     * - opgenomen_saldo = absoluut getal van negatieve minuten (uren opgenomen)
     * - totaal = overgedragen + overuren_saldo - opgenomen_saldo
     */
    public function recalculateSaldo(int $userId, int $jaar): Saldo
    {
        $goedgekeurdeUren = Overuren::where('user_id', $userId)
            ->where('jaar', $jaar)
            ->where('status', 'GOEDGEKEURD')
            ->get();

        // Bereken overuren saldo (alleen positieve waarden)
        $overurenSaldo = $goedgekeurdeUren
            ->where('minuten', '>', 0)
            ->sum('minuten');

        // Bereken opgenomen saldo (absoluut getal van negatieve waarden)
        $opgenomenSaldo = abs($goedgekeurdeUren
            ->where('minuten', '<', 0)
            ->sum('minuten'));

        $saldo = $this->getOrCreateSaldo($userId, $jaar);
        $saldo->overuren_saldo = $overurenSaldo;
        $saldo->opgenomen_saldo = $opgenomenSaldo;
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
