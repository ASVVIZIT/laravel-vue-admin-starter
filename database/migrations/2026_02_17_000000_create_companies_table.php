<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Класс миграции для создания и удаления таблицы 'companies'
return new class extends Migration
{
    // Метод up() выполняется при запуске миграции.
    // Здесь мы создаём таблицу 'companies'.
    public function up()
    {
        Schema::create('companies', function (Blueprint $table) {
            // Основной идентификатор записи компании (первичный ключ)
            $table->id();

            // Название компании (строковое поле)
            $table->string('name');

            // Описание компании (текстовое поле, может быть пустым)
            $table->text('description')->nullable();

            // Адрес компании (строковое поле, может быть пустым)
            $table->string('address')->nullable();

            // Настройки компаний
            $table->json('settings')->nullable();

            // Столбцы для отметки времени создания и последнего обновления записи
            $table->timestamps();
        });
    }

    // Метод down() выполняется при откате миграции.
    // Здесь мы удаляем таблицу 'companies'.
    public function down()
    {
        Schema::dropIfExists('companies');
    }
};
