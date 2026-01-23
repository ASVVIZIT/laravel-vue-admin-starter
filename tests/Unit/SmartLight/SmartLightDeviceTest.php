<?php

namespace Tests\Unit\SmartLight;

use App\Models\SmartLight\GlobalSetting;
use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\Telemetry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

class SmartLightDeviceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Создаем базовые настройки
        GlobalSetting::set('default_critical_voltage', 3.2);
        GlobalSetting::set('default_sleep_interval', 600);
        GlobalSetting::set('default_emergency_sleep_interval', 3600);
    }

    /** @test */
    public function device_has_correct_default_settings()
    {
        $device = SmartLightDevice::factory()->make();

        $settings = $device->getSettingsAttribute(null);

        $this->assertEquals(config('app.url') . '/smart-light', $settings['server_url']);
        $this->assertEquals(3.2, $settings['default_critical_voltage']);
    }

    /** @test */
    public function device_has_estimated_runtime()
    {
        $device = SmartLightDevice::factory()->create([
            'voltage' => 3.7,
            'battery_capacity' => 2000,
            'critical_voltage' => 3.0
        ]);

        $this->assertIsString($device->estimated_runtime);
        $this->assertNotEmpty($device->estimated_runtime);
    }

    /** @test */
    public function device_has_current_telemetry()
    {
        $device = SmartLightDevice::factory()->create();

        // Создаем несколько записей телеметрии
        Telemetry::factory()->create([
            'device_id' => $device->id,
            'voltage' => 3.8,
            'received_at' => now()->subHours(2)
        ]);

        $latestTelemetry = Telemetry::factory()->create([
            'device_id' => $device->id,
            'voltage' => 3.9,
            'received_at' => now()
        ]);

        $this->assertEquals($latestTelemetry->id, $device->current_telemetry->id);
        $this->assertEquals(3.9, $device->current_telemetry->voltage);
    }

    /** @test */
    public function fake_device_is_identified_correctly()
    {
        $realDevice = SmartLightDevice::factory()->create(['is_fake' => false]);
        $fakeDevice = SmartLightDevice::factory()->create(['is_fake' => true]);

        $this->assertFalse($realDevice->isFake());
        $this->assertTrue($fakeDevice->isFake());
    }

    /** @test */
    public function settings_attribute_handles_json_correctly()
    {
        $device = SmartLightDevice::factory()->create([
            'settings' => json_encode([
                'custom_setting' => 'value',
                'battery_group_config' => [
                    'enabled' => true,
                    'type' => 'parallel'
                ]
            ])
        ]);

        $settings = $device->settings;

        $this->assertIsArray($settings);
        $this->assertEquals('value', $settings['custom_setting']);
        $this->assertTrue($settings['battery_group_config']['enabled']);
    }

    /** @test */
    public function device_calculates_runtime_with_dependency_injection()
    {
        // Мокаем PowerManager
        $mockPowerManager = $this->createMock(\App\Services\SmartLight\PowerManager::class);
        $mockPowerManager->expects($this->once())
            ->method('calculateRuntime')
            ->willReturn('10 дней');

        App::instance(\App\Services\SmartLight\PowerManager::class, $mockPowerManager);

        $device = SmartLightDevice::factory()->create();

        $this->assertEquals('10 дней', $device->estimated_runtime);
    }

    /** @test */
    public function device_can_be_registered_with_all_required_fields()
    {
        $device = SmartLightDevice::create([
            'user_id' => null, // Может быть null для фейковых устройств
            'name' => 'Тестовое устройство',
            'device_id' => 'TEST-DEVICE-001',
            'device_type' => 'node_mcu_v3',
            'battery_capacity' => 2000,
            'critical_voltage' => 3.2,
            'sleep_interval' => 600,
            'emergency_sleep_interval' => 3600,
            'status' => 'OFF',
            'voltage' => 3.7,
            'api_key' => 'test_api_key_12345',
            'is_fake' => false
        ]);

        $this->assertDatabaseHas('smart_light_devices', [
            'device_id' => 'TEST-DEVICE-001',
            'name' => 'Тестовое устройство',
            'is_fake' => false
        ]);
    }

    /** @test */
    public function device_has_correct_casts_for_json_fields()
    {
        $device = SmartLightDevice::factory()->create([
            'settings' => json_encode([
                'group_settings' => ['enabled' => true, 'count' => 2]
            ]),
            'battery_group_config' => json_encode([
                'enabled' => true,
                'type' => 'series',
                'count' => 3
            ])
        ]);

        $this->assertIsArray($device->settings);
        $this->assertIsArray($device->battery_group_config);

        $this->assertTrue($device->settings['group_settings']['enabled']);
        $this->assertEquals(3, $device->battery_group_config['count']);
    }
}
