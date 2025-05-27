<?php

namespace App\Models\ElectricalProtection;

use Illuminate\Database\Eloquent\Model;

class Accessory extends Model
{
    protected $table = 'ep_accessories';

    // Связь с брендом
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    // Связь с типом устройства
    public function type()
    {
        return $this->belongsTo(DeviceType::class);
    }

    // Связь с автоматами
    public function circuitBreakers()
    {
        return $this->belongsToMany(CircuitBreaker::class);
    }
}
