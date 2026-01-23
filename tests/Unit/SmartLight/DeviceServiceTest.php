<?php

namespace Tests\Unit\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Services\SmartLight\DeviceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new DeviceService();
    }

    /** @test */
    public function gets_all_devices()
    {
        SmartLightDevice::factory()->count(5)->create();

        $devices = $this->service->getAllDevices();

        $this->assertCount(5, $devices);
        $this->assertArrayHasKey(0, $devices);
        $this->assertArrayHasKey('device_id', $devices[0]);
        $this->assertArrayHasKey('name', $devices[0]);
    }

    /** @test */
    public function finds_device_by_device_id()
    {
        $device = SmartLightDevice::factory()->create([
            'device_id' => 'test-device-123'
        ]);

        $found = $this->service->findDeviceByDeviceId('test-device-123');

        $this->assertEquals($device->id, $found->id);
        $this->assertEquals('test-device-123', $found->device_id);
    }

    /** @test */
    public function throws_exception_when_device_not_found()
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->service->findDeviceByDeviceId('nonexistent-device');
    }

    /** @test */
    public function updates_device_status()
    {
        $device = SmartLightDevice::factory()->create([
            'status' => 'OFF'
        ]);

        $updated = $this->service->updateDeviceStatus($device, 'ON');

        $this->assertEquals('ON', $updated->status);

        // Проверяем сохранение в базе данных
        $device->refresh();
        $this->assertEquals('ON', $device->status);
    }

    /** @test */
    public function validates_device_status()
    {
        $device = SmartLightDevice::factory()->create();

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid status: INVALID_STATUS');

        $this->service->updateDeviceStatus($device, 'INVALID_STATUS');
    }

    /** @test */
    public function updates_device_voltage_with_limits()
    {
        $device = SmartLightDevice::factory()->create([
            'battery_type_id' => 'li-ion-18650',
            'voltage' => 3.7
        ]);

        // Обновление в пределах допустимого диапазона
        $updated1 = $this->service->updateDeviceVoltage($device, 3.8);
        $this->assertEquals(3.8, $updated1->voltage);

        // Обновление ниже минимального значения
        $updated2 = $this->service->updateDeviceVoltage($device, 2.4);
        $this->assertEquals(2.5, $updated2->voltage);

        // Обновление выше максимального значения
        $updated3 = $this->service->updateDeviceVoltage($device, 4.3);
        $this->assertEquals(4.2, $updated3->voltage);
    }

    /** @test */
    public function gets_real_devices_only()
    {
        SmartLightDevice::factory()->count(3)->create(['is_fake' => false]);
        SmartLightDevice::factory()->count(2)->create(['is_fake' => true]);

        $realDevices = $this->service->getRealDevices();

        $this->assertCount(3, $realDevices);
        $this->assertTrue(collect($realDevices)->every(fn($d) => !$d['is_fake']));
    }

    /** @test */
    public function gets_fake_devices_only()
    {
        SmartLightDevice::factory()->count(3)->create(['is_fake' => false]);
        SmartLightDevice::factory()->count(2)->create(['is_fake' => true]);

        $fakeDevices = $this->service->getFakeDevices();

        $this->assertCount(2, $fakeDevices);
        $this->assertTrue(collect($fakeDevices)->every(fn($d) => $d['is_fake']));
    }

    /** @test */
    public function wakes_up_device()
    {
        $device = SmartLightDevice::factory()->create([
            'status' => 'SLEEPING',
            'voltage' => 3.0,
            'battery_type_id' => 'li-ion-18650'
        ]);

        $wokenDevice = $this->service->wakeDevice($device);

        $this->assertEquals('ON', $wokenDevice->status);
        $this->assertEquals(3.7, $wokenDevice->voltage); // Восстановленное напряжение

        // Проверяем сохранение в базе данных
        $device->refresh();
        $this->assertEquals('ON', $device->status);
        $this->assertEquals(3.7, $device->voltage);
    }

    /** @test */
    public function forces_device_to_sleep()
    {
        $device = SmartLightDevice::factory()->create([
            'status' => 'ON',
            'voltage' => 3.7
        ]);

        $sleepingDevice = $this->service->forceSleep($device);

        $this->assertEquals('SLEEPING', $sleepingDevice->status);
        $this->assertLessThan(3.7, $sleepingDevice->voltage); // Напряжение должно уменьшиться

        // Проверяем сохранение в базе данных
        $device->refresh();
        $this->assertEquals('SLEEPING', $device->status);
        $this->assertLessThan(3.7, $device->voltage);
    }

    /** @test */
    public function restores_voltage_by_battery_type()
    {
        // Li-ion 18650
        $device1 = SmartLightDevice::factory()->create([
            'battery_type_id' => 'li-ion-18650',
            'voltage' => 3.0
        ]);

        $woken1 = $this->service->wakeDevice($device1);
        $this->assertEquals(3.7, $woken1->voltage);

        // Li-Po
        $device2 = SmartLightDevice::factory()->create([
            'battery_type_id' => 'li-po',
            'voltage' => 3.0
        ]);

        $woken2 = $this->service->wakeDevice($device2);
        $this->assertEquals(3.7, $woken2->voltage);

        // Lead-acid
        $device3 = SmartLightDevice::factory()->create([
            'battery_type_id' => 'lead-acid',
            'voltage' => 11.0
        ]);

        $woken3 = $this->service->wakeDevice($device3);
        $this->assertEquals(12.0, $woken3->voltage);
    }

    /** @test */
    public function reduces_voltage_for_sleep_mode()
    {
        $device = SmartLightDevice::factory()->create([
            'voltage' => 3.7,
            'battery_type_id' => 'li-ion-18650'
        ]);

        $sleeping = $this->service->forceSleep($device);

        $this->assertLessThan(3.7, $sleeping->voltage);
        $this->assertGreaterThanOrEqual(2.5, $sleeping->voltage); // Не ниже минимального
    }
}
