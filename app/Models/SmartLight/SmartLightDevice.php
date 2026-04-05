<?php

namespace App\Models\SmartLight;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SmartLightDevice extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'smart_light_devices';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id', 'name', 'device_id', 'device_type',
        'battery_type_id', 'bulb_type_id', 'power_supply_id',
        'battery_capacity', 'critical_voltage', 'sleep_interval',
        'emergency_sleep_interval', 'status', 'voltage', 'intensity',
        'api_key', 'settings', 'is_fake', 'battery_group_config', 'settings_updated_at',
    ];

    protected $guarded = ['id', 'created_at', 'updated_at', 'deleted_at'];

    protected $casts = [
        'user_id' => 'integer',
        'battery_capacity' => 'integer',
        'critical_voltage' => 'float',
        'sleep_interval' => 'integer',
        'emergency_sleep_interval' => 'integer',
        'voltage' => 'float',
        'intensity' => 'integer',
        'is_fake' => 'boolean',
        'settings' => 'array',
        'battery_group_config' => 'array',
        'settings_updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // ОТНОШЕНИЯ
    public function user(): BelongsTo { return $this->belongsTo(\App\Models\User::class, 'user_id', 'id'); }
    public function batteryType(): BelongsTo { return $this->belongsTo(BatteryType::class, 'battery_type_id', 'id'); }
    public function bulbType(): BelongsTo { return $this->belongsTo(BulbType::class, 'bulb_type_id', 'id'); }
    public function powerSupply(): BelongsTo { return $this->belongsTo(PowerSupply::class, 'power_supply_id', 'id'); }
    public function telemetry(): HasMany { return $this->hasMany(Telemetry::class, 'device_id', 'id')->orderBy('received_at', 'desc'); }

    // АКСЕССОРЫ
    public function getMergedSettingsAttribute(): array
    {
        $dbSettings = [
            'critical_voltage' => $this->critical_voltage,
            'sleep_interval' => $this->sleep_interval,
            'emergency_sleep_interval' => $this->emergency_sleep_interval,
            'battery_type_id' => $this->battery_type_id,
            'bulb_type_id' => $this->bulb_type_id,
            'power_supply_id' => $this->power_supply_id,
            'battery_group_config' => $this->battery_group_config,
        ];
        return array_merge($dbSettings, $this->settings ?? []);
    }

    public function getCurrentTelemetryAttribute(): ?Telemetry { return $this->telemetry()->latest()->first(); }

    public function getBatteryProgressAttribute(): float
    {
        $v = $this->voltage ?? 0; $crit = $this->critical_voltage ?? 3.0; $max = 4.2;
        if ($v <= $crit) return 0; if ($v >= $max) return 100;
        return round((($v - $crit) / ($max - $crit)) * 100, 1);
    }

    public function getVoltageColorAttribute(): string
    {
        $v = $this->voltage ?? 0; $crit = $this->critical_voltage ?? 3.0;
        if ($v <= $crit) return '#f56c6c'; if ($v <= $crit + 0.3) return '#e6a23c'; return '#67c23a';
    }

    public function getDisplayNameAttribute(): string
    {
        $prefix = $this->is_fake ? '🎭 ' : '';
        $icon = match($this->status) { 'ON' => '🟢', 'OFF' => '⚪', 'SLEEPING' => '😴', 'ERROR' => '❌', default => '' };
        return "{$prefix}{$icon} {$this->name}";
    }

    // ✅ ПУБЛИЧНЫЙ АКСЕССОР (обязательно public!)
    public function getEstimatedRuntimeAttribute(): string
    {
        $capacity = $this->battery_capacity ?? 2000;
        $voltage = $this->voltage ?? 3.7;
        $consumption = 50 + ($this->intensity ?? 0) * 2.5;
        if ($consumption <= 0) return '∞';
        $hours = ($capacity * $voltage) / ($consumption * 3.7);
        if ($hours >= 24) return sprintf('%dд %dч', (int)($hours/24), (int)($hours%24));
        return sprintf('%dч %dм', (int)$hours, (int)(($hours%1)*60));
    }

    // МУТАТОРЫ
    public function setSettingsAttribute($value): void { $this->attributes['settings'] = is_array($value) ? json_encode($value) : $value; }
    public function setBatteryGroupConfigAttribute($value): void { $this->attributes['battery_group_config'] = is_array($value) ? json_encode($value) : $value; }

    // СКОУПЫ
    public function scopeReal($query) { return $query->where('is_fake', false); }
    public function scopeFake($query) { return $query->where('is_fake', true); }
    public function scopeActive($query) { return $query->whereNotIn('status', ['ERROR', 'OFF']); }
    public function scopeLowBattery($query) { return $query->whereColumn('voltage', '<=', 'critical_voltage'); }

    // ФРОНТЕНД-РЕСУРС
    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id, 'device_id' => $this->device_id, 'name' => $this->name,
            'display_name' => $this->display_name, 'device_type' => $this->device_type,
            'status' => $this->status, 'voltage' => $this->voltage,
            'voltage_color' => $this->voltage_color, 'battery_progress' => $this->battery_progress,
            'intensity' => $this->intensity ?? 0, 'battery_capacity' => $this->battery_capacity,
            'critical_voltage' => $this->critical_voltage,
            'estimated_runtime' => $this->estimated_runtime, // ✅ Вызов через свойство
            'battery_type' => $this->batteryType?->only(['id', 'name', 'short_name']),
            'bulb_type' => $this->bulbType?->only(['id', 'name', 'short_name']),
            'power_supply' => $this->powerSupply?->only(['id', 'name', 'short_name']),
            'settings' => $this->settings, 'battery_group_config' => $this->battery_group_config,
            'merged_settings' => $this->merged_settings, 'is_fake' => $this->is_fake,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'settings_updated_at' => $this->settings_updated_at?->toISOString(),
        ];
    }
}
