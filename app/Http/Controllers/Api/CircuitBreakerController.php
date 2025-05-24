<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CircuitBreaker;
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

        $breakers = $query->paginate($request->per_page ?? 25);

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


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
