<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'country', 'website'];

    public function circuitBreakers() {
        return $this->hasMany(CircuitBreaker::class);
    }

    public function rcds() {
        return $this->hasMany(RCD::class);
    }

    public function cables() {
        return $this->hasMany(Cable::class);
    }
}
