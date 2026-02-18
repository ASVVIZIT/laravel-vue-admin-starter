<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompanyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // Проверка прав доступа (например, через Gate или Policy)
        // $user = $this->user();
        // return $user && $user->can('create', \App\Models\Company\Company::class);
        return true; // Временно разрешаем всем
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'settings' => 'nullable|array',
            'settings.icon' => 'nullable|string|max:255', // Пример: валидация конкретного ключа 'icon'
            'settings.color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/', // Пример: валидация цвета в формате #RRGGBB
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array
     */
    public function attributes()
    {
        return [
            'name' => 'Название',
            'description' => 'Описание',
            'address' => 'Адрес',
            'settings' => 'Настройки',
            'settings.icon' => 'Иконка', // Локализация для ключа icon в settings
            'settings.color' => 'Цвет',   // Локализация для ключа color в settings
        ];
    }
}
