# Artisan commands (scenario seeding en jaarbeheer testen)

Dit document beschrijft de Artisan commands die in dit project zijn toegevoegd om snel verschillende situaties in de UI te kunnen testen, met name rondom jaarbeheer (rollover) en het nieuwe journaal/baseline‑model.

## Overzicht

- app:seed-scenario — seed verschillende testscenario’s voor HR/UI

> Opmerking (Laravel 11): het command is geregistreerd via `bootstrap/app.php` met `->withCommands([...])`. De implementatie staat in `app/Console/Commands/SeedScenarioCommand.php`.

---

## app:seed-scenario

Seed één van de vooraf gedefinieerde scenario’s om specifieke UI‑toestanden te testen.

Signature:

```
php artisan app:seed-scenario \
  --scenario=init|rollover-ready|started|mid-year|end-year \
  [--jaar=YYYY] \
  [--fresh] \
  [--start-saldo=MINUTEN]
```

Opties:
- --scenario: welk scenario gezaaid moet worden. Standaard: `rollover-ready`.
- --jaar: doeljaar (default: huidig jaar volgens server). Voor `rollover-ready` betekent dit dat het vorige jaar `jaar-1` is.
- --fresh: draait vóór seeden `migrate:fresh` (leegt de database en voert alle migraties uit).
- --start-saldo: alleen voor `init` scenario; start_saldo (in minuten) waarmee het jaar begint (default 0).

Aangemaakte gebruikers (vast):
- HR: `linda / Welkom123!`
- Medewerker: `jan / Welkom123!`

De command zorgt idempotent dat deze gebruikers bestaan en seed daarna de gewenste basisdata (baselines, journaalmutaties en optioneel pending overuren).

### Scenario’s

1) init
- Doel: eerste ingebruikname, geen historie.
- Acties: maakt baseline voor het opgegeven jaar (OPEN) met `start_saldo = --start-saldo` (default 0). Geen vorig jaar nodig.
- Extra: maakt optioneel één ingediende (INGEDIEND) overuren voor dashboard.

Voorbeeld:
```
php artisan app:seed-scenario --scenario=init --jaar=$(date +%Y) --start-saldo=600 --fresh
```

2) rollover-ready
- Doel: historie in vorig jaar, huidig jaar nog niet gestart → HR‑knop “Start nieuw boekjaar” is zichtbaar.
- Acties: maakt baseline in vorig jaar (OPEN) + enkele definitieve mutaties in vorig jaar. Huidig jaar heeft géén baseline. Maakt ook één ingediende overuren in huidig jaar voor dashboard.

Voorbeeld:
```
php artisan app:seed-scenario --scenario=rollover-ready --jaar=$(date +%Y) --fresh
```

3) started
- Doel: vorig jaar CLOSED, huidig jaar gestart (OPEN) met correcte carry‑over; knop verborgen.
- Acties: baseline vorig jaar = CLOSED (met kleine historie), baseline huidig jaar = OPEN met start_saldo afgeleid. Geen pending vereist.

Voorbeeld:
```
php artisan app:seed-scenario --scenario=started --jaar=$(date +%Y) --fresh
```

4) mid-year
- Doel: huidig jaar OPEN met een mix van OPBOUW/OPNAME mutaties en een pending indiening.
- Acties: baseline huidig jaar = OPEN; mutaties door het jaar heen; 1 pending indiending.

Voorbeeld:
```
php artisan app:seed-scenario --scenario=mid-year --jaar=$(date +%Y) --fresh
```

5) end-year
- Doel: rijk gevulde historie voor huidig jaar; vorig jaar CLOSED.
- Acties: baseline vorig jaar = CLOSED; baseline huidig jaar = OPEN met gespreide OPBOUW/OPNAME mutaties; optioneel pending in december.

Voorbeeld:
```
php artisan app:seed-scenario --scenario=end-year --jaar=$(date +%Y) --fresh
```

### Verwachte UI‑effecten per scenario

- rollover-ready:
  - HR Dashboard toont knop “Start nieuw boekjaar (Y)” (mits er geen openstaande, ingediende overuren in Y‑1 zijn). Na klik: vorig jaar wordt CLOSED en huidig jaar gestart; de knop verdwijnt.
  - Medewerkerslijst toont cijfers alleen als de zichtbaarheidspolicy voldaan is (baseline + vorig jaar CLOSED), anders fallback/0.

- started/mid-year/end-year:
  - HR Dashboard: knop verborgen (baseline voor Y bestaat al).
  - Overzichten gebruiken de nieuwe berekening: baseline(Y).start_saldo + jaarmutaties.

- init:
  - Huidig jaar is meteen zichtbaar (initieel jaar) met opgegeven start_saldo.

### Tips

- Lijst het command in Artisan:
  ```
  php artisan list | grep seed-scenario
  ```

- Troubleshooting Ziggy routes (indien UI routes niet klikken): herstart Vite en controleer dat `@routes` aanwezig is in `resources/views/app.blade.php`. Voor de rolloverknop gebruiken we een directe POST naar `/hr/jaar/rollover`.

### Interne implementatie

Bestand: `app/Console/Commands/SeedScenarioCommand.php`
- Maakt/verzekert vaste gebruikers (HR en medewerker)
- Leegt alleen `uren_mutaties` en `uren_baselines` voor herhaalbaarheid (tenzij `--fresh` is gebruikt)
- Bouwt scenario’s via helpers:
  - `createMutatiesSetVorigJaar`, `createSpreadMutaties`, `createPendingOveruren`

Registratie: `bootstrap/app.php`
```php
->withCommands([
    \App\Console\Commands\SeedScenarioCommand::class,
])
```

---

Heb je extra scenario’s of flags nodig (bijv. meerdere medewerkers, negatieve startsaldi, of bulk‑generatie)? Laat het weten; we breiden het command eenvoudig uit.
