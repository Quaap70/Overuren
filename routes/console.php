<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
// In Laravel 11, console commands are registered via bootstrap/app.php -> withCommands().
// Keep this file for simple closure-based commands only.

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
