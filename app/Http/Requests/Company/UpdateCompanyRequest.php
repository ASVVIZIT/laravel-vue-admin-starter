<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyRequest extends FormRequest
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
        // return $user && $user->can('update', $company);
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
        if ($this->filled('name')) {
            $rules['name'] = 'string|max:255';
        }
        if ($this->filled('description')) {
            $rules['description'] = 'string';
        }
        if ($this->filled('address')) {
            $rules['address'] = 'string|max:500';
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
            'name' => 'Название',
            'description' => 'Описание',
            'address' => 'Адрес',
        ];
    }
}
