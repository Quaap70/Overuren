<?php

namespace App\Http\Controllers;

use App\Services\SaldoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private SaldoService $saldoService
    ) {}

    /**
     * Display employee dashboard
     */
    public function index(Request $request)
    {
        $huidigJaar = now()->year;
        $saldo = $this->saldoService->getOrCreateSaldo($request->user()->id, $huidigJaar);

        return Inertia::render('Dashboard/Index', [
            'saldo' => [
                'jaar' => $huidigJaar,
                'saldo_minuten' => $saldo->huidig_saldo,
                'formatted' => $saldo->formatted_saldo,
                'overgedragen' => $saldo->overgedragen_saldo,
                'gebruikt' => $saldo->gebruikt_saldo,
                'laatst_bijgewerkt' => $saldo->laatst_bijgewerkt->format('Y-m-d H:i:s'),
            ],
        ]);
    }
}
