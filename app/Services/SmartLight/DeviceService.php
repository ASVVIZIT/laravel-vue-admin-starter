<?php

namespace App\Services\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Support\Facades\DB;

class DeviceService
{
    /**
     * Get all devices with proper ordering.
     */
    public function getAllDevices(): array
    {
        return SmartLightDevice::orderBy('is_fake')
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    /**
     * Find device by device_id.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function findDeviceByDeviceId(string $deviceId): SmartLightDevice
    {
        return SmartLightDevice::where('device_id', $deviceId)->firstOrFail();
    }

    /**
     * Update device status safely.
     */
    public function updateDeviceStatus(SmartLightDevice $device, string $status): SmartLightDevice
    {
        $validStatuses = ['ON', 'OFF', 'SLEEPING', 'LOW_POWER'];

        if (!in_array($status, $validStatuses)) {
            throw new \InvalidArgumentException("Invalid status: {$status}");
        }

        $device->status = $status;
        $device->save();

        return $device;
    }

    /**
     * Update device voltage safely.
     */
    public function updateDeviceVoltage(SmartLightDevice $device, float $voltage): SmartLightDevice
    {
        // Get device type limits
        $deviceType = $device->device_type;
        $limits = [
            'node_mcu_v3' => [2.5, 4.2],
            'esp32' => [2.5, 4.2],
            'raspberry_pi' => [4.75, 5.25],
        ];

        $range = $limits[$deviceType] ?? [2.5, 4.2];

        $voltage = max($range[0], min($range[1], $voltage));
        $device->voltage = $voltage;
        $device->save();

        return $device;
    }

    /**
     * Get real devices only.
     */
    public function getRealDevices(): array
    {
        return SmartLightDevice::where('is_fake', false)
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    /**
     * Get fake devices only.
     */
    public function getFakeDevices(): array
    {
        return SmartLightDevice::where('is_fake', true)
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    /**
     * Wake up device (set status to ON and restore voltage).
     */
    public function wakeDevice(SmartLightDevice $device): SmartLightDevice
    {
        $device->status = 'ON';

        // Restore default voltage based on device type
        $deviceTypeDefaults = [
            'node_mcu_v3' => 3.7,
            'esp32' => 3.7,
            'raspberry_pi' => 5.0
        ];

        $defaultVoltage = $deviceTypeDefaults[$device->device_type] ?? 3.7;
        $device->voltage = $defaultVoltage;

        $device->save();

        return $device;
    }

    /**
     * Force device to sleep mode (set status to SLEEPING and reduce voltage).
     */
    public function forceSleep(SmartLightDevice $device): SmartLightDevice
    {
        $device->status = 'SLEEPING';

        // Reduce voltage for sleep mode
        $sleepVoltage = max(2.5, $device->voltage * 0.8);
        $device->voltage = $sleepVoltage;

        $device->save();

        return $device;
    }

    /**
     * Calculate remaining runtime considering shared power source
     */
    public function calculateSharedPowerRuntime(SmartLightDevice $device): array
    {
        $totalCapacity = $device->battery_capacity;
        $currentVoltage = $device->voltage;

        // Расчет оставшейся емкости
        $remainingCapacity = $totalCapacity * (($currentVoltage - 2.8) / (4.2 - 2.8));

        // Расчет потребления для разных компонентов
        $controllerConsumption = 0.5; // mA для контроллера в активном режиме
        $lightConsumption = 40; // mA для лампочки

        // Расчет времени работы для разных режимов
        $lightRuntime = $remainingCapacity / $lightConsumption; // часов при включенной лампочке
        $controllerRuntime = $remainingCapacity / $controllerConsumption; // часов только контроллера

        return [
            'light_only_runtime' => $this->formatRuntime($lightRuntime),
            'controller_only_runtime' => $this->formatRuntime($controllerRuntime),
            'remaining_capacity_mah' => round($remainingCapacity, 1),
            'total_capacity_mah' => $totalCapacity,
            'current_voltage' => $currentVoltage
        ];
    }

    private function formatRuntime(float $hours): string
    {
        if ($hours < 1) {
            $minutes = round($hours * 60);
            return $minutes . ' ' . $this->declineWord($minutes, ['минута', 'минуты', 'минут']);
        }

        if ($hours < 24) {
            return round($hours, 1) . ' ' . $this->declineWord(floor($hours), ['час', 'часа', 'часов']);
        }

        $days = $hours / 24;
        return round($days, 1) . ' ' . $this->declineWord(floor($days), ['день', 'дня', 'дней']);
    }

    private function declineWord(int $number, array $words): string
    {
        $number = abs($number) % 100;
        $lastDigit = $number % 10;

        if ($number > 10 && $number < 20) {
            return $words[2];
        }

        if ($lastDigit === 1) {
            return $words[0];
        }

        if ($lastDigit >= 2 && $lastDigit <= 4) {
            return $words[1];
        }

        return $words[2];
    }
}
