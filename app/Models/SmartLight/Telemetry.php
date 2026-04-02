<?php

namespace App\Models\SmartLight;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Telemetry extends Model
{
    use HasFactory;

    protected $table = 'smart_light_telemetry';

    protected $fillable = [
        'device_id',
        'voltage',
        'status',
        'intensity',
        'is_emergency',
        'received_at',
        'battery_temperature',
        'signal_strength',
        'uptime'
    ];

    protected $casts = [
        'voltage' => 'float',
        'intensity' => 'integer',
        'is_emergency' => 'boolean',
        'received_at' => 'datetime',
        'battery_temperature' => 'float',
        'signal_strength' => 'integer',
        'uptime' => 'integer'
    ];

    public function device()
    {
        return $this->belongsTo(SmartLightDevice::class);
    }
}
