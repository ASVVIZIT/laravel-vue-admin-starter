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
        'received_at'
    ];

    protected $casts = [
        'voltage' => 'float',
        'intensity' => 'integer',
        'is_emergency' => 'boolean',
        'received_at' => 'datetime'
    ];

    public function device()
    {
        return $this->belongsTo(SmartLightDevice::class);
    }
}
