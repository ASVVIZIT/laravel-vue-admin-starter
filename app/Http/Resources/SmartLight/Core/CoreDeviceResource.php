<?php

namespace App\Http\Resources\SmartLight\Core;

use Illuminate\Http\Resources\Json\JsonResource;

class CoreDeviceResource extends JsonResource
{
    public function toArray($request): array
    {
        // ✅ Безопасная обработка settings
        $settingsRaw = $this->settings; $settings = [];
        if (is_array($settingsRaw)) $settings = $settingsRaw;
        elseif (is_string($settingsRaw) && !empty($settingsRaw)) {
            $decoded = json_decode($settingsRaw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) $settings = $decoded;
        }

        // ✅ Синхронизация типов: приоритет settings над БД
        $batteryTypeId = $settings['battery_type_id'] ?? $this->battery_type_id;
        $bulbTypeId = $settings['bulb_type_id'] ?? $this->bulb_type_id;
        $powerSupplyId = $settings['power_supply_id'] ?? $this->power_supply_id;
        $groupConfig = $settings['battery_group_config'] ?? $this->battery_group_config;

        return [
            // === ИДЕНТИФИКАТОРЫ ===
            'id' => $this->id, 'device_id' => $this->device_id, 'name' => $this->name,
            'display_name' => $this->display_name, 'is_fake' => (bool) $this->is_fake,

            // === СТАТУС И ТЕЛЕМЕТРИЯ ===
            'device_type' => $this->device_type, 'status' => $this->status,
            'voltage' => (float) $this->voltage, 'intensity' => (int) ($this->intensity ?? 0),
            'battery_progress' => (float) $this->battery_progress,
            'voltage_color' => $this->voltage_color,
            'estimated_runtime' => $this->estimated_runtime,

            // === СПРАВОЧНИКИ (with-loaded) ===
            'battery_type' => $this->whenLoaded('batteryType', fn() => $this->batteryType?->only(['id','name','short_name'])),
            'bulb_type' => $this->whenLoaded('bulbType', fn() => $this->bulbType?->only(['id','name','short_name'])),
            'power_supply' => $this->whenLoaded('powerSupply', fn() => $this->powerSupply?->only(['id','name','short_name'])),

            // === НАСТРОЙКИ ДЛЯ ФОРМЫ ===
            'battery_type_id' => $batteryTypeId, 'bulb_type_id' => $bulbTypeId, 'power_supply_id' => $powerSupplyId,
            'form_settings' => array_merge([
                'critical_voltage' => (float) $this->critical_voltage,
                'sleep_interval' => (int) $this->sleep_interval,
                'emergency_sleep_interval' => (int) $this->emergency_sleep_interval,
                'battery_type_id' => $batteryTypeId, 'bulb_type_id' => $bulbTypeId,
                'power_supply_id' => $powerSupplyId, 'battery_group_config' => $groupConfig,
            ], $settings),

            // === МЕТА-ДАННЫЕ ===
            'battery_capacity' => (int) $this->battery_capacity,
            'settings_updated_at' => $this->settings_updated_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
