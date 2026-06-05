<?php

namespace Database\Seeders\Training;

use Illuminate\Database\Seeder;
use App\Models\Training\Exercise;
use App\Models\Training\TrainingLog;
use App\Models\Training\TrainingSetting;
use App\Models\User;
use Illuminate\Support\Carbon;

class TrainingModuleSeeder extends Seeder
{
    private const SYSTEM_USER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    private const START_DATE = '2024-12-01';
    private const END_DATE = '2026-06-05';

    private const LOGS_PER_INTENSIVE_USER = 2000;  // Было 700
    private const LOGS_PER_MEDIUM_USER = 1500;     // Было 550
    private const LOGS_PER_LIGHT_USER = 800;       // Было 300
    private const BATCH_SIZE = 1000;               // Было 500 (ускорит вставку)

    private const SHARING_CONFIG = [
        'public_chance' => 10,
        'shared_chance' => 15,
        'min_recipients' => 1,
        'max_recipients' => 3,
    ];

    private const PROGRAMS = [
        'street_calisthenics' => ['name' => 'Уличный воркаут', 'frequency' => 5, 'weights' => ['bodyweight' => 45, 'weighted' => 35, 'cardio' => 10, 'other' => 10], 'intensity_pattern' => 'linear', 'rest_days' => [0, 3]],
        'powerlifter' => ['name' => 'Пауэрлифтинг', 'frequency' => 4, 'weights' => ['weighted' => 80, 'bodyweight' => 5, 'cardio' => 5, 'other' => 10], 'intensity_pattern' => 'plateau', 'rest_days' => [0, 2, 4, 6]],
        'marathon_runner' => ['name' => 'Марафонец', 'frequency' => 6, 'weights' => ['cardio' => 75, 'bodyweight' => 15, 'other' => 10, 'weighted' => 0], 'intensity_pattern' => 'linear', 'rest_days' => [6]],
        'crossfit_general' => ['name' => 'Кроссфит', 'frequency' => 5, 'weights' => ['weighted' => 30, 'bodyweight' => 30, 'cardio' => 25, 'other' => 15], 'intensity_pattern' => 'random', 'rest_days' => [6]],
        'yoga_mobility' => ['name' => 'Йога и Мобильность', 'frequency' => 4, 'weights' => ['other' => 60, 'bodyweight' => 20, 'cardio' => 10, 'weighted' => 10], 'intensity_pattern' => 'exponential', 'rest_days' => [2, 5]],
        'triathlon_prep' => ['name' => 'Триатлон', 'frequency' => 6, 'weights' => ['cardio' => 70, 'weighted' => 15, 'bodyweight' => 10, 'other' => 5], 'intensity_pattern' => 'plateau', 'rest_days' => [6]],
        'functional_athlete' => ['name' => 'Функциональный атлет', 'frequency' => 4, 'weights' => ['bodyweight' => 40, 'cardio' => 30, 'weighted' => 20, 'other' => 10], 'intensity_pattern' => 'random', 'rest_days' => [2, 4, 6]],
        'senior_light' => ['name' => 'ЛФК', 'frequency' => 3, 'weights' => ['other' => 50, 'bodyweight' => 25, 'cardio' => 20, 'weighted' => 5], 'intensity_pattern' => 'linear', 'rest_days' => [1, 2, 3, 4, 5]],
        'hiit_sprinter' => ['name' => 'ВИИТ', 'frequency' => 4, 'weights' => ['cardio' => 50, 'bodyweight' => 30, 'weighted' => 15, 'other' => 5], 'intensity_pattern' => 'exponential', 'rest_days' => [1, 3, 5]],
        'balanced_beginner' => ['name' => 'Начинающий', 'frequency' => 3, 'weights' => ['weighted' => 25, 'bodyweight' => 25, 'cardio' => 25, 'other' => 25], 'intensity_pattern' => 'linear', 'rest_days' => [2, 4, 6]],
    ];

    private const USER_PROGRAM_MAP = [
        1 => 'street_calisthenics', 2 => 'powerlifter', 3 => 'marathon_runner',
        4 => 'crossfit_general', 5 => 'yoga_mobility', 6 => 'triathlon_prep',
        7 => 'functional_athlete', 8 => 'senior_light', 9 => 'hiit_sprinter', 10 => 'balanced_beginner',
        11 => 'street_calisthenics', 12 => 'powerlifter', 13 => 'marathon_runner',
        14 => 'crossfit_general', 15 => 'yoga_mobility', 16 => 'triathlon_prep',
        17 => 'functional_athlete', 18 => 'senior_light', 19 => 'hiit_sprinter', 20 => 'balanced_beginner',
    ];

