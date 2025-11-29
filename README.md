# 🕐 Overuren Registratie Systeem

Modern overuren registratie systeem gebouwd met Laravel 12, Inertia.js en React. Het systeem maakt het mogelijk voor medewerkers om overuren te registreren en voor HR om deze te beoordelen en goedkeuren.

## ✨ Features

### Voor Medewerkers
- ✅ Overuren registreren (concept of direct indienen)
- ✅ Overzicht van alle overuren met status (CONCEPT, INGEDIEND, GOEDGEKEURD, AFGEKEURD)
- ✅ Saldo bekijken (huidig, overgedragen, gebruikt)
- ✅ Notificaties ontvangen bij goedkeuring/afkeuring
- ✅ Week overzicht van geregistreerde uren

### Voor HR
- ✅ Dashboard met statistieken
- ✅ Overuren goedkeuren/afkeuren met reden
- ✅ Medewerkers beheren en bekijken
- ✅ Saldo handmatig aanpassen
- ✅ Notificaties bij nieuwe indieningen

## 🛠️ Tech Stack

- **Backend**: Laravel 12.40.2
- **Frontend**: React 19 + Inertia.js v2.0.11
- **Testing**: PEST v3.8.4
- **Build Tool**: Vite v7.2.4
- **Styling**: Tailwind CSS v4
- **Database**: SQLite (configureerbaar naar MySQL/PostgreSQL)
- **PHP**: 8.4.15

## 📋 Requirements

- PHP >= 8.4
- Composer
- Node.js >= 18.x
- NPM of Yarn

## 🚀 Installatie

### 1. Clone de Repository

```bash
git clone git@github.com:Quaap70/Overuren.git
cd Overuren
```

### 2. Installeer Dependencies

```bash
# PHP dependencies
composer install

# JavaScript dependencies
npm install
```

### 3. Environment Setup

```bash
# Kopieer .env.example naar .env
cp .env.example .env

# Genereer application key
php artisan key:generate
```

### 4. Database Setup

Het systeem is geconfigureerd met SQLite als default database.

```bash
# Creëer SQLite database
touch database/database.sqlite

# Run migrations
php artisan migrate

# (Optioneel) Seed database met testdata
php artisan db:seed
```

Dit creëert:
- 1 HR gebruiker: `linda / Welkom123!`
- 10 test medewerkers: `jan1, pieter2, kees3, etc. / Welkom123!`
- Historische overuren data (laatste 3 maanden)
- Berekende saldi voor alle medewerkers
- Sample notificaties

### 5. Build Assets

```bash
# Development (met hot reload)
npm run dev

# Production build
npm run build
```

### 6. Start de Applicatie

```bash
# Start Laravel development server
php artisan serve
```

Ga naar http://localhost:8000

## 🔐 Test Accounts

Na seeding zijn de volgende accounts beschikbaar:

**HR Account:**
- Username: `linda`
- Password: `Welkom123!`

**Medewerker Accounts:**
- Usernames: `jan1`, `pieter2`, `kees3`, `hendrik4`, `willem5`, `dirk6`, `gerrit7`, `cor8`, `henk9`, `piet10`
- Password (voor allemaal): `Welkom123!`

## 🧪 Testing

Het project gebruikt PEST voor testing:

```bash
# Run alle tests
php artisan test

# Of met Pest direct
./vendor/bin/pest

# Alleen feature tests
./vendor/bin/pest --testsuite=Feature

# Alleen unit tests
./vendor/bin/pest --testsuite=Unit

# Met coverage
./vendor/bin/pest --coverage
```

## 📁 Project Structuur

