<?php

namespace App\Http\Controllers\Api\Entity;

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
        $brands = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $brands->map(function ($brand) {
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'country' => $brand->country,
                    'website' => $brand->website,
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
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:brands',
            'country' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:100',
            'description' => 'nullable|string|max:255',
        ]);

        $brand = Brand::create($validated);

        return response()->json([
            'message' => 'Бренд создан успешно',
            'data' => $brand
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['error' => 'Бренд не найден'], 404);
        }

        return response()->json($brand);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['error' => 'Бренд не найден'], 404);
        }

        $validated = $request->validate([
            'name' => 'string|max:100|unique:brands,name,' . $id,
            'country' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:100',
            'description' => 'nullable|string|max:255',
        ]);

        $brand->update($validated);

        return response()->json([
            'message' => 'Бренд обновлён',
            'data' => $brand
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['error' => 'Бренд не найден'], 404);
        }

        $brand->delete();

        return response()->json(['message' => 'Бренд удалён']);
    }
}
