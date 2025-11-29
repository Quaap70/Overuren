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
        Schema::create('notificaties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['GOEDKEURING', 'AFKEURING', 'SALDO_WIJZIGING', 'HERINNERING', 'INFO']);
            $table->string('titel');
            $table->text('bericht');
            $table->boolean('gelezen')->default(false);
            $table->integer('gerelateerd_id')->nullable()->comment('ID van gerelateerde overuren entry of andere entity');
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'gelezen']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificaties');
    }
};
