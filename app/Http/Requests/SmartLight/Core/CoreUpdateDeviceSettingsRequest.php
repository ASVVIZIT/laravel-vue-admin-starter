<?php

namespace App\Http\Requests\SmartLight\Core;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CoreUpdateDeviceSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Авторизация проверяется в контроллере через Policy
    }

    public function rules(): array
    {
        return [
            // Поля устройства (из таблицы)
            'critical_voltage' => 'nullable|numeric|min:2.0|max:5.0',
            'sleep_interval' => 'nullable|integer|min:60|max:86400',
            'emergency_sleep_interval' => 'nullable|integer|min:300|max:86400',
            'battery_type_id' => ['nullable', 'string', Rule::exists('smart_light_battery_types', 'id')],
            'bulb_type_id' => ['nullable', 'string', Rule::exists('smart_light_bulb_types', 'id')],
            'power_supply_id' => ['nullable', 'string', Rule::exists('smart_light_power_supplies', 'id')],

            // JSON: группировка батарей
            'battery_group_config' => 'nullable|array',
            'battery_group_config.enabled' => 'nullable|boolean',
            'battery_group_config.type' => 'nullable|in:series,parallel,series_parallel',
            'battery_group_config.count' => 'nullable|integer|min:1|max:15',

            // JSON: дополнительные настройки (разрешаем только известные ключи)
            'settings' => 'nullable|array',
            'settings.power_management_mode' => 'nullable|in:conservative,balanced,aggressive',
            'settings.server_url' => 'nullable|url',
        ];
    }

    public function messages(): array
    {
        return [
            'critical_voltage.min' => 'Критическое напряжение не может быть меньше 2.0 В',
            'critical_voltage.max' => 'Критическое напряжение не может быть больше 5.0 В',
            'sleep_interval.min' => 'Интервал сна не может быть меньше 60 секунд',
            'battery_group_config.count.max' => 'Максимум 15 элементов в группе',
        ];
    }
}
