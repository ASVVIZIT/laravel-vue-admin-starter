<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

# ✅ ПОЛНЫЙ СБРОС + СИДИНГ (ОСНОВНОЙ СПОСОБ)
# php artisan migrate:fresh --seed

# ✅ ТОЛЬКО КАНАЛЫ (через сидер)
# php artisan db:seed --class=Database\\Seeders\\CompanyContactChannels\\CompanyContactChannelsSeeder

# ✅ ТОЛЬКО КАНАЛЫ (через команду)
# php artisan seed:channels

# ✅ БЫСТРЫЙ РЕЖИМ (изменить CURRENT_MODE на MODE_FAST)
# php artisan db:seed --class=Database\\Seeders\\CompanyContactChannels\\FastCompanyContactChannelSeeder

# ✅ ТОЛЬКО КОМПАНИИ
# php artisan db:seed --class=Database\\Seeders\\Company\\CompanySeeder

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ГЛОБАЛЬНЫЙ СБРОС КЕША перед всеми сидерами
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $this->command->info('🚀 Запуск сидеров...');

        // 1. Базовые данные (роли, пользователи, права)
        $this->call(\Database\Seeders\Base\AdminBaseSeeder::class);

        // 2. Интерфейс админки
        $this->call(\Database\Seeders\Interface\AdminMenuSeeder::class);

        // 3. Интерфейс шаблонизатора таблицы
        $this->call(\Database\Seeders\Interface\Template\TemplateSeeder::class);

        // 4. Электрическая защита
        $this->call(\Database\Seeders\ElectricalProtection\ElectricalProtectionSeeder::class);

        // 5. SmartLight (когда будет готов)
        $this->call(\Database\Seeders\SmartLight\SmartLightPermissionsSeeder::class);
        // 5.1 SmartLight (Фейковые данные для отладки интерфейса)
        $this->call([
            \Database\Seeders\SmartLight\SmartLightDeviceSeeder::class,
            \Database\Seeders\SmartLight\SmartLightTelemetrySeeder::class
        ]);

        $this->command->info('✅ Все сидеры завершены!');
    }
}
