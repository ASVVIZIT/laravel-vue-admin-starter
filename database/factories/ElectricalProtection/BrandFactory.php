<?php

namespace Database\Factories\ElectricalProtection;

use App\Models\ElectricalProtection\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;

class BrandFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    // Укажите модель, с которой связана фабрика
    protected $model = Brand::class;

    public function definition()
    {
        return [
            'name' => $this->faker->randomElement([
                'ABB',
                'Schneider Electric',
                'Legrand',
                'IEK',
                'CHINT'
            ]),
            'country' => $this->faker->randomElement([
                'Швейцария',
                'Франция',
                'Россия',
                'Китай'
            ]),
            'website' => $this->faker->randomElement([
                'https://new.abb.com',
                'https://www.se.com',
                'https://www.legrand.ru'
            ])
        ];
    }
}
