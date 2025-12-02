<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Development clean-up: legacy table rename migration removed.
     * No-op because we create 'saldo_cache' directly on fresh installs.
     */
    public function up(): void {}

    /**
     * Reverse the migrations.
     */
    public function down(): void {}
};
