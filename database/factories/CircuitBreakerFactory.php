<?php
namespace Database\Factories;

use App\Models\Brand;
use App\Models\CircuitBreaker;
use Illuminate\Database\Eloquent\Factories\Factory;

class CircuitBreakerFactory extends Factory
{
    protected $model = CircuitBreaker::class;

    public function definition()
    {
        return [
            'brand_id' => Brand::inRandomOrder()->first()->id,
            'device_type' => $this->faker->randomElement([
                'Автоматический выключатель',
                'УЗО',
                'Дифференциальный автомат'
            ]),
            'model' => $this->faker->unique()->bothify('??##-####'),
            'series' => $this->faker->randomElement(['S200', 'Acti9', 'Easy9']),
            'nominal_current' => $this->faker->randomElement([6, 10, 16, 20, 25, 32, 40]),
            'trip_curve' => $this->faker->randomElement(['B', 'C', 'D']),
            'poles' => $this->faker->numberBetween(1, 4),
            'breaking_capacity' => $this->faker->randomElement(['6 кА', '10 кА', '15 кА']),
            'voltage' => '230/400V',
            'modular_size' => $this->faker->randomElement(['1D', '2D', '3D', '4D']),
            'energy_class' => 'A-III',
            'ip_rating' => 'IP20',
            'terminal_type' => $this->faker->randomElement(['Винтовой', 'Безвинтовой']),
            'temperature_range' => '-25°C до +55°C',
            'tripping_time' => $this->faker->numberBetween(10, 100),
            'pollution_degree' => 'Степень 2',
            'housing_material' => 'Термопласт',
            'standards' => 'IEC 60898',
            'protection' => 'Токовая перегрузка, КЗ'
        ];
    }
}
