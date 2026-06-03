<?php

namespace Database\Seeders\Training;

/**
 * Сидер для наполнения модуля тренировок реалистичными данными (10 пользователей).
 *
 * ЯДРО ЛОГИКИ: "Взвешенная вариативность" (Weighted Probability)
 * - Вместо жёсткого списка упражнений используется система весов нагрузок.
 * - Пример: User #1 (Воркаут) — 45% bodyweight, 35% weighted, 10% cardio, 10% other.
 * - Гарантирует кросс-тренинг: даже узкий специалист периодически меняет активность.
 *
 * 🎛 КОНФИГУРАЦИЯ (менять только константы вверху файла):
 * 1. SYSTEM_USER_IDS / REAL_USER_START_ID — защита продакшена от случайной генерации.
 * 2. START_DATE / END_DATE — период генерации истории (~1.5 года).
 * 3. LOGS_PER_*_USER — целевое количество записей на пользователя.
 * 4. BATCH_SIZE — размер пакета массовой вставки (500-2000 для скорости).
 * 5. PROGRAMS — профили нагрузок с весами типов, частотой, паттерном прогрессии и днями отдыха.
 * 6. USER_PROGRAM_MAP — привязка ID пользователей к программам.
 *
 * ⚙️ АЛГОРИТМ ГЕНЕРАЦИИ:
 * 1. Проход по дням в диапазоне START_DATE → END_DATE.
 * 2. Пропуск дней отдыха, заданных в профиле программы.
 * 3. Вероятностное решение о тренировке в рабочий день (зависит от frequency).
 * 4. Выбор ТИПА нагрузки через getWeightedExerciseType() на основе весов программы.
 * 5. Выбор случайного упражнения этого типа из базы.
 * 6. Генерация записи через фабрику: подходы → прогрессия → мета-данные.
 * 7. Пакетная вставка через insertBatch() при достижении BATCH_SIZE.
 *
 * 🔧 ТЕХНИЧЕСКИЕ НЮАНСЫ:
 * - insertBatch() вручную кодирует JSON-поля (sets, shared_with) перед вставкой.
 *   Laravel::insert() игнорирует $casts модели, что вызывает ошибку "Array to string".
 * - withProgression() в фабрике пересобирает массив, обходя ограничение Eloquent на ссылки.
 *
 * 📈 МАСШТАБИРОВАНИЕ:
 * - Для 300k+ записей: увеличьте BATCH_SIZE до 1000-2000.
 * - Добавьте DB::disableQueryLog() в начало run() для ускорения.
 *
 * ✅ ПРОВЕРКА:
 *   // Количество записей: TrainingLog::where('user_id', 1)->count();
 *   // Прогрессия весов: TrainingLog::where('user_id', 1)->orderBy('date')->pluck('sets');
 *   // Распределение типов: TrainingLog::where('user_id', 1)->selectRaw('exercise_id, COUNT(*) as c')->groupBy('exercise_id')->get();
 */

use Illuminate\Database\Seeder;
use App\Models\Training\Exercise;
use App\Models\Training\TrainingLog;
use App\Models\User;
use Illuminate\Support\Carbon;

class TrainingModuleSeeder extends Seeder
{
    private const SYSTEM_USER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    private const REAL_USER_START_ID = 50;

    private const START_DATE = '2024-12-01';
    private const END_DATE = '2026-06-01';

    private const LOGS_PER_INTENSIVE_USER = 450;
    private const LOGS_PER_MEDIUM_USER = 250;
    private const LOGS_PER_LIGHT_USER = 80;
    private const BATCH_SIZE = 500;

