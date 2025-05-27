<?php

namespace App\Models\ElectricalProtection;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ElectricalProtection\BaseDevice;

class CircuitBreaker extends Model
{
    use HasFactory;
    protected $table = 'ep_circuit_breakers';
    protected $fillable = [
        'model', 'brand_id', 'type_id', 'unit_id',
        'nominal_current', 'trip_curve', 'poles',
        'breaking_capacity', 'is_main', 'rated_diff_current',
        'rcd_type', 'combined_protection',
        'voltage',
        'modular_size',
        'energy_class',
        'ip_rating',
        'terminal_type',
        'protection',
        'temperature_range_min',
        'temperature_range_max',
        'tripping_time',
        'pollution_degree',
        'housing_material',
        'standards'
    ];

    // Переназначение Пути фабрики в папку ElectricalProtection
    protected static function newFactory()
    {
        return \Database\Factories\ElectricalProtection\CircuitBreakerFactory::new();
    }

    public function brand() {
        return $this->belongsTo(Brand::class);
    }

    public function type() {
        return $this->belongsTo(DeviceType::class);
    }

    // Связь с аксессуарами
    public function accessories()
    {
        return $this->belongsToMany(Accessory::class, 'ep_circuit_breaker_accessories');
    }

    // Связи с единицами измерения
    public function nominalCurrentUnit() {
        return $this->belongsTo(MeasurementUnit::class, 'nominal_current_unit_id');
    }

    public function trippingTimeUnit() {
        return $this->belongsTo(MeasurementUnit::class, 'tripping_time_unit_id');
    }

    public function ratedDiffCurrentUnit() {
        return $this->belongsTo(MeasurementUnit::class, 'rated_diff_current_unit_id');
    }

    public function breakingCapacityUnit() {
        return $this->belongsTo(MeasurementUnit::class, 'breaking_capacity_unit_id');
    }

    public function temperatureRangeMinUnit() {
        return $this->belongsTo(MeasurementUnit::class, 'temperature_range_min_unit_id');
    }
    public function temperatureRangeMaxUnit() {
        return $this->belongsTo(MeasurementUnit::class, 'temperature_range_max_unit_id');
    }

}
