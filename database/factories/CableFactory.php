<?php

namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Cable>
 */
class CableFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'brand_id' => Brand::where('name', 'IEK')->first()->id,
            'type' => 'ВВГнг-LS',
            'insulation' => 'ПВХ',
            'cross_section' => $this->faker->randomElement([1.5, 2.5, 4, 6]),
            'cores' => 3,
            'current_rating' => $this->faker->randomElement([19, 25, 34, 43]), // Для 2.5 мм²: 25А
            'temperature_range' => '-50°C до +70°C'
        ];
    }
}
