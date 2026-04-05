<?php

namespace App\Http\Requests\SmartLight\Core;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CoreUpdateDeviceSettingsRequest extends FormRequest
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
            'critical_voltage' => 'sometimes|numeric|min:2.5|max:14.4',
            'sleep_interval' => 'sometimes|integer|min:60|max:86400',
            'emergency_sleep_interval' => 'sometimes|integer|min:300|max:86400',
            'battery_group_config' => 'sometimes|array',
            'battery_group_config.enabled' => 'sometimes|boolean',
            'battery_group_config.type' => [
                'sometimes',
                Rule::requiredIf(function () {
                    return $this->input('battery_group_config.enabled', false);
                }),
                Rule::in(['series', 'parallel', 'series_parallel'])
            ],
            'battery_group_config.count' => [
                'sometimes',
                Rule::requiredIf(function () {
                    return $this->input('battery_group_config.enabled', false);
                }),
                'integer',
                'min:1',
                'max:15'
            ],
            'power_config' => 'sometimes|array',
            'power_config.shared_power_source' => 'sometimes|boolean',
            'power_config.controller_runtime' => 'sometimes|integer|min:3600|max:86400',
            'power_config.min_controller_voltage' => 'sometimes|numeric|min:2.0|max:3.0',
            'power_config.power_management_mode' => 'sometimes|in:conservative,aggressive,balanced'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'critical_voltage.min' => 'Критическое напряжение не может быть меньше 2.5В',
            'critical_voltage.max' => 'Критическое напряжение не может быть больше 14.4В',
            'sleep_interval.min' => 'Интервал сна не может быть меньше 60 секунд',
            'sleep_interval.max' => 'Интервал сна не может быть больше 24 часов',
            'emergency_sleep_interval.min' => 'Аварийный интервал не может быть меньше 5 минут',
            'emergency_sleep_interval.max' => 'Аварийный интервал не может быть больше 24 часов',
            'battery_group_config.type.required_if' => 'Тип группировки обязателен при включенной группировке',
            'battery_group_config.count.required_if' => 'Количество аккумуляторов обязательно при включенной группировке',
            'battery_group_config.count.max' => 'Максимальное количество аккумуляторов в группе - 15',
            'power_config.controller_runtime.min' => 'Минимальное время автономной работы контроллера - 1 час',
            'power_config.controller_runtime.max' => 'Максимальное время автономной работы контроллера - 24 часа',
            'power_config.min_controller_voltage.min' => 'Минимальное напряжение для работы контроллера не может быть меньше 2.0В',
            'power_config.min_controller_voltage.max' => 'Минимальное напряжение для работы контроллера не может быть больше 3.0В',
            'power_config.power_management_mode.in' => 'Недопустимый режим управления питанием. Допустимые: conservative, aggressive, balanced'
        ];
    }
}
