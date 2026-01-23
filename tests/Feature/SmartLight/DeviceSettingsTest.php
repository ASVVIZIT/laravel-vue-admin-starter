<?php

namespace Tests\Feature\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Создаем тестового пользователя
        $this->user = User::factory()->create();
        $this->actingAs($this->user, 'api');

        // Создаем тестовое устройство
        $this->device = SmartLightDevice::factory()->create([
            'user_id' => $this->user->id,
            'device_id' => 'test-device-123',
            'name' => 'Тестовое устройство',
            'battery_type_id' => 'li-ion-18650',
            'is_fake' => true
        ]);
    }

    /** @test */
    public function user_can_get_device_settings()
    {
        $response = $this->getJson("/api/smart-light/devices/{$this->device->device_id}/device-settings");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'device_id' => $this->device->device_id,
                    'critical_voltage' => $this->device->critical_voltage,
                    'sleep_interval' => $this->device->sleep_interval,
                    'emergency_sleep_interval' => $this->device->emergency_sleep_interval
                ]
            ]);
    }

    /** @test */
    public function user_can_update_device_settings()
    {
        $newSettings = [
            'critical_voltage' => 3.1,
            'sleep_interval' => 720,
            'emergency_sleep_interval' => 4500,
            'battery_group_config' => [
                'enabled' => true,
                'type' => 'parallel',
                'count' => 3
            ]
        ];

        $response = $this->putJson("/api/smart-light/devices/{$this->device->device_id}/device-settings", $newSettings);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => $newSettings
            ]);

        // Проверяем обновление в базе данных
        $this->device->refresh();
        $this->assertEquals(3.1, $this->device->critical_voltage);
        $this->assertNotNull($this->device->settings_updated_at);

        // Проверяем сохранение настроек
        $this->assertArrayHasKey('battery_group_config', $this->device->settings);
        $this->assertEquals(3, $this->device->settings['battery_group_config']['count']);
    }

    /** @test */
    public function user_can_reset_device_settings()
    {
        // Сначала обновляем настройки
        $this->putJson("/api/smart-light/devices/{$this->device->device_id}/device-settings", [
            'critical_voltage' => 3.1,
            'battery_group_config' => [
                'enabled' => true,
                'type' => 'series',
                'count' => 2
            ]
        ]);

        // Затем сбрасываем
        $response = $this->postJson("/api/smart-light/devices/{$this->device->device_id}/device-settings/reset");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'critical_voltage' => 3.2, // Значение по умолчанию
                    'sleep_interval' => 600,
                    'emergency_sleep_interval' => 3600,
                    'battery_group_config' => [
                        'enabled' => false,
                        'type' => 'series',
                        'count' => 1
                    ]
                ]
            ]);

        // Проверяем сброс в базе данных
        $this->device->refresh();
        $this->assertEquals(3.2, $this->device->critical_voltage);
        $this->assertNull($this->device->settings); // Настройки должны быть сброшены
    }

    /** @test */
    public function user_cannot_access_another_users_device_settings()
    {
        // Создаем устройство другого пользователя
        $otherUser = User::factory()->create();
        $otherDevice = SmartLightDevice::factory()->create([
            'user_id' => $otherUser->id,
            'device_id' => 'other-device-456',
            'is_fake' => true
        ]);

        $response = $this->getJson("/api/smart-light/devices/{$otherDevice->device_id}/device-settings");

        $response->assertStatus(403);
    }

    /** @test */
    public function validation_prevents_invalid_critical_voltage()
    {
        $response = $this->putJson("/api/smart-light/devices/{$this->device->device_id}/device-settings", [
            'critical_voltage' => 14.5 // Слишком высокое значение
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['critical_voltage']);

        $response = $this->putJson("/api/smart-light/devices/{$this->device->device_id}/device-settings", [
            'critical_voltage' => 2.4 // Слишком низкое значение
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['critical_voltage']);
    }

    /** @test */
    public function validation_requires_battery_group_type_when_enabled()
    {
        $response = $this->putJson("/api/smart-light/devices/{$this->device->device_id}/device-settings", [
            'battery_group_config' => [
                'enabled' => true,
                'count' => 3
                // Отсутствует обязательное поле 'type'
            ]
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['battery_group_config.type']);
    }

    /** @test */
    public function admin_can_access_any_device_settings()
    {
        // Создаем устройство другого пользователя
        $otherUser = User::factory()->create();
        $otherDevice = SmartLightDevice::factory()->create([
            'user_id' => $otherUser->id,
            'device_id' => 'other-device-456',
            'is_fake' => true
        ]);

        // Назначаем текущему пользователю роль администратора
        $this->user->assignRole('admin');

        $response = $this->getJson("/api/smart-light/devices/{$otherDevice->device_id}/device-settings");

        $response->assertStatus(200);
    }

    /** @test */
    public function settings_defaults_api_returns_correct_format()
    {
        $response = $this->getJson("/api/smart-light/devices/{$this->device->device_id}/device-settings/defaults");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'default_settings' => [
                        'critical_voltage' => 3.2,
                        'sleep_interval' => 600,
                        'emergency_sleep_interval' => 3600
                    ],
                    'battery_types' => [
                        'li-ion-18650' => [
                            'name' => 'Li-ion 18650',
                            'min_voltage' => 2.5,
                            'max_voltage' => 4.2,
                            'critical_voltage' => 3.0
                        ]
                    ]
                ]
            ]);
    }
}
