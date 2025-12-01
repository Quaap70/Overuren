<?php

namespace App\Http\Controllers;

use App\Services\SaldoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaldoController extends Controller
{
    public function __construct(
        private SaldoService $saldoService
    ) {}

    /**
     * Display user's saldo
     */
    public function index(Request $request)
    {
        $huidigJaar = now()->year;
        $saldo = $this->saldoService->getOrCreateSaldo($request->user()->id, $huidigJaar);

        return Inertia::render('Saldo/Index', [
            'saldo' => [
                'jaar' => $huidigJaar,
                'saldo_minuten' => $saldo->totaal_saldo,
                'formatted' => $saldo->formatted_saldo,
                'overgedragen' => $saldo->overgedragen_saldo,
                'overuren' => $saldo->overuren_saldo,
                'opgenomen' => $saldo->opgenomen_saldo,
                'laatst_bijgewerkt' => $saldo->laatst_bijgewerkt->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * Get current user's saldo (API endpoint)
     */
    public function current(Request $request)
    {
        $huidigJaar = now()->year;
        $saldo = $this->saldoService->getOrCreateSaldo($request->user()->id, $huidigJaar);

        return response()->json([
            'jaar' => $huidigJaar,
            'saldo_minuten' => $saldo->totaal_saldo,
            'formatted' => $saldo->formatted_saldo,
            'overgedragen' => $saldo->overgedragen_saldo,
            'overuren' => $saldo->overuren_saldo,
            'opgenomen' => $saldo->opgenomen_saldo,
            'laatst_bijgewerkt' => $saldo->laatst_bijgewerkt,
        ]);
    }
}
