<?php

namespace Database\Seeders\Base;

use Illuminate\Database\Seeder;
use Database\Seeders\SocialMediaLinks\SocialMediaLinksSeeder;
use Database\Seeders\Company\CompanySeeder;
use Database\Seeders\CompanyContactChannels\CompanyContactChannelsSeeder;

class AdminBaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Запуск базового сидера...');
        $this->command->info('');

        // ✅ 1. РОЛИ И РАЗРЕШЕНИЯ
        $this->command->info('📋 Шаг 1/4: Роли и разрешения...');
        $this->call(RolesAndPermissionsSeeder::class);

        // ✅ 2. ПОЛЬЗОВАТЕЛИ
        $this->command->info('👤 Шаг 2/4: Пользователи...');
        $this->call(UsersSeeder::class);
        $this->call(UsersTableSeeder::class);

        // ✅ 3. СОЦИАЛЬНЫЕ ССЫЛКИ
        $this->command->info('🔗 Шаг 3/4: Социальные ссылки...');
        $this->call(SocialMediaLinksSeeder::class);

        // ✅ 4. КОМПАНИИ И КАНАЛЫ
        $this->command->info('🏢 Шаг 4/4: Компании и каналы...');
        $this->call(CompanySeeder::class);
        $this->call(CompanyContactChannelsSeeder::class);

        $this->command->info('');
        $this->command->info('✅ Базовый сидер завершен!');
    }
}
