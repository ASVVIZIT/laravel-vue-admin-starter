<?php

namespace Database\Factories\Training;

use App\Models\Training\TrainingLog;
use App\Models\Training\Exercise;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrainingLogFactory extends Factory
{
    protected $model = TrainingLog::class;

    public function definition(): array
    {
        $exercise = Exercise::inRandomOrder()->first() ?? Exercise::factory()->create();
        $type = $exercise->type;
        $sets = [];

        foreach (range(1, fake()->numberBetween(3, 6)) as $i) {
            $set = ['reps' => null, 'weight' => null, 'duration' => null, 'distance' => null, 'notes' => null];

            match ($type) {
                'bodyweight' => $set['reps'] = fake()->numberBetween(8, 40),
                'weighted' => [
                    $set['reps'] = fake()->numberBetween(3, 15),
                    $set['weight'] = fake()->randomFloat(1, 2.5, 100),
                ],
                'cardio' => [
                    $set['duration'] = fake()->numberBetween(300, 3600),
                    $set['distance'] = fake()->randomFloat(2, 0.5, 15),
                ],
                default => $set['reps'] = fake()->numberBetween(10, 30),
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

    public function public(): static
    {
        return $this->state(fn(array $attrs) => ['is_public' => true]);
    }
}
