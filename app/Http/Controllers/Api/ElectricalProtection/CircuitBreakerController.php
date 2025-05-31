<?php

namespace App\Http\Controllers\Api\ElectricalProtection;

use App\Http\Controllers\Controller;
use App\Models\ElectricalProtection\Brand;
use App\Models\ElectricalProtection\DeviceType;
use App\Models\ElectricalProtection\MeasurementUnit;
use App\Models\ElectricalProtection\CircuitBreaker;
use Illuminate\Http\Request;

class CircuitBreakerController extends Controller
{
    public function index(Request $request)
    {
        $query = CircuitBreaker::with(['brand:id,name,website']);

        // Фильтры из запроса
        $filters = $request->only([
            'nominal_current',
            'trip_curve',
            'poles',
            'breaking_capacity'
        ]);

        foreach ($filters as $field => $value) {
            $query->where($field, $value);
        }

        // Сортировка по умолчанию
        $query->orderBy('nominal_current')->orderBy('model');

        $breakers = $query->paginate($request->per_page ?? 100);

        return response()->json([
            'data' => $breakers->map(function ($breaker) {
                return [
                    'id' => $breaker->id,
                    'model' => $breaker->model,
                    'nominal_current' => $breaker->nominal_current . 'A',
                    'trip_curve' => $breaker->trip_curve,
                    'poles' => $breaker->poles,
                    'breaking_capacity' => $breaker->breaking_capacity,
                    'brand' => $breaker->brand,
                    'technical' => [
                        'voltage' => $breaker->voltage,
                        'ip_rating' => $breaker->ip_rating,
                        'standards' => $breaker->standards
                    ]
                ];
            }),
            'meta' => $this->getPaginationMeta($breakers)
        ]);
    }

    private function getPaginationMeta($paginator)
    {
        return [
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage()
        ];
    }


    public function create() {
        $brands = Brand::all();
        $types = DeviceType::all();
        $currentUnits = MeasurementUnit::where('category', 'current')->get();
        $timeUnits = MeasurementUnit::where('category', 'time')->get();

        return view('circuit_breakers.create', compact(
            'brands',
            'types',
            'currentUnits',
            'timeUnits'
        ));
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) {
        $validated = $request->validate([
            'nominal_current' => 'required|integer',
            'nominal_current_unit_id' => 'required|exists:ep_measurement_units,id',
            'tripping_time' => 'nullable|integer',
            'tripping_time_unit_id' => 'nullable|exists:ep_measurement_units,id',
            // ... другие поля
        ]);

        CircuitBreaker::create($validated);
        return redirect()->route('breakers.index');
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
