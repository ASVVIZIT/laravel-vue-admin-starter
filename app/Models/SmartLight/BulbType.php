<?php

namespace App\Models\SmartLight;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BulbType extends Model
{
    protected $table = 'smart_light_bulb_types';

    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected $fillable = [
        'id', 'name', 'short_name', 'category',
        'light_efficiency', 'color_temperature', 'lifespan', 'visual_config',
    ];

    protected $casts = [
        'light_efficiency' => 'integer',
        'color_temperature' => 'integer',
        'lifespan' => 'integer',
        'visual_config' => 'array',
    ];

    public function devices(): HasMany
    {
        return $this->hasMany(SmartLightDevice::class, 'bulb_type_id', 'id');
    }
}
