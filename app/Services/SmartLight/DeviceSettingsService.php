<?php

namespace App\Services\SmartLight;

use App\Models\SmartLight\SmartLightDevice;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

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

        $settings = $device->settings ?? $this->getDefaultSettings($device);

        return array_merge([
            'critical_voltage' => $device->critical_voltage,
            'sleep_interval' => $device->sleep_interval,
            'emergency_sleep_interval' => $device->emergency_sleep_interval,
            'battery_type_id' => $device->battery_type_id,
            'bulb_type_id' => $device->bulb_type_id,
            'power_supply_id' => $device->power_supply_id,
            'battery_group_config' => $device->battery_group_config,
        ], $settings);
    }

    /**
     * Update device settings with validation.
     *
     * @throws InvalidArgumentException
     */
    public function updateDeviceSettings(SmartLightDevice $device, array $settings): array
    {
        Log::debug('DeviceSettingsService: Updating settings for device', [
            'device_id' => $device->device_id,
            'new_settings' => $settings
        ]);

        if (isset($settings['critical_voltage'])) {
            $this->validateCriticalVoltage($device, $settings['critical_voltage']);
        }

        if (isset($settings['battery_group_config']['enabled']) && $settings['battery_group_config']['enabled']) {
            $this->validateBatteryGroupConfig($device, $settings['battery_group_config']);
        }

        $deviceFields = [
            'critical_voltage', 'sleep_interval', 'emergency_sleep_interval',
            'battery_type_id', 'bulb_type_id', 'power_supply_id'
        ];

        $settingsFields = array_diff_key($settings, array_flip($deviceFields));
        $updateDevice = array_intersect_key($settings, array_flip($deviceFields));

        if (!empty($updateDevice)) {
            $device->update($updateDevice);
        }

        if (!empty($settingsFields)) {
            if (isset($settingsFields['battery_group_config'])) {
                $config = $settingsFields['battery_group_config'];
                $device->battery_group_config = ($config['enabled'] ?? false) ? $config : null;
                unset($settingsFields['battery_group_config']);
            }

            // ✅ Явно обрабатываем power_config / custom_consumption_mA
            if (isset($settingsFields['settings']) && is_array($settingsFields['settings'])) {
                $currentSettings = $device->settings ?? [];

                // Сохраняем custom_consumption_mA в power_config для консистентности
                if (isset($settingsFields['settings']['custom_consumption_mA'])) {
                    $currentSettings['power_config']['custom_consumption_mA'] = (int) $settingsFields['settings']['custom_consumption_mA'];
                    unset($settingsFields['settings']['custom_consumption_mA']);
                }

                $device->settings = array_merge($currentSettings, $settingsFields['settings']);
            }

            $device->settings_updated_at = now();
            $device->save();
        }

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
        $device->settings_updated_at = now();
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
        ];
    }

    /**
     * Validate critical voltage based on device type.
     *
     * @throws InvalidArgumentException
     */
    private function validateCriticalVoltage(SmartLightDevice $device, float $voltage): void
    {
        $deviceType = $device->device_type;

        $limits = [
            'node_mcu_v3' => [2.5, 4.2],
            'esp32' => [2.5, 4.2],
            'esp8266' => [2.5, 4.2],
            'raspberry_pi' => [4.75, 5.25],
            'custom' => [2.0, 5.0],
        ];

        $range = $limits[$deviceType] ?? [2.5, 4.2];

        if ($voltage < $range[0] || $voltage > $range[1]) {
            throw new InvalidArgumentException(
                "Критическое напряжение для {$deviceType} должно быть в диапазоне {$range[0]}-{$range[1]} В"
            );
        }
    }

    /**
     * Validate battery group configuration.
     *
     * @throws InvalidArgumentException
     */
    private function validateBatteryGroupConfig(SmartLightDevice $device, array $config): void
    {
        $deviceType = $device->device_type;

        $maxGroups = [
            'node_mcu_v3' => 10,
            'esp32' => 8,
            'esp8266' => 6,
            'raspberry_pi' => 4,
            'custom' => 15,
        ];

        $maxCount = $maxGroups[$deviceType] ?? 10;

        if (isset($config['count']) && $config['count'] > $maxCount) {
            throw new InvalidArgumentException(
                "Максимальное количество аккумуляторов для {$deviceType} в группе: {$maxCount}"
            );
        }

        $validTypes = ['series', 'parallel', 'series_parallel'];

        if (isset($config['type']) && !in_array($config['type'], $validTypes)) {
            throw new InvalidArgumentException(
                "Недопустимый тип соединения: {$config['type']}. Допустимые: " .
                implode(', ', $validTypes)
            );
        }
    }
}
