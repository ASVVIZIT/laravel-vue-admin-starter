<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CircuitBreaker extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand_id',
        'model',
        'nominal_current',
        'device_type',
        'trip_curve',
        'poles',
        'breaking_capacity',
        'voltage',
        'modular_size',
        'energy_class',
        'ip_rating',
        'terminal_type',
        'protection'
    ];

    public function brand() {
        return $this->belongsTo(Brand::class);
    }
}
