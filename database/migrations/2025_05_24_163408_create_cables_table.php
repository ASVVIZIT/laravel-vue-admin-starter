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
        Schema::create('cables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained();
            $table->string('type'); // ВВГнг-LS
            $table->string('insulation')->default('ПВХ'); // ГОСТ 31996-2012
            $table->float('cross_section'); // мм²
            $table->integer('cores'); // Количество жил
            $table->integer('current_rating'); // Допустимый ток
            $table->string('temperature_range')->default('-50°C до +70°C');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cables');
    }
};
