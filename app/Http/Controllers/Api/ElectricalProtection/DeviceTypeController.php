<?php

namespace App\Http\Controllers\Api\ElectricalProtection;

use App\Http\Controllers\Controller;
use App\Models\ElectricalProtection\DeviceType;
use Illuminate\Http\Request;

class DeviceTypeController extends Controller
{
    public function index(Request $request)
    {
        $types = DeviceType::query()
            ->orderBy('name')
            ->paginate($request->per_page ?? 100);

        return response()->json([
            'data' => $types,
            'meta' => [
                'total' => $types->total(),
                'current_page' => $types->currentPage()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'code' => 'required|string|unique:ep_device_types,code',
            'description' => 'nullable|string'
        ]);

        $type = DeviceType::create($validated);
        return response()->json($type, 201);
    }

    // ... show, update, destroy
}
