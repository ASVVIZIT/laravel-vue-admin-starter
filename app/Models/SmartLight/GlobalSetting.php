<?php

namespace App\Models\SmartLight;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class GlobalSetting extends Model
{
    protected $table = 'smart_light_settings';
    protected $fillable = ['key', 'value'];
    public $timestamps = true;

    /**
     * Получить значение настройки по ключу
     */
    public static function get($key, $default = null)
    {
        try {
            $setting = self::where('key', $key)->first();
            $value = $setting ? $setting->value : $default;

            Log::channel('smartlight')->debug("GlobalSetting::get: {$key} = {$value}");

            return $value;
        } catch (\Exception $e) {
            Log::channel('smartlight')->error("GlobalSetting::get error for key {$key}: " . $e->getMessage());
            return $default;
        }
    }

    /**
     * Установить значение настройки
     */
    public static function set($key, $value)
    {
        try {
            $stringValue = $value !== null ? (string) $value : '';

            Log::channel('smartlight')->debug("GlobalSetting::set: {$key} = {$stringValue}");

            self::updateOrCreate(
                ['key' => $key],
                ['value' => $stringValue]
            );

            return true;
        } catch (\Exception $e) {
            Log::channel('smartlight')->error("GlobalSetting::set error for key {$key}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Получить все настройки
     */
    public static function getAll()
    {
        try {
            $settings = self::pluck('value', 'key')->toArray();

            Log::channel('smartlight')->debug("GlobalSetting::getAll retrieved", $settings);

            return $settings;
        } catch (\Exception $e) {
            Log::channel('smartlight')->error("GlobalSetting::getAll error: " . $e->getMessage());
            return [];
        }
    }
}
