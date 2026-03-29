<?php

namespace Database\Factories\Company;

use App\Models\Company\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company\Company>
 */
class CompanyFactory extends Factory
{
    protected $model = Company::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $companyTypes = ['ООО', 'ОАО', 'ЗАО', 'ПАО', 'ИП', 'МФК', 'МКК'];
        $industries = ['Тех', 'Строй', 'Финанс', 'Торг', 'Пром', 'Сервис', 'Групп', 'Холдинг'];
        $cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Нижний Новгород', 'Челябинск', 'Самара'];

        $prefix = $this->faker->randomElement($companyTypes);
        $industry = $this->faker->randomElement($industries);
        $city = $this->faker->randomElement($cities);
        $name = $this->faker->unique()->company();

        return [
            'name' => "{$prefix} {$industry}{$city} {$name}",
            'description' => $this->faker->optional(0.7)->realText(200),
            'address' => $this->faker->optional(0.8)->address(),
            'settings' => [
                'icon' => $this->faker->randomElement([
                    'el-icon-office-building',
                    'el-icon-house',
                    'el-icon-fenix-custom',
                    'el-icon-link',
                    'el-icon-video-camera',
                    'el-icon-chat-line-square',
                    'el-icon-position',
                    'el-icon-guide',
                    'el-icon-picture',
                    'el-icon-connection',
                    'el-icon-monitor',
                ]),
                'color' => $this->faker->hexColor(),
                'website' => $this->faker->optional(0.6)->url(),
            ],
        ];
    }

    /**
     * Indicate that the company is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'settings' => array_merge($attributes['settings'], ['active' => true]),
        ]);
    }

    /**
     * Indicate that the company is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'settings' => array_merge($attributes['settings'], ['active' => false]),
        ]);
    }
}
