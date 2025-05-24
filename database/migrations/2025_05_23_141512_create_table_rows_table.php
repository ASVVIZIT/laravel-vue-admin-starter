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
        Schema::create('table_rows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained();
            $table->foreignId('parent_id')->nullable()->constrained('table_rows');
            $table->json('data')->comment('Данные строки в формате JSON');
            $table->integer('order')->default(0);
            $table->boolean('is_expanded')->default(false)->comment('Раскрыта ли строка');
            $table->timestamps();

            $table->index(['parent_id', 'template_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_rows');
    }
};
