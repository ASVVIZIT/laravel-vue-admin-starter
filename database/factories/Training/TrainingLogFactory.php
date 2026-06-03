<?php

namespace Database\Factories\Training;

/**
 * Фабрика для генерации записей тренировочного журнала (TrainingLog).
 *
 * ОТВЕТСТВЕННОСТЬ:
 * - Создаёт реалистичные данные тренировок: подходы, повторения, веса, длительность.
 * - Учитывает тип упражнения (bodyweight/weighted/cardio/other) для релевантных метрик.
 * - Поддерживает программную интенсивность и математическую прогрессию нагрузок.
 *
 * КАК ЭТО РАБОТАЕТ:
 * 1. definition() — базовая генерация случайных подходов согласно типу упражнения.
 * 2. withProgramSets() — переопределяет подходы с учётом интенсивности программы
 *    (light/medium/hard/peak влияет на объём и значения метрик).
 * 3. withProgression() — применяет множитель прогрессии к указанной метрике
 *    на основе даты записи и номера недели.
 *
 * ⚠️ КРИТИЧЕСКИЙ ПОРЯДОК ВЫЗОВА:
 * Всегда вызывайте withProgramSets() ДО withProgression().
 * Причина: Eloquent не поддерживает модификацию JSON-кастов по ссылке.
 * Метод прогрессии пересобирает массив подходов в новую переменную и присваивает обратно.
 * Если поменять порядок — прогрессия не применится к данным.
 *
 * КОНФИГУРАЦИЯ:
 * - Все диапазоны генерации (reps, weight, duration, sets) вынесены в EXERCISE_DEFAULTS.
 * - Для изменения логики правьте только эту константу и метод definition().
 *
 * ПРИМЕР ИСПОЛЬЗОВАНИЯ:
 *   TrainingLog::factory()
 *     ->forUser(1)
 *     ->forExercise(6)
 *     ->forDate('2026-05-15')
 *     ->withProgramSets('weighted', 'hard')
 *     ->withProgression(40, 'weight', 'linear', weekOffset: 10)
 *     ->create();
 */

