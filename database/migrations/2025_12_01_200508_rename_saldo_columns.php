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
    }
};
