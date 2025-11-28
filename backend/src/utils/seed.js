import sequelize, { syncDatabase } from '../config/database.js';
import { User, Overuren, Saldo, Notificatie } from '../models/index.js';

const NEDERLANDSE_NAMEN = [
  { voornaam: 'Jan', achternaam: 'de Vries' },
  { voornaam: 'Pieter', achternaam: 'Bakker' },
  { voornaam: 'Kees', achternaam: 'Jansen' },
  { voornaam: 'Hendrik', achternaam: 'Visser' },
  { voornaam: 'Willem', achternaam: 'Smit' },
  { voornaam: 'Dirk', achternaam: 'de Jong' },
  { voornaam: 'Gerrit', achternaam: 'van Dijk' },
  { voornaam: 'Cor', achternaam: 'Mulder' },
  { voornaam: 'Henk', achternaam: 'Bos' },
  { voornaam: 'Piet', achternaam: 'Vos' }
];

const AFDELINGEN = ['Productie', 'Montage', 'Onderhoud', 'Logistiek', 'Magazijn'];

const REDENEN = [
  'Spoedklus klant',
  'Extra werk voor deadline',
  'Machine reparatie',
  'Inventarisatie',
  'Nachtdienst',
  'Weekend werk',
  'Storing verhelpen',
  'Projectafronding',
  'Inwerken nieuwe medewerker',
  'Schoonmaak werkplaats'
];

/**
 * Get week number from date
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Random integer between min and max
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Random element from array
 */
const randomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Generate random date in past N days
 */
const randomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  return date.toISOString().split('T')[0];
};

/**
 * Seed database with test data
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Sync database (force: true will drop existing tables)
    await syncDatabase({ force: true });

    // 1. Create HR user
    console.log('📝 Creating HR user...');
    const hrUser = await User.create({
      username: 'linda',
      password: 'Welkom123!',
      email: 'linda@overuren.nl',
      voornaam: 'Linda',
      achternaam: 'van Personeelszaken',
      role: 'HR',
      afdeling: 'HR',
      startdatum: '2020-01-01',
      is_active: true
    });
    console.log('✅ HR user created: linda / Welkom123!');

    // 2. Create test employees
    console.log('\n📝 Creating test employees...');
    const medewerkers = [];

    for (let i = 0; i < 10; i++) {
      const naam = NEDERLANDSE_NAMEN[i];
      const username = `${naam.voornaam.toLowerCase()}${i + 1}`;

      const medewerker = await User.create({
        username,
        password: 'Welkom123!',
        email: `${username}@overuren.nl`,
        voornaam: naam.voornaam,
        achternaam: naam.achternaam,
        role: 'MEDEWERKER',
        afdeling: randomElement(AFDELINGEN),
        startdatum: `2020-${randomInt(1, 12).toString().padStart(2, '0')}-01`,
        is_active: true
      });

      medewerkers.push(medewerker);
      console.log(`   ✅ ${medewerker.getFullName()} (${username})`);
    }

    // 3. Create historical overuren data (last 3 months)
    console.log('\n📝 Creating historical overuren data...');
    const huidigJaar = new Date().getFullYear();
    let totalEntries = 0;

    for (const medewerker of medewerkers) {
      // Create random entries for past 90 days
      const aantalEntries = randomInt(15, 30);

      for (let i = 0; i < aantalEntries; i++) {
        const datum = randomDate(90);
        const date = new Date(datum);
        const weekNummer = getWeekNumber(date);
        const jaar = date.getFullYear();

        // Random minutes: -120 to 360 (negative = left early, positive = overtime)
        const minutenOptions = [-120, -60, -30, 0, 30, 60, 90, 120, 150, 180, 240, 300, 360];
        const minuten = randomElement(minutenOptions);

        // Random status with realistic distribution
        const statusRand = Math.random();
        let status;
        if (statusRand < 0.7) {
          status = 'GOEDGEKEURD';
        } else if (statusRand < 0.85) {
          status = 'INGEDIEND';
        } else if (statusRand < 0.95) {
          status = 'AFGEKEURD';
        } else {
          status = 'CONCEPT';
        }

        await Overuren.create({
          user_id: medewerker.id,
          datum,
          minuten,
          reden: minuten !== 0 ? randomElement(REDENEN) : null,
          week_nummer: weekNummer,
          jaar,
          status,
          ingediend_op: status !== 'CONCEPT' ? date : null,
          goedgekeurd_op: status === 'GOEDGEKEURD' ? date : null,
          goedgekeurd_door: status === 'GOEDGEKEURD' ? hrUser.id : null,
          afkeur_reden: status === 'AFGEKEURD' ? 'Graag meer details over de reden' : null
        });

        totalEntries++;
      }
    }

    console.log(`✅ Created ${totalEntries} overuren entries`);

    // 4. Calculate and create saldi
    console.log('\n📝 Calculating saldi...');

    for (const medewerker of medewerkers) {
      // Calculate total approved minutes
      const goedgekeurdeUren = await Overuren.findAll({
        where: {
          user_id: medewerker.id,
          jaar: huidigJaar,
          status: 'GOEDGEKEURD'
        }
      });

      const totaalMinuten = goedgekeurdeUren.reduce((sum, entry) => sum + entry.minuten, 0);

      // Add some random carried over balance
      const overgedragen = randomInt(-20, 40) * 60; // -20u to +40u

      const saldo = await Saldo.create({
        user_id: medewerker.id,
        jaar: huidigJaar,
        overgedragen_saldo: overgedragen,
        gebruikt_saldo: 0,
        huidig_saldo: overgedragen + totaalMinuten,
        laatst_bijgewerkt: new Date()
      });

      console.log(`   ✅ ${medewerker.getFullName()}: ${saldo.getFormattedSaldo()}`);
    }

    // 5. Create some notifications
    console.log('\n📝 Creating sample notifications...');

    // For medewerkers: goedkeuring notifications
    for (let i = 0; i < 5; i++) {
      const medewerker = randomElement(medewerkers);
      await Notificatie.create({
        user_id: medewerker.id,
        type: 'GOEDKEURING',
        titel: 'Overuren goedgekeurd',
        bericht: 'Je overuren zijn goedgekeurd en toegevoegd aan je saldo.',
        gelezen: Math.random() > 0.5
      });
    }

    // For HR: new submissions
    await Notificatie.create({
      user_id: hrUser.id,
      type: 'INFO',
      titel: 'Nieuwe overuren ingediend',
      bericht: `${randomElement(medewerkers).getFullName()} heeft nieuwe overuren ingediend.`,
      gelezen: false
    });

    console.log('✅ Notifications created');

    console.log('\n✅ Database seeding completed!\n');
    console.log('📊 Summary:');
    console.log(`   - 1 HR user (linda / Welkom123!)`);
    console.log(`   - 10 test employees (username: jan1, pieter2, etc. / Welkom123!)`);
    console.log(`   - ${totalEntries} overuren entries`);
    console.log(`   - Saldi berekend voor alle medewerkers`);
    console.log(`   - Sample notificaties aangemaakt\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
