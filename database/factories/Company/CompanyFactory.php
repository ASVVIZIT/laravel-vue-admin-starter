<?php

namespace Database\Factories\Company;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Company\Company;

class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        // Убедитесь, что 'ru' установлена как 'locale' в config/app.php
        // $this->faker->locale = 'ru_RU'; // Можно указать явно, если нужно переопределить

        $availableIcons = [
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
        ];

        return [
            'name' => $this->faker->company(), // Будет использовать ru_RU, если локаль установлена
            'description' => $this->faker->optional()->realText(200), // Будет использовать ru_RU
            'address' => $this->faker->optional()->address(), // Будет использовать ru_RU
            'settings' => [
                'icon' => $availableIcons[array_rand($availableIcons)]
            ],
        ];
    }
}
