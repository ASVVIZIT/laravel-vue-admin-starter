<?php

namespace App\Http\Resources\SmartLight\Core;

use Illuminate\Http\Resources\Json\JsonResource;

class CoreDeviceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            // === ИДЕНТИФИКАТОРЫ ===
            'id' => $this->id,
            'device_id' => $this->device_id,
            'name' => $this->name,
            'display_name' => $this->display_name,
            'is_fake' => (bool) $this->is_fake,

            // === СТАТУС И ТЕЛЕМЕТРИЯ (только чтение) ===
            'device_type' => $this->device_type,
            'status' => $this->status,
            'voltage' => (float) $this->voltage,
            'intensity' => (int) ($this->intensity ?? 0),
            'battery_progress' => (float) $this->battery_progress,
            'voltage_color' => $this->voltage_color,
            'estimated_runtime' => $this->estimated_runtime,

            // === СПРАВОЧНИКИ (для отображения) ===
            'battery_type' => $this->batteryType?->only(['id', 'name', 'short_name']),
            'bulb_type' => $this->bulbType?->only(['id', 'name', 'short_name']),
            'power_supply' => $this->powerSupply?->only(['id', 'name', 'short_name']),

            // === НАСТРОЙКИ ДЛЯ ФОРМЫ (ЕДИНЫЙ ИСТОЧНИК) ===
            // ✅ ВСЕ редактируемые поля — только здесь
            'form_settings' => [
                'critical_voltage' => (float) $this->critical_voltage,
                'sleep_interval' => (int) $this->sleep_interval,
                'emergency_sleep_interval' => (int) $this->emergency_sleep_interval,
                'battery_type_id' => $this->battery_type_id,
                'bulb_type_id' => $this->bulb_type_id,
                'power_supply_id' => $this->power_supply_id,
                'battery_group_config' => $this->battery_group_config,
                // Дополнительные настройки из JSON
                ...(is_array($this->settings) ? $this->settings : []),
            ],

            // === МЕТА-ДАННЫЕ ===
            'battery_capacity' => (int) $this->battery_capacity,
            'settings_updated_at' => $this->settings_updated_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
