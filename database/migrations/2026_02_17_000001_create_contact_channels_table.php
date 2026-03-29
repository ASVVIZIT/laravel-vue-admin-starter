<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Миграция для создания таблицы 'company_contact_channels'
// Эта таблица будет хранить информацию о различных каналах связи (соцсети, мессенджеры, карты и т.д.), привязанных к компаниям.
return new class extends Migration
{
    // Метод up() выполняется при запуске миграции.
    // Здесь мы создаём таблицу 'company_contact_channels'.
    public function up()
    {
        Schema::create('company_contact_channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');

            $table->enum('type', [
                'social_network',
                'messenger',
                'messenger_group',
                'gis_map',
                'yandex_map',
                'email',
                'phone_number',
                'website'
            ]);

            $table->string('title');
            $table->text('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('url')->nullable();
            $table->string('identifier')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('order_column')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // ✅ ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ (1M+ ЗАПИСЕЙ!)
            $table->index('company_id', 'idx_company_id');
            $table->index('type', 'idx_type');
            $table->index('is_active', 'idx_is_active');
            $table->index('order_column', 'idx_order_column');
            $table->index('created_at', 'idx_created_at');
            $table->index('updated_at', 'idx_updated_at');

            // ✅ КОМБИНИРОВАННЫЕ ИНДЕКСЫ (ДЛЯ ЧАСТЫХ ЗАПРОСОВ)
            $table->index(['company_id', 'is_active'], 'idx_company_active');
            $table->index(['company_id', 'type'], 'idx_company_type');
            $table->index(['type', 'is_active'], 'idx_type_active');
            $table->index(['company_id', 'order_column'], 'idx_company_order');

            // ✅ ПОЛНОТЕКСТОВЫЙ ПОИСК (ДЛЯ БЫСТРОГО ПОИСКА)
            $table->fullText(['title', 'identifier', 'url'], 'ft_search');
        });
    }

    // Метод down() выполняется при откате миграции.
    // Здесь мы удаляем таблицу 'company_contact_channels'.
    public function down()
    {
        Schema::dropIfExists('company_contact_channels');
    }
};
