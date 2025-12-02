<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Overuren;
use App\Models\Saldo;
use App\Models\Notificatie;
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

        // 2. Create test employees
//        echo "\n📝 Creating test employees...\n";
//        $medewerkers = [];
//
//        foreach (self::NEDERLANDSE_NAMEN as $index => $naam) {
//            $username = strtolower($naam['voornaam']) . ($index + 1);
//
//            $medewerker = User::create([
//                'username' => $username,
//                'password' => Hash::make('Welkom123!'),
//                'email' => "{$username}@overuren.nl",
//                'voornaam' => $naam['voornaam'],
//                'achternaam' => $naam['achternaam'],
//                'role' => 'MEDEWERKER',
//                'afdeling' => config('afdelingen.lijst')[array_rand(config('afdelingen.lijst'))],
//                'startdatum' => sprintf('2020-%02d-01', rand(1, 12)),
//                'is_active' => true,
//            ]);
//
//            $medewerkers[] = $medewerker;
//            echo "   ✅ {$medewerker->full_name} ({$username})\n";
//        }
//
//        // 3. Create historical overuren data (last 3 months)
//        echo "\n📝 Creating historical overuren data...\n";
//        $huidigJaar = now()->year;
//        $totalEntries = 0;
//
//        foreach ($medewerkers as $medewerker) {
//            $aantalEntries = rand(15, 30);
//
//            for ($i = 0; $i < $aantalEntries; $i++) {
//                $datum = now()->subDays(rand(0, 90))->format('Y-m-d');
//                $date = new \DateTime($datum);
//                $weekNummer = (int) $date->format('W');
//                $jaar = (int) $date->format('Y');
//
//                $minutenOptions = [-120, -60, -30, 0, 30, 60, 90, 120, 150, 180, 240, 300, 360];
//                $minuten = $minutenOptions[array_rand($minutenOptions)];
//
//                $statusRand = rand(1, 100) / 100;
//                if ($statusRand < 0.7) {
//                    $status = 'GOEDGEKEURD';
//                } elseif ($statusRand < 0.85) {
//                    $status = 'INGEDIEND';
//                } elseif ($statusRand < 0.95) {
//                    $status = 'AFGEKEURD';
//                } else {
//                    $status = 'CONCEPT';
//                }
//
//                Overuren::create([
//                    'user_id' => $medewerker->id,
//                    'datum' => $datum,
//                    'minuten' => $minuten,
//                    'reden' => $minuten !== 0 ? self::REDENEN[array_rand(self::REDENEN)] : null,
//                    'week_nummer' => $weekNummer,
//                    'jaar' => $jaar,
//                    'status' => $status,
//                    'ingediend_op' => $status !== 'CONCEPT' ? $date : null,
//                    'goedgekeurd_op' => $status === 'GOEDGEKEURD' ? $date : null,
//                    'goedgekeurd_door' => $status === 'GOEDGEKEURD' ? $hrUser->id : null,
//                    'afkeur_reden' => $status === 'AFGEKEURD' ? 'Graag meer details over de reden' : null,
//                ]);
//
//                $totalEntries++;
//            }
//        }
//
//        echo "✅ Created {$totalEntries} overuren entries\n";
//
//        // 4. Calculate and create saldi
//        echo "\n📝 Calculating saldi...\n";
//
//        foreach ($medewerkers as $medewerker) {
//            $goedgekeurdeUren = Overuren::where('user_id', $medewerker->id)
//                ->where('jaar', $huidigJaar)
//                ->where('status', 'GOEDGEKEURD')
//                ->get();
//
//            $totaalMinuten = $goedgekeurdeUren->sum('minuten');
//            $overgedragen = rand(-20, 40) * 60; // -20u to +40u
//
//            $saldo = Saldo::create([
//                'user_id' => $medewerker->id,
//                'jaar' => $huidigJaar,
//                'overgedragen_saldo' => $overgedragen,
//                'gebruikt_saldo' => 0,
//                'huidig_saldo' => $overgedragen + $totaalMinuten,
//                'laatst_bijgewerkt' => now(),
//            ]);
//
//            echo "   ✅ {$medewerker->full_name}: {$saldo->formatted_saldo}\n";
//        }
//
//        // 5. Create some notifications
//        echo "\n📝 Creating sample notifications...\n";
//
//        for ($i = 0; $i < 5; $i++) {
//            $medewerker = $medewerkers[array_rand($medewerkers)];
//            Notificatie::create([
//                'user_id' => $medewerker->id,
//                'type' => 'GOEDKEURING',
//                'titel' => 'Overuren goedgekeurd',
//                'bericht' => 'Je overuren zijn goedgekeurd en toegevoegd aan je saldo.',
//                'gelezen' => (bool) rand(0, 1),
//            ]);
//        }
//
//        Notificatie::create([
//            'user_id' => $hrUser->id,
//            'type' => 'INFO',
//            'titel' => 'Nieuwe overuren ingediend',
//            'bericht' => "{$medewerkers[array_rand($medewerkers)]->full_name} heeft nieuwe overuren ingediend.",
//            'gelezen' => false,
//        ]);
//
//        echo "✅ Notifications created\n";
//
//        echo "\n✅ Database seeding completed!\n\n";
//        echo "📊 Summary:\n";
//        echo "   - 1 HR user (linda / Welkom123!)\n";
//        echo "   - 10 test employees (username: jan1, pieter2, etc. / Welkom123!)\n";
//        echo "   - {$totalEntries} overuren entries\n";
//        echo "   - Saldi berekend voor alle medewerkers\n";
//        echo "   - Sample notificaties aangemaakt\n\n";
    }
}
