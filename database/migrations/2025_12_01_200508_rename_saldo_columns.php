<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Development clean-up: legacy rename migration removed.
     * No-op because we no longer create or alter the old 'saldo' table.
     */
    public function up(): void {}

    /**
     * Reverse the migrations.
     */
    public function down(): void {}
};