    private const PROGRAMS = [
        'street_calisthenics' => [
            'name' => 'Уличный воркаут (Отжимания/Подтягивания/Штанга)',
            'frequency' => 5,
            'weights' => ['bodyweight' => 45, 'weighted' => 35, 'cardio' => 10, 'other' => 10],
            'intensity_pattern' => 'linear',
            'rest_days' => [0, 3],
        ],
        'powerlifter' => [
            'name' => 'Пауэрлифтинг (Тяжёлая база)',
            'frequency' => 4,
            'weights' => ['weighted' => 80, 'bodyweight' => 5, 'cardio' => 5, 'other' => 10],
            'intensity_pattern' => 'plateau',
            'rest_days' => [0, 2, 4, 6],
        ],
        'marathon_runner' => [
            'name' => 'Марафонец (Бег и выносливость)',
            'frequency' => 6,
            'weights' => ['cardio' => 75, 'bodyweight' => 15, 'other' => 10, 'weighted' => 0],
            'intensity_pattern' => 'linear',
            'rest_days' => [6],
        ],
        'crossfit_general' => [
            'name' => 'Кроссфит (Смешанный функционал)',
            'frequency' => 5,
            'weights' => ['weighted' => 30, 'bodyweight' => 30, 'cardio' => 25, 'other' => 15],
            'intensity_pattern' => 'random',
            'rest_days' => [6],
        ],
        'yoga_mobility' => [
            'name' => 'Йога и Мобильность',
            'frequency' => 4,
            'weights' => ['other' => 60, 'bodyweight' => 20, 'cardio' => 10, 'weighted' => 10],
            'intensity_pattern' => 'exponential',
            'rest_days' => [2, 5],
        ],
        'triathlon_prep' => [
            'name' => 'Триатлон (Плавание/Вело/Бег)',
            'frequency' => 6,
            'weights' => ['cardio' => 70, 'weighted' => 15, 'bodyweight' => 10, 'other' => 5],
            'intensity_pattern' => 'plateau',
            'rest_days' => [6],
        ],
        'functional_athlete' => [
            'name' => 'Функциональный атлет (Гиря/Канат/Прыжки)',
            'frequency' => 4,
            'weights' => ['bodyweight' => 40, 'cardio' => 30, 'weighted' => 20, 'other' => 10],
            'intensity_pattern' => 'random',
            'rest_days' => [2, 4, 6],
        ],
        'senior_light' => [
            'name' => 'ЛФК и Лёгкая активность',
            'frequency' => 3,
            'weights' => ['other' => 50, 'bodyweight' => 25, 'cardio' => 20, 'weighted' => 5],
            'intensity_pattern' => 'linear',
            'rest_days' => [1, 2, 3, 4, 5],
        ],
        'hiit_sprinter' => [
            'name' => 'ВИИТ и Спринты',
            'frequency' => 4,
            'weights' => ['cardio' => 50, 'bodyweight' => 30, 'weighted' => 15, 'other' => 5],
            'intensity_pattern' => 'exponential',
            'rest_days' => [1, 3, 5],
        ],
        'balanced_beginner' => [
            'name' => 'Начинающий (Равномерная нагрузка)',
            'frequency' => 3,
            'weights' => ['weighted' => 25, 'bodyweight' => 25, 'cardio' => 25, 'other' => 25],
            'intensity_pattern' => 'linear',
            'rest_days' => [2, 4, 6],
        ],
    ];

    private const USER_PROGRAM_MAP = [
        1 => 'street_calisthenics',
        2 => 'powerlifter',
        3 => 'marathon_runner',
        4 => 'crossfit_general',
        5 => 'yoga_mobility',
        6 => 'triathlon_prep',
        7 => 'functional_athlete',
        8 => 'senior_light',
        9 => 'hiit_sprinter',
        10 => 'balanced_beginner',
    ];

    public function run(): void
    {
        $maxSystemId = max(self::SYSTEM_USER_IDS);
        if ($maxSystemId >= self::REAL_USER_START_ID) {
            $this->command->error("❌ КОНФИГУРАЦИЯ: SYSTEM_USER_IDS (max {$maxSystemId}) конфликтует с REAL_USER_START_ID (" . self::REAL_USER_START_ID . ")");
            return;
        }

        $this->command->info('️ Starting Training Module Seeder...');

        $this->seedExercises();

        $availableUsers = User::whereIn('id', self::SYSTEM_USER_IDS)->pluck('id');
        if ($availableUsers->isEmpty()) {
            $this->command->error(' Нет системных пользователей (ID 1-10). Запусти UserSeeder сначала.');
            return;
        }

        $totalGenerated = 0;
        $startTime = microtime(true);

        foreach (self::SYSTEM_USER_IDS as $userId) {
            $programKey = self::USER_PROGRAM_MAP[$userId] ?? 'balanced_beginner';
            $logsCount = $this->getLogsCountForUser($userId);

            $generated = $this->generateRealisticLogs(
                userId: $userId,
                programKey: $programKey,
                startDate: self::START_DATE,
                endDate: self::END_DATE,
                targetCount: $logsCount
            );

            $totalGenerated += $generated;
            $this->command->info("✅ User #{$userId} [{$programKey}]: {$generated} logs");
        }

        $duration = round(microtime(true) - $startTime, 2);
        $this->command->info("🎉 Done! Generated {$totalGenerated} logs in {$duration}s");
    }

