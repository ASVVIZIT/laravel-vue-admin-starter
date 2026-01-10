<?php

namespace App\Http\Controllers\Api\SmartLight;

use App\Http\Controllers\Controller;
use App\Models\SmartLight\GlobalSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SettingsController extends Controller
{
    private $defaultSettings = [
        'global_server_url' => null,
        'default_critical_voltage' => 3.21,
        'default_sleep_interval' => 500,
        'default_emergency_sleep_interval' => 3600,
        'default_wifi_ssid' => '',
        'default_wifi_password' => '',
        'timezone' => 'Europe/Moscow',
        'log_level' => 'info',
        'telemetry_retention_days' => 60
    ];

    public function __construct()
    {
        // Инициализируем значения по умолчанию
        foreach ($this->defaultSettings as $key => $value) {
            if ($value === null) {
                $this->defaultSettings[$key] = config('app.url') . '/smart-light';
            }
        }
    }

    /**
     * Получение глобальных настроек
     */
    public function index(Request $request)
    {
        Log::channel('smartlight')->info('SettingsController@index called', [
            'user_id' => $request->user()?->id,
            'timestamp' => now()->toIso8601String()
        ]);

        try {
            $dbSettings = GlobalSetting::getAll();
            $settings = array_merge($this->defaultSettings, $dbSettings);
            $settings = $this->castSettingsTypes($settings);

            Log::channel('smartlight')->info('Final settings prepared', $settings);

            return response()->json([
                'success' => true,
                'message' => 'Настройки успешно загружены',
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            Log::channel('smartlight')->error('SettingsController@index error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка загрузки настроек: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Обновление глобальных настроек
     */
    public function update(Request $request)
    {
        Log::channel('smartlight')->info('SettingsController@update called', [
            'user_id' => $request->user()?->id,
            'raw_input' => $request->all(),
            'timestamp' => now()->toIso8601String()
        ]);

        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.default_critical_voltage' => 'nullable|numeric|min:2.5|max:4.3',
            'settings.default_sleep_interval' => 'nullable|integer|min:60|max:86400',
            'settings.default_emergency_sleep_interval' => 'nullable|integer|min:300|max:86400',
            'settings.default_wifi_ssid' => 'nullable|string|max:50',
            'settings.default_wifi_password' => 'nullable|string|max:50',
            'settings.timezone' => 'nullable|timezone',
            'settings.log_level' => 'nullable|in:debug,info,warning,error,critical',
            'settings.telemetry_retention_days' => 'nullable|integer|min:1|max:365'
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors()->toArray();
            Log::channel('smartlight')->warning('Validation failed', $errors);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации: ' . $validator->errors()->first(),
                'errors' => $errors
            ], 422);
        }

        try {
            $validatedData = $validator->validated();
            $settings = $validatedData['settings'];

            Log::channel('smartlight')->info('Validated settings', $settings);

            // Приводим типы данных к правильным форматам
            $settings = $this->castSettingsTypes($settings);

            // Сохраняем каждую настройку
            foreach ($settings as $key => $value) {
                if ($value !== null) {
                    GlobalSetting::set($key, $value);
                    Log::channel('smartlight')->info("Setting updated: {$key} = {$value}");
                }
            }

            // Получаем обновленные настройки
            $updatedSettings = GlobalSetting::getAll();
            $finalSettings = array_merge($this->defaultSettings, $updatedSettings);
            $finalSettings = $this->castSettingsTypes($finalSettings);

            Log::channel('smartlight')->info('Settings updated successfully', $finalSettings);

            return response()->json([
                'success' => true,
                'message' => 'Настройки успешно обновлены',
                'data' => $finalSettings
            ]);
        } catch (\Exception $e) {
            Log::channel('smartlight')->error('SettingsController@update error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка обновления настроек: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Сброс настроек к значениям по умолчанию
     */
    public function reset(Request $request)
    {
        Log::channel('smartlight')->info('SettingsController@reset called', [
            'user_id' => $request->user()?->id,
            'timestamp' => now()->toIso8601String()
        ]);

        try {
            foreach ($this->defaultSettings as $key => $value) {
                GlobalSetting::set($key, $value);
                Log::channel('smartlight')->info("Reset setting: {$key} = {$value}");
            }

            $resetSettings = GlobalSetting::getAll();
            $finalSettings = array_merge($this->defaultSettings, $resetSettings);
            $finalSettings = $this->castSettingsTypes($finalSettings);

            Log::channel('smartlight')->info('Settings reset successfully', $finalSettings);

            return response()->json([
                'success' => true,
                'message' => 'Настройки сброшены к значениям по умолчанию',
                'data' => $finalSettings
            ]);
        } catch (\Exception $e) {
            Log::channel('smartlight')->error('SettingsController@reset error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка сброса настроек: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Приведение типов данных настроек
     */
    private function castSettingsTypes(array $settings): array
    {
        $typeMap = [
            'default_critical_voltage' => 'float',
            'default_sleep_interval' => 'int',
            'default_emergency_sleep_interval' => 'int',
            'telemetry_retention_days' => 'int'
        ];

        foreach ($typeMap as $key => $type) {
            if (array_key_exists($key, $settings) && $settings[$key] !== null) {
                switch ($type) {
                    case 'float':
                        $settings[$key] = (float) $settings[$key];
                        break;
                    case 'int':
                        $settings[$key] = (int) $settings[$key];
                        break;
                }
                Log::channel('smartlight')->debug("Casted {$key} to {$type}: " . $settings[$key]);
            }
        }

        return $settings;
    }
}
