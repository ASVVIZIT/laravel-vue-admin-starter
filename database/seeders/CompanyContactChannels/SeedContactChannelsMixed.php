<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;
use App\Models\Company\Company;

class SeedContactChannelsMixed extends Seeder
{
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            // Смешанные примеры каналов
            $mixedChannels = [
                [
                    'type' => 'social_network',
                    'title' => 'Twitter/X - ' . $company->name,
                    'url' => 'https://twitter.com/' . str_replace([' ', '&', '.', '-'], ['', 'and', '', ''], strtolower($company->name)),
                    'description' => 'Follow us on X (formerly Twitter).',
                    'logo_url' => '/icons/x.svg',
                    'order_column' => 15,
                    'is_active' => true,
                ],
                [
                    'type' => 'messenger_group',
                    'title' => 'Discord Server - ' . $company->name,
                    'url' => 'https://discord.gg/invite-code-placeholder', // Замените на реальный код
                    'description' => 'Join our Discord community.',
                    'logo_url' => '/icons/discord.svg',
                    'metadata' => ['member_count' => rand(10, 100)],
                    'order_column' => 16,
                    'is_active' => true,
                ],
                [
                    'type' => 'gis_map',
                    'title' => 'Warehouse Location - ' . $company->name,
                    'description' => 'Our warehouse location on 2GIS.',
                    'metadata' => [
                        'provider' => '2gis',
                        'coordinates' => ['lat' => 55.8 + (fake()->randomFloat(4, -0.1, 0.1)), 'lng' => 37.7 + (fake()->randomFloat(4, -0.1, 0.1))], // Слегка смещенная координата
                        'embed_code' => '<iframe src="https://map.2gis.com/embed/v1/map?point=37.7%2C55.8&z=15&lang=en" width="600" height="400" frameborder="0"></iframe>',
                    ],
                    'order_column' => 20,
                    'is_active' => true,
                ],
            ];

            foreach ($mixedChannels as $channelData) {
                // Обновляем URL для Discord, если используется placeholder
                if ($channelData['type'] === 'messenger_group' && str_contains($channelData['url'], 'invite-code-placeholder')) {
                    $channelData['url'] = str_replace('invite-code-placeholder', fake()->lexify('???????'), $channelData['url']); // Заменяем на случайный код
                }
                $company->contactChannels()->create($channelData);
            }
        }
    }
}
