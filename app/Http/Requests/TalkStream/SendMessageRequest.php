<?php

namespace App\Http\Requests\TalkStream;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // 🔥 Читаем лимит из конфига с фолбэком на 5000, если конфиг вдруг недоступен
        $maxLength = config('talkstream.limits.max_message_length', 5000);

        return [
            'to_id' => 'required|exists:users,id',
            'content' => [
                'required',
                'string',
                'max:' . $maxLength,
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $maxLength = config('talkstream.limits.max_message_length', 5000);

        return [
            'to_id.exists' => 'Пользователь не найден.',
            'content.max' => "Длина сообщения не должна превышать {$maxLength} символов.",
        ];
    }
}
