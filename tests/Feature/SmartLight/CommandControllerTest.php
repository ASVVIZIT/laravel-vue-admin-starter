<?php

namespace Tests\Feature\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Cache;

class CommandControllerTest extends TestCase
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
            'api_key' => 'test_api_key_12345'
        ]);
    }

    /** @test */
    public function device_can_get_pending_command()
    {
        // Send a command to the device
        $commandData = [
            'command' => 'EMERGENCY_SLEEP',
            'timestamp' => now()->timestamp,
            'data' => ['reason' => 'low_battery']
        ];

        Cache::put("cmd_{$this->device->device_id}", $commandData, 120);

        // Device requests command
        $response = $this->getJson(
            "/api/smart-light/{$this->device->device_id}/commands",
            ['X-Device-Key' => $this->device->api_key]
        );

        $response->assertStatus(200)
            ->assertJson([
                'command' => 'EMERGENCY_SLEEP',
                'device_id' => 'test-device-123',
                'has_command' => true,
                'data' => ['reason' => 'low_battery']
            ]);

        // Command should be removed after retrieval
        $this->assertNull(Cache::get("cmd_{$this->device->device_id}"));
    }

    /** @test */
    public function device_gets_null_when_no_command_available()
    {
        $response = $this->getJson(
            "/api/smart-light/{$this->device->device_id}/commands",
            ['X-Device-Key' => $this->device->api_key]
        );

        $response->assertStatus(200)
            ->assertJson([
                'command' => null,
                'device_id' => 'test-device-123',
                'has_command' => false
            ]);
    }

    /** @test */
    public function unauthorized_device_cannot_get_commands()
    {
        $response = $this->getJson(
            "/api/smart-light/{$this->device->device_id}/commands",
            ['X-Device-Key' => 'invalid_key']
        );

        $response->assertStatus(401);
    }

    /** @test */
    public function multiple_commands_are_processed_correctly()
    {
        // Send first command
        Cache::put("cmd_{$this->device->device_id}", [
            'command' => 'COMMAND_1',
            'timestamp' => now()->timestamp
        ], 120);

        // Device gets first command
        $response1 = $this->getJson(
            "/api/smart-light/{$this->device->device_id}/commands",
            ['X-Device-Key' => $this->device->api_key]
        );

        $response1->assertStatus(200)
            ->assertJson(['command' => 'COMMAND_1', 'has_command' => true]);

        // Send second command
        Cache::put("cmd_{$this->device->device_id}", [
            'command' => 'COMMAND_2',
            'timestamp' => now()->timestamp
        ], 120);

        // Device gets second command
        $response2 = $this->getJson(
            "/api/smart-light/{$this->device->device_id}/commands",
            ['X-Device-Key' => $this->device->api_key]
        );

        $response2->assertStatus(200)
            ->assertJson(['command' => 'COMMAND_2', 'has_command' => true]);
    }

    /** @test */
    public function commands_expire_after_timeout()
    {
        // Send command with short expiration
        Cache::put("cmd_{$this->device->device_id}", [
            'command' => 'EXPIRED_COMMAND',
            'timestamp' => now()->timestamp
        ], 1); // 1 second

        // Wait for expiration
        sleep(2);

        $response = $this->getJson(
            "/api/smart-light/{$this->device->device_id}/commands",
            ['X-Device-Key' => $this->device->api_key]
        );

        $response->assertStatus(200)
            ->assertJson(['command' => null, 'has_command' => false]);
    }
}
