<?php

namespace App\Http\Resources\SmartLight\V0;

use Illuminate\Http\Resources\Json\JsonResource;

class V0CommandResource extends JsonResource
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
            'command_type' => $this->command_type,
            'command_data' => $this->command_data,
            'status' => $this->status,
            'executed_at' => $this->executed_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s')
        ];
    }
}