    private function seedExercises(): void
    {
        $exercises = [
            ['name' => 'Отжимания', 'type' => 'bodyweight', 'default_unit' => 'reps'],
            ['name' => 'Подтягивания', 'type' => 'bodyweight', 'default_unit' => 'reps'],
            ['name' => 'Приседания', 'type' => 'bodyweight', 'default_unit' => 'reps'],
            ['name' => 'Берпи', 'type' => 'bodyweight', 'default_unit' => 'reps'],
            ['name' => 'Жим штанги', 'type' => 'weighted', 'default_unit' => 'reps'],
            ['name' => 'Становая тяга', 'type' => 'weighted', 'default_unit' => 'reps'],
            ['name' => 'Присед со штангой', 'type' => 'weighted', 'default_unit' => 'reps'],
            ['name' => 'Тяга блока', 'type' => 'weighted', 'default_unit' => 'reps'],
            ['name' => 'Бег', 'type' => 'cardio', 'default_unit' => 'km'],
            ['name' => 'Велосипед', 'type' => 'cardio', 'default_unit' => 'km'],
            ['name' => 'Плавание', 'type' => 'cardio', 'default_unit' => 'km'],
            ['name' => 'Скакалка', 'type' => 'cardio', 'default_unit' => 'reps'],
            ['name' => 'Растяжка', 'type' => 'other', 'default_unit' => 'min'],
            ['name' => 'Йога', 'type' => 'other', 'default_unit' => 'min'],
            ['name' => 'МФР (ролл)', 'type' => 'other', 'default_unit' => 'min'],
            ['name' => 'Дыхательная гимнастика', 'type' => 'other', 'default_unit' => 'min'],
        ];

        foreach ($exercises as $ex) {
            Exercise::firstOrCreate(['name' => $ex['name']], $ex);
        }
        $this->command->info('✅ Exercises seeded: ' . count($exercises));
    }

    private function getLogsCountForUser(int $userId): int
    {
        return match ($userId) {
            1, 2, 3, 4 => self::LOGS_PER_INTENSIVE_USER,
            5, 6, 7 => self::LOGS_PER_MEDIUM_USER,
            8, 9, 10 => self::LOGS_PER_LIGHT_USER,
            default => self::LOGS_PER_LIGHT_USER,
        };
    }

    private function generateRealisticLogs(
        int $userId,
        string $programKey,
        string $startDate,
        string $endDate,
        int $targetCount
    ): int {
        $program = self::PROGRAMS[$programKey] ?? self::PROGRAMS['balanced_beginner'];
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $totalDays = $start->diffInDays($end);

        $weeklyTarget = ceil($targetCount / ($totalDays / 7));
        $frequency = min($program['frequency'], $weeklyTarget);

        $generated = 0;
        $batch = [];
        $weekOffset = 0;

        for ($day = 0; $day <= $totalDays; $day++) {
            $currentDate = $start->copy()->addDays($day);
            $dayOfWeek = $currentDate->dayOfWeek;

            if (in_array($dayOfWeek, $program['rest_days'])) {
                continue;
            }

            $shouldTrain = fake()->boolean(min(100, ($frequency / (7 - count($program['rest_days']))) * 100));
            if (!$shouldTrain) {
                continue;
            }

            $exerciseType = $this->getWeightedExerciseType($program['weights']);
            $exercise = Exercise::where('type', $exerciseType)->inRandomOrder()->first();
            if (!$exercise) continue;

            $intensity = $this->calculateIntensity($weekOffset, $program['intensity_pattern']);

            $log = TrainingLog::factory()
                ->forUser($userId)
                ->forExercise($exercise->id)
                ->forDate($currentDate->format('Y-m-d'))
                ->withProgramSets($exercise->type, $intensity)
                ->withProgression(
                    baseValue: $this->getBaseValue($exercise->type),
                    metric: $this->getPrimaryMetric($exercise->type),
                    progressionType: $program['intensity_pattern'],
                    weekOffset: $weekOffset
                )
                ->make([
                    'time' => $this->generateTrainingTime($dayOfWeek),
                    'is_public' => fake()->boolean(15),
                    'rating' => fake()->boolean(50) ? fake()->numberBetween(3, 5) : null,
                    'notes' => fake()->boolean(20) ? $this->generateProgramNote($programKey, $exercise->type) : null,
                ]);

            $batch[] = $log->toArray();
            $generated++;

            if (count($batch) >= self::BATCH_SIZE) {
                $this->insertBatch($batch);
                $batch = [];
            }

            if ($day % 7 === 0) {
                $weekOffset++;
            }

            if ($generated >= $targetCount) {
                break;
            }
        }

        if (!empty($batch)) {
            $this->insertBatch($batch);
        }

        return $generated;
    }