    public function run(): void
    {
        $this->command->info('🏋️ Starting Training Module Seeder...');

        $this->fixTableCharset();
        $this->seedExercises();

        $availableUsers = User::whereIn('id', self::SYSTEM_USER_IDS)->pluck('id');
        if ($availableUsers->isEmpty()) {
            $this->command->error('❌ Нет системных пользователей (ID 1-10).');
            return;
        }

        $totalGenerated = 0;
        $startTime = microtime(true);
        $publicCount = 0;
        $sharedCount = 0;

        foreach (self::SYSTEM_USER_IDS as $userId) {
            $programKey = self::USER_PROGRAM_MAP[$userId] ?? 'balanced_beginner';
            $logsCount = $this->getLogsCountForUser($userId);

            $generated = $this->generateRealisticLogs(
                userId: $userId,
                programKey: $programKey,
                startDate: self::START_DATE,
                endDate: self::END_DATE,
                targetCount: $logsCount,
                publicCount: $publicCount,
                sharedCount: $sharedCount
            );

            $totalGenerated += $generated;
            $this->command->info("✅ User #{$userId} [{$programKey}]: {$generated} logs");
        }

        $duration = round(microtime(true) - $startTime, 2);
        $this->command->info("🎉 Done! Generated {$totalGenerated} logs in {$duration}s");
        $this->command->info("🔗 Sharing: {$publicCount} public, {$sharedCount} shared");

        $this->seedSettings();
    }

    private function fixTableCharset(): void
    {
        try {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE training_logs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $this->command->info('✅ Table charset fixed to utf8mb4');
        } catch (\Exception $e) {
            $this->command->warn('⚠️ Could not fix charset: ' . $e->getMessage());
        }
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

    private function generateRealisticLogs(int $userId, string $programKey, string $startDate, string $endDate, int $targetCount, int &$publicCount, int &$sharedCount): int
    {
        $program = self::PROGRAMS[$programKey] ?? self::PROGRAMS['balanced_beginner'];
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $totalDays = $start->diffInDays($end);

        $weeklyTarget = ceil($targetCount / ($totalDays / 7));
        $frequency = min($program['frequency'], $weeklyTarget);

        $generated = 0;
        $batch = [];
        $weekOffset = 0;
        $allUserIds = User::whereIn('id', self::SYSTEM_USER_IDS)->pluck('id')->toArray();

        for ($day = 0; $day <= $totalDays; $day++) {
            $currentDate = $start->copy()->addDays($day);
            $dayOfWeek = $currentDate->dayOfWeek;

            if (in_array($dayOfWeek, $program['rest_days'])) continue;

            $shouldTrain = fake()->boolean(min(100, ($frequency / (7 - count($program['rest_days']))) * 100));
            if (!$shouldTrain) continue;

            $exerciseType = $this->getWeightedExerciseType($program['weights']);
            $exercise = Exercise::where('type', $exerciseType)->inRandomOrder()->first();
            if (!$exercise) continue;

            $intensity = $this->calculateIntensity($weekOffset, $program['intensity_pattern']);

            $isPublic = fake()->boolean(self::SHARING_CONFIG['public_chance']);
            $sharedWith = null;

            if (!$isPublic && fake()->boolean(self::SHARING_CONFIG['shared_chance'])) {
                $potentialRecipients = array_filter($allUserIds, fn($id) => $id !== $userId);
                $recipientCount = fake()->numberBetween(self::SHARING_CONFIG['min_recipients'], self::SHARING_CONFIG['max_recipients']);

                if (!empty($potentialRecipients)) {
                    $sharedWith = fake()->randomElements($potentialRecipients, min($recipientCount, count($potentialRecipients)));
                    $sharedCount++;
                }
            } elseif ($isPublic) {
                $publicCount++;
            }

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
                    'is_public' => $isPublic,
                    'shared_with' => $sharedWith,
                    'rating' => fake()->boolean(50) ? fake()->numberBetween(3, 5) : null,
                    'notes' => fake()->boolean(20) ? $this->generateProgramNote($programKey, $exercise->type, $isPublic, $sharedWith) : null,
                ]);

            $batch[] = $log->toArray();
            $generated++;

            if (count($batch) >= self::BATCH_SIZE) {
                $this->insertBatch($batch);
                $batch = [];
            }

            if ($day % 7 === 0) $weekOffset++;
            if ($generated >= $targetCount) break;
        }

