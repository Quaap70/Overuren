<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('uren_baselines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('jaar');
            $table->integer('start_saldo')->default(0); // minuten
            $table->enum('status', ['OPEN', 'CLOSED'])->default('OPEN');
            $table->dateTime('asof')->nullable();
            $table->boolean('locked')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'jaar']);
            $table->index(['user_id', 'jaar', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('uren_baselines');
    }
};
