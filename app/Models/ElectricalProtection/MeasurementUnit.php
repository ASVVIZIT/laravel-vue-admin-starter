<?php

namespace App\Models\ElectricalProtection;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeasurementUnit extends Model
{
    use HasFactory;

    protected $table = 'ep_measurement_units';

    protected $fillable = [
        'name',
        'symbol',
        'physical_quantity',
        'category'
    ];
}
