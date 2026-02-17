<?php

namespace App\Http\Requests\CompanyContactChannel;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactChannelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // $user = $this->user();
        // $company = $this->route('company'); // Получаем модель Company из маршрута
        // return $user && $user->can('createContactChannel', $company);
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
            'type' => 'required|in:social_network,messenger,messenger_group,gis_map,yandex_map,email,phone_number,website',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|url|max:2048',
            'url' => [
                'nullable',
                'max:2048',
                function ($attribute, $value, $fail) {
                    // Проверяем URL только если type предполагает его наличие
                    $typesRequiringUrl = ['social_network', 'messenger', 'messenger_group', 'website'];
                    $type = $this->input('type');
                    if (in_array($type, $typesRequiringUrl) && !filter_var($value, FILTER_VALIDATE_URL)) {
                        $fail("The {$attribute} field must be a valid URL when type is " . implode(', ', $typesRequiringUrl) . ".");
                    }
                },
            ],
            'identifier' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    // Проверяем identifier только если type предполагает его наличие
                    $typesRequiringIdentifier = ['email', 'phone_number', 'messenger', 'messenger_group'];
                    $type = $this->input('type');
                    if (in_array($type, $typesRequiringIdentifier)) {
                        if ($type === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $fail("The {$attribute} field must be a valid email address when type is email.");
                        }
                        // Для phone_number можно добавить более строгую проверку формата
                        // if ($type === 'phone_number' && !is_valid_phone_format($value)) { ... }
                    }
                },
            ],
            'metadata' => 'nullable|array',
            'order_column' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
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
            'type' => 'Тип канала',
            'title' => 'Название',
            'description' => 'Описание',
            'logo_url' => 'URL логотипа',
            'url' => 'URL',
            'identifier' => 'Идентификатор',
            'metadata' => 'Метаданные',
            'order_column' => 'Порядок',
            'is_active' => 'Активен',
        ];
    }
}
