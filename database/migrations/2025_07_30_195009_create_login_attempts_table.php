<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLoginAttemptsTable extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('login_attempts')) {
            Schema::create('login_attempts', function (Blueprint $table) {
                $table->id();
                $table->string('ip_address'); // IP-адрес пользователя
                $table->string('email')->nullable(); // Email для идентификации
                $table->text('user_agent')->nullable(); // Информация о браузере
                $table->boolean('is_banned')->default(false); // Флаг блокировки
                $table->integer('attempts')->default(0); // Счетчик попыток
                $table->timestamp('last_attempt_at')->nullable(); // Время последней попытки
                $table->timestamps(); // Метки времени

                // Индексы для оптимизации запросов
                $table->index('ip_address');
                $table->index('created_at');
                $table->index('is_banned');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('login_attempts');
    }
}
