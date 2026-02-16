<?php

namespace Database\Seeders\SocialMediaLinks;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SocialMediaLinksTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Массив данных для заполнения
        $links = [
            [
                'name' => '2gis',
                'url' => 'https://2gis.ru',
                'icon' => 'fab fa-2gis',
                'description' => 'Официальная страница 2GIS',
                'order_column' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'VK',
                'url' => 'https://vk.com',
                'icon' => 'fab fa-vk',
                'description' => 'Официальная группа ВКонтакте',
                'order_column' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Telegram',
                'url' => 'https://t.me',
                'icon' => 'fab fa-telegram',
                'description' => 'Официальный канал Telegram',
                'order_column' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'WhatsApp',
                'url' => 'https://wa.me',
                'icon' => 'fab fa-whatsapp',
                'description' => 'Связаться с нами через WhatsApp',
                'order_column' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'YouTube',
                'url' => 'https://www.youtube.com',
                'icon' => 'fab fa-youtube',
                'description' => 'Наш канал на YouTube',
                'order_column' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'TikTok',
                'url' => 'https://www.tiktok.com',
                'icon' => 'fab fa-tiktok',
                'description' => 'Наш профиль в TikTok',
                'order_column' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Twitter',
                'url' => 'https://twitter.com', // Или используйте 'https://x.com' если предпочитаете X
                'icon' => 'fab fa-x-twitter', // Используем новое имя для X
                'description' => 'Наша страница в X (бывший Twitter)',
                'order_column' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pinterest',
                'url' => 'https://www.pinterest.com',
                'icon' => 'fab fa-pinterest',
                'description' => 'Наша доска на Pinterest',
                'order_column' => 7,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Facebook',
                'url' => 'https://www.facebook.com',
                'icon' => 'fab fa-facebook',
                'description' => 'Наша страница на Facebook',
                'order_column' => 8,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Instagram',
                'url' => 'https://www.instagram.com',
                'icon' => 'fab fa-instagram',
                'description' => 'Наш профиль в Instagram',
                'order_column' => 9,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'LinkedIn',
                'url' => 'https://www.linkedin.com',
                'icon' => 'fab fa-linkedin',
                'description' => 'Наша компания на LinkedIn',
                'order_column' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Очищаем таблицу перед вставкой (опционально, закомментируйте, если не нужно)
        // DB::table('social_media_links')->truncate();

        // Вставляем данные
        DB::table('social_media_links')->insert($links);
    }
}
