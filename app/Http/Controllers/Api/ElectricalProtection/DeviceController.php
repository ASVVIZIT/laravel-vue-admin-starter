<?php

namespace App\Http\Controllers\Api\ElectricalProtection;

use App\Http\Controllers\Controller;
use App\Models\ElectricalProtection\Device;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        return Device::with(['brand', 'type', 'unit'])->paginate(20);
    }
}
