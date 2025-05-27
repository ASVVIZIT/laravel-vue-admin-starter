<?php

namespace Database\Factories\ElectricalProtection;

use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\Cable;
use App\Models\ElectricalProtection\DeviceType;
use Illuminate\Database\Eloquent\Factories\Factory;


class CableFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    // Укажите модель, с которой связана фабрика
    protected $model = Cable::class;
    public function definition(): array
    {
        return [
            'brand_id' => Brand::where('name', 'IEK')->first()->id,
            'type_id' => DeviceType::where('code', 'CABLE')->first()->id,
            'model' => 'Наименование',
            'insulation' => 'ПВХ',
            'cores' => 3,
            'cross_section' => $this->faker->randomElement([1.5, 2.5, 4, 6]),
            'current_rating' => $this->faker->randomElement([19, 25, 34, 43]), // Для 2.5 мм²: 25А
            'temperature_range_min' => -50,
            'temperature_range_min_unit_id' => 10,
            'temperature_range_max' => 70,
            'temperature_range_max_unit_id' => 10,
        ];
    }
}
