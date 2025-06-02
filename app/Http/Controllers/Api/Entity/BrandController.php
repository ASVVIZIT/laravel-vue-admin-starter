<?php

namespace App\Http\Controllers\Api\Entity;

use App\Http\Controllers\Controller;
use App\Models\ElectricalProtection\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BrandController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index(Request $request)
    {
        try {
            $query = Brand::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('country', 'LIKE', "%{$search}%")
                        ->orWhere('website', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }

            // Режим для выпадающих списков (все записи)
            if ($request->boolean('for_dropdown')) {
                return response()->json([
                    'data' => $query->get()
                ]);
            }


            $perPage = $request->per_page ?? 10;
            $brands = $query->paginate($perPage);

            return response()->json([
                'data' => $brands->items(),
                'meta' => [
                    'total' => $brands->total(),
                    'per_page' => $brands->perPage(),
                    'current_page' => $brands->currentPage(),
                    'last_page' => $brands->lastPage()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Brand index error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при загрузке брендов',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::debug('Brand Store Request:', $request->all());

            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:100',
                    Rule::unique('ep_brands', 'name')
                ],
                'website' => [
                    'required',
                    'url',
                    'max:100',
                    Rule::unique('ep_brands', 'website')
                ],
                'country' => 'nullable|string|max:50',
                'description' => 'nullable|string|max:255',
            ]);

            $brand = Brand::create($validated);

            return response()->json([
                'message' => 'Бренд создан успешно',
                'data' => $brand
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Brand store error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при создании бренда',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $brand = Brand::findOrFail($id);
            return response()->json($brand);

        } catch (\Exception $e) {
            Log::error('Brand show error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Бренд не найден',
                'details' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $brand = Brand::findOrFail($id);

            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:100',
                    Rule::unique('ep_brands', 'name')->ignore($id)
                ],
                'website' => [
                    'required',
                    'url',
                    'max:100',
                    Rule::unique('ep_brands', 'website')->ignore($id)
                ],
                'country' => 'nullable|string|max:50',
                'description' => 'nullable|string|max:255',
            ]);

            $brand->update($validated);

            return response()->json([
                'message' => 'Бренд обновлён',
                'data' => $brand
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Brand update error: ' . $e->getMessage());
            $status = $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500;
            return response()->json([
                'error' => $status === 404 ? 'Бренд не найден' : 'Ошибка при обновлении бренда',
                'details' => $e->getMessage()
            ], $status);
        }
    }

    public function destroy(string $id)
    {
        try {
            $brand = Brand::findOrFail($id);
            $brand->delete();

            return response()->json(['message' => 'Бренд удалён']);

        } catch (\Exception $e) {
            Log::error('Brand destroy error: ' . $e->getMessage());
            $status = $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500;
            return response()->json([
                'error' => $status === 404 ? 'Бренд не найден' : 'Ошибка при удалении бренда',
                'details' => $e->getMessage()
            ], $status);
        }
    }
}
