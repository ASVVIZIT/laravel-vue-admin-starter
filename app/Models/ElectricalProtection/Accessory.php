<?php

namespace App\Models\ElectricalProtection;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Accessory extends Model
{
    use HasFactory;

    protected $table = 'ep_accessories';

    protected $fillable = [
        'model',
        'name',
        'description',
        'cross_section',
        'cross_section_unit_id',
        'current_rating',
        'current_rating_unit_id',
        'quantity_per_pack',
        'quantity_per_pack_unit_id',
        'thickness',
        'thickness_unit_id',
        'rated_diff_current',
        'rated_diff_current_unit_id',
        'brand_id',
        'type_id',
        'series',
        'compatible_models',
        'voltage',
        'voltage_unit_id',
        'communication_protocol',
        'remote_control',
        'ip_rating',
        'mounting_type',
        'standards',
        'material'
    ];

    protected $casts = [
        'remote_control' => 'boolean',
    ];

    // Relationships
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(DeviceType::class, 'type_id');
    }

    public function crossSectionUnit(): BelongsTo
    {
        return $this->belongsTo(MeasurementUnit::class, 'cross_section_unit_id');
    }

    public function currentRatingUnit(): BelongsTo
    {
        return $this->belongsTo(MeasurementUnit::class, 'current_rating_unit_id');
    }

    public function quantityPerPackUnit(): BelongsTo
    {
        return $this->belongsTo(MeasurementUnit::class, 'quantity_per_pack_unit_id');
    }

    public function thicknessUnit(): BelongsTo
    {
        return $this->belongsTo(MeasurementUnit::class, 'thickness_unit_id');
    }

    public function ratedDiffCurrentUnit(): BelongsTo
    {
        return $this->belongsTo(MeasurementUnit::class, 'rated_diff_current_unit_id');
    }

    public function voltageUnit(): BelongsTo
    {
        return $this->belongsTo(MeasurementUnit::class, 'voltage_unit_id');
    }

    public function circuitBreakers()
    {
        return $this->belongsToMany(CircuitBreaker::class, 'ep_circuit_breaker_accessories');
    }

    // Scope для загрузки всех необходимых отношений
    public function scopeWithRelations($query)
    {
        return $query->with(['brand', 'type', 'crossSectionUnit', 'currentRatingUnit',
            'quantityPerPackUnit', 'thicknessUnit', 'ratedDiffCurrentUnit', 'voltageUnit']);
    }
}
