<?php

namespace Database\Seeders\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\BatteryType;
use App\Models\SmartLight\BulbType;
use App\Models\SmartLight\PowerSupply;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * ============================================================================
 * SMARTLIGHT — СИДЕР УСТРОЙСТВ (ИСПРАВЛЕННЫЙ)
 * ============================================================================
 * 📁 Путь: database/seeders/SmartLight/SmartLightDeviceSeeder.php
 * ✅ fake(): Использование хелпера вместо $this->faker
 * ✅ РеалФейк: Русские названия комнат для is_fake=false
 * ✅ Демо: Все is_fake=true привязаны к user_id=1 (SuperAdmin)
 * ✅ Валидация: Проверка роли супер-админа перед привязкой
 * ============================================================================
 */

class SmartLightDeviceSeeder extends Seeder
{
    // ✅ Русские названия комнат для "РеалФейк" устройств
    private const REAL_ROOMS = [
        'Гостиная', 'Прихожая', 'Ванна', 'Коридор', 'Зал',
        'Балкон', 'Чердак', 'Кухня', 'Спальня', 'Туалет',
        'Гардероб', 'Кладовая', 'Лоджия', 'Терраса', 'Подвал'
    ];

    // ✅ Демо-устройства с конкретными настройками
    private const DEMO_DEVICES = [
        ['name' => 'Демо: Коридор', 'device_id' => 'fake_device_001', 'battery_type_id' => 'li-ion-18650', 'bulb_type_id' => 'halogen', 'status' => 'ON', 'voltage' => 3.95, 'intensity' => 90],
        ['name' => 'Демо: Кухня', 'device_id' => 'fake_device_002', 'battery_type_id' => 'li-ion-21700', 'bulb_type_id' => 'led', 'status' => 'OFF', 'voltage' => 3.85, 'intensity' => 0],
        ['name' => 'Демо: Гостиная', 'device_id' => 'fake_device_003', 'battery_type_id' => 'li-po', 'bulb_type_id' => 'smart-rgb', 'status' => 'ON', 'voltage' => 3.15, 'intensity' => 60],
        ['name' => 'Демо: Спальня', 'device_id' => 'fake_device_004', 'battery_type_id' => 'nimh-aa', 'bulb_type_id' => 'classic', 'status' => 'SLEEPING', 'voltage' => 1.15, 'intensity' => 0],
    ];

    public function run(): void
    {
        // 1. Очистка старых фейковых устройств
        $deletedCount = SmartLightDevice::where('is_fake', true)->delete();
        if ($deletedCount > 0) {
            $this->command->info("   🧹 Очищено старых устройств: <fg=yellow>{$deletedCount}</>");
        }

        // 2. Проверка супер-админа
        $superAdminId = 1;
        $superAdmin = $this->validateSuperAdmin($superAdminId);

        if (!$superAdmin) {
            $this->command->warn("   ⚠️ Пользователь ID={$superAdminId} не найден или не имеет роли супер-админа");
            $superAdminId = null;
        }

        // 3. Создаём демо-устройства
        $this->createDemoDevices($superAdminId);

        // 4. Генерируем "РеалФейк" устройства
        $this->createRealFakeDevices();

        // 5. Генерируем случайные устройства через фабрику
        $this->createRandomDevices($superAdminId);

        // 6. Статистика
        $this->printStatistics();
    }

    /**
     * Проверка супер-админа
     */
    private function validateSuperAdmin(int $userId): ?User
    {
        $user = User::find($userId);
        if (!$user) return null;

        // Проверяем роль (используем строковое значение, так как константа может не быть доступна)
        $hasRole = $user->roles->contains('name', 'superadmin') ||
            (method_exists($user, 'hasRole') && $user->hasRole('superadmin'));

        return $hasRole ? $user : null;
    }

