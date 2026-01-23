<?php

namespace Tests\Feature\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\Telemetry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelemetryControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->actingAs($this->user, 'api');

        $this->device = SmartLightDevice::factory()->create([
            'user_id' => $this->user->id,
            'device_id' => 'test-device-123',
            'api_key' => 'valid_api_key'
        ]);
    }

    /** @test */
    public function device_can_send_telemetry()
    {
        $telemetryData = [
            'voltage' => 3.75,
            'status' => 'ON',
            'intensity' => 85,
            'emergency' => false
        ];

        $response = $this->postJson("/api/smart-light/{$this->device->device_id}/telemetry", $telemetryData, [
            'X-Device-Key' => $this->device->api_key
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'device_id' => 'test-device-123',
                'telemetry_id' => 1
            ]);

        // Проверяем обновление в базе данных
        $this->device->refresh();
        $this->assertEquals(3.75, $this->device->voltage);
        $this->assertEquals('ON', $this->device->status);

        // Проверяем создание записи телеметрии
        $this->assertDatabaseHas('smart_light_telemetry', [
            'device_id' => $this->device->id,
            'voltage' => 3.75,
            'status' => 'ON',
            'intensity' => 85,
            'is_emergency' => false
        ]);
    }

    /** @test */
    public function user_can_get_telemetry_history()
    {
        // Создаем несколько записей телеметрии
        Telemetry::factory()->count(15)->create([
            'device_id' => $this->device->id
        ]);

        $response = $this->getJson("/api/smart-light/{$this->device->device_id}/telemetry");

        $response->assertStatus(200)
            ->assertJsonCount(15)
            ->assertJsonStructure([
                '*' => [
                    'id', 'voltage', 'status', 'intensity', 'is_emergency',
                    'received_at', 'created_at', 'updated_at'
                ]
            ]);
    }

    /** @test */
    public function validation_prevents_invalid_telemetry()
    {
        $invalidData = [
            'voltage' => 4.5, // Слишком высокое напряжение
            'status' => 'ON',
            'intensity' => 101 // Слишком высокая интенсивность
        ];

        $response = $this->postJson("/api/smart-light/{$this->device->device_id}/telemetry", $invalidData, [
            'X-Device-Key' => $this->device->api_key
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['voltage', 'intensity']);

        // Проверяем, что запись не создана
        $this->assertDatabaseMissing('smart_light_telemetry', [
            'device_id' => $this->device->id
        ]);
    }

    /** @test */
    public function invalid_device_cannot_send_telemetry()
    {
        $response = $this->postJson("/api/smart-light/{$this->device->device_id}/telemetry", [
            'voltage' => 3.7,
            'status' => 'ON'
        ], [
            'X-Device-Key' => 'invalid_api_key'
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function user_cannot_access_other_users_telemetry()
    {
        // Создаем устройство другого пользователя
        $otherUser = User::factory()->create();
        $otherDevice = SmartLightDevice::factory()->create([
            'user_id' => $otherUser->id,
            'device_id' => 'other-device-456'
        ]);

        Telemetry::factory()->count(5)->create([
            'device_id' => $otherDevice->id
        ]);

        $response = $this->getJson("/api/smart-light/{$otherDevice->device_id}/telemetry");

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_access_any_telemetry()
    {
        // Назначаем роль администратора
        $this->user->assignRole('admin');

        // Создаем устройство другого пользователя
        $otherUser = User::factory()->create();
        $otherDevice = SmartLightDevice::factory()->create([
            'user_id' => $otherUser->id,
            'device_id' => 'other-device-456'
        ]);

        Telemetry::factory()->count(3)->create([
            'device_id' => $otherDevice->id
        ]);

        $response = $this->getJson("/api/smart-light/{$otherDevice->device_id}/telemetry");

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    /** @test */
    public function device_with_low_voltage_triggers_emergency_mode()
    {
        $device = SmartLightDevice::factory()->create([
            'user_id' => $this->user->id,
            'device_id' => 'low-voltage-device',
            'api_key' => 'valid_api_key',
            'voltage' => 3.7,
            'critical_voltage' => 3.0
        ]);

        // Отправляем телеметрию с низким напряжением
        $response = $this->postJson("/api/smart-light/{$device->device_id}/telemetry", [
            'voltage' => 2.8, // Ниже критического
            'status' => 'ON'
        ], [
            'X-Device-Key' => $device->api_key
        ]);

        $response->assertStatus(201);

        // Проверяем, что устройство перешло в аварийный режим
        $device->refresh();
        $this->assertEquals(2.8, $device->voltage);

        // Проверяем запись телеметрии с флагом аварии
        $this->assertDatabaseHas('smart_light_telemetry', [
            'device_id' => $device->id,
            'voltage' => 2.8,
            'is_emergency' => true
        ]);
    }
}
