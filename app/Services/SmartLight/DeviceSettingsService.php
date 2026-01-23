<?php

namespace App\Services\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Support\Facades\Log;

class DeviceSettingsService
{
    /**
     * Get device settings (merged with defaults if needed).
     */
    public function getDeviceSettings(SmartLightDevice $device): array
    {
        Log::debug('DeviceSettingsService: Getting settings for device', [
            'device_id' => $device->device_id,
            'has_settings' => !empty($device->settings)
        ]);

        return $device->settings ?? $this->getDefaultSettings($device);
    }

    /**
     * Update device settings with validation.
     *
     * @throws \InvalidArgumentException
     */
    public function updateDeviceSettings(SmartLightDevice $device, array $settings): array
    {
        Log::debug('DeviceSettingsService: Updating settings for device', [
            'device_id' => $device->device_id,
            'new_settings' => $settings
        ]);

        // Validate critical voltage based on device type
        if (isset($settings['critical_voltage'])) {
            $this->validateCriticalVoltage($device, $settings['critical_voltage']);
        }

        // Validate battery group configuration if enabled
        if (isset($settings['battery_group_config']['enabled']) &&
            $settings['battery_group_config']['enabled']) {
            $this->validateBatteryGroupConfig($device, $settings['battery_group_config']);
        }

        $device->settings = array_merge($device->settings ?? [], $settings);
        $device->save();

        Log::info('Device settings updated successfully', [
            'device_id' => $device->device_id,
            'updated_settings' => $device->settings
        ]);

        return $this->getDeviceSettings($device);
    }

    /**
     * Reset device settings to defaults.
     */
    public function resetDeviceSettings(SmartLightDevice $device): array
    {
        Log::info('DeviceSettingsService: Resetting settings for device', [
            'device_id' => $device->device_id
        ]);

        $device->settings = null;
        $device->save();

        return $this->getDeviceSettings($device);
    }

    /**
     * Get default settings for device.
     */
    private function getDefaultSettings(SmartLightDevice $device): array
    {
        return [
            'critical_voltage' => $device->critical_voltage,
            'sleep_interval' => $device->sleep_interval,
            'emergency_sleep_interval' => $device->emergency_sleep_interval,
            'battery_group_config' => [
                'enabled' => false,
                'type' => 'series',
                'count' => 1
            ],
            'power_config' => [
                'shared_power_source' => true,
                'controller_runtime' => 86400, // 24 часа в секундах
                'min_controller_voltage' => 2.8,
                'power_management_mode' => 'conservative'
            ]
        ];
    }

    /**
     * Validate critical voltage based on battery type.
     *
     * @throws \InvalidArgumentException
     */
    private function validateCriticalVoltage(SmartLightDevice $device, float $voltage): void
    {
        $deviceType = $device->device_type;
        $limits = [
            'node_mcu_v3' => [2.5, 4.2],
            'esp32' => [2.5, 4.2],
            'raspberry_pi' => [4.75, 5.25],
        ];

        $range = $limits[$deviceType] ?? [2.5, 4.2];

        if ($voltage < $range[0] || $voltage > $range[1]) {
            throw new \InvalidArgumentException(
                "Критическое напряжение для {$deviceType} должно быть в диапазоне {$range[0]}-{$range[1]}В"
            );
        }
    }

    /**
     * Validate battery group configuration.
     *
     * @throws \InvalidArgumentException
     */
    private function validateBatteryGroupConfig(SmartLightDevice $device, array $config): void
    {
        $deviceType = $device->device_type;
        $maxGroups = [
            'node_mcu_v3' => 10,
            'esp32' => 8,
            'raspberry_pi' => 4
        ];

        $maxCount = $maxGroups[$deviceType] ?? 10;

        if (isset($config['count']) && $config['count'] > $maxCount) {
            throw new \InvalidArgumentException(
                "Максимальное количество аккумуляторов для {$deviceType} в группе: {$maxCount}"
            );
        }
    }
}