    /**
     * Создание демо-устройств
     */
    private function createDemoDevices(?int $superAdminId): void
    {
        foreach (self::DEMO_DEVICES as $index => $data) {
            SmartLightDevice::create([
                'user_id' => $superAdminId,
                'name' => $data['name'],
                'device_id' => $data['device_id'],
                'device_type' => 'node_mcu_v3',
                'battery_type_id' => $data['battery_type_id'],
                'bulb_type_id' => $data['bulb_type_id'],
                'power_supply_id' => 'standard',
                'battery_capacity' => 2000,
                'critical_voltage' => 3.0,
                'sleep_interval' => 600,
                'emergency_sleep_interval' => 3600,
                'status' => $data['status'],
                'voltage' => $data['voltage'],
                'intensity' => $data['intensity'],
                'api_key' => 'demo_key_' . $index,
                'is_fake' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        $this->command->info("   🎭 Создано демо-устройств: <fg=green>" . count(self::DEMO_DEVICES) . "</>");
    }

    /**
     * Создание "РеалФейк" устройств с русскими названиями
     */
    private function createRealFakeDevices(): void
    {
        $batteryTypes = SmartLightReferenceDataSeeder::BATTERY_TYPES;
        $bulbTypes = SmartLightReferenceDataSeeder::BULB_TYPES;
        $powerSupplies = SmartLightReferenceDataSeeder::POWER_SUPPLY_TYPES;

        // ✅ ИСПОЛЬЗУЕМ ХЕЛПЕР fake() ВМЕСТО $this->faker
        $faker = fake();

        $created = 0;

        foreach (self::REAL_ROOMS as $room) {
            if (SmartLightDevice::where('name', "РеалФейк: {$room}")->where('is_fake', false)->exists()) {
                continue;
            }

            SmartLightDevice::create([
                'user_id' => null,
                'name' => "РеалФейк: {$room}",
                'device_id' => 'real_device_' . Str::slug($room) . '_' . Str::random(4),
                'device_type' => $faker->randomElement(['node_mcu_v3', 'esp32', 'esp8266']),
                'battery_type_id' => $faker->randomElement($batteryTypes),
                'bulb_type_id' => $faker->randomElement($bulbTypes),
                'power_supply_id' => $faker->randomElement($powerSupplies),
                'battery_capacity' => $faker->numberBetween(1000, 5000),
                'critical_voltage' => $faker->randomFloat(1, 2.8, 3.3),
                'sleep_interval' => $faker->randomElement([300, 600, 900, 1800]),
                'emergency_sleep_interval' => $faker->randomElement([1800, 3600, 7200]),
                'status' => $faker->randomElement(['ON', 'OFF', 'SLEEPING']),
                'voltage' => round($faker->randomFloat(1, 3.0, 4.2), 2),
                'intensity' => $faker->numberBetween(0, 100),
                'api_key' => Str::random(32),
                'is_fake' => false,
                'settings' => json_encode(['room' => $room, 'created_by_seeder' => true]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $created++;
        }
        $this->command->info("   🔌 Создано РеалФейк устройств: <fg=green>{$created}</>");
    }

    /**
     * Генерация случайных устройств через фабрику
     */
    private function createRandomDevices(?int $superAdminId): void
    {
        SmartLightDevice::factory()->count(20)->create()->each(function ($device) use ($superAdminId) {
            if ($device->is_fake && $superAdminId) {
                $device->update(['user_id' => $superAdminId]);
            }
        });
        $this->command->info("   🎲 Создано случайных устройств: <fg=green>20</>");
    }

    /**
     * Статистика
     */
    private function printStatistics(): void
    {
        $totalDevices = SmartLightDevice::count();
        $fakeDevices = SmartLightDevice::where('is_fake', true)->count();
        $realDevices = $totalDevices - $fakeDevices;
        $fakeWithUser = SmartLightDevice::where('is_fake', true)->whereNotNull('user_id')->count();

        $batteriesUsed = SmartLightDevice::distinct('battery_type_id')->count('battery_type_id');
        $bulbsUsed = SmartLightDevice::distinct('bulb_type_id')->count('bulb_type_id');
        $powersUsed = SmartLightDevice::distinct('power_supply_id')->count('power_supply_id');

        $totalBatteryTypes = BatteryType::count();
        $totalBulbTypes = BulbType::count();
        $totalPowerTypes = PowerSupply::count();

        $this->command->newLine();
        $this->command->info("   🚀 <bg=blue;fg=white> УСТРОЙСТВА СОЗДАНЫ </>");
        $this->command->line("      📦 Всего: <fg=white>{$totalDevices}</> | 🎭 Демо: <fg=yellow>{$fakeDevices}</> | 🔌 РеалФейк: <fg=green>{$realDevices}</>");
        $this->command->line("      🔗 Демо с пользователем: <fg=cyan>{$fakeWithUser}</>");
        $this->command->newLine();
        $this->command->info("      🔋 Батареи: <fg=green>{$batteriesUsed}</>/<fg=cyan>{$totalBatteryTypes}</> типов");
        $this->command->info("      💡 Лампы:     <fg=green>{$bulbsUsed}</>/<fg=cyan>{$totalBulbTypes}</> типов");
        $this->command->info("      ⚡ Питание:   <fg=green>{$powersUsed}</>/<fg=cyan>{$totalPowerTypes}</> типов");
        $this->command->newLine();
    }
}
