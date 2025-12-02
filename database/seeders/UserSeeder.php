<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Overuren;
use App\Models\Saldo;
use App\Models\Notificatie;
use App\Models\UrenBaseline;
use App\Models\UrenMutatie;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    use WithoutModelEvents;

    private const NEDERLANDSE_NAMEN = [
        ['voornaam' => 'Jan', 'achternaam' => 'de Vries'],
        ['voornaam' => 'Pieter', 'achternaam' => 'Bakker'],
        ['voornaam' => 'Kees', 'achternaam' => 'Jansen'],
        ['voornaam' => 'Hendrik', 'achternaam' => 'Visser'],
        ['voornaam' => 'Willem', 'achternaam' => 'Smit'],
        ['voornaam' => 'Dirk', 'achternaam' => 'de Jong'],
        ['voornaam' => 'Gerrit', 'achternaam' => 'van Dijk'],
        ['voornaam' => 'Cor', 'achternaam' => 'Mulder'],
        ['voornaam' => 'Henk', 'achternaam' => 'Bos'],
        ['voornaam' => 'Piet', 'achternaam' => 'Vos'],
    ];

    // Afdelingen worden nu uit config gehaald: config('afdelingen.lijst')
    // private const AFDELINGEN = ['HR', 'Zakelijk', 'Particulier', 'Schade', 'ICT'];

    private const REDENEN = [
        'Spoedklus klant',
        'Extra werk voor deadline',
        'Machine reparatie',
        'Inventarisatie',
        'Nachtdienst',
        'Weekend werk',
        'Storing verhelpen',
        'Projectafronding',
        'Inwerken nieuwe medewerker',
        'Schoonmaak werkplaats',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "🌱 Starting database seeding...\n\n";

        // 1. Create HR user
        echo "📝 Creating HR user...\n";
        $hrUser = User::create([
            'username' => 'linda',
            'password' => Hash::make('Welkom123!'),
            'email' => 'linda@overuren.nl',
            'voornaam' => 'Linda',
            'achternaam' => 'van Personeelszaken',
            'role' => 'HR',
            'afdeling' => 'HR',
            'startdatum' => '2020-01-01',
            'is_active' => true,
        ]);
        echo "✅ HR user created: linda / Welkom123!\n";

        // 2. Create exactly 1 medewerker
        echo "\n📝 Creating 1 medewerker...\n";
        $medewerker = User::create([
            'username' => 'jan',
            'password' => Hash::make('Welkom123!'),
            'email' => 'jan@overuren.nl',
            'voornaam' => 'Jan',
            'achternaam' => 'Jansen',
            'role' => 'MEDEWERKER',
            'afdeling' => config('afdelingen.lijst')[0] ?? 'Algemeen',
            'startdatum' => '2021-05-01',
            'is_active' => true,
        ]);
        echo "✅ Medewerker created: jan / Welkom123!\n";

        // 2b. Extra test medewerker (voor dashboards testen)
        echo "\n📝 Creating extra test medewerker...\n";
        $medewerker2 = User::create([
            'username' => 'sofie',
            'password' => Hash::make('Welkom123!'),
            'email' => 'sofie@overuren.nl',
            'voornaam' => 'Sofie',
            'achternaam' => 'de Boer',
            'role' => 'MEDEWERKER',
            'afdeling' => config('afdelingen.lijst')[1] ?? (config('afdelingen.lijst')[0] ?? 'Algemeen'),
            'startdatum' => '2022-03-15',
            'is_active' => true,
        ]);
        echo "✅ Extra medewerker created: sofie / Welkom123!\n";

        // 3. Seed previous year baseline (OPEN) and some mutaties for medewerker
        $huidigJaar = now()->year;
        $vorigJaar = $huidigJaar - 1;

        echo "\n🧮 Creating baseline for vorig jaar ({$vorigJaar})...\n";
        UrenBaseline::create([
            'user_id' => $medewerker->id,
            'jaar' => $vorigJaar,
            'start_saldo' => 60 * 10, // 10 uur carry-over naar vorig jaar
            'status' => UrenBaseline::STATUS_OPEN, // bewust OPEN laten zodat HR knop zichtbaar is
            'asof' => now()->startOfYear(),
            'locked' => false,
        ]);
        echo "✅ Baseline (OPEN) for {$vorigJaar} created\n";

        echo "🧾 Creating definitieve mutaties in {$vorigJaar}...\n";
        // Positieve opbouw (3 uur) op 15 maart vorig jaar
        UrenMutatie::create([
            'user_id' => $medewerker->id,
            'datum' => now()->setYear($vorigJaar)->setMonth(3)->setDay(15)->toDateString(),
            'minuten' => 180,
            'type' => UrenMutatie::TYPE_OPBOUW,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);
        // Nog een opbouw (2 uur) in september vorig jaar
        UrenMutatie::create([
            'user_id' => $medewerker->id,
            'datum' => now()->setYear($vorigJaar)->setMonth(9)->setDay(5)->toDateString(),
            'minuten' => 120,
            'type' => UrenMutatie::TYPE_OPBOUW,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);
        // Opname (1,5 uur) in november vorig jaar (negatief)
        UrenMutatie::create([
            'user_id' => $medewerker->id,
            'datum' => now()->setYear($vorigJaar)->setMonth(11)->setDay(20)->toDateString(),
            'minuten' => -90,
            'type' => UrenMutatie::TYPE_OPNAME,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);
        echo "✅ Mutaties voor {$vorigJaar} aangemaakt (opbouw/opname)\n";

        // 4. Do NOT create baseline for current year → ensures HR rollover button appears
        echo "\nℹ️ Geen baseline voor huidig jaar ({$huidigJaar}) aangemaakt zodat de rollover-knop zichtbaar is.\n";

        // Seed ook voor extra medewerker (Sofie) data in vorig jaar, zodat HR/kalender badges getest kunnen worden
        echo "\n🧮 Creating baseline and entries for extra medewerker in vorig jaar ({$vorigJaar})...\n";
        UrenBaseline::create([
            'user_id' => $medewerker2->id,
            'jaar' => $vorigJaar,
            'start_saldo' => 60 * 6, // 6 uur carry-over naar vorig jaar
            'status' => UrenBaseline::STATUS_OPEN,
            'asof' => now()->startOfYear(),
            'locked' => false,
        ]);

        // Mix aan mutaties in vorig jaar (opbouw en opname)
        UrenMutatie::create([
            'user_id' => $medewerker2->id,
            'datum' => now()->setYear($vorigJaar)->setMonth(2)->setDay(8)->toDateString(),
            'minuten' => 120,
            'type' => UrenMutatie::TYPE_OPBOUW,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);
        UrenMutatie::create([
            'user_id' => $medewerker2->id,
            'datum' => now()->setYear($vorigJaar)->setMonth(6)->setDay(22)->toDateString(),
            'minuten' => -60,
            'type' => UrenMutatie::TYPE_OPNAME,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);

        // Voor huidige maand in huidig jaar maken we enkel Overuren records met verschillende statussen
        // (zodat de kalender-badges zichtbaar zijn wanneer het jaar zichtbaar wordt)
        $today = now();
        $currYear = (int) $today->format('Y');
        $month = (int) $today->format('n');
        // CONCEPT (dag 5)
        Overuren::create([
            'user_id' => $medewerker2->id,
            'datum' => now()->setYear($currYear)->setMonth($month)->setDay(5)->toDateString(),
            'minuten' => 45,
            'reden' => 'Test concept',
            'week_nummer' => (int) now()->setDay(5)->format('W'),
            'jaar' => $currYear,
            'status' => 'CONCEPT',
        ]);
        // INGEDIEND (dag 10)
        Overuren::create([
            'user_id' => $medewerker2->id,
            'datum' => now()->setYear($currYear)->setMonth($month)->setDay(10)->toDateString(),
            'minuten' => 60,
            'reden' => 'Test ingediend',
            'week_nummer' => (int) now()->setDay(10)->format('W'),
            'jaar' => $currYear,
            'status' => 'INGEDIEND',
            'ingediend_op' => now(),
        ]);
        // GOEDGEKEURD (dag 12)
        Overuren::create([
            'user_id' => $medewerker2->id,
            'datum' => now()->setYear($currYear)->setMonth($month)->setDay(12)->toDateString(),
            'minuten' => 90,
            'reden' => 'Test goedgekeurd',
            'week_nummer' => (int) now()->setDay(12)->format('W'),
            'jaar' => $currYear,
            'status' => 'GOEDGEKEURD',
            'ingediend_op' => now()->subDays(2),
            'goedgekeurd_op' => now(),
            'goedgekeurd_door' => $hrUser->id,
        ]);
        // AFGEKEURD (dag 15)
        Overuren::create([
            'user_id' => $medewerker2->id,
            'datum' => now()->setYear($currYear)->setMonth($month)->setDay(15)->toDateString(),
            'minuten' => 30,
            'reden' => 'Test afgekeurd',
            'week_nummer' => (int) now()->setDay(15)->format('W'),
            'jaar' => $currYear,
            'status' => 'AFGEKEURD',
            'ingediend_op' => now()->subDays(3),
        ]);
        // Opname (journaal) in huidige maand (dag 18)
        UrenMutatie::create([
            'user_id' => $medewerker2->id,
            'datum' => now()->setYear($currYear)->setMonth($month)->setDay(18)->toDateString(),
            'minuten' => -45,
            'type' => UrenMutatie::TYPE_OPNAME,
            'status' => UrenMutatie::STATUS_DEFINITIEF,
            'bron' => 'SEED',
            'geboekt_op' => now(),
        ]);
        echo "✅ Extra medewerker heeft voorbeelddata voor badges in huidige maand.\n";

        // 5. Create one pending overuren (INGEDIEND) for HR dashboard testing
        echo "\n📝 Creating 1 ingediend overuren voor dashboard...\n";
        $vandaag = now();
        Overuren::create([
            'user_id' => $medewerker->id,
            'datum' => $vandaag->toDateString(),
            'minuten' => 120,
            'reden' => 'Test indiening via seeder',
            'week_nummer' => (int) $vandaag->format('W'),
            'jaar' => (int) $vandaag->format('Y'),
            'status' => 'INGEDIEND',
            'ingediend_op' => $vandaag,
        ]);
        echo "✅ 1 ingediend overuren aangemaakt\n";

        echo "\n✅ Database seeding completed!\n\n";
        echo "📊 Summary:\n";
        echo "   - 1 HR user (linda / Welkom123!)\n";
        echo "   - 2 medewerkers (jan / Welkom123!, sofie / Welkom123!)\n";
        echo "   - Baseline {$vorigJaar} = OPEN (start_saldo 10u)\n";
        echo "   - 2x OPBOUW en 1x OPNAME mutaties in {$vorigJaar}\n";
        echo "   - 1 ingediend overuren voor dashboard\n\n";

    }
}
