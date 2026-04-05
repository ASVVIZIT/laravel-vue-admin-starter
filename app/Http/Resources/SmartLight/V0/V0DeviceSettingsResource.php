<?php

namespace App\Http\Resources\SmartLight;

use Illuminate\Http\Resources\Json\JsonResource;

class V0DeviceSettingsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'device_id' => $this->device_id,
            'critical_voltage' => (float) $this->critical_voltage,
            'sleep_interval' => (int) $this->sleep_interval,
            'emergency_sleep_interval' => (int) $this->emergency_sleep_interval,
            'battery_group_config' => [
                'enabled' => (bool) ($this->settings['battery_group_config']['enabled'] ?? false),
                'type' => $this->settings['battery_group_config']['type'] ?? 'series',
                'count' => (int) ($this->settings['battery_group_config']['count'] ?? 1),
                'connections' => $this->settings['battery_group_config']['connections'] ?? []
            ],
            'power_config' => $this->settings['power_config'] ?? [
                    'shared_power_source' => true,
                    'controller_runtime' => 86400,
                    'min_controller_voltage' => 2.8,
                    'power_management_mode' => 'conservative'
                ],
            'updated_at' => $this->settings_updated_at?->format('Y-m-d H:i:s')
        ];
    }
}
