<?php

namespace Tests\Unit\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use App\Models\SmartLight\Telemetry;
use App\Services\SmartLight\TelemetryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelemetryServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new TelemetryService();
    }

    /** @test */
    public function creates_telemetry_record()
    {
        $device = SmartLightDevice::factory()->create();
        $telemetryData = [
            'voltage' => 3.75,
            'status' => 'ON',
            'intensity' => 85,
            'is_emergency' => false
        ];

        $telemetry = $this->service->createTelemetry($device, $telemetryData);

        $this->assertInstanceOf(Telemetry::class, $telemetry);
        $this->assertEquals(3.75, $telemetry->voltage);
        $this->assertEquals('ON', $telemetry->status);
        $this->assertEquals(85, $telemetry->intensity);

        // Проверяем обновление устройства
        $device->refresh();
        $this->assertEquals(3.75, $device->voltage);
        $this->assertEquals('ON', $device->status);
    }

    /** @test */
    public function gets_latest_telemetry_for_device()
    {
        $device = SmartLightDevice::factory()->create();

        // Создаем несколько записей
        Telemetry::factory()->create([
            'device_id' => $device->id,
            'voltage' => 3.5,
            'received_at' => now()->subHours(2)
        ]);

        $latest = Telemetry::factory()->create([
            'device_id' => $device->id,
            'voltage' => 3.8,
            'received_at' => now()
        ]);

        $result = $this->service->getLatestTelemetry($device);

        $this->assertEquals($latest->id, $result->id);
        $this->assertEquals(3.8, $result->voltage);
    }

    /** @test */
    public function gets_telemetry_history_for_device()
    {
        $device = SmartLightDevice::factory()->create();

        // Создаем несколько записей
        Telemetry::factory()->count(10)->create([
            'device_id' => $device->id
        ]);

        $history = $this->service->getTelemetryHistory($device, 5);

        $this->assertCount(5, $history);
        $this->assertInstanceOf(Telemetry::class, $history->first());

        // Проверяем сортировку (новые записи первыми)
        $timestamps = $history->pluck('received_at')->toArray();
        $this->assertEquals($timestamps, array_reverse($timestamps));
    }

    /** @test */
    public function deletes_old_telemetry()
    {
        $device = SmartLightDevice::factory()->create();

        // Создаем старые записи
        Telemetry::factory()->count(5)->create([
            'device_id' => $device->id,
            'received_at' => now()->subDays(40) // Старше 30 дней
        ]);

        // Создаем новые записи
        Telemetry::factory()->count(3)->create([
            'device_id' => $device->id,
            'received_at' => now()->subDays(10) // Новые записи
        ]);

        $deletedCount = $this->service->deleteOldTelemetry($device, 30);

        $this->assertEquals(5, $deletedCount);

        // Проверяем, что остались только новые записи
        $remainingCount = Telemetry::where('device_id', $device->id)->count();
        $this->assertEquals(3, $remainingCount);
    }

    /** @test */
    public function handles_emergency_mode_based_on_voltage()
    {
        $device = SmartLightDevice::factory()->create([
            'critical_voltage' => 3.0
        ]);

        $telemetryData = [
            'voltage' => 2.8, // Ниже критического
            'status' => 'ON'
        ];

        $telemetry = $this->service->createTelemetry($device, $telemetryData);

        $this->assertTrue($telemetry->is_emergency);

        // Проверяем, что устройство перешло в аварийный режим
        $device->refresh();
        $this->assertEquals('SLEEPING', $device->status);
    }

    /** @test */
    public function aggregates_telemetry_by_time_period()
    {
        $device = SmartLightDevice::factory()->create();

        // Создаем данные за разные периоды
        Telemetry::factory()->create([
            'device_id' => $device->id,
            'voltage' => 3.7,
            'received_at' => now()->subHours(23)
        ]);

        Telemetry::factory()->create([
            'device_id' => $device->id,
            'voltage' => 3.8,
            'received_at' => now()->subHours(1)
        ]);

        // Агрегация по дням
        $daily = $this->service->aggregateTelemetry($device, 'day');

        $this->assertCount(1, $daily); // Обе записи за один день
        $this->assertEquals(3.75, $daily->first()['avg_voltage']); // Среднее значение

        // Агрегация по часам
        $hourly = $this->service->aggregateTelemetry($device, 'hour');

        $this->assertCount(2, $hourly); // Две записи за разные часы
    }

    /** @test */
    public function calculates_battery_stats()
    {
        $device = SmartLightDevice::factory()->create([
            'battery_capacity' => 2000,
            'critical_voltage' => 3.0
        ]);

        // Создаем данные с разным напряжением
        Telemetry::factory()->create([
            'device_id' => $device->id,
            'voltage' => 3.8,
            'received_at' => now()->subHours(24)
        ]);

        Telemetry::factory()->create([
            'device_id' => $device->id,
            'voltage' => 3.5,
            'received_at' => now()->subHours(12)
        ]);

        Telemetry::factory()->create([
            'device_id' => $device->id,
            'voltage' => 3.2,
            'received_at' => now()
        ]);

        $stats = $this->service->getBatteryStats($device);

        $this->assertEquals(3.2, $stats['current_voltage']);
        $this->assertEquals(3.5, $stats['avg_voltage']);
        $this->assertEquals(0.3, $stats['voltage_drop_24h']);
        $this->assertContains('час', $stats['estimated_runtime']);
    }
}
