<?php

namespace App\Http\Requests\SmartLight\Core;

use Illuminate\Foundation\Http\FormRequest;

class CoreForceSleepRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'reason' => 'nullable|string|max:255',
            'priority' => 'sometimes|integer|in:1,2,3',
            'emergency_mode' => 'sometimes|boolean'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'priority.in' => 'Приоритет должен быть от 1 (низкий) до 3 (высокий)',
            'reason.max' => 'Причина не должна превышать 255 символов'
        ];
    }
}
