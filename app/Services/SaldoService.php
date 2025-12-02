<?php

namespace App\Services;

use App\Models\Overuren;
use App\Models\Saldo;
use App\Models\UrenBaseline;
use App\Models\UrenMutatie;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

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
        // Als er een baseline voor dit jaar bestaat, gebruik de nieuwe, robuuste route (baseline + journaal)
        $baselineExists = UrenBaseline::where('user_id', $userId)->where('jaar', $jaar)->exists();
        if ($baselineExists) {
            return $this->rebuildCacheForUserYear($userId, $jaar);
        }

        // Compatibiliteit: als er (nog) geen baseline is, val terug op legacy-gedrag
        // waarbij we rekenen vanuit bestaand overgedragen_saldo + goedgekeurde Overuren in dat jaar.
        $saldo = $this->getOrCreateSaldo($userId, $jaar);

        // Neem bestaand overgedragen_saldo als start (tests/factories vullen dit)
        $start = (int) ($saldo->overgedragen_saldo ?? 0);

        // Sommeer goedgekeurde overuren binnen het jaar rechtstreeks uit Overuren
        $plus = (int) Overuren::where('user_id', $userId)
            ->where('jaar', $jaar)
            ->where('status', 'GOEDGEKEURD')
            ->where('minuten', '>', 0)
            ->sum('minuten');

        $neg = (int) Overuren::where('user_id', $userId)
            ->where('jaar', $jaar)
            ->where('status', 'GOEDGEKEURD')
            ->where('minuten', '<', 0)
            ->sum('minuten'); // negatief of 0

        $opgenomenAbs = abs($neg);
        // Neem eventueel bestaande (legacy) gebruikt/opgenomen saldo mee als start voor dit jaar
        $baselineOpgenomen = (int) ($saldo->opgenomen_saldo ?? 0);

        $saldo->overuren_saldo = $plus;
        $saldo->opgenomen_saldo = $baselineOpgenomen + $opgenomenAbs;
        // overgedragen_saldo laten zoals die is (tests verwachten dit gedrag)
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

    /**
     * New model: determine if year Y is visible for UI according to baseline rules
     */
    public function canShowYear(int $userId, int $jaar): bool
    {
        $baselineY = UrenBaseline::where('user_id', $userId)->where('jaar', $jaar)->first();
        if (!$baselineY) {
            return false;
        }

        $prev = $jaar - 1;
        $minYear = UrenBaseline::where('user_id', $userId)->min('jaar');
        $isInitial = $minYear !== null && (int) $minYear === $jaar;

        if ($isInitial) {
            return true;
        }

        $baselinePrev = UrenBaseline::where('user_id', $userId)->where('jaar', $prev)->first();
        return $baselinePrev && $baselinePrev->status === UrenBaseline::STATUS_CLOSED;
    }

    /**
     * Calculate per-year overview from baseline + mutaties (definitief)
     * Returns array: [zichtbaar, overgenomen_uren, opgebouwd_dit_jaar, opgenomen_dit_jaar, huidig_saldo]
     */
    public function getJaarOverzicht(int $userId, int $jaar): array
    {
        if (!$this->canShowYear($userId, $jaar)) {
            return ['zichtbaar' => false];
        }

        $baseline = UrenBaseline::where('user_id', $userId)->where('jaar', $jaar)->first();
        $start = (int) ($baseline?->start_saldo ?? 0);

        $query = UrenMutatie::query()
            ->where('user_id', $userId)
            ->definitief()
            ->inJaar($jaar);

        $plus = (int) $query->clone()->where('minuten', '>', 0)->sum('minuten');
        $min = (int) $query->clone()->where('minuten', '<', 0)->sum('minuten'); // negatief getal

        $totaal = $start + $plus + $min; // $min is negatief

        return [
            'zichtbaar' => true,
            'overgenomen_uren' => $start,
            'opgebouwd_dit_jaar' => $plus,
            'opgenomen_dit_jaar' => $min, // negatief
            'huidig_saldo' => $totaal,
        ];
    }

    /**
     * Compute saldo t/m 31-12-(jaar) for a user based on baseline(jaar) and year mutaties.
     */
    public function saldoTotEindeJaar(int $userId, int $jaar): int
    {
        $baseline = UrenBaseline::where('user_id', $userId)->where('jaar', $jaar)->first();
        if (!$baseline) {
            return 0;
        }
        $start = (int) $baseline->start_saldo;
        $som = (int) UrenMutatie::where('user_id', $userId)
            ->definitief()
            ->inJaar($jaar)
            ->sum('minuten');
        return $start + $som;
    }

    /**
     * Start a year Y for all users: create baseline(Y) with start_saldo = saldo t/m 31-12-(Y-1).
     * Requires that Y-1 is CLOSED or Y is the initial seeded year per user.
     */
    public function startJaar(int $jaar): int
    {
        $prev = $jaar - 1;
        $count = 0;

        DB::transaction(function () use ($jaar, $prev, &$count) {
            $users = User::query()->get(['id']);
            foreach ($users as $user) {
                // Skip if already exists
                if (UrenBaseline::where('user_id', $user->id)->where('jaar', $jaar)->exists()) {
                    continue;
                }

                $minYear = UrenBaseline::where('user_id', $user->id)->min('jaar');
                $isInitial = $minYear === null; // no baseline yet → first year allowed

                if (!$isInitial) {
                    $prevBaseline = UrenBaseline::where('user_id', $user->id)->where('jaar', $prev)->first();
                    if (!$prevBaseline || $prevBaseline->status !== UrenBaseline::STATUS_CLOSED) {
                        // do not create baseline if previous is not closed
                        continue;
                    }
                }

                $startSaldo = 0;
                if ($isInitial) {
                    // Initial year for this user: derive carry-over purely from history (definitive mutaties up to end of previous year)
                    $startSaldo = $this->carryOverFromHistory($user->id, $prev);
                } else {
                    // saldo t/m 31-12-(prev) = baseline(prev) + som mutaties in prev
                    $startSaldo = $this->saldoTotEindeJaar($user->id, $prev);
                }

                UrenBaseline::create([
                    'user_id' => $user->id,
                    'jaar' => $jaar,
                    'start_saldo' => $startSaldo,
                    'status' => UrenBaseline::STATUS_OPEN,
                    'asof' => now(),
                ]);
                $count++;
            }
        });

        return $count;
    }

    /**
     * Close a year for all users by setting baseline status to CLOSED
     */
    public function sluitJaar(int $jaar): int
    {
        return UrenBaseline::where('jaar', $jaar)
            ->where('status', UrenBaseline::STATUS_OPEN)
            ->update(['status' => UrenBaseline::STATUS_CLOSED]);
    }

    /**
     * Rollover: Close year (Y-1) if open and start year Y (idempotent).
     * Returns array with counts: ['closed_prev' => n, 'started' => m]
     */
    public function rolOverNaarJaar(int $jaar): array
    {
        $prev = $jaar - 1;
        $result = ['closed_prev' => 0, 'started' => 0];

        DB::transaction(function () use ($prev, $jaar, &$result) {
            // 1) Close previous year if open
            $result['closed_prev'] = UrenBaseline::where('jaar', $prev)
                ->where('status', UrenBaseline::STATUS_OPEN)
                ->update(['status' => UrenBaseline::STATUS_CLOSED]);

            // 2) Start current year (idempotent, only when not exists and rules satisfied)
            $result['started'] = $this->startJaar($jaar);

            // 3) Initialise/actualiseer saldo cache voor het nieuwe jaar voor alle users
            if ($result['started'] > 0) {
                $this->bulkRebuildForYear($jaar);
            }
        });

        return $result;
    }

    /**
     * Rebuild saldo cache for a specific user and year
     * Cache is derived only from baseline + definitive jaar-mutaties (DRY)
     */
    public function rebuildCacheForUserYear(int $userId, int $jaar): Saldo
    {
        $baseline = UrenBaseline::where('user_id', $userId)->where('jaar', $jaar)->first();
        // If baseline missing, ensure a cache row exists but with zeros or just return current row
        $saldo = $this->getOrCreateSaldo($userId, $jaar);

        if (!$baseline) {
            // Leave as-is but update timestamp to reflect attempted rebuild
            $saldo->laatst_bijgewerkt = now();
            $saldo->save();
            return $saldo;
        }

        $start = (int) $baseline->start_saldo;
        $query = UrenMutatie::query()
            ->where('user_id', $userId)
            ->definitief()
            ->inJaar($jaar);

        $plus = (int) $query->clone()->where('minuten', '>', 0)->sum('minuten');
        $negSum = (int) $query->clone()->where('minuten', '<', 0)->sum('minuten'); // negatief getal of 0
        $opgenomenAbs = abs($negSum);

        $saldo->overgedragen_saldo = $start;
        $saldo->overuren_saldo = $plus;
        $saldo->opgenomen_saldo = $opgenomenAbs;
        $saldo->laatst_bijgewerkt = now();
        $saldo->save();

        return $saldo;
    }

    /**
     * Bulk rebuild cache for all users who have a baseline for the given year
     */
    public function bulkRebuildForYear(int $jaar): void
    {
        $userIds = UrenBaseline::where('jaar', $jaar)->pluck('user_id')->all();
        foreach ($userIds as $uid) {
            $this->rebuildCacheForUserYear((int) $uid, $jaar);
        }
    }

    /**
     * Compute carry-over for an initial baseline when there is no previous baseline yet.
     * Sums all definitive mutaties up to and including 31-12-(cutoffYear).
     */
    protected function carryOverFromHistory(int $userId, int $cutoffYear): int
    {
        // If there are no definitive mutaties, carry-over is zero
        $cutoffDate = Carbon::create($cutoffYear, 12, 31)->toDateString();

        $sum = (int) UrenMutatie::query()
            ->where('user_id', $userId)
            ->definitief()
            ->where('datum', '<=', $cutoffDate)
            ->sum('minuten');

        return $sum;
    }
}
