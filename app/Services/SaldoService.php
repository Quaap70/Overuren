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
        $approvedTotal = Overuren::where('user_id', $userId)
            ->where('jaar', $jaar)
            ->where('status', 'GOEDGEKEURD')
            ->sum('minuten');

        $saldo = $this->getOrCreateSaldo($userId, $jaar);
        // Zet overuren_saldo gelijk aan totaal goedgekeurde minuten (kan negatief zijn)
        // en laat opgenomen_saldo zoals die al in de database staat (historisch gebruikt/afgeboekt)
        $saldo->overuren_saldo = $approvedTotal;
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
