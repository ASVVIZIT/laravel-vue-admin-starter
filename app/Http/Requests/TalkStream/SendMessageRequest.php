<?php

namespace App\Http\Requests\TalkStream;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'content' => 'required|string|max:' . config('talkstream.limits.max_message_length'),
            'to_id'   => 'required|integer|exists:users,id',
            'type'    => 'sometimes|string|in:text,image,file', // Для будущего медиа
        ];
    }
}
