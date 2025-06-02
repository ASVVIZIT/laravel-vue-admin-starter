<?php

namespace App\Http\Controllers\Api\Entity;

use App\Http\Controllers\Controller;
use App\Models\ElectricalProtection\DeviceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DeviceTypeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index(Request $request)
    {
        try {
            $query = DeviceType::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('code', 'LIKE', "%{$search}%")
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
            $deviceTypes = $query->paginate($perPage);

            return response()->json([
                'data' => $deviceTypes->items(),
                'meta' => [
                    'total' => $deviceTypes->total(),
                    'per_page' => $deviceTypes->perPage(),
                    'current_page' => $deviceTypes->currentPage(),
                    'last_page' => $deviceTypes->lastPage()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('DeviceType index error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при загрузке типов устройств',
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
                    Rule::unique('ep_device_types', 'name')
                ],
                'code' => [
                    'required',
                    'string',
                    'max:20',
                    Rule::unique('ep_device_types', 'code')
                ],
                'description' => 'nullable|string|max:255',
            ]);

            $deviceType = DeviceType::create($validated);

            return response()->json([
                'message' => 'Тип устройства успешно создан',
                'data' => $deviceType
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('DeviceType store error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при создании типа устройства',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $deviceType = DeviceType::findOrFail($id);
            return response()->json($deviceType);

        } catch (\Exception $e) {
            Log::error('DeviceType show error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Тип устройства не найден',
                'details' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $deviceType = DeviceType::findOrFail($id);

            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('ep_device_types', 'name')->ignore($id)
                ],
                'code' => [
                    'required',
                    'string',
                    'max:20',
                    Rule::unique('ep_device_types', 'code')->ignore($id)
                ],
                'description' => 'nullable|string|max:255',
            ]);

            $deviceType->update($validated);

            return response()->json([
                'message' => 'Тип устройства обновлен',
                'data' => $deviceType
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('DeviceType update error: ' . $e->getMessage());
            $status = $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500;
            return response()->json([
                'error' => $status === 404 ? 'Тип устройства не найден' : 'Ошибка при обновлении типа устройства',
                'details' => $e->getMessage()
            ], $status);
        }
    }

    public function destroy(string $id)
    {
        try {
            $deviceType = DeviceType::findOrFail($id);
            $deviceType->delete();

            return response()->json(['message' => 'Тип устройства удален']);

        } catch (\Exception $e) {
            Log::error('DeviceType destroy error: ' . $e->getMessage());
            $status = $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500;
            return response()->json([
                'error' => $status === 404 ? 'Тип устройства не найден' : 'Ошибка при удалении типа устройства',
                'details' => $e->getMessage()
            ], $status);
        }
    }
}
