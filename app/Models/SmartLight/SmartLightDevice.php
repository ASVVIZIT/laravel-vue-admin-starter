<?php

namespace App\Models\SmartLight;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

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
        'user_id' => 'integer', 'battery_capacity' => 'integer',
        'critical_voltage' => 'float', 'sleep_interval' => 'integer',
        'emergency_sleep_interval' => 'integer', 'voltage' => 'float',
        'intensity' => 'integer', 'is_fake' => 'boolean',
        'settings' => 'array', 'battery_group_config' => 'array',
        'settings_updated_at' => 'datetime', 'deleted_at' => 'datetime',
    ];

    // ========================================================================
    // 🔗 ОТНОШЕНИЯ
    // ========================================================================

    public function user(): BelongsTo
    {
        // ✅ Возвращаем SmartLightUser для доступа к методам прав
        return $this->belongsTo(SmartLightUser::class, 'user_id', 'id');
    }

    public function batteryType(): BelongsTo { return $this->belongsTo(BatteryType::class, 'battery_type_id', 'id'); }
    public function bulbType(): BelongsTo { return $this->belongsTo(BulbType::class, 'bulb_type_id', 'id'); }
    public function powerSupply(): BelongsTo { return $this->belongsTo(PowerSupply::class, 'power_supply_id', 'id'); }
    public function telemetry(): HasMany { return $this->hasMany(Telemetry::class, 'device_id', 'id')->orderBy('received_at', 'desc'); }

    // ========================================================================
    // 🧮 АКСЕССОРЫ
    // ========================================================================

    public function getMergedSettingsAttribute(): array
    {
        $dbSettings = [
            'critical_voltage' => $this->critical_voltage, 'sleep_interval' => $this->sleep_interval,
            'emergency_sleep_interval' => $this->emergency_sleep_interval, 'battery_type_id' => $this->battery_type_id,
            'bulb_type_id' => $this->bulb_type_id, 'power_supply_id' => $this->power_supply_id,
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

    public function getEstimatedRuntimeAttribute(): string
    {
        $capacity = $this->battery_capacity ?? 2000; $voltage = $this->voltage ?? 3.7;
        $consumption = 50 + ($this->intensity ?? 0) * 2.5;
        if ($consumption <= 0) return '∞';
        $hours = ($capacity * $voltage) / ($consumption * 3.7);
        if ($hours >= 24) return sprintf('%dд %dч', (int)($hours/24), (int)($hours%24));
        return sprintf('%dч %dм', (int)$hours, (int)(($hours%1)*60));
    }

    // ========================================================================
    // 🔍 СКОУПЫ (Делегируют логику в SmartLightUser)
    // ========================================================================

    public function scopeReal($query) { return $query->where('is_fake', false); }
    public function scopeFake($query) { return $query->where('is_fake', true); }
    public function scopeActive($query) { return $query->whereNotIn('status', ['ERROR', 'OFF']); }
    public function scopeLowBattery($query) { return $query->whereColumn('voltage', '<=', 'critical_voltage'); }

    /**
     * ✅ Главная фильтрация: автоматически применяет права текущего пользователя
     * Использование: SmartLightDevice::forSmartLightUser()->get();
     *
     * 🔥 ИСПРАВЛЕНО: Прямая проверка прав через Auth::user()->can() (без создания нового экземпляра)
     */
    public function scopeForSmartLightUser($query, $user = null)
    {
        $authUser = $user ?: Auth::user();
        if (!$authUser) return $query->whereRaw('1 = 0');

        // ✅ ПРЯМАЯ ПРОВЕРКА через существующий экземпляр пользователя
        // Это гарантирует, что права загружены и кэш Spatie работает корректно
        if ($authUser->can(\App\Models\Acl::PERMISSION_MANAGE_SMART_LIGHT)) {
            return $query; // Админ видит всё
        }

        if ($authUser->can(\App\Models\Acl::PERMISSION_MANAGE_OWN_SMART_LIGHT)) {
            return $query->where('user_id', $authUser->id); // Пользователь видит только свои
        }

        return $query->whereRaw('1 = 0'); // Нет прав — пусто
    }

    /**
     * Явный фильтр: только устройства текущего пользователя
     */
    public function scopeOnlyMySmartLights($query, $user = null)
    {
        $authUser = $user ?: Auth::user();
        return $authUser ? $query->where('user_id', $authUser->id) : $query->whereRaw('1 = 0');
    }

    // ========================================================================
    // 📤 ФРОНТЕНД-РЕСУРС
    // ========================================================================

    public function toFrontendArray(): array
    {
        $settingsRaw = $this->settings; $settings = [];
        if (is_array($settingsRaw)) $settings = $settingsRaw;
        elseif (is_string($settingsRaw) && !empty($settingsRaw)) {
            $decoded = json_decode($settingsRaw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) $settings = $decoded;
        }

        $batteryTypeId = $settings['battery_type_id'] ?? $this->battery_type_id;
        $bulbTypeId    = $settings['bulb_type_id'] ?? $this->bulb_type_id;
        $powerSupplyId = $settings['power_supply_id'] ?? $this->power_supply_id;
        $groupConfig   = $settings['battery_group_config'] ?? $this->battery_group_config;

        return [
            'id' => $this->id, 'device_id' => $this->device_id, 'name' => $this->name,
            'display_name' => $this->display_name, 'is_fake' => (bool) $this->is_fake,
            'device_type' => $this->device_type, 'status' => $this->status,
            'voltage' => (float) $this->voltage, 'intensity' => (int) ($this->intensity ?? 0),
            'battery_progress' => (float) $this->battery_progress, 'voltage_color' => $this->voltage_color,
            'estimated_runtime' => $this->estimated_runtime,
            'battery_type' => $this->whenLoaded('batteryType', fn() => $this->batteryType?->only(['id','name','short_name'])),
            'bulb_type' => $this->whenLoaded('bulbType', fn() => $this->bulbType?->only(['id','name','short_name'])),
            'power_supply' => $this->whenLoaded('powerSupply', fn() => $this->powerSupply?->only(['id','name','short_name'])),
            'battery_type_id' => $batteryTypeId, 'bulb_type_id' => $bulbTypeId, 'power_supply_id' => $powerSupplyId,
            'form_settings' => array_merge([
                'critical_voltage' => (float) $this->critical_voltage, 'sleep_interval' => (int) $this->sleep_interval,
                'emergency_sleep_interval' => (int) $this->emergency_sleep_interval,
                'battery_type_id' => $batteryTypeId, 'bulb_type_id' => $bulbTypeId,
                'power_supply_id' => $powerSupplyId, 'battery_group_config' => $groupConfig,
            ], $settings),
            'battery_capacity' => (int) $this->battery_capacity,
            'settings_updated_at' => $this->settings_updated_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(), 'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
