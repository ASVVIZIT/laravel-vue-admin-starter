<?php

namespace App\Http\Controllers\Api\Entity;

use App\Http\Controllers\Controller;
use App\Models\ElectricalProtection\MeasurementUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MeasurementUnitController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index(Request $request)
    {
        try {
            $query = MeasurementUnit::with('category');

            // Поиск
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('symbol', 'LIKE', "%{$search}%")
                        ->orWhere('display_symbol', 'LIKE', "%{$search}%")
                        ->orWhere('physical_quantity', 'LIKE', "%{$search}%")
                        ->orWhereHas('category', function($q) use ($search) {
                            $q->where('name', 'LIKE', "%{$search}%")
                                ->orWhere('description', 'LIKE', "%{$search}%");
                        });
                });
            }

            // Режим для выпадающих списков (все записи)
            if ($request->boolean('for_dropdown')) {
                return response()->json([
                    'data' => $query->get()
                ]);
            }

            // Стандартный режим с пагинацией
            $perPage = $request->per_page ?? 10;
            $units = $query->paginate($perPage);

            return response()->json([
                'data' => $units->items(),
                'meta' => [
                    'total' => $units->total(),
                    'per_page' => $units->perPage(),
                    'current_page' => $units->currentPage(),
                    'last_page' => $units->lastPage()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('MeasurementUnit index error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при загрузке единиц измерений',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('ep_measurement_units', 'name')
                ],
                'symbol' => [
                    'required',
                    'string',
                    'max:10',
                    Rule::unique('ep_measurement_units', 'symbol')
                ],
                'display_symbol' => 'required|string|max:10',
                'physical_quantity' => 'required|string|max:50',
                'measurement_category_id' => 'required|exists:ep_measurement_categories,id',
            ]);

            $unit = MeasurementUnit::create($validated);
            $unit->load('category');

            return response()->json([
                'message' => 'Единица измерения успешно создана',
                'data' => $unit
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('MeasurementUnit store error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при создании единицы измерения',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $unit = MeasurementUnit::with('category')->findOrFail($id);
            return response()->json($unit);

        } catch (\Exception $e) {
            Log::error('MeasurementUnit show error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Единица измерения не найдена',
                'details' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $unit = MeasurementUnit::findOrFail($id);

            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('ep_measurement_units', 'name')->ignore($id)
                ],
                'symbol' => [
                    'required',
                    'string',
                    'max:10',
                    Rule::unique('ep_measurement_units', 'symbol')->ignore($id)
                ],
                'display_symbol' => 'required|string|max:10',
                'physical_quantity' => 'required|string|max:50',
                'measurement_category_id' => 'required|exists:ep_measurement_categories,id',
            ]);

            $unit->update($validated);
            $unit->load('category');

            return response()->json([
                'message' => 'Единица измерения обновлена',
                'data' => $unit
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('MeasurementUnit update error: ' . $e->getMessage());
            $status = $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500;
            return response()->json([
                'error' => $status === 404 ? 'Единица измерения не найдена' : 'Ошибка при обновлении единицы измерения',
                'details' => $e->getMessage()
            ], $status);
        }
    }

    public function destroy(string $id)
    {
        try {
            $unit = MeasurementUnit::findOrFail($id);
            $unit->delete();

            return response()->json(['message' => 'Единица измерения удалена']);

        } catch (\Exception $e) {
            Log::error('MeasurementUnit destroy error: ' . $e->getMessage());
            $status = $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500;
            return response()->json([
                'error' => $status === 404 ? 'Единица измерения не найдена' : 'Ошибка при удалении единицы измерения',
                'details' => $e->getMessage()
            ], $status);
        }
    }
}