        if (!empty($batch)) $this->insertBatch($batch);
        return $generated;
    }

    private function insertBatch(array $batch): void
    {
        $encoded = array_map(function ($row) {
            if (isset($row['date'])) $row['date'] = date('Y-m-d', strtotime($row['date']));
            if (isset($row['sets']) && is_array($row['sets'])) $row['sets'] = json_encode($row['sets'], JSON_UNESCAPED_UNICODE);
            if (isset($row['shared_with']) && is_array($row['shared_with'])) $row['shared_with'] = json_encode($row['shared_with']);
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
            if ($random <= $sum) return $type;
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
            'bodyweight' => 15, 'weighted' => 40, 'cardio' => 5, 'other' => 1800, default => 10,
        };
    }

    private function getPrimaryMetric(string $exerciseType): string
    {
        return match ($exerciseType) {
            'bodyweight', 'weighted' => 'reps', 'cardio' => 'distance', 'other' => 'duration', default => 'reps',
        };
    }

    private function generateTrainingTime(int $dayOfWeek): string
    {
        $isWeekend = in_array($dayOfWeek, [0, 6]);
        $hour = $isWeekend ? fake()->numberBetween(9, 18) : (fake()->boolean(30) ? fake()->numberBetween(6, 9) : fake()->numberBetween(18, 22));
        return sprintf('%02d:%02d', $hour, fake()->numberBetween(0, 59));
    }

    private function generateProgramNote(string $programKey, string $type, bool $isPublic, ?array $sharedWith): string
    {
        $baseNotes = [
            'weighted' => ['Железо шло сегодня хорошо 💪', 'Добавил 2.5кг ⬆️', 'Техника хромает 🔧', 'База решает 🏋️'],
            'cardio' => ['Хороший пульс держал ❤️', 'Дыхалка 💨', 'Интервалы ⏱️', 'Кадрос высокий 📈'],
            'bodyweight' => ['Калистеника 🤸', 'Свой вес - мой тренажер 💯', 'Мышцы горят 🔥', 'Отжимания и подтягивания 💪'],
            'other' => ['Растяжка после тренировки 🧘', 'Йога для спины 🧘‍♀️', 'Мобильность суставов 🦴', 'Заминка 🏁'],
        ];

        $typeNotes = $baseNotes[$type] ?? ['Тренировка 🏃'];
        $note = $typeNotes[array_rand($typeNotes)];

        if ($isPublic) $note .= ' 🌍';
        elseif ($sharedWith) $note .= ' 🔐';

        return $note;
    }

    private function seedSettings(): void
    {
        $serverSettings = [
            'server.grouping_mode' => 'auto',
            'server.grouping_auto_threshold' => '500',
            'server.grouping_by' => 'user',
            'server.grouping_per_page' => '10',
            'server.logs_per_page' => '50',
            'server.enable_stats' => 'true',
            'server.enable_sharing' => 'true',
            // 🔥 НОВЫЕ НАСТРОЙКИ УМНОЙ ГРУППИРОВКИ
            'server.enable_min_groups_check' => 'true',
            'server.grouping_min_groups' => '3',
        ];

        $frontendSettings = [
            'frontend.default_tab' => 'mine',
            'frontend.show_grouping_toggle' => 'true',
            'frontend.filters_collapsed_mobile' => 'true',
            'frontend.compact_view' => 'false',
        ];

        $columnsSettings = [
            'frontend.columns.mine' => json_encode(['date' => true, 'time' => true, 'exercise' => true, 'sharing' => true, 'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => true]),
            'frontend.columns.shared-with-me' => json_encode(['date' => true, 'time' => true, 'exercise' => true, 'sharing' => true, 'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => false]),
            'frontend.columns.shared-by-me' => json_encode(['date' => true, 'time' => true, 'exercise' => true, 'sharing' => true, 'sets' => true, 'reps' => true, 'volume' => true, 'rating' => true, 'actions' => true]),
        ];

        $allSettings = array_merge($serverSettings, $frontendSettings, $columnsSettings);

        foreach ($allSettings as $key => $value) {
            TrainingSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        $this->command->info('✅ Settings seeded: ' . count($allSettings));
    }
}
