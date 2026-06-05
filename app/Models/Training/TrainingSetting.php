<?php

namespace App\Models\Training;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class TrainingSetting extends Model
{
    protected $fillable = ['key', 'value'];

    protected static function boot()
    {
        parent::boot();

        static::saved(fn() => Cache::forget('training_settings'));
        static::deleted(fn() => Cache::forget('training_settings'));
    }

    public static function get(string $key, $default = null)
    {
        $settings = Cache::remember('training_settings', 3600, function () {
            return static::pluck('value', 'key')->toArray();
        });

        return $settings[$key] ?? $default;
    }

    public static function set(string $key, $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function getTyped(string $key, $default = null)
    {
        $value = static::get($key);

        if ($value === null) return $default;
        if ($value === 'true') return true;
        if ($value === 'false') return false;
        if (is_numeric($value)) return strpos($value, '.') !== false ? (float)$value : (int)$value;

        $decoded = json_decode($value, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }
}
