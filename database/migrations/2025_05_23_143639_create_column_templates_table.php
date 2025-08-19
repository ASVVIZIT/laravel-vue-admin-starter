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
        Schema::create('column_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained()->onDelete('cascade');
            $table->string('type', 20);
            $table->string('label', 255);
            $table->json('options')->nullable();
            $table->integer('order')->default(0);

            // Добавляем специфичные поля для разных типов колонок
            $table->string('data_type', 20)->nullable();
            $table->string('unit', 20)->nullable();
            $table->text('reference')->nullable();
            $table->text('boolean_settings')->nullable();
            $table->string('date_format', 20)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('column_templates');
    }
};
