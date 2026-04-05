<?php

namespace App\Http\Resources\SmartLight\Core;

use Illuminate\Http\Resources\Json\JsonResource;

class CoreBulbTypeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'short_name' => $this->short_name ?? null,
            'category' => $this->category ?? null,
            'specs' => [
                'light_efficiency_lm_w' => $this->light_efficiency ?? null,
                'color_temperature_k' => $this->color_temperature ?? null,
                'lifespan_hours' => $this->lifespan ?? null
            ],
            'created_at' => $this->created_at?->toISOString()
        ];
    }
}
