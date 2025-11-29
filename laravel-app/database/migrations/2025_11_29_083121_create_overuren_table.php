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
        Schema::create('overuren', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('datum');
            $table->integer('minuten'); // Minuten, must be multiple of 10, max ±720 (12 hours)
            $table->text('reden')->nullable();
            $table->integer('week_nummer');
            $table->integer('jaar');
            $table->enum('status', ['CONCEPT', 'INGEDIEND', 'GOEDGEKEURD', 'AFGEKEURD'])->default('CONCEPT');
            $table->text('afkeur_reden')->nullable();
            $table->timestamp('ingediend_op')->nullable();
            $table->timestamp('goedgekeurd_op')->nullable();
            $table->foreignId('goedgekeurd_door')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'datum']);
            $table->index('status');
            $table->index(['week_nummer', 'jaar']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overuren');
    }
};