```
/Overuren
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Laravel controllers
│   │   │   ├── Auth/          # Authentication controllers
│   │   │   ├── DashboardController.php
│   │   │   ├── OverurenController.php
│   │   │   ├── SaldoController.php
│   │   │   ├── HRController.php
│   │   │   └── NotificatieController.php
│   │   └── Middleware/        # Custom middleware
│   ├── Models/                # Eloquent models
│   │   ├── User.php
│   │   ├── Overuren.php
│   │   ├── Saldo.php
│   │   └── Notificatie.php
│   └── Services/              # Business logic services
│       └── SaldoService.php
├── database/
│   ├── factories/             # Model factories voor testing
│   ├── migrations/            # Database migrations
│   └── seeders/               # Database seeders
├── resources/
│   ├── js/
│   │   ├── Components/        # Herbruikbare React componenten
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── Toast.jsx
│   │   └── Pages/             # Inertia.js pagina componenten
│   │       ├── Auth/
│   │       ├── Dashboard/
│   │       ├── Overuren/
│   │       ├── Saldo/
│   │       ├── HR/
│   │       └── Notificaties/
│   └── css/
│       └── app.css            # Tailwind CSS
├── routes/
│   └── web.php                # Web routes
└── tests/
    ├── Feature/               # Feature tests
    └── Unit/                  # Unit tests
```

## 🎨 Design System

Het systeem gebruikt een pastel kleurenschema:

- **Mint** (#B8E6D1) - Primary actions
- **Peach** (#FFD3BA) - Secondary/logout
- **Lavender** (#D4A5FF) - Focus states
- **Success** (#BAFFC9) - Success states
- **Error** (#FFB3BA) - Error states
- **Background** (#F0F4F8) - Page background
- **Card** (#FFFFFF) - Card backgrounds
- **Text Primary** (#2D3748) - Primary text
- **Text Secondary** (#718096) - Secondary text

## 📝 Database Schema

### Users
- **Role**: HR of MEDEWERKER
- Bevat voornaam, achternaam, email, afdeling, startdatum

### Overuren
- Gekoppeld aan gebruiker
- **Status**: CONCEPT, INGEDIEND, GOEDGEKEURD, AFGEKEURD
- Bevat datum, minuten (veelvoud van 10, max ±720), reden
- Week nummer en jaar worden automatisch berekend

### Saldo
- Per gebruiker per jaar
- Overgedragen saldo, gebruikt saldo, huidig saldo
- Wordt automatisch herberekend bij goedkeuring overuren

### Notificaties
- **Types**: GOEDKEURING, AFKEURING, SALDO_WIJZIGING, HERINNERING, INFO
- Gelezen/ongelezen status

## 🔒 Beveiliging

- Session-based authenticatie (compatibel met Inertia.js)
- CSRF protectie
- Password hashing met bcrypt
- HR middleware voor autorisatie van HR-only routes
- Input validatie op alle formulieren
- XSS protectie via React's automatic escaping

## 🚧 Development

### Code Style

Het project volgt Laravel en React best practices:
- PSR-12 voor PHP code
- ES6+ JavaScript
- Functional components voor React
- PEST syntax voor tests

### Git Workflow

```bash
# Nieuwe feature branch
git checkout -b feature/naam

# Commits
git commit -m "Beschrijving"

# Push naar GitHub
git push origin feature/naam
```

## 📦 Production Deployment

Voor production deployment:

1. **Environment**:
   ```bash
   cp .env.example .env
   # Pas .env aan voor production (APP_ENV=production, database credentials, etc.)
   ```

2. **Dependencies**:
   ```bash
   composer install --optimize-autoloader --no-dev
   npm ci
   ```

3. **Build**:
   ```bash
   npm run build
   ```

4. **Cache**:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

5. **Migrations**:
   ```bash
   php artisan migrate --force
   ```

## 🐛 Troubleshooting

### Witte pagina / Geen styling

Check of Vite draait:
```bash
npm run dev
```

### Database errors

Check of de database bestaat:
```bash
php artisan migrate:fresh --seed
```

### Permission errors

Check file permissions:
```bash
chmod -R 775 storage bootstrap/cache
```

## 📄 License

Dit project is ontwikkeld als intern systeem voor overuren registratie.

## 👥 Credits

Ontwikkeld met Laravel 12, Inertia.js en React.
