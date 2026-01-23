<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSmartLightTables extends Migration
{
    public function up()
    {
        // Таблица устройств
        Schema::create('smart_light_devices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('name');
            $table->string('device_id')->unique();
            $table->string('device_type')->default('node_mcu_v3');
            $table->integer('battery_capacity')->default(2000);
            $table->float('critical_voltage')->default(3.2);
            $table->integer('sleep_interval')->default(600);
            $table->integer('emergency_sleep_interval')->default(3600);
            $table->string('status')->default('OFF');
            $table->float('voltage')->default(3.7);
            $table->string('api_key');
            $table->json('settings')->nullable();
            $table->boolean('is_fake')->default(false);
            $table->timestamp('settings_updated_at')->nullable()->comment('Время последнего обновления настроек');
            $table->json('battery_group_config')->nullable()->comment('Конфигурация группировки аккумуляторов');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index('user_id');
            $table->index('device_id');
        });

        // Таблица телеметрии
        Schema::create('smart_light_telemetry', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('smart_light_devices')->onDelete('cascade');
            $table->float('voltage');
            $table->string('status');
            $table->integer('intensity')->default(100);
            $table->boolean('is_emergency')->default(false);
            $table->timestamp('received_at')->useCurrent();
            $table->timestamps();

            $table->index('device_id');
            $table->index('received_at');
        });

        // Глобальные настройки
        Schema::create('smart_light_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });

        // Добавление базовых настроек
        $baseSettings = [
            [
                'key' => 'global_server_url',
                'value' => config('app.url') . '/smart-light'
            ],
            [
                'key' => 'default_critical_voltage',
                'value' => '3.2'
            ],
            [
                'key' => 'default_sleep_interval',
                'value' => '600'
            ],
            [
                'key' => 'default_emergency_sleep_interval',
                'value' => '3600'
            ],
            [
                'key' => 'default_wifi_ssid',
                'value' => ''
            ],
            [
                'key' => 'default_wifi_password',
                'value' => ''
            ],
            [
                'key' => 'timezone',
                'value' => 'Europe/Moscow'
            ],
            [
                'key' => 'log_level',
                'value' => 'info'
            ],
            [
                'key' => 'telemetry_retention_days',
                'value' => '30'
            ],
            [
                'key' => 'voltage_warning_threshold',
                'value' => '0.15'
            ],
            [
                'key' => 'voltage_critical_threshold',
                'value' => '0.10'
            ]
        ];

        foreach ($baseSettings as $setting) {
            \DB::table('smart_light_settings')->insert([
                ...$setting,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    public function down()
    {
        Schema::dropIfExists('smart_light_settings');
        Schema::dropIfExists('smart_light_telemetry');
        Schema::dropIfExists('smart_light_devices');
    }
}
