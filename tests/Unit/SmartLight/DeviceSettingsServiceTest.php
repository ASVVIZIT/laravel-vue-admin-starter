<?php

namespace Tests\Unit\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Services\SmartLight\DeviceSettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceSettingsServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new DeviceSettingsService();
    }

    /** @test */
    public function gets_device_settings_with_defaults()
    {
        $device = SmartLightDevice::factory()->make([
            'settings' => null,
            'critical_voltage' => 3.2,
            'sleep_interval' => 600,
            'emergency_sleep_interval' => 3600
        ]);

        $settings = $this->service->getDeviceSettings($device);

        $this->assertEquals(3.2, $settings['critical_voltage']);
        $this->assertEquals(600, $settings['sleep_interval']);
        $this->assertEquals(3600, $settings['emergency_sleep_interval']);
        $this->assertFalse($settings['battery_group_config']['enabled']);
        $this->assertEquals('series', $settings['battery_group_config']['type']);
        $this->assertEquals(1, $settings['battery_group_config']['count']);
    }

    /** @test */
    public function gets_device_settings_with_custom_values()
    {
        $device = SmartLightDevice::factory()->make([
            'settings' => [
                'critical_voltage' => 3.1,
                'sleep_interval' => 900,
                'battery_group_config' => [
                    'enabled' => true,
                    'type' => 'parallel',
                    'count' => 3
                ]
            ]
        ]);

        $settings = $this->service->getDeviceSettings($device);

        $this->assertEquals(3.1, $settings['critical_voltage']);
        $this->assertEquals(900, $settings['sleep_interval']);
        $this->assertTrue($settings['battery_group_config']['enabled']);
        $this->assertEquals('parallel', $settings['battery_group_config']['type']);
        $this->assertEquals(3, $settings['battery_group_config']['count']);
    }

    /** @test */
    public function updates_device_settings_correctly()
    {
        $device = SmartLightDevice::factory()->create([
            'settings' => [
                'critical_voltage' => 3.0,
                'sleep_interval' => 600
            ]
        ]);

        $newSettings = [
            'critical_voltage' => 3.1,
            'sleep_interval' => 720,
            'battery_group_config' => [
                'enabled' => true,
                'type' => 'parallel'
            ]
        ];

        $updatedSettings = $this->service->updateDeviceSettings($device, $newSettings);

        $this->assertEquals(3.1, $updatedSettings['critical_voltage']);
        $this->assertEquals(720, $updatedSettings['sleep_interval']);
        $this->assertTrue($updatedSettings['battery_group_config']['enabled']);
        $this->assertEquals('parallel', $updatedSettings['battery_group_config']['type']);

        // Проверяем сохранение в базе данных
        $device->refresh();
        $this->assertNotNull($device->settings_updated_at);
        $this->assertEquals(3.1, $device->settings['critical_voltage']);
    }

    /** @test */
    public function resets_device_settings_to_defaults()
    {
        $device = SmartLightDevice::factory()->create([
            'settings' => [
                'critical_voltage' => 3.1,
                'sleep_interval' => 720
            ]
        ]);

        $resetSettings = $this->service->resetDeviceSettings($device);

        $this->assertEquals(3.2, $resetSettings['critical_voltage']); // Значение по умолчанию
        $this->assertEquals(600, $resetSettings['sleep_interval']); // Значение по умолчанию
        $this->assertFalse($resetSettings['battery_group_config']['enabled']);

        // Проверяем сброс в базе данных
        $device->refresh();
        $this->assertNull($device->settings); // Должно быть null после сброса
    }

    /** @test */
    public function validates_critical_voltage_for_lead_acid_battery()
    {
        $device = SmartLightDevice::factory()->make([
            'battery_type_id' => 'lead-acid'
        ]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Критическое напряжение для lead-acid должно быть в диапазоне 10.5-14.4В');

        $this->service->updateDeviceSettings($device, [
            'critical_voltage' => 3.0
        ]);
    }

    /** @test */
    public function validates_battery_group_count_for_li_ion_battery()
    {
        $device = SmartLightDevice::factory()->make([
            'battery_type_id' => 'li-ion-18650'
        ]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Максимальное количество аккумуляторов для li-ion-18650 в группе: 10');

        $this->service->updateDeviceSettings($device, [
            'battery_group_config' => [
                'enabled' => true,
                'type' => 'series',
                'count' => 15
            ]
        ]);
    }

    /** @test */
    public function validates_group_config_when_enabled()
    {
        $device = SmartLightDevice::factory()->make();

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Тип группировки обязателен при включенной группировке');

        $this->service->updateDeviceSettings($device, [
            'battery_group_config' => [
                'enabled' => true,
                'count' => 3
                // Отсутствует обязательное поле 'type'
            ]
        ]);
    }

    /** @test */
    public function calculates_default_critical_voltage_by_battery_type()
    {
        // Li-ion 18650
        $device1 = SmartLightDevice::factory()->make([
            'battery_type_id' => 'li-ion-18650'
        ]);

        $settings1 = $this->service->getDeviceSettings($device1);
        $this->assertEquals(3.0, $settings1['critical_voltage']);

        // Li-Po
        $device2 = SmartLightDevice::factory()->make([
            'battery_type_id' => 'li-po'
        ]);

        $settings2 = $this->service->getDeviceSettings($device2);
        $this->assertEquals(3.2, $settings2['critical_voltage']);

        // Lead-acid
        $device3 = SmartLightDevice::factory()->make([
            'battery_type_id' => 'lead-acid'
        ]);

        $settings3 = $this->service->getDeviceSettings($device3);
        $this->assertEquals(11.0, $settings3['critical_voltage']);
    }
}
