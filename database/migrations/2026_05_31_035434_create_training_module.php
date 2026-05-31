<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Запуск миграций.
     * Создаёт все таблицы модуля Training с нуля.
     */
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique()->comment('Название: Отжимания, Подтягивания, Бег');
            $table->enum('type', ['bodyweight', 'weighted', 'cardio', 'other'])
                ->default('bodyweight')
                ->comment('Тип: bodyweight/weighted/cardio/other');
            $table->string('default_unit')->default('reps')
                ->comment('Единица: reps, kg, sec, m, km, min');
            $table->boolean('is_active')->default(true)->comment('Видимо в форме');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'is_active']);
        });

        Schema::create('training_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained('exercises')->cascadeOnDelete();
            $table->date('date')->comment('Дата тренировки');
            $table->string('time')->comment('Время начала (H:i)');
            $table->json('sets')->comment('Массив: [{"reps":20,"weight":null,"duration":30}]');
            $table->boolean('is_public')->default(false)->comment('Публичный доступ');
            $table->json('shared_with')->nullable()->comment('Массив ID: [1,5,12]');
            $table->text('notes')->nullable()->comment('Заметки к сессии');
            $table->tinyInteger('rating')->nullable()->comment('Оценка 1-5');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'date', 'exercise_id']);
            $table->index('is_public');
            $table->index('date');
        });
    }

    /**
     * Откат миграций.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_logs');
        Schema::dropIfExists('exercises');
    }
};
