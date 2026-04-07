<?php

namespace App\Http\Resources\SmartLight\Core;

use Illuminate\Http\Resources\Json\JsonResource;

class CoreDeviceSettingsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request): array
    {
        return [
            'device_id' => $this->device_id,
            'form_settings' => array_merge([
                'critical_voltage' => (float) $this->critical_voltage,
                'sleep_interval' => (int) $this->sleep_interval,
                'emergency_sleep_interval' => (int) $this->emergency_sleep_interval,
                'battery_type_id' => $this->battery_type_id,
                'bulb_type_id' => $this->bulb_type_id,
                'power_supply_id' => $this->power_supply_id,
                'battery_group_config' => $this->battery_group_config,
            ], is_array($this->settings) ? $this->settings : []),
            'settings_updated_at' => $this->settings_updated_at?->toISOString(),
        ];
    }
}
