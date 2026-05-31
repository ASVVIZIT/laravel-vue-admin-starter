<?php

namespace Database\Seeders\Training;

use Illuminate\Database\Seeder;
use App\Models\Training\Exercise;
use App\Models\Training\TrainingLog;
use App\Models\User;

class TrainingModuleSeeder extends Seeder
{
    public function run(): void
    {
        $exercises = [
            ['name' => 'Отжимания', 'type' => 'bodyweight', 'default_unit' => 'reps'],
            ['name' => 'Подтягивания', 'type' => 'bodyweight', 'default_unit' => 'reps'],
            ['name' => 'Приседания', 'type' => 'bodyweight', 'default_unit' => 'reps'],
            ['name' => 'Берпи', 'type' => 'bodyweight', 'default_unit' => 'reps'],
            ['name' => 'Планка', 'type' => 'bodyweight', 'default_unit' => 'sec'],
            ['name' => 'Жим штанги', 'type' => 'weighted', 'default_unit' => 'reps'],
            ['name' => 'Становая тяга', 'type' => 'weighted', 'default_unit' => 'reps'],
            ['name' => 'Присед со штангой', 'type' => 'weighted', 'default_unit' => 'reps'],
            ['name' => 'Тяга блока', 'type' => 'weighted', 'default_unit' => 'reps'],
            ['name' => 'Бег', 'type' => 'cardio', 'default_unit' => 'km'],
            ['name' => 'Велосипед', 'type' => 'cardio', 'default_unit' => 'km'],
            ['name' => 'Плавание', 'type' => 'cardio', 'default_unit' => 'm'],
            ['name' => 'Скакалка', 'type' => 'cardio', 'default_unit' => 'reps'],
            ['name' => 'Растяжка', 'type' => 'other', 'default_unit' => 'min'],
            ['name' => 'Йога', 'type' => 'other', 'default_unit' => 'min'],
        ];

        foreach ($exercises as $ex) {
            Exercise::firstOrCreate(['name' => $ex['name']], $ex);
        }

        $userIds = User::limit(30)->pluck('id');
        if ($userIds->isEmpty()) {
            $this->command->warn('⚠ Нет пользователей. Создай через UserFactory.');
            return;
        }

        // User #1: плотная программа
        $this->generateForUser(1, 45, '2026-05-01', '2026-05-31', [1, 2, 6, 10]);

        // Users 2-10: средняя активность
        foreach ($userIds->slice(1, 9) as $uid) {
            $this->generateForUser($uid, fake()->numberBetween(15, 35), '-45 days', 'now');
        }

        // Users 11-30: легкая активность
        foreach ($userIds->slice(10) as $uid) {
            $this->generateForUser($uid, fake()->numberBetween(5, 20), '-60 days', 'now');
        }

        $this->command->info('✅ Training module seeded: exercises + logs for 30 users');
    }

    private function generateForUser(int $userId, int $logsCount, string $from, string $to, ?array $exerciseIds = null): void
    {
        $availableExercises = $exerciseIds ?? Exercise::active()->pluck('id')->toArray();

        TrainingLog::factory()
            ->count($logsCount)
            ->forUser($userId)
            ->sequence(fn($seq) => [
                'exercise_id' => $availableExercises[$seq->index % count($availableExercises)],
                'date' => fake()->dateTimeBetween($from, $to)->format('Y-m-d'),
            ])
            ->create();
    }
}
