<?php

// resources/database/seeders/CompanyContactChannels/ContactChannelSeeder.php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;
use App\Models\Company\Company; // Импортируем модель Company
use App\Models\Company\CompanyContactChannel; // Импортируем модель CompanyContactChannel

class ContactChannelSeeder extends Seeder
{
    /**
     * Запустить сидер.
     *
     * @return void
     */
    public function run(): void
    {
        // Получаем все существующие компании
        $companies = Company::all();

        // Проходимся по каждой компании
        foreach ($companies as $company) {
            // Шаг 1: Определяем, с какого номера начинать `order_column` для этой конкретной компании
            // Используем метод `max()` на связанной коллекции `contactChannels`
            // Если у компании нет каналов, max вернёт null, тогда начнём с 0
            $maxCurrentOrder = $company->contactChannels()->max('order_column');
            $startingOrder = ($maxCurrentOrder !== null) ? $maxCurrentOrder + 1 : 0;

            // Шаг 2: Подготовим массив данных для новых каналов связи
            // Обратите внимание: 'order_column' НЕ задан в массиве изначально
            $channelsToCreate = [
                [
                    'type' => 'social_network',
                    'title' => 'Instagram ' . $company->name,
                    'url' => 'https://instagram.com/' . strtolower(str_replace(' ', '_', $company->name)),
                    'logo_url' => '/icons/instagram.png', // Пример пути к иконке
                    'description' => 'Официальный Instagram ' . $company->name,
                    'metadata' => [
                        'icon_class' => 'fab fa-instagram',
                        'followers' => rand(100, 10000) // Случайное количество подписчиков
                    ],
                    // 'order_column' => будет добавлен динамически
                ],
                [
                    'type' => 'messenger',
                    'title' => 'WhatsApp ' . $company->name,
                    'url' => 'https://wa.me/' . rand(70000000000, 79999999999),
                    'logo_url' => '/icons/whatsapp.png',
                    'description' => 'Связаться с нами через WhatsApp',
                    'metadata' => ['is_business' => true],
                    // 'order_column' => будет добавлен динамически
                ],
                [
                    'type' => 'messenger_group',
                    'title' => 'Группа в Telegram ' . $company->name,
                    'url' => 'https://t.me/' . strtolower(str_replace(' ', '_', $company->name)) . '_group',
                    'logo_url' => '/icons/telegram.png',
                    'description' => 'Присоединяйтесь к нашей группе в Telegram',
                    'metadata' => [
                        'member_count' => rand(50, 500),
                        'is_public' => true
                    ],
                    // 'order_column' => будет добавлен динамически
                ],
                [
                    'type' => 'gis_map',
                    'title' => 'Наш офис на 2GIS ' . $company->name,
                    'description' => 'Расположение офиса ' . $company->name . ' на карте 2GIS',
                    'metadata' => [
                        'provider' => '2gis',
                        'coordinates' => [
                            'lat' => rand(55000000, 56000000) / 1000000,
                            'lng' => rand(37000000, 38000000) / 1000000
                        ],
                        'embed_code' => '<iframe src="https://map.2gis.com/embed/v1/...?center=37.6173,55.7558&zoom=15" width="600" height="400" frameborder="0"></iframe>'
                    ],
                    // 'order_column' => будет добавлен динамически
                ],
                [
                    'type' => 'email',
                    'title' => 'Email ' . $company->name,
                    'identifier' => 'info@' . strtolower(str_replace([' ', '&', '.'], ['', 'and', ''], $company->name)) . '.com',
                    'description' => 'Электронная почта для связи',
                    // 'order_column' => будет добавлен динамически
                ],
                [
                    'type' => 'phone_number',
                    'title' => 'Телефон ' . $company->name,
                    'identifier' => '+' . rand(70000000000, 79999999999),
                    'description' => 'Телефон для связи',
                    // 'order_column' => будет добавлен динамически
                ],
                [
                    'type' => 'website',
                    'title' => 'Сайт ' . $company->name,
                    'url' => 'https://' . strtolower(str_replace([' ', '&', '.'], ['', 'and', ''], $company->name)) . '.com',
                    'description' => 'Официальный сайт',
                    // 'order_column' => будет добавлен динамически
                ],
            ];

            // Шаг 3: Создаём каналы для текущей компании
            // Используем счётчик, начиная с $startingOrder
            $currentOrder = $startingOrder;
            foreach ($channelsToCreate as $channelData) {
                // Добавляем уникальный `order_column` к данным канала перед созданием
                $channelData['order_column'] = $currentOrder;
                $currentOrder++; // Увеличиваем счётчик для следующего канала

                // Используем связь Eloquent (`$company->contactChannels()`)
                // для создания `CompanyContactChannel`, автоматически устанавливая `company_id`
                $company->contactChannels()->create($channelData);
            }
        }
    }
}
