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
            // Основной идентификатор записи (первичный ключ)
            $table->id();

            // Внешний ключ, связывающий канал связи с конкретной компанией
            // Ссылаемся на таблицу 'companies' и столбец 'id'
            // onDelete('cascade') означает, что при удалении компании, все её каналы связи также будут удалены
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');

            // Поле для типа канала связи (ограниченный список допустимых значений)
            $table->enum('type', [
                'social_network',    // Социальная сеть (например, Instagram, VK)
                'messenger',         // Мессенджер (например, WhatsApp, Telegram)
                'messenger_group',   // Группа в мессенджере
                'gis_map',           // Карта 2GIS
                'yandex_map',        // Карта Яндекс
                'email',             // Электронная почта
                'phone_number',      // Номер телефона
                'website'            // Веб-сайт
            ]);

            // Название канала связи (например, "Instagram Компании X")
            $table->string('title');

            // Описание канала связи (необязательное поле)
            $table->text('description')->nullable();

            // URL к логотипу/иконке канала связи (необязательное поле)
            $table->string('logo_url')->nullable();

            // Основной URL для канала (например, ссылка на профиль, сайт и т.д.) (необязательное поле)
            $table->string('url')->nullable();

            // Универсальное текстовое поле для идентификатора (например, email, номер телефона, username в мессенджере) (необязательное поле)
            $table->string('identifier')->nullable();

            // JSON-поле для хранения любых специфичных данных (например, координаты для карты, embed-код, дополнительные настройки)
            $table->json('metadata')->nullable();

            // Поле для сортировки каналов связи внутри компании
            $table->integer('order_column')->default(0);

            // Флаг активности канала связи (по умолчанию - активен)
            $table->boolean('is_active')->default(true);

            // Столбцы для отметки времени создания и последнего обновления записи
            $table->timestamps();
        });
    }

    // Метод down() выполняется при откате миграции.
    // Здесь мы удаляем таблицу 'company_contact_channels'.
    public function down()
    {
        Schema::dropIfExists('company_contact_channels');
    }
};
