<?php

namespace App\Http\Resources\CompanyContactChannel;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Company\CompanyResource;

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

            // КОМПАНИЯ (вложенный ресурс)
            'company' => new CompanyResource($this->whenLoaded('company')),

            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'logo_url' => $this->logo_url,
            'url' => $this->url,
            'identifier' => $this->identifier,
            'metadata' => $this->metadata,
            'order_column' => $this->order_column,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
