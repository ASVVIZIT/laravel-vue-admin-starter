<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BrandFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
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
