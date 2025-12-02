<?php

namespace App\Services;

use App\Models\Overuren;
use App\Models\UrenMutatie;
use Illuminate\Support\Carbon;

class MonthCalendarService
{
    public function __construct(private readonly SaldoService $saldoService)
    {
    }

    /**
     * Build month calendar data for a given user and month.
     * Returns array with keys:
     * - visible (bool)
     * - calendar: { year, month, daysInMonth, firstWeekday }
     * - days: 1..N each having arrays: concept, ingediend, goedgekeurd, afgekeurd, opnames
     */
    public function getUserMonth(int $userId, int $year, int $month): array
    {
        // Normalize month first
        $month = min(12, max(1, (int) $month));

        // Normalize year against user's available baselines
        $year = (int) $year;
        $hasBaselineForYear = \App\Models\UrenBaseline::where('user_id', $userId)
            ->where('jaar', $year)
            ->exists();

        if ($year < 1970 || !$hasBaselineForYear) {
            // Snap to the latest available baseline year for this user (most useful default)
            $latestBaselineYear = (int) (\App\Models\UrenBaseline::where('user_id', $userId)->max('jaar') ?? 0);
            if ($latestBaselineYear > 0) {
                $year = $latestBaselineYear;
            } else {
                // No baselines at all → keep clamped year but will return visible=false with structure below
                $year = max(1970, $year);
            }
        }

        // Respect visibility policy
        if (!$this->saldoService->canShowYear($userId, $year)) {
            return [
                'visible' => false,
                'calendar' => [
                    'year' => $year,
                    'month' => $month,
                    'daysInMonth' => (int) Carbon::create($year, $month, 1)->daysInMonth,
                    'firstWeekday' => (int) Carbon::create($year, $month, 1)->dayOfWeekIso, // 1=Mon .. 7=Sun
                ],
                'days' => [],
            ];
        }

        $start = Carbon::create($year, $month, 1)->startOfDay();
        $end = (clone $start)->endOfMonth()->endOfDay();
        $daysInMonth = (int) $start->daysInMonth;
        $firstWeekday = (int) $start->dayOfWeekIso; // 1=Mon .. 7=Sun

        // Prepare day buckets
        $days = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $days[$d] = [
                'concept' => [],
                'ingediend' => [],
                'goedgekeurd' => [],
                'afgekeurd' => [],
                'opnames' => [],
            ];
        }

        // Overuren by status within the month
        $overuren = Overuren::query()
            ->where('user_id', $userId)
            ->whereBetween('datum', [$start->toDateString(), $end->toDateString()])
            ->get(['id', 'datum', 'minuten', 'status', 'reden']);

        foreach ($overuren as $o) {
            $day = (int) Carbon::parse($o->datum)->day;
            $item = [
                'id' => $o->id,
                'datum' => Carbon::parse($o->datum)->toDateString(),
                'minuten' => (int) $o->minuten,
                'reden' => $o->reden,
            ];
            switch ($o->status) {
                case 'CONCEPT':
                    $days[$day]['concept'][] = $item;
                    break;
                case 'INGEDIEND':
                    $days[$day]['ingediend'][] = $item;
                    break;
                case 'GOEDGEKEURD':
                    $days[$day]['goedgekeurd'][] = $item;
                    break;
                case 'AFGEKEURD':
                    $days[$day]['afgekeurd'][] = $item;
                    break;
                default:
                    // Onbekende status negeren
                    break;
            }
        }

        // Opnames vanuit journaal (negatieve minuten, definitief) binnen de maand
        $opnames = UrenMutatie::query()
            ->where('user_id', $userId)
            ->definitief()
            ->whereBetween('datum', [$start->toDateString(), $end->toDateString()])
            ->where('minuten', '<', 0)
            ->get(['id', 'datum', 'minuten', 'type']);

        foreach ($opnames as $m) {
            $day = (int) Carbon::parse($m->datum)->day;
            $days[$day]['opnames'][] = [
                'id' => $m->id,
                'datum' => Carbon::parse($m->datum)->toDateString(),
                'minuten' => (int) $m->minuten,
                'type' => $m->type,
            ];
        }

        return [
            'visible' => true,
            'calendar' => [
                'year' => $year,
                'month' => $month,
                'daysInMonth' => $daysInMonth,
                'firstWeekday' => $firstWeekday,
            ],
            'days' => $days,
        ];
    }
}
