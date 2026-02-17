<?php

namespace App\Http\Resources\Company;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\CompanyContactChannel\CompanyContactChannelResource; // Обновлённый путь к ресурсу

class CompanyResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'address' => $this->address,
            // Пример: передаём количество каналов связи (если использовался withCount)
            'contact_channels_count' => $this->when(isset($this->contact_channels_count), $this->contact_channels_count),
            // Передаём связанные каналы связи (если они были загружены, например, через load)
            'contact_channels' => CompanyContactChannelResource::collection($this->whenLoaded('contactChannels')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