    /**
     * Массовая вставка с ручным кодированием JSON-полей и форматированием даты.
     * Laravel::insert() не применяет $casts и не форматирует Carbon-даты автоматически.
     */
    private function insertBatch(array $batch): void
    {
        $encoded = array_map(function ($row) {
            // 1. Гарантируем формат даты Y-m-d (убираем время и таймзону)
            if (isset($row['date'])) {
                $row['date'] = date('Y-m-d', strtotime($row['date']));
            }

            // 2. Кодируем JSON-поля
            if (isset($row['sets']) && is_array($row['sets'])) {
                $row['sets'] = json_encode($row['sets']);
            }
            if (isset($row['shared_with']) && is_array($row['shared_with'])) {
                $row['shared_with'] = json_encode($row['shared_with']);
            }
            return $row;
        }, $batch);

        TrainingLog::insert($encoded);
    }

    private function getWeightedExerciseType(array $weights): string
    {
        $random = fake()->numberBetween(1, 100);
        $sum = 0;

        foreach ($weights as $type => $weight) {
            $sum += $weight;
            if ($random <= $sum) {
                return $type;
            }
        }

        return array_key_first($weights);
    }

    private function calculateIntensity(int $week, string $pattern): string
    {
        return match ($pattern) {
            'linear' => $week < 10 ? 'light' : ($week < 30 ? 'medium' : 'hard'),
            'exponential' => $week < 15 ? 'light' : ($week < 40 ? 'medium' : 'peak'),
            'plateau' => $week < 20 ? 'medium' : ($week < 50 ? 'hard' : 'peak'),
            'random' => fake()->randomElement(['light', 'medium', 'hard']),
            default => 'medium',
        };
    }

    private function getBaseValue(string $exerciseType): float
    {
        return match ($exerciseType) {
            'bodyweight' => 15,
            'weighted' => 40,
            'cardio' => 5,
            'other' => 1800,
            default => 10,
        };
    }

    private function getPrimaryMetric(string $exerciseType): string
    {
        return match ($exerciseType) {
            'bodyweight', 'weighted' => 'reps',
            'cardio' => 'distance',
            'other' => 'duration',
            default => 'reps',
        };
    }

    private function generateTrainingTime(int $dayOfWeek): string
    {
        $isWeekend = in_array($dayOfWeek, [0, 6]);
        $hour = $isWeekend
            ? fake()->numberBetween(9, 18)
            : (fake()->boolean(30) ? fake()->numberBetween(6, 9) : fake()->numberBetween(18, 22));

        return sprintf('%02d:%02d', $hour, fake()->numberBetween(0, 59));
    }

    private function generateProgramNote(string $programKey, string $type): string
    {
        $notes = [
            'weighted' => ['Железо шло сегодня хорошо', 'Добавил 2.5кг', 'Техника хромает', 'База решает'],
            'cardio' => ['Хороший пульс держал', 'Дыхалка', 'Интервалы', 'Кадрос высокий'],
            'bodyweight' => ['Калистеника', 'Свой вес - мой тренажер', 'Мышцы горят', 'Отжимания и подтягивания'],
            'other' => ['Растяжка после тренировки', 'Йога для спины', 'Мобильность суставов', 'Заминка'],
        ];
        $typeNotes = $notes[$type] ?? ['Тренировка'];
        return $typeNotes[array_rand($typeNotes)];
    }
}
