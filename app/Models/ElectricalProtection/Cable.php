<?php

namespace App\Models\ElectricalProtection;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cable extends Model
{
    use HasFactory;
    protected $table = 'ep_cables';

    protected $fillable = [
        'model',
        'brand_id',
        'type_id',
        'insulation',
        'cores',
        'cross_section',
        'current_rating',
        'temperature_range_min',
        'temperature_range_max'
    ];

    // Переназначение Пути фабрики в папку ElectricalProtection
    protected static function newFactory()
    {
        return \Database\Factories\ElectricalProtection\CableFactory::new();
    }

    public function temperatureRangeMinUnit() {
        return $this->belongsTo(MeasurementUnit::class, 'temperature_range_min_unit_id');
    }
    public function temperatureRangeMaxUnit() {
        return $this->belongsTo(MeasurementUnit::class, 'temperature_range_max_unit_id');
    }


}
