<?php

namespace App\Http\Resources\TalkStream;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'content'      => $this->content,
            'type'         => $this->type ?? 'text',
            'from_id'      => $this->from_id,
            'to_id'        => $this->to_id,
            'read_at'      => $this->read_at?->toISOString(),
            'created_at'   => $this->created_at->toISOString(),
            'updated_at'   => $this->updated_at->toISOString(),
            // Виртуальное поле для удобства фронтенда (не сохраняется в БД)
            'is_mine'      => $this->from_id === $request->user()->id,
        ];
    }
}
