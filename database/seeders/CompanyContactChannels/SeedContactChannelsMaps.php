<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;
use App\Models\Company\Company;

class SeedContactChannelsMaps extends Seeder
{
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            // Пример данных для карт
            $mapChannels = [
                [
                    'type' => 'gis_map',
                    'title' => 'Our Location on 2GIS - ' . $company->name,
                    'description' => 'Find our office on 2GIS map.',
                    'metadata' => [
                        'provider' => '2gis',
                        'coordinates' => ['lat' => 55.7558, 'lng' => 37.6173], // Пример координат Москвы
                        'embed_code' => '<iframe src="https://map.2gis.com/embed/v1/map?point=37.6173%2C55.7558&z=15&lang=en" width="600" height="400" frameborder="0"></iframe>',
                    ],
                    'order_column' => 10,
                    'is_active' => true,
                ],
                [
                    'type' => 'yandex_map',
                    'title' => 'Our Location on Yandex Maps - ' . $company->name,
                    'description' => 'Find our office on Yandex Maps.',
                    'metadata' => [
                        'provider' => 'yandex',
                        'coordinates' => ['lat' => 55.7558, 'lng' => 37.6173],
                        'embed_code' => '<iframe width="600" height="400" frameborder="0" allowfullscreen allow="autoplay" src="https://yandex.ru/map-widget/v1/-/CCUlxjZl~D"></iframe>', // Замените CCUlxjZl~D на реальный ID
                    ],
                    'order_column' => 11,
                    'is_active' => true,
                ],
            ];

            foreach ($mapChannels as $channelData) {
                $company->contactChannels()->create($channelData);
            }
        }
    }
}
