<?php

namespace App\Models\ElectricalProtection;

use Illuminate\Database\Eloquent\Model;

class BaseDevice extends Model {
    protected $table = 'ep_device_types';

    public function circuitBreakers() {
        return $this->hasMany(CircuitBreaker::class, 'type_id');
    }

    public function cables() {
        return $this->hasMany(Cable::class, 'type_id');
    }
}
