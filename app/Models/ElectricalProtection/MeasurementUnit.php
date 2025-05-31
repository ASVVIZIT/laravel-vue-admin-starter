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
        'display_symbol',
        'physical_quantity',
        'measurement_category_id'
    ];

    public function category()
    {
        return $this->belongsTo(MeasurementCategory::class, 'measurement_category_id');
    }

    // Мутатор для приведения символа к нижнему регистру
    public function setSymbolAttribute($value)
    {
        $this->attributes['symbol'] = mb_strtolower($value);
    }

    // Аксессор для получения отображаемого символа
    public function getDisplaySymbolAttribute($value)
    {
        return $value ?: $this->symbol;
    }
}
