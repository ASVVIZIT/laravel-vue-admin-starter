<?php

namespace App\Http\Controllers\Api\SmartLight\Core;

use App\Http\Controllers\Controller;
use App\Models\SmartLight\GlobalSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CoreSettingsController extends Controller
{
    /**
     * Get global settings
     */
    public function index(Request $request)
    {
        try {
            $settings = GlobalSetting::getAll();

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('SettingsController::index error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка загрузки настроек'
            ], 500);
        }
    }

    /**
     * Update global settings
     */
    public function update(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'settings' => 'required|array',
                'settings.critical_voltage' => 'nullable|numeric|min:2.5|max:5.0',
                'settings.sleep_interval' => 'nullable|integer|min:60|max:86400',
                'settings.emergency_sleep_interval' => 'nullable|integer|min:300|max:86400',
                'settings.default_battery_type' => 'nullable|string',
                'settings.default_bulb_type' => 'nullable|string',
                'settings.default_power_supply' => 'nullable|string',
                'settings.power_management_mode' => 'nullable|in:conservative,balanced,aggressive',
                'settings.controller_runtime' => 'nullable|integer|min:3600|max:86400',
                'settings.min_controller_voltage' => 'nullable|numeric|min:2.0|max:3.0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации',
                    'errors' => $validator->errors()
                ], 422);
            }

            $settings = $request->input('settings');

            foreach ($settings as $key => $value) {
                if ($value !== null) {
                    GlobalSetting::set($key, $value);
                }
            }

            $updatedSettings = GlobalSetting::getAll();

            return response()->json([
                'success' => true,
                'message' => 'Настройки обновлены',
                'data' => $updatedSettings
            ]);
        } catch (\Exception $e) {
            Log::error('SettingsController::update error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка обновления настроек'
            ], 500);
        }
    }

    /**
     * Reset global settings
     */
    public function reset(Request $request)
    {
        try {
            GlobalSetting::set('critical_voltage', 3.2);
            GlobalSetting::set('sleep_interval', 600);
            GlobalSetting::set('emergency_sleep_interval', 3600);
            GlobalSetting::set('default_battery_type', 'li-ion-18650');
            GlobalSetting::set('default_bulb_type', 'classic');
            GlobalSetting::set('default_power_supply', 'standard');
            GlobalSetting::set('power_management_mode', 'balanced');
            GlobalSetting::set('controller_runtime', 86400);
            GlobalSetting::set('min_controller_voltage', 2.8);

            $settings = GlobalSetting::getAll();

            return response()->json([
                'success' => true,
                'message' => 'Настройки сброшены',
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('SettingsController::reset error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка сброса настроек'
            ], 500);
        }
    }
}
