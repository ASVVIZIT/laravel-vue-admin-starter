<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('type')->default('custom')
                ->comment('Тип: custom, personal_brand, shop, portfolio');
            $table->text('description')->nullable();
            $table->json('settings')->nullable()->comment('Тема, SEO, цвета');
            $table->json('blocks')->nullable()->comment('Массив блоков');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['slug', 'is_active']);
            $table->index(['type', 'is_published']);
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_pages');
    }
};
