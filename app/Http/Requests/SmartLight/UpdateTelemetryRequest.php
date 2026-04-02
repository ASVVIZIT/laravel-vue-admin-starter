<?php

namespace App\Http\Requests\SmartLight;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTelemetryRequest extends FormRequest
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
            'voltage' => 'required|numeric|min:2.0|max:5.5',
            'status' => 'required|in:ON,OFF,SLEEPING,LOW_POWER',
            'intensity' => 'nullable|integer|min:0|max:100',
            'emergency' => 'sometimes|boolean',
            'received_at' => 'sometimes|date_format:Y-m-d\TH:i:s.uP',
            'battery_temperature' => 'nullable|numeric|min:-20|max:60',
            'signal_strength' => 'nullable|integer|min:-100|max:0',
            'uptime' => 'nullable|integer|min:0'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'voltage.min' => 'Напряжение не может быть ниже 2.0В',
            'voltage.max' => 'Напряжение не может быть выше 5.5В',
            'status.in' => 'Недопустимый статус. Допустимые: ON, OFF, SLEEPING, LOW_POWER',
            'intensity.min' => 'Яркость не может быть ниже 0%',
            'intensity.max' => 'Яркость не может быть выше 100%',
            'battery_temperature.min' => 'Температура не может быть ниже -20°C',
            'battery_temperature.max' => 'Температура не может быть выше 60°C',
            'signal_strength.min' => 'Уровень сигнала не может быть ниже -100 dBm',
            'signal_strength.max' => 'Уровень сигнала не может быть выше 0 dBm'
        ];
    }
}
