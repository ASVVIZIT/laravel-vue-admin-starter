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
        Schema::create('circuit_breakers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained()->onDelete('cascade');
            $table->string('device_type', 50)
                ->default('Автоматический выключатель') // Значение по умолчанию
                ->comment('Тип устройства');
            $table->string('model', 50);
            $table->string('series', 50)->nullable()->comment('Серия');
            $table->integer('nominal_current');
            $table->string('trip_curve', 2);
            $table->integer('poles');
            $table->string('breaking_capacity', 20);
            $table->string('voltage', 20)->default('230/400V');
            $table->string('modular_size', 5);
            $table->string('energy_class', 10)->nullable();
            $table->string('ip_rating', 10)->default('IP20');
            $table->string('terminal_type', 30)->default('винтовой');
            $table->string('protection', 100)->default('Токовая перегрузка, КЗ');
            $table->string('temperature_range', 50)->default('-25°C до +55°C');
            $table->integer('tripping_time')->nullable()->comment('мс');
            $table->string('pollution_degree', 20)->default('Степень 2');
            $table->string('housing_material', 30)->default('Термопласт');
            $table->string('standards', 100)->default('IEC 60898');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('circuit_breakers');
    }
};
