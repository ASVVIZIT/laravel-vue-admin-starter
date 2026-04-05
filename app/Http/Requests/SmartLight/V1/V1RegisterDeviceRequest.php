<?php

namespace App\Http\Requests\SmartLight\V1;

use Illuminate\Foundation\Http\FormRequest;

class V1RegisterDeviceRequest extends FormRequest
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
            'mac_address' => 'required|string|regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/',
            'device_type' => 'required|string|in:node_mcu_v3,esp32,esp8266,custom',
            'hardware_version' => 'nullable|string|max:50',
            'firmware_version' => 'nullable|string|max:50',
            'initial_settings' => 'nullable|array'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'mac_address.regex' => 'MAC-адрес должен быть в формате AA:BB:CC:DD:EE:FF',
            'device_type.in' => 'Недопустимый тип устройства. Допустимые: node_mcu_v3, esp32, esp8266, custom',
            'hardware_version.max' => 'Версия оборудования не должна превышать 50 символов',
            'firmware_version.max' => 'Версия прошивки не должна превышать 50 символов'
        ];
    }
}