use App\Models\Training\TrainingLog;
use App\Models\Training\Exercise;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class TrainingLogFactory extends Factory
{
    protected $model = TrainingLog::class;

    private const EXERCISE_DEFAULTS = [
        'bodyweight' => ['reps_min' => 8, 'reps_max' => 40, 'sets_min' => 3, 'sets_max' => 6],
        'weighted'   => ['reps_min' => 3, 'reps_max' => 15, 'weight_min' => 2.5, 'weight_max' => 150, 'sets_min' => 3, 'sets_max' => 5],
        'cardio'     => ['duration_min' => 300, 'duration_max' => 5400, 'distance_min' => 0.5, 'distance_max' => 42, 'sets_min' => 1, 'sets_max' => 3],
        'other'      => ['duration_min' => 600, 'duration_max' => 3600, 'sets_min' => 1, 'sets_max' => 4],
    ];

    public function definition(): array
    {
        $exercise = Exercise::inRandomOrder()->first() ?? Exercise::factory()->create();
        $type = $exercise->type;
        $defaults = self::EXERCISE_DEFAULTS[$type] ?? self::EXERCISE_DEFAULTS['other'];

        $sets = [];
        $setsCount = fake()->numberBetween($defaults['sets_min'], $defaults['sets_max']);

        foreach (range(1, $setsCount) as $i) {
            $set = ['reps' => null, 'weight' => null, 'duration' => null, 'distance' => null, 'notes' => null];

            match ($type) {
                'bodyweight' => $set['reps'] = fake()->numberBetween($defaults['reps_min'], $defaults['reps_max']),
                'weighted' => [
                    $set['reps'] = fake()->numberBetween($defaults['reps_min'], $defaults['reps_max']),
                    $set['weight'] = round(fake()->randomFloat(1, $defaults['weight_min'], $defaults['weight_max']), 1),
                ],
                'cardio' => [
                    $set['duration'] = fake()->numberBetween($defaults['duration_min'], $defaults['duration_max']),
                    $set['distance'] = round(fake()->randomFloat(2, $defaults['distance_min'], $defaults['distance_max']), 2),
                ],
                default => $set['duration'] = fake()->numberBetween($defaults['duration_min'], $defaults['duration_max']),
            };
            $sets[] = $set;
        }

        return [
            'user_id' => User::factory(),
            'exercise_id' => $exercise->id,
            'date' => fake()->dateTimeBetween('-60 days', 'now')->format('Y-m-d'),
            'time' => fake()->time('H:i'),
            'sets' => $sets,
            'is_public' => fake()->boolean(10),
            'shared_with' => fake()->boolean(5) ? [fake()->numberBetween(1, 30)] : null,
            'notes' => fake()->boolean(30) ? fake()->sentence(10) : null,
            'rating' => fake()->boolean(40) ? fake()->numberBetween(1, 5) : null,
        ];
    }

    public function forUser(int $userId): static
    {
        return $this->state(fn(array $attrs) => ['user_id' => $userId]);
    }

    public function forExercise(int $exerciseId): static
    {
        return $this->state(fn(array $attrs) => ['exercise_id' => $exerciseId]);
    }

    public function forDate(string $date): static
    {
        return $this->state(fn(array $attrs) => ['date' => $date]);
    }

    public function forDateRange(string $from, string $to): static
    {
        return $this->state(fn(array $attrs) => [
            'date' => fake()->dateTimeBetween($from, $to)->format('Y-m-d'),
        ]);
    }

    public function withSets(array $sets): static
    {
        return $this->state(fn(array $attrs) => ['sets' => $sets]);
    }

    public function withProgression(
        float $baseValue,
        string $metric,
        string $progressionType = 'linear',
        int $weekOffset = 0
    ): static {
        return $this->afterMaking(function (TrainingLog $log) use ($baseValue, $metric, $progressionType, $weekOffset) {
            $startDate = Carbon::parse($log->date);
            $weeks = floor($startDate->diffInDays(Carbon::now()) / 7) + $weekOffset;

            $multiplier = match ($progressionType) {
                'linear' => 1 + ($weeks * 0.02),
                'exponential' => pow(1.015, $weeks),
                'plateau' => min(1.3, 1 + ($weeks * 0.01)),
                'random' => fake()->randomFloat(2, 0.95, 1.15),
                default => 1,
            };

            // 🔥 ИСПРАВЛЕНО: Eloquent не поддерживает модификацию JSON-атрибутов по ссылке.
            // Пересобираем массив в новую переменную и присваиваем обратно.
            $updatedSets = [];
            foreach ($log->sets as $set) {
                if (isset($set[$metric]) && is_numeric($set[$metric])) {
                    $set[$metric] = round($set[$metric] * $multiplier, in_array($metric, ['weight', 'distance']) ? 1 : 0);
                }
                $updatedSets[] = $set;
            }
            $log->sets = $updatedSets;
        });
    }

    public function public(): static
    {
        return $this->state(fn(array $attrs) => ['is_public' => true]);
    }

    public function withRating(int $min = 4, int $max = 5): static
    {
        return $this->state(fn(array $attrs) => ['rating' => fake()->numberBetween($min, $max)]);
    }

    public function withNotes(): static
    {
        return $this->state(fn(array $attrs) => [
            'notes' => fake()->boolean(70) ? fake()->sentence(10) : null,
        ]);
    }

    public function withProgramSets(string $exerciseType, string $intensity = 'medium'): static
    {
        return $this->afterMaking(function (TrainingLog $log) use ($exerciseType, $intensity) {
            $defaults = self::EXERCISE_DEFAULTS[$exerciseType] ?? self::EXERCISE_DEFAULTS['other'];

            $intensityMultiplier = match ($intensity) {
                'light' => 0.8,
                'medium' => 1.0,
                'hard' => 1.2,
                'peak' => 1.4,
                default => 1.0,
            };

            $sets = [];
            $setsCount = fake()->numberBetween(
                max(1, (int)($defaults['sets_min'] * $intensityMultiplier)),
                (int)($defaults['sets_max'] * $intensityMultiplier)
            );

            foreach (range(1, $setsCount) as $i) {
                $set = ['reps' => null, 'weight' => null, 'duration' => null, 'distance' => null, 'notes' => null];

                match ($exerciseType) {
                    'bodyweight' => $set['reps'] = fake()->numberBetween(
                        (int)($defaults['reps_min'] * $intensityMultiplier),
                        (int)($defaults['reps_max'] * $intensityMultiplier)
                    ),
                    'weighted' => [
                        $set['reps'] = fake()->numberBetween(
                            (int)($defaults['reps_min'] * $intensityMultiplier),
                            (int)($defaults['reps_max'] * $intensityMultiplier)
                        ),
                        $set['weight'] = round(fake()->randomFloat(
                            1,
                            $defaults['weight_min'] * $intensityMultiplier,
                            $defaults['weight_max'] * $intensityMultiplier
                        ), 1),
                    ],
                    'cardio' => [
                        $set['duration'] = fake()->numberBetween(
                            (int)($defaults['duration_min'] * $intensityMultiplier),
                            (int)($defaults['duration_max'] * $intensityMultiplier)
                        ),
                        $set['distance'] = round(fake()->randomFloat(
                            2,
                            $defaults['distance_min'] * $intensityMultiplier,
                            $defaults['distance_max'] * $intensityMultiplier
                        ), 2),
                    ],
                    default => $set['duration'] = fake()->numberBetween(
                        (int)($defaults['duration_min'] * $intensityMultiplier),
                        (int)($defaults['duration_max'] * $intensityMultiplier)
                    ),
                };
                $sets[] = $set;
            }
            $log->sets = $sets;
        });
    }
}
