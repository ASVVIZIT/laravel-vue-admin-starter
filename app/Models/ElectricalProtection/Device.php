<?php

namespace App\Models\ElectricalProtection;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $table = 'ep_devices';
    protected $fillable = [
        'model', 'brand_id', 'type_id', 'unit_id',
        'nominal_current', 'trip_curve', 'poles',
        'breaking_capacity', 'is_main', 'rated_diff_current',
        'rcd_type', 'combined_protection'
    ];

    public function brand() {
        return $this->belongsTo(Brand::class);
    }

    public function type() {
        return $this->belongsTo(DeviceType::class);
    }
}
