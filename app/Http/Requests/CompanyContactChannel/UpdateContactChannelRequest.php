<?php

namespace App\Http\Requests\CompanyContactChannel;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContactChannelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // $user = $this->user();
        // $company = $this->route('company');
        // $contactChannel = $this->route('contactChannel');
        // return $user && $user->can('update', [$contactChannel, $company]);
        return true; // Временно разрешаем всем
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        // Правила валидации применяются только если поле было передано в запросе
        $rules = [];
        if ($this->filled('company_id')) {
            $rules['company_id'] = 'integer|exists:companies,id';
        }
        if ($this->filled('type')) {
            $rules['type'] = 'in:social_network,messenger,messenger_group,gis_map,yandex_map,email,phone_number,website';
        }
        if ($this->filled('title')) {
            $rules['title'] = 'string|max:255';
        }
        if ($this->filled('description')) {
            $rules['description'] = 'string';
        }
        if ($this->filled('logo_url')) {
            $rules['logo_url'] = 'url|max:2048';
        }
        if ($this->filled('url')) {
            $rules['url'] = [
                'max:2048',
                function ($attribute, $value, $fail) {
                    $typesRequiringUrl = ['social_network', 'messenger', 'messenger_group', 'website'];
                    // Используем переданный тип из запроса или тип из существующей модели
                    $type = $this->input('type') ?? $this->route('contactChannel')?->type;
                    if (in_array($type, $typesRequiringUrl) && !filter_var($value, FILTER_VALIDATE_URL)) {
                        $fail("The {$attribute} field must be a valid URL when type is " . implode(', ', $typesRequiringUrl) . ".");
                    }
                },
            ];
        }
        if ($this->filled('identifier')) {
            $rules['identifier'] = [
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    $typesRequiringIdentifier = ['email', 'phone_number', 'messenger', 'messenger_group'];
                    $type = $this->input('type') ?? $this->route('contactChannel')?->type;
                    if (in_array($type, $typesRequiringIdentifier)) {
                        if ($type === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $fail("The {$attribute} field must be a valid email address when type is email.");
                        }
                    }
                },
            ];
        }
        if ($this->filled('metadata')) {
            $rules['metadata'] = 'array';
        }
        if ($this->filled('order_column')) {
            $rules['order_column'] = 'integer|min:0';
        }
        if ($this->filled('is_active')) {
            $rules['is_active'] = 'boolean';
        }

        return $rules;
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array
     */
    public function attributes()
    {
        return [
            'company_id' => 'ID компании',
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
