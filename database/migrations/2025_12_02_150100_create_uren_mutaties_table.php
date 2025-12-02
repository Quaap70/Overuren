<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('uren_mutaties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('datum');
            $table->integer('minuten'); // positief = opbouw, negatief = opname
            $table->enum('type', ['OPBOUW', 'OPNAME', 'CORRECTIE', 'OVERDRACHT']);
            $table->enum('status', ['CONCEPT', 'DEFINITIEF', 'GEANNULEERD'])->default('DEFINITIEF');
            $table->string('bron')->nullable();
            $table->unsignedBigInteger('bron_id')->nullable();
            $table->dateTime('geboekt_op')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'datum']);
            $table->index(['user_id', 'status', 'datum']);
            $table->index(['bron', 'bron_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('uren_mutaties');
    }
};
