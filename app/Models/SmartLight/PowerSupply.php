<?php

namespace App\Models\SmartLight;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PowerSupply extends Model
{
    protected $table = 'smart_light_power_supplies';

    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected $fillable = [
        'id', 'name', 'short_name', 'category',
        'voltage_range', 'current_range', 'visual_config',
    ];

    protected $casts = [
        'voltage_range' => 'array',
        'current_range' => 'array',
        'visual_config' => 'array',
    ];

    public function devices(): HasMany
    {
        return $this->hasMany(SmartLightDevice::class, 'power_supply_id', 'id');
    }
}
