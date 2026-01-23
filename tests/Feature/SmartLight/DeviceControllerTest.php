<?php

namespace Tests\Feature\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Str;

class DeviceControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->actingAs($this->user, 'api');
    }

    /** @test */
    public function user_can_register_new_device()
    {
        $response = $this->postJson('/api/smart-light/register', [
            'mac_address' => '00:11:22:33:44:55',
            'device_type' => 'node_mcu_v3'
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'device_id' => 'LIGHT_',
                'api_key' => Str::random(32)
            ], true);

        // Проверяем создание устройства
        $this->assertDatabaseHas('smart_light_devices', [
            'user_id' => $this->user->id,
            'device_id' => $response->json('device_id'),
            'device_type' => 'node_mcu_v3',
            'status' => 'OFF'
        ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_register_device()
    {
        $this->actingAs(new \stdClass()); // Неавторизованный запрос

        $response = $this->postJson('/api/smart-light/register', [
            'mac_address' => '00:11:22:33:44:55',
            'device_type' => 'node_mcu_v3'
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function user_can_get_all_devices()
    {
        // Создаем несколько устройств
        $device1 = SmartLightDevice::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Устройство 1',
            'is_fake' => false
        ]);

        $device2 = SmartLightDevice::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Устройство 2',
            'is_fake' => true
        ]);

        $response = $this->getJson('/api/smart-light/devices');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['name' => 'Устройство 1'])
            ->assertJsonFragment(['name' => 'Устройство 2'])
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id', 'name', 'device_id', 'status', 'voltage', 'estimated_runtime'
                    ]
                ],
                'meta' => [
                    'total', 'per_page', 'current_page', 'last_page'
                ]
            ]);
    }

    /** @test */
    public function user_can_get_devices_for_dropdown()
    {
        // Создаем устройства
        $device1 = SmartLightDevice::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Офисный светильник',
            'device_id' => 'office-001'
        ]);

        $device2 = SmartLightDevice::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Кухонный светильник',
            'device_id' => 'kitchen-001'
        ]);

        $response = $this->getJson('/api/smart-light/devices/dropdown');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJson([
                'data' => [
                    [
                        'id' => 'office-001',
                        'label' => 'Офисный светильник'
                    ],
                    [
                        'id' => 'kitchen-001',
                        'label' => 'Кухонный светильник'
                    ]
                ]
            ]);
    }

    /** @test */
    public function user_cannot_access_other_users_devices()
    {
        // Создаем устройство другого пользователя
        $otherUser = User::factory()->create();
        $otherDevice = SmartLightDevice::factory()->create([
            'user_id' => $otherUser->id,
            'name' => 'Секретное устройство',
            'device_id' => 'secret-001'
        ]);

        $response = $this->getJson('/api/smart-light/devices');

        $response->assertStatus(200)
            ->assertJsonMissing(['name' => 'Секретное устройство']);

        $response = $this->getJson("/api/smart-light/devices/{$otherDevice->device_id}/ownership");

        $response->assertStatus(200)
            ->assertJson([
                'owns_device' => false,
                'device_id' => 'secret-001',
                'user_id' => $this->user->id,
                'device_owner_id' => $otherUser->id,
                'user_can_manage_all' => false
            ]);
    }

    /** @test */
    public function admin_can_access_all_devices()
    {
        // Назначаем роль администратора
        $this->user->assignRole('admin');

        // Создаем устройство другого пользователя
        $otherUser = User::factory()->create();
        $otherDevice = SmartLightDevice::factory()->create([
            'user_id' => $otherUser->id,
            'name' => 'Секретное устройство',
            'device_id' => 'secret-001'
        ]);

        $response = $this->getJson('/api/smart-light/devices');

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Секретное устройство']);

        $response = $this->getJson("/api/smart-light/devices/{$otherDevice->device_id}/ownership");

        $response->assertStatus(200)
            ->assertJson([
                'owns_device' => true, // Администратор имеет доступ
                'device_id' => 'secret-001',
                'user_can_manage_all' => true
            ]);
    }

    /** @test */
    public function device_can_force_sleep()
    {
        $device = SmartLightDevice::factory()->create([
            'user_id' => $this->user->id,
            'device_id' => 'test-device-123',
            'api_key' => 'valid_api_key'
        ]);

        // Сначала проверяем через API устройств
        $response = $this->postJson("/api/smart-light/{$device->device_id}/sleep", [], [
            'X-Device-Key' => $device->api_key
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Команда сна отправлена',
                'device_id' => 'test-device-123'
            ]);

        // Проверяем, что статус устройства изменился
        $device->refresh();
        $this->assertEquals('SLEEPING', $device->status);
    }

    /** @test */
    public function invalid_device_cannot_force_sleep()
    {
        $device = SmartLightDevice::factory()->create([
            'user_id' => $this->user->id,
            'device_id' => 'test-device-123',
            'api_key' => 'valid_api_key'
        ]);

        $response = $this->postJson("/api/smart-light/{$device->device_id}/sleep", [], [
            'X-Device-Key' => 'invalid_api_key'
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function device_with_low_voltage_gets_critical_response()
    {
        $device = SmartLightDevice::factory()->create([
            'user_id' => $this->user->id,
            'device_id' => 'low-voltage-device',
            'api_key' => 'valid_api_key',
            'voltage' => 2.8, // Ниже критического значения по умолчанию (3.2)
            'critical_voltage' => 3.0
        ]);

        $response = $this->getJson("/api/smart-light/{$device->device_id}/settings", [], [
            'X-Device-Key' => $device->api_key
        ]);

        $response->assertStatus(428)
            ->assertJson([
                'error' => 'Critical voltage',
                'message' => 'Device is in emergency mode due to low battery',
                'current_voltage' => 2.8,
                'critical_voltage' => 3.0
            ]);
    }
}
