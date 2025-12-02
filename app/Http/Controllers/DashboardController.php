<?php

namespace App\Http\Controllers;

use App\Services\SaldoService;
use App\Services\MonthCalendarService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private SaldoService $saldoService,
        private MonthCalendarService $monthCalendarService,
    ) {}

    /**
     * Display employee dashboard
     */
    public function index(Request $request)
    {
        $huidigJaar = now()->year;
        $huidigeMaand = now()->month;

        // Query parameters (optioneel): ?year=YYYY&month=MM
        $jaar = (int) ($request->query('year', $huidigJaar));
        $maand = (int) ($request->query('month', $huidigeMaand));

        $saldo = $this->saldoService->getOrCreateSaldo($request->user()->id, $huidigJaar);
        $calendarData = $this->monthCalendarService->getUserMonth($request->user()->id, $jaar, $maand);

        return Inertia::render('Dashboard/Index', [
            'saldo' => [
                'jaar' => $huidigJaar,
                'saldo_minuten' => $saldo->totaal_saldo,
                'formatted' => $saldo->formatted_saldo,
                'overgedragen' => $saldo->overgedragen_saldo,
                'overuren' => $saldo->overuren_saldo,
                'opgenomen' => $saldo->opgenomen_saldo,
                'laatst_bijgewerkt' => $saldo->laatst_bijgewerkt->format('Y-m-d H:i:s'),
            ],
            'calendar' => $calendarData,
        ]);
    }
}
