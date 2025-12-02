<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // No-op: we maken geen database views meer aan voor 'saldo'.
        // Alle code gebruikt nu het model Saldo -> tabel 'saldo_cache'.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op.
    }
};
