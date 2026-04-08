<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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
                $table->softDeletes();
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
