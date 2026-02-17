<?php

namespace App\Http\Resources\CompanyContactChannel;

use Illuminate\Http\Resources\Json\JsonResource;

class CompanyContactChannelResource extends JsonResource
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
            'company_id' => $this->company_id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'logo_url' => $this->logo_url,
            'url' => $this->url,
            'identifier' => $this->identifier,
            'metadata' => $this->metadata, // JSON-поле передаётся как есть
            'order_column' => $this->order_column,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
