<?php

namespace Database\Seeders\Base;

use Illuminate\Database\Seeder;

class AdminBaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Запуск базового сидера...');
        $this->command->info('');

        // ✅ 1. РОЛИ И РАЗРЕШЕНИЯ
        $this->command->info('📋 Шаг 1/9: Роли и разрешения...');
        $this->call(RolesAndPermissionsSeeder::class);

        // ✅ 2. ПОЛЬЗОВАТЕЛИ
        $this->command->info('👤 Шаг 2/9: Пользователи...');
        $this->call(UsersSeeder::class);
        $this->call(UsersTableSeeder::class);

        // ✅ 3. СОЦИАЛЬНЫЕ ССЫЛКИ
        $this->command->info('🔗 Шаг 3/9: Социальные ссылки...');
        $this->call(\Database\Seeders\SocialMediaLinks\SocialMediaLinksSeeder::class);

        // ✅ 4. КОМПАНИИ И КАНАЛЫ
        $this->command->info('🏢 Шаг 4/9: Компании и каналы...');
        $this->call(\Database\Seeders\Company\CompanySeeder::class);
        $this->call(\Database\Seeders\CompanyContactChannels\CompanyContactChannelsSeeder::class);

        // ✅ 5. LANDING PAGES
        $this->command->info('🎨 Шаг 5/9: Лендинги...');
        $this->call(\Database\Seeders\Landing\LandingPageSeeder::class);

        // ✅ 6. ИНТЕРФЕЙС АДМИНКИ
        $this->command->info('🖥️  Шаг 6/9: Интерфейс админки...');
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
