<?php

namespace App\Console\Commands;

use App\Models\Overuren;
use App\Models\UrenBaseline;
use App\Models\UrenMutatie;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SeedScenarioCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * Examples:
     *  php artisan app:seed-scenario --scenario=rollover-ready --jaar=2026 --fresh
     *  php artisan app:seed-scenario --scenario=init --jaar=2025 --start-saldo=600
     */
    protected $signature = 'app:seed-scenario
        {--scenario= : init|rollover-ready|started|mid-year|end-year}
        {--jaar= : Doeljaar (default: huidig jaar)}
        {--fresh : Voer migrate:fresh uit voor het seeden}
        {--start-saldo= : Startsaldo in minuten (alleen voor init-scenario, default 0)}';

    /**
     * The console command description.
     */
    protected $description = 'Seed verschillende scenario\'s voor HR/UI testing (jaarbeheer & uren)';

    public function handle(): int
    {
        $scenario = (string) ($this->option('scenario') ?? 'rollover-ready');
        $jaar = (int) ($this->option('jaar') ?? now()->year);
        $fresh = (bool) $this->option('fresh');
        $startSaldoOpt = $this->option('start-saldo');
        $startSaldo = $startSaldoOpt !== null ? (int) $startSaldoOpt : 0;

        if ($fresh) {
            $this->info('🔄 Running migrate:fresh...');
            Artisan::call('migrate:fresh');
            $this->line(Artisan::output());
        }

        DB::transaction(function () {
            // Minimal cleanup for repeatability
            DB::table('uren_mutaties')->delete();
            DB::table('uren_baselines')->delete();
        });

        [$hr, $medewerker] = $this->ensureUsers();

        match ($scenario) {
            'init' => $this->scenarioInit($medewerker, $jaar, $startSaldo),
            'rollover-ready' => $this->scenarioRolloverReady($medewerker, $jaar),
            'started' => $this->scenarioStarted($medewerker, $jaar),
            'mid-year' => $this->scenarioMidYear($medewerker, $jaar),
            'end-year' => $this->scenarioEndYear($medewerker, $jaar),
            default => function () use ($scenario) {
                $this->error("Onbekend scenario: {$scenario}");
            },
        };

        $this->newLine();
        $this->info('✅ Scenario seeding voltooid.');
        $this->line("👤 HR inlog: linda / Welkom123!");
        $this->line("👤 Medewerker inlog: jan / Welkom123!");

        return self::SUCCESS;
    }

    private function ensureUsers(): array
    {
        $this->info('👥 Controleren/aanmaken van HR en medewerker gebruikers...');

        $hr = User::firstOrCreate(
            ['username' => 'linda'],
            [
                'password' => Hash::make('Welkom123!'),
                'email' => 'linda@overuren.nl',
                'voornaam' => 'Linda',
                'achternaam' => 'van Personeelszaken',
                'role' => 'HR',
                'afdeling' => 'HR',
                'startdatum' => '2020-01-01',
                'is_active' => true,
            ]
        );

        $medewerker = User::firstOrCreate(
            ['username' => 'jan'],
            [
                'password' => Hash::make('Welkom123!'),
                'email' => 'jan@overuren.nl',
                'voornaam' => 'Jan',
                'achternaam' => 'Jansen',
                'role' => 'MEDEWERKER',
                'afdeling' => config('afdelingen.lijst')[0] ?? 'Algemeen',
                'startdatum' => '2021-05-01',
                'is_active' => true,
            ]
        );

        return [$hr, $medewerker];
    }

    private function scenarioInit(User $user, int $jaar, int $startSaldo): void
    {
        $this->section("Scenario: INIT (geen historie, start jaar {$jaar} met startsaldo={$startSaldo}m)");

        UrenBaseline::create([
            'user_id' => $user->id,
            'jaar' => $jaar,
            'start_saldo' => $startSaldo,
            'status' => UrenBaseline::STATUS_OPEN,
            'asof' => now(),
        ]);

        $this->line("✔️ Baseline {$jaar} aangemaakt met startsaldo {$startSaldo}m (OPEN). Geen vorige jaren.");

        // Optioneel 1 ingediende overuren voor dashboard
        $this->createPendingOveruren($user, now()->setYear($jaar), 120);
    }

    private function scenarioRolloverReady(User $user, int $jaar): void
    {
        $prev = $jaar - 1;
        $this->section("Scenario: ROLLOVER-READY (vorig jaar OPEN, huidig jaar geen baseline)");

        // Vorig jaar baseline OPEN + wat mutaties
        UrenBaseline::create([
            'user_id' => $user->id,
            'jaar' => $prev,
            'start_saldo' => 600, // 10u
            'status' => UrenBaseline::STATUS_OPEN,
            'asof' => now()->setYear($prev)->startOfYear(),
        ]);

        $this->createMutatiesSetVorigJaar($user, $prev);

        $this->line("✔️ Baseline {$prev} = OPEN, mutaties aanwezig. Baseline {$jaar} ontbreekt (HR-knop zichtbaar).");
        $this->createPendingOveruren($user, now()->setYear($jaar), 120);
    }

    private function scenarioStarted(User $user, int $jaar): void
    {
        $prev = $jaar - 1;
        $this->section("Scenario: STARTED (vorig jaar CLOSED, huidig jaar gestart)");

        // Vorig jaar CLOSED
        UrenBaseline::create([
            'user_id' => $user->id,
            'jaar' => $prev,
            'start_saldo' => 480,
            'status' => UrenBaseline::STATUS_CLOSED,
            'asof' => now()->setYear($prev)->endOfYear(),
        ]);

        // En wat mutaties in vorig jaar zodat carry-over != startsaldo
        UrenMutatie::create([
            'user_id' => $user->id,
            'datum' => now()->setYear($prev)->setMonth(11)->setDay(15)->toDateString(),
            'minuten' => 120,
            'type' => UrenMutatie::TYPE_OPBOUW,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);

        // Huidig jaar OPEN met start_saldo = vorige baseline + som mutaties vorig jaar (hier simpel: 480 + 120 = 600)
        UrenBaseline::create([
            'user_id' => $user->id,
            'jaar' => $jaar,
            'start_saldo' => 600,
            'status' => UrenBaseline::STATUS_OPEN,
            'asof' => now()->startOfYear(),
        ]);

        $this->line("✔️ Vorig jaar {$prev} CLOSED. Huidig jaar {$jaar} gestart met start_saldo 600m. HR-knop verborgen.");
    }

    private function scenarioMidYear(User $user, int $jaar): void
    {
        $this->section("Scenario: MID-YEAR (huidig jaar OPEN met opbouw/opname + pending)");

        UrenBaseline::create([
            'user_id' => $user->id,
            'jaar' => $jaar,
            'start_saldo' => 300,
            'status' => UrenBaseline::STATUS_OPEN,
            'asof' => now()->startOfYear(),
        ]);

        // Mutaties gaandeweg het jaar
        UrenMutatie::create([
            'user_id' => $user->id,
            'datum' => now()->setYear($jaar)->setMonth(3)->setDay(10)->toDateString(),
            'minuten' => 180,
            'type' => UrenMutatie::TYPE_OPBOUW,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);
        UrenMutatie::create([
            'user_id' => $user->id,
            'datum' => now()->setYear($jaar)->setMonth(5)->setDay(4)->toDateString(),
            'minuten' => -60,
            'type' => UrenMutatie::TYPE_OPNAME,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);

        // Pending indiening zichtbaar voor HR dashboard
        $this->createPendingOveruren($user, now()->setYear($jaar)->setMonth(6)->setDay(1), 90);

        $this->line("✔️ Baseline {$jaar} = OPEN met mutaties + 1 pending indiening.");
    }

    private function scenarioEndYear(User $user, int $jaar): void
    {
        $prev = $jaar - 1;
        $this->section("Scenario: END-YEAR (vorig jaar CLOSED, huidig jaar OPEN met rijke historie)");

        // Vorig jaar CLOSED voor zichtbaarheid
        UrenBaseline::create([
            'user_id' => $user->id,
            'jaar' => $prev,
            'start_saldo' => 300,
            'status' => UrenBaseline::STATUS_CLOSED,
            'asof' => now()->setYear($prev)->endOfYear(),
        ]);

        // Huidig jaar OPEN en verschillende mutaties door het jaar heen
        UrenBaseline::create([
            'user_id' => $user->id,
            'jaar' => $jaar,
            'start_saldo' => 420,
            'status' => UrenBaseline::STATUS_OPEN,
            'asof' => now()->startOfYear(),
        ]);

        // Opbouw/opname verspreid over het jaar
        $this->createSpreadMutaties($user, $jaar);

        // Optional: pending in december
        $this->createPendingOveruren($user, now()->setYear($jaar)->setMonth(12)->setDay(15), 120);

        $this->line("✔️ Huidig jaar {$jaar} rijk gevuld; vorige jaar {$prev} CLOSED. Klaar voor eind-jaar schermen.");
    }

    private function createMutatiesSetVorigJaar(User $user, int $jaar): void
    {
        UrenMutatie::create([
            'user_id' => $user->id,
            'datum' => now()->setYear($jaar)->setMonth(3)->setDay(15)->toDateString(),
            'minuten' => 180,
            'type' => UrenMutatie::TYPE_OPBOUW,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);
        UrenMutatie::create([
            'user_id' => $user->id,
            'datum' => now()->setYear($jaar)->setMonth(9)->setDay(5)->toDateString(),
            'minuten' => 120,
            'type' => UrenMutatie::TYPE_OPBOUW,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);
        UrenMutatie::create([
            'user_id' => $user->id,
            'datum' => now()->setYear($jaar)->setMonth(11)->setDay(20)->toDateString(),
            'minuten' => -90,
            'type' => UrenMutatie::TYPE_OPNAME,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);
    }

    private function createSpreadMutaties(User $user, int $jaar): void
    {
        $rows = [
            [3, 12, 150],   // maart 12, +150m
            [4, 2, -60],    // april 2, -60m
            [6, 18, 120],   // juni 18, +120m
            [8, 7, -90],    // aug 7, -90m
            [9, 25, 180],   // sep 25, +180m
            [10, 30, -120], // okt 30, -120m
        ];
        foreach ($rows as [$m, $d, $min]) {
            UrenMutatie::create([
                'user_id' => $user->id,
                'datum' => now()->setYear($jaar)->setMonth($m)->setDay($d)->toDateString(),
                'minuten' => $min,
                'type' => $min >= 0 ? UrenMutatie::TYPE_OPBOUW : UrenMutatie::TYPE_OPNAME,
                'status' => UrenMutatie::STATUS_DEFINITIEF,
                'bron' => 'SEED',
                'geboekt_op' => now(),
            ]);
        }
    }

    private function createPendingOveruren(User $user, \Illuminate\Support\Carbon $datum, int $minuten): void
    {
        Overuren::create([
            'user_id' => $user->id,
            'datum' => $datum->toDateString(),
            'minuten' => $minuten,
            'reden' => 'Test indiening via scenario seeder',
            'week_nummer' => (int) $datum->format('W'),
            'jaar' => (int) $datum->format('Y'),
            'status' => 'INGEDIEND',
            'ingediend_op' => now(),
        ]);
        $this->line('📝 Pending overuren toegevoegd voor dashboard.');
    }

    private function section(string $title): void
    {
        $this->newLine();
        $this->info(str_repeat('─', max(10, strlen($title) + 4)));
        $this->info('  ' . $title);
        $this->info(str_repeat('─', max(10, strlen($title) + 4)));
    }
}
