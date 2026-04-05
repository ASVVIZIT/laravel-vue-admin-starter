<?php
namespace App\Http\Resources\SmartLight\Core;

use Illuminate\Http\Resources\Json\JsonResource;

class CoreBatteryTypeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'short_name' => $this->short_name ?? null,
            'chemistry' => $this->chemistry ?? null,
            'specs' => [
                'min_voltage' => $this->min_voltage,
                'max_voltage' => $this->max_voltage,
                'critical_voltage' => $this->critical_voltage,
                'nominal_capacity_mah' => $this->nominal_capacity ?? null
            ],
            'created_at' => $this->created_at?->toISOString()
        ];
    }
}
