<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected $table = 'site_settings';

    protected $fillable = ['key', 'value', 'description', 'group'];

    protected $casts = ['value' => 'array'];

    protected static function boot()
    {
        parent::boot();

        static::saved(function ($setting) {
            Cache::forget('site_setting_' . $setting->key);
            Cache::forget('site_settings_' . $setting->group);
        });
    }

    public static function get(string $key, $default = null)
    {
        return Cache::remember('site_setting_' . $key, 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    public static function set(string $key, $value, ?string $description = null, string $group = 'general'): self
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'description' => $description, 'group' => $group]
        );
        Cache::forget('site_setting_' . $key);
        return $setting;
    }

    public static function getPublicMode(): array
    {
        return static::get('public_mode', [
            'mode' => 'maintenance',
            'active_landing_id' => null,
            'maintenance' => [
                'enabled' => true,
                'title' => 'Сайт в разработке',
                'message' => 'Мы готовим что-то невероятное',
                'target_date' => '2026-11-25T23:59:59',
                'show_countdown' => true,
            ],
        ]);
    }

    public static function switchMode(string $mode): self
    {
        $current = static::getPublicMode();
        $current['mode'] = $mode;
        return static::set('public_mode', $current, 'Режим работы публичной части', 'public');
    }

    public static function activateLanding(int $landingId): self
    {
        $current = static::getPublicMode();
        $current['mode'] = 'landing';
        $current['active_landing_id'] = $landingId;
        return static::set('public_mode', $current, 'Режим работы публичной части', 'public');
    }
}
