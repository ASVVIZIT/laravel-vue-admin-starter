<?php

namespace App\Http\Resources\SmartLight\Core;

use Illuminate\Http\Resources\Json\JsonResource;

class CorePowerSupplyResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'short_name' => $this->short_name ?? null,
            'category' => $this->category ?? null,
            'specs' => [
                'voltage_range' => $this->voltage_range ?? [],
                'current_range' => $this->current_range ?? []
            ],
            'created_at' => $this->created_at?->toISOString()
        ];
    }
}
