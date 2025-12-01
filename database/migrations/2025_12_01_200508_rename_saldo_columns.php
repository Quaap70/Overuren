<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('saldo', function (Blueprint $table) {
            // Rename columns for better clarity
            $table->renameColumn('huidig_saldo', 'overuren_saldo');
            $table->renameColumn('gebruikt_saldo', 'opgenomen_saldo');
        });

        // Update comment descriptions
        \DB::statement('ALTER TABLE saldo MODIFY COLUMN overuren_saldo INT DEFAULT 0 COMMENT "Totaal opgebouwde overuren in minuten (alleen positieve waarden)"');
        \DB::statement('ALTER TABLE saldo MODIFY COLUMN opgenomen_saldo INT DEFAULT 0 COMMENT "Totaal opgenomen uren in minuten (absoluut getal van negatieve entries)"');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('saldo', function (Blueprint $table) {
            $table->renameColumn('overuren_saldo', 'huidig_saldo');
            $table->renameColumn('opgenomen_saldo', 'gebruikt_saldo');
        });

        \DB::statement('ALTER TABLE saldo MODIFY COLUMN huidig_saldo INT DEFAULT 0 COMMENT "Huidig totaal saldo in minuten"');
        \DB::statement('ALTER TABLE saldo MODIFY COLUMN gebruikt_saldo INT DEFAULT 0 COMMENT "Gebruikt saldo in minuten (bijv. voor vakantie)"');
    }
};
