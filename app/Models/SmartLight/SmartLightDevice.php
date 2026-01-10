<?php

namespace App\Models\SmartLight;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Services\SmartLight\PowerManager;

class SmartLightDevice extends Model
{
    use HasFactory;

    protected $table = 'smart_light_devices';

    protected $guarded = [];

    protected $fillable = [
        'user_id',
        'name',
        'device_id',
        'device_type',
        'battery_capacity',
        'critical_voltage',
        'sleep_interval',
        'emergency_sleep_interval',
        'status',
        'voltage',
        'api_key',
        'settings',
        'is_fake'
    ];

    protected $casts = [
        'settings' => 'array',
        'voltage' => 'float',
        'critical_voltage' => 'float',
        'sleep_interval' => 'integer',
        'emergency_sleep_interval' => 'integer',
        'is_fake' => 'boolean'
    ];

    public function telemetry()
    {
        return $this->hasMany(Telemetry::class, 'device_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function getEstimatedRuntimeAttribute()
    {
        return app(PowerManager::class)->calculateRuntime($this);
    }

    public function getSettingsAttribute($value)
    {
        return $value ? json_decode($value, true) : [
            'server_url' => config('app.url') . '/smart-light'
        ];
    }

    public function getCurrentTelemetryAttribute()
    {
        return $this->telemetry()->latest()->first();
    }

    public function isFake(): bool
    {
        return $this->is_fake;
    }
}
