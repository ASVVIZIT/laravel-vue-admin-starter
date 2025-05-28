<?php

namespace App\Models\ElectricalProtection;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model {

    use HasFactory;

    protected $table = 'ep_brands';

    protected $fillable = ['name', 'country', 'website', 'description'];

    // Переназначение Пути фабрики в папку ElectricalProtection
    protected static function newFactory()
    {
        return \Database\Factories\ElectricalProtection\BrandFactory::new();
    }

    public function circuitBreakers() {
        return $this->hasMany(CircuitBreaker::class);
    }

    public function cables() {
        return $this->hasMany(Cable::class);
    }
}
