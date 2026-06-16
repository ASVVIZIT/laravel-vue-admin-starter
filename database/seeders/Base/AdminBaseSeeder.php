<?php

namespace Database\Seeders\Base;

use Illuminate\Database\Seeder;
use Database\Seeders\SocialMediaLinks\SocialMediaLinksSeeder;
use Database\Seeders\Company\CompanySeeder;
use Database\Seeders\CompanyContactChannels\CompanyContactChannelsSeeder;
use Database\Seeders\Landing\LandingPageSeeder;

class AdminBaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Запуск базового сидера...');
        $this->command->info('');

        // ✅ 1. РОЛИ И РАЗРЕШЕНИЯ (включая Landing права)
        $this->command->info('📋 Шаг 1/6: Роли и разрешения...');
        $this->call(RolesAndPermissionsSeeder::class);

        // ✅ 2. ПОЛЬЗОВАТЕЛИ
        $this->command->info('👤 Шаг 2/6: Пользователи...');
        $this->call(UsersSeeder::class);
        $this->call(UsersTableSeeder::class);

        // ✅ 3. СОЦИАЛЬНЫЕ ССЫЛКИ
        $this->command->info('🔗 Шаг 3/6: Социальные ссылки...');
        $this->call(SocialMediaLinksSeeder::class);

        // ✅ 4. КОМПАНИИ И КАНАЛЫ
        $this->command->info('🏢 Шаг 4/6: Компании и каналы...');
        $this->call(CompanySeeder::class);
        $this->call(CompanyContactChannelsSeeder::class);

        // ✅ 5. 🔥 LANDING PAGES
        $this->command->info('🎨 Шаг 5/6: Лендинги...');
        $this->call(LandingPageSeeder::class);

        // ✅ 6. ИНТЕРФЕЙС АДМИНКИ (меню + шаблоны)
        $this->command->info('🖥️  Шаг 6/6: Интерфейс админки...');
        $this->call(\Database\Seeders\Interface\AdminMenuSeeder::class);
        $this->call(\Database\Seeders\Interface\Template\TemplateSeeder::class);

        $this->command->info('');
        $this->command->info('✅ Базовый сидер завершен!');
        $this->command->info('');
        $this->command->info('📊 Итого создано:');
        $this->command->info('   • Ролей: ' . count(\App\Models\Acl::roles()));
        $this->command->info('   • Прав: ' . count(\App\Models\Acl::permissions()));
        $this->command->info('   • Лендингов: 3 (personal_brand, shop, portfolio)');
    }
}
