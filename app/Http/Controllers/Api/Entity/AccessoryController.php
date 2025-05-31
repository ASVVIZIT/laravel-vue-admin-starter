<?php

namespace App\Http\Controllers\Api\Entity;

use App\Http\Controllers\Controller;
use App\Models\ElectricalProtection\Accessory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AccessoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index(Request $request)
    {
        try {
            $query = Accessory::with(['brand', 'type', 'crossSectionUnit', 'currentRatingUnit',
                'quantityPerPackUnit', 'thicknessUnit', 'ratedDiffCurrentUnit', 'voltageUnit'])
                ->withCount('circuitBreakers');

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('model', 'LIKE', "%{$search}%")
                        ->orWhere('name', 'LIKE', "%{$search}%")
                        ->orWhere('series', 'LIKE', "%{$search}%")
                        ->orWhere('compatible_models', 'LIKE', "%{$search}%")
                        ->orWhereHas('brand', function($q) use ($search) {
                            $q->where('name', 'LIKE', "%{$search}%");
                        });
                });
            }

            $perPage = $request->per_page ?? 100;
            $accessories = $query->paginate($perPage);

            return response()->json([
                'data' => $accessories->items(),
                'meta' => [
                    'total' => $accessories->total(),
                    'per_page' => $accessories->perPage(),
                    'current_page' => $accessories->currentPage(),
                    'last_page' => $accessories->lastPage()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Accessory index error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при загрузке аксессуаров',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'model' => 'required|string|max:100|unique:ep_accessories,model',
                'name' => 'required|string|max:100',
                'description' => 'nullable|string',

                // Physical parameters
                'cross_section' => 'nullable|numeric',
                'cross_section_unit_id' => 'nullable|exists:ep_measurement_units,id',
                'current_rating' => 'nullable|integer',
                'current_rating_unit_id' => 'nullable|exists:ep_measurement_units,id',
                'quantity_per_pack' => 'nullable|integer',
                'quantity_per_pack_unit_id' => 'nullable|exists:ep_measurement_units,id',
                'thickness' => 'nullable|numeric',
                'thickness_unit_id' => 'nullable|exists:ep_measurement_units,id',
                'rated_diff_current' => 'nullable|integer',
                'rated_diff_current_unit_id' => 'nullable|exists:ep_measurement_units,id',

                // Relations
                'brand_id' => 'required|exists:ep_brands,id',
                'type_id' => 'required|exists:ep_device_types,id',

                // Technical parameters
                'series' => 'nullable|string|max:50',
                'compatible_models' => 'nullable|string|max:255',
                'voltage' => 'nullable|string|max:20',
                'voltage_unit_id' => 'nullable|exists:ep_measurement_units,id',
                'communication_protocol' => 'nullable|string|max:50',
                'remote_control' => 'boolean',
                'ip_rating' => 'nullable|string|max:10',
                'mounting_type' => 'nullable|string|max:50',
                'standards' => 'nullable|string|max:100',
                'material' => 'nullable|string|max:30',
            ]);

            $accessory = Accessory::create($validated);

            return response()->json([
                'message' => 'Аксессуар успешно создан',
                'data' => $accessory
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Accessory store error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при создании аксессуара',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $accessory = Accessory::with(['brand', 'type', 'crossSectionUnit', 'currentRatingUnit',
                'quantityPerPackUnit', 'thicknessUnit', 'ratedDiffCurrentUnit', 'voltageUnit'])
                ->findOrFail($id);

            return response()->json($accessory);

        } catch (\Exception $e) {
            Log::error('Accessory show error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Аксессуар не найден',
                'details' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $accessory = Accessory::findOrFail($id);

            $validated = $request->validate([
                'model' => [
                    'required',
                    'string',
                    'max:100',
                    Rule::unique('ep_accessories', 'model')->ignore($id)
                ],
                'name' => 'required|string|max:100',
                'description' => 'nullable|string',

                // Physical parameters
                'cross_section' => 'nullable|numeric',
                'cross_section_unit_id' => 'nullable|exists:ep_measurement_units,id',
                'current_rating' => 'nullable|integer',
                'current_rating_unit_id' => 'nullable|exists:ep_measurement_units,id',
                'quantity_per_pack' => 'nullable|integer',
                'quantity_per_pack_unit_id' => 'nullable|exists:ep_measurement_units,id',
                'thickness' => 'nullable|numeric',
                'thickness_unit_id' => 'nullable|exists:ep_measurement_units,id',
                'rated_diff_current' => 'nullable|integer',
                'rated_diff_current_unit_id' => 'nullable|exists:ep_measurement_units,id',

                // Relations
                'brand_id' => 'required|exists:ep_brands,id',
                'type_id' => 'required|exists:ep_device_types,id',

                // Technical parameters
                'series' => 'nullable|string|max:50',
                'compatible_models' => 'nullable|string|max:255',
                'voltage' => 'nullable|string|max:20',
                'voltage_unit_id' => 'nullable|exists:ep_measurement_units,id',
                'communication_protocol' => 'nullable|string|max:50',
                'remote_control' => 'boolean',
                'ip_rating' => 'nullable|string|max:10',
                'mounting_type' => 'nullable|string|max:50',
                'standards' => 'nullable|string|max:100',
                'material' => 'nullable|string|max:30',
            ]);

            $accessory->update($validated);

            return response()->json([
                'message' => 'Аксессуар успешно обновлен',
                'data' => $accessory
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Accessory update error: ' . $e->getMessage());
            $status = $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500;
            return response()->json([
                'error' => $status === 404 ? 'Аксессуар не найден' : 'Ошибка при обновлении аксессуара',
                'details' => $e->getMessage()
            ], $status);
        }
    }

    public function destroy(string $id)
    {
        try {
            $accessory = Accessory::findOrFail($id);
            $accessory->delete();

            return response()->json(['message' => 'Аксессуар успешно удален']);

        } catch (\Exception $e) {
            Log::error('Accessory destroy error: ' . $e->getMessage());
            $status = $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500;
            return response()->json([
                'error' => $status === 404 ? 'Аксессуар не найден' : 'Ошибка при удалении аксессуара',
                'details' => $e->getMessage()
            ], $status);
        }
    }
}
