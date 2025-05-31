<?php

namespace App\Http\Controllers\Api\ElectricalProtection;

use App\Http\Controllers\Controller;
use App\Models\ElectricalProtection\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $query = Brand::query();

        // Фильтрация по стране
        if ($request->has('country')) {
            $query->where('country', $request->country);
        }

        // Пагинация (20 элементов по умолчанию)
        $brands = $query->paginate($request->per_page ?? 50);

        return response()->json([
            'data' => $brands->map(function ($brand) {
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'country' => $brand->country,
                    'website' => $brand->website,
                    'elements_count' => $brand->circuit_breakers_count
                        + $brand->rcds_count
                        + $brand->cables_count
                ];
            }),
            'meta' => [
                'total' => $brands->total(),
                'per_page' => $brands->perPage(),
                'current_page' => $brands->currentPage()
            ]
        ]);
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
