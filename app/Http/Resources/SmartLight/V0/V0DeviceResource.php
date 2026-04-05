<?php

namespace App\Http\Resources\SmartLight;

use Illuminate\Http\Resources\Json\JsonResource;

class V0DeviceResource extends JsonResource
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
            'id' => $this->id,
            'user_id' => $this->user_id,
            'device_id' => $this->device_id,
            'name' => $this->name,
            'status' => $this->status,
            'voltage' => (float) $this->voltage,
            'intensity' => (int) $this->current_telemetry?->intensity ?? 100,
            'estimated_runtime' => $this->estimated_runtime,
            'critical_voltage' => (float) $this->critical_voltage,
            'battery_capacity' => (int) $this->battery_capacity,
            'device_type' => $this->device_type,
            'is_fake' => (bool) $this->is_fake,
            'last_telemetry_at' => $this->current_telemetry?->received_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            'settings' => $this->settings,
            'battery_group_config' => $this->battery_group_config
        ];
    }
}
