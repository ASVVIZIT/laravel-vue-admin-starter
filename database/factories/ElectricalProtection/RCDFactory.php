<?php

namespace Database\Factories\ElectricalProtection;

use App\Models\ElectricalProtection\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;

class RCDFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'brand_id' => Brand::where('name', 'Schneider Electric')->first()->id,
            'model' => $this->faker->randomElement(['A9D91615', 'A9D91630']),
            'nominal_current' => 25,
            'rated_diff_current' => $this->faker->randomElement(['10mA', '30mA']),
            'type' => $this->faker->randomElement(['AC', 'A']),
            'poles' => 2,
            'breaking_capacity' => '6 кА'
        ];
    }
}
