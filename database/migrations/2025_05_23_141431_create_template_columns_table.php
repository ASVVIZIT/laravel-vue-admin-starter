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
        Schema::create('template_columns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained();
            $table->string('type')->default('text')->comment('Тип поля: text,number,select');
            $table->string('label')->comment('Заголовок колонки');
            $table->json('options')->nullable()->comment('Опции для select');
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('template_columns');
    }
};
