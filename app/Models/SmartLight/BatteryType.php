<?php

namespace App\Models\SmartLight;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BatteryType extends Model
{
    protected $table = 'smart_light_battery_types';

    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected $fillable = [
        'id', 'name', 'short_name', 'chemistry',
        'min_voltage', 'max_voltage', 'critical_voltage',
        'nominal_capacity', 'visual_config',
    ];

    protected $casts = [
        'min_voltage' => 'float',
        'max_voltage' => 'float',
        'critical_voltage' => 'float',
        'nominal_capacity' => 'integer',
        'visual_config' => 'array',
    ];

    public function devices(): HasMany
    {
        return $this->hasMany(SmartLightDevice::class, 'battery_type_id', 'id');
    }
}
