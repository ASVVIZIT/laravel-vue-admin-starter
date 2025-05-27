<?php

namespace App\Models\ElectricalProtection;

use Illuminate\Database\Eloquent\Model;

class MeasurementUnit extends Model
{
    protected $table = 'ep_measurement_units';
    protected $fillable = ['name', 'symbol', 'physical_quantity', 'category'];
}
