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
        // Maak direct de cache-tabel met de definitieve naam aan.
        // Let op: oudere projecten maakten hier 'saldo' aan. We creëren nu 'saldo_cache'.
        if (!Schema::hasTable('saldo_cache')) {
            Schema::create('saldo_cache', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->integer('jaar');
                // Definitieve kolomnamen (DRY t.o.v. journaal/baseline)
                $table->integer('overgedragen_saldo')->default(0)->comment('Carry-over in minuten (baseline start_saldo)');
                $table->integer('opgenomen_saldo')->default(0)->comment('Opgenomen minuten in het jaar (abs van negatieve mutaties)');
                $table->integer('overuren_saldo')->default(0)->comment('Opgebouwde minuten in het jaar (som positieve mutaties)');
                $table->timestamp('laatst_bijgewerkt')->useCurrent();
                $table->timestamps();

                $table->unique(['user_id', 'jaar']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saldo_cache');
    }
};
