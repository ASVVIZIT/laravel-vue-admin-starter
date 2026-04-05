<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ===== Типы батарей =====
        if (!Schema::hasTable('smart_light_battery_types')) {
            Schema::create('smart_light_battery_types', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('name');
                $table->string('short_name')->nullable();
                $table->string('chemistry')->nullable();
                $table->decimal('min_voltage', 4, 2)->default(2.5);
                $table->decimal('max_voltage', 4, 2)->default(4.2);
                $table->decimal('critical_voltage', 4, 2)->default(3.0);
                $table->integer('nominal_capacity')->nullable();
                $table->json('visual_config')->nullable();
                $table->timestamps();
            });
        }

        // ===== Типы ламп =====
        if (!Schema::hasTable('smart_light_bulb_types')) {
            Schema::create('smart_light_bulb_types', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('name');
                $table->string('short_name')->nullable();
                $table->string('category')->nullable();
                $table->integer('light_efficiency')->nullable();
                $table->integer('color_temperature')->nullable();
                $table->integer('lifespan')->nullable();
                $table->json('visual_config')->nullable();
                $table->timestamps();
            });
        }

        // ===== Источники питания =====
        if (!Schema::hasTable('smart_light_power_supplies')) {
            Schema::create('smart_light_power_supplies', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('name');
                $table->string('short_name')->nullable();
                $table->string('category')->nullable();
                $table->json('voltage_range')->nullable();
                $table->json('current_range')->nullable();
                $table->json('visual_config')->nullable();
                $table->timestamps();
            });
        }

        // ===== Устройства =====
        if (!Schema::hasTable('smart_light_devices')) {
            Schema::create('smart_light_devices', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('name');
                $table->string('device_id')->unique();
                $table->string('device_type')->default('node_mcu_v3');
                $table->string('battery_type_id')->default('li-ion-18650');
                $table->string('bulb_type_id')->default('classic');
                $table->string('power_supply_id')->default('standard');
                $table->integer('battery_capacity')->default(2000);
                $table->float('critical_voltage')->default(3.2);
                $table->integer('sleep_interval')->default(600);
                $table->integer('emergency_sleep_interval')->default(3600);
                $table->string('status')->default('OFF');
                $table->float('voltage')->default(3.7);
                $table->integer('intensity')->default(0);
                $table->string('api_key')->unique();
                $table->json('settings')->nullable();
                $table->json('battery_group_config')->nullable();
                $table->boolean('is_fake')->default(false);
                $table->timestamp('settings_updated_at')->nullable();
                $table->softDeletes(); // ✅ Добавляет deleted_at
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
                $table->foreign('battery_type_id')->references('id')->on('smart_light_battery_types')->onDelete('restrict');
                $table->foreign('bulb_type_id')->references('id')->on('smart_light_bulb_types')->onDelete('restrict');
                $table->foreign('power_supply_id')->references('id')->on('smart_light_power_supplies')->onDelete('restrict');

                $table->index(['user_id', 'is_fake']);
                $table->index('device_id');
                $table->index('status');
                $table->index('deleted_at');
            });
        }

        // ===== Телеметрия =====
        if (!Schema::hasTable('smart_light_telemetry')) {
            Schema::create('smart_light_telemetry', function (Blueprint $table) {
                $table->id();
                $table->foreignId('device_id')->constrained('smart_light_devices')->onDelete('cascade');
                $table->float('voltage');
                $table->string('status');
                $table->integer('intensity')->default(100);
                $table->boolean('is_emergency')->default(false);
                $table->timestamp('received_at')->useCurrent();
                $table->timestamps();
                $table->index(['device_id', 'received_at']);
                $table->index('status');
            });
        }

        // ===== Глобальные настройки =====
        if (!Schema::hasTable('smart_light_settings')) {
            Schema::create('smart_light_settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value');
                $table->timestamps();
            });
        }

        // ===== Сиды =====
        $this->seedReferenceData();
        $this->seedGlobalSettings();
    }

    private function seedReferenceData(): void
    {
        $batteryTypes = [
            ['id' => 'li-ion-18650', 'name' => 'Li-ion 18650', 'short_name' => '18650', 'chemistry' => 'lithium-ion', 'min_voltage' => 2.5, 'max_voltage' => 4.2, 'critical_voltage' => 3.0, 'nominal_capacity' => 3500],
            ['id' => 'li-ion-21700', 'name' => 'Li-ion 21700', 'short_name' => '21700', 'chemistry' => 'lithium-ion', 'min_voltage' => 2.5, 'max_voltage' => 4.2, 'critical_voltage' => 3.0, 'nominal_capacity' => 5000],
            ['id' => 'li-po', 'name' => 'Li-Po', 'short_name' => 'Li-Po', 'chemistry' => 'lithium-polymer', 'min_voltage' => 2.8, 'max_voltage' => 4.35, 'critical_voltage' => 3.2, 'nominal_capacity' => 2500],
            ['id' => 'lead-acid', 'name' => 'Свинцово-кислотный', 'short_name' => 'Pb', 'chemistry' => 'lead-acid', 'min_voltage' => 10.5, 'max_voltage' => 14.4, 'critical_voltage' => 11.0, 'nominal_capacity' => 50000],
        ];
        DB::table('smart_light_battery_types')->upsert($batteryTypes, ['id'], ['name', 'short_name', 'chemistry', 'min_voltage', 'max_voltage', 'critical_voltage', 'nominal_capacity', 'updated_at']);

        $bulbTypes = [
            ['id' => 'classic', 'name' => 'Классическая', 'short_name' => 'Classic', 'category' => 'incandescent', 'light_efficiency' => 10, 'color_temperature' => 2700, 'lifespan' => 1000],
            ['id' => 'led', 'name' => 'LED', 'short_name' => 'LED', 'category' => 'led', 'light_efficiency' => 80, 'color_temperature' => 4000, 'lifespan' => 25000],
            ['id' => 'halogen', 'name' => 'Галогенная', 'short_name' => 'Halogen', 'category' => 'halogen', 'light_efficiency' => 15, 'color_temperature' => 3000, 'lifespan' => 2000],
            ['id' => 'smart-rgb', 'name' => 'Smart RGB', 'short_name' => 'RGB', 'category' => 'smart', 'light_efficiency' => 60, 'color_temperature' => 6500, 'lifespan' => 15000],
        ];
        DB::table('smart_light_bulb_types')->upsert($bulbTypes, ['id'], ['name', 'short_name', 'category', 'light_efficiency', 'color_temperature', 'lifespan', 'updated_at']);

        $powerSupplies = [
            ['id' => 'standard', 'name' => 'Стандартный источник', 'short_name' => 'Standard', 'category' => 'standard', 'voltage_range' => json_encode(['min' => 2.5, 'max' => 4.3]), 'current_range' => json_encode(['min' => 0, 'max' => 1000])],
            ['id' => 'solar', 'name' => 'Солнечная панель', 'short_name' => 'Solar', 'category' => 'renewable', 'voltage_range' => json_encode(['min' => 2.5, 'max' => 6.0]), 'current_range' => json_encode(['min' => 0, 'max' => 500])],
            ['id' => 'grid', 'name' => 'Сеть', 'short_name' => 'Grid', 'category' => 'grid', 'voltage_range' => json_encode(['min' => 2.5, 'max' => 4.3]), 'current_range' => json_encode(['min' => 0, 'max' => 1000])],
            ['id' => 'usb-5v', 'name' => 'USB 5V', 'short_name' => 'USB', 'category' => 'usb', 'voltage_range' => json_encode(['min' => 4.5, 'max' => 5.5]), 'current_range' => json_encode(['min' => 0, 'max' => 2000])],
        ];
        DB::table('smart_light_power_supplies')->upsert($powerSupplies, ['id'], ['name', 'short_name', 'category', 'voltage_range', 'current_range', 'updated_at']);
    }

    private function seedGlobalSettings(): void
    {
        $settings = [
            ['key' => 'global_server_url', 'value' => config('app.url') . '/smart-light'],
            ['key' => 'default_critical_voltage', 'value' => '3.2'],
            ['key' => 'default_sleep_interval', 'value' => '600'],
            ['key' => 'default_emergency_sleep_interval', 'value' => '3600'],
            ['key' => 'default_wifi_ssid', 'value' => ''],
            ['key' => 'default_wifi_password', 'value' => ''],
            ['key' => 'timezone', 'value' => 'Europe/Moscow'],
            ['key' => 'log_level', 'value' => 'info'],
            ['key' => 'telemetry_retention_days', 'value' => '30'],
            ['key' => 'voltage_warning_threshold', 'value' => '0.15'],
            ['key' => 'voltage_critical_threshold', 'value' => '0.10'],
            ['key' => 'default_battery_type', 'value' => 'li-ion-18650'],
            ['key' => 'default_bulb_type', 'value' => 'classic'],
            ['key' => 'default_power_supply', 'value' => 'standard'],
            ['key' => 'power_management_mode', 'value' => 'balanced'],
            ['key' => 'controller_runtime', 'value' => '86400'],
            ['key' => 'min_controller_voltage', 'value' => '2.8'],
        ];
        foreach ($settings as $setting) {
            DB::table('smart_light_settings')->updateOrInsert(
                ['key' => $setting['key']],
                ['value' => $setting['value'], 'updated_at' => now()] + (!DB::table('smart_light_settings')->where('key', $setting['key'])->exists() ? ['created_at' => now()] : [])
            );
        }
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('smart_light_telemetry');
        Schema::dropIfExists('smart_light_devices');
        Schema::dropIfExists('smart_light_settings');
        Schema::dropIfExists('smart_light_power_supplies');
        Schema::dropIfExists('smart_light_bulb_types');
        Schema::dropIfExists('smart_light_battery_types');
        Schema::enableForeignKeyConstraints();
    }
};
