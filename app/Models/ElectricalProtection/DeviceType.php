<?php

namespace App\Models\ElectricalProtection;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceType extends Model
{
    use HasFactory;
    protected $table = 'ep_device_types';
    protected $fillable = ['name', 'code', 'description'];
}
