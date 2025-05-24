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
        Schema::create('r_c_d_s', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained();
            $table->string('model');
            $table->integer('nominal_current'); // А
            $table->string('rated_diff_current'); // 10mA, 30mA
            $table->enum('type', ['AC', 'A', 'B']); // Тип срабатывания
            $table->integer('poles'); // Полюсность
            $table->string('breaking_capacity'); // Отключающая способность
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('r_c_d_s');
    }
};
