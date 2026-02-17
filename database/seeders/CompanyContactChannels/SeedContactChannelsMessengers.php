<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;
use App\Models\Company\Company;
use App\Models\Company\CompanyContactChannel; // Используем обновлённый путь
use Faker\Factory as FakerFactory; // Импортируем Faker

class SeedContactChannelsMessengers extends Seeder
{
    public function run(): void
    {
        // Создаём экземпляр Faker
        $faker = FakerFactory::create();

        $companies = Company::all();

        foreach ($companies as $company) {
            // Пример данных для мессенджеров
            $messengerChannels = [
                [
                    'type' => 'messenger',
                    'title' => 'WhatsApp - ' . $company->name,
                    // Используем $faker, а не $this->faker
                    'url' => 'https://wa.me/' . preg_replace('/[^0-9]/', '', $faker->e164PhoneNumber()),
                    'description' => 'Chat with us on WhatsApp!',
                    'logo_url' => '/icons/whatsapp.svg',
                    'order_column' => 4,
                    'is_active' => true,
                ],
                [
                    'type' => 'messenger_group',
                    'title' => 'Telegram Group - ' . $company->name,
                    'url' => 'https://t.me/' . str_replace([' ', '&', '.'], ['', 'and', ''], strtolower($company->name)) . '_group',
                    'description' => 'Join our Telegram group!',
                    'logo_url' => '/icons/telegram.svg',
                    'metadata' => ['member_count' => rand(50, 500), 'is_public' => true],
                    'order_column' => 5,
                    'is_active' => true,
                ],
                [
                    'type' => 'messenger',
                    'title' => 'Viber - ' . $company->name,
                    // Используем $faker, а не $this->faker
                    'url' => 'viber://add?number=' . preg_replace('/[^0-9]/', '', $faker->e164PhoneNumber()),
                    'description' => 'Call or message us on Viber.',
                    'logo_url' => '/icons/viber.svg',
                    'order_column' => 6,
                    'is_active' => false, // Пример неактивного канала
                ],
            ];

            foreach ($messengerChannels as $channelData) {
                $company->contactChannels()->create($channelData);
            }
        }
    }
}
