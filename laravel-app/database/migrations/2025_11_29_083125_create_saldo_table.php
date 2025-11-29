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
        Schema::create('saldo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('jaar');
            $table->integer('overgedragen_saldo')->default(0)->comment('Saldo in minuten overgedragen van vorig jaar');
            $table->integer('gebruikt_saldo')->default(0)->comment('Gebruikt saldo in minuten (bijv. voor vakantie)');
            $table->integer('huidig_saldo')->default(0)->comment('Huidig totaal saldo in minuten');
            $table->timestamp('laatst_bijgewerkt')->useCurrent();
            $table->timestamps();

            // Unique constraint
            $table->unique(['user_id', 'jaar']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saldo');
    }
};
