<?php

namespace App\Models\ElectricalProtection;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeasurementCategory extends Model
{
    use HasFactory;

    protected $table = 'ep_measurement_categories';

    protected $fillable = [
        'name',
        'description'
    ];

    public function units()
    {
        return $this->hasMany(MeasurementUnit::class, 'measurement_category_id');
    }
}
