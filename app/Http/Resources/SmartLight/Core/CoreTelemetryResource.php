<?php

namespace App\Http\Resources\SmartLight\Core;

use Illuminate\Http\Resources\Json\JsonResource;

class CoreTelemetryResource extends JsonResource
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
            'device_id' => $this->device_id,
            'voltage' => (float) $this->voltage,
            'status' => $this->status,
            'intensity' => (int) $this->intensity,
            'is_emergency' => (bool) $this->is_emergency,
            'battery_temperature' => $this->battery_temperature ? (float) $this->battery_temperature : null,
            'signal_strength' => $this->signal_strength ? (int) $this->signal_strength : null,
            'uptime' => $this->uptime ? (int) $this->uptime : null,
            'received_at' => $this->received_at->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s')
        ];
    }
}
