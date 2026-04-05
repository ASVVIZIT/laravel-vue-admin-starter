<?php

namespace App\Http\Controllers\Api\SmartLight\V1;

use App\Http\Controllers\Api\SmartLight\Core\CoreTelemetryController;
use App\Http\Resources\SmartLight\V1\V1TelemetryResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class V1TelemetryController extends CoreTelemetryController
{
    /**
     * V1: История телеметрии (с пагинацией и фильтрацией)
     */
    public function index(Request $request, $device_id): JsonResponse
    {
        $device = \App\Models\SmartLight\SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('view', $device);

        $query = $device->telemetry();

        // Фильтрация по времени
        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->input('to'));
        }

        // Фильтрация по статусу
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Пагинация
        $perPage = min(500, max(1, $request->integer('per_page', 50)));
        $telemetry = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => V1TelemetryResource::collection($telemetry),
            'meta' => [
                'device_id' => $device_id,
                'current_page' => $telemetry->currentPage(),
                'per_page' => $telemetry->perPage(),
                'total' => $telemetry->total()
            ],
            'links' => [
                'first' => $telemetry->url(1),
                'last' => $telemetry->url($telemetry->lastPage()),
                'prev' => $telemetry->previousPageUrl(),
                'next' => $telemetry->nextPageUrl()
            ],
            'api_version' => '1.0.0'
        ]);
    }

    /**
     * V1: Сохранение телеметрии (с расширенной валидацией)
     */
    public function store(Request $request, $device_id): JsonResponse
    {
        $request->validate([
            'voltage' => 'required|numeric|min:2.0|max:5.0',
            'status' => 'required|in:ON,OFF,LOW_POWER,SLEEPING,ERROR',
            'intensity' => 'nullable|integer|min:0|max:100',
            'temperature' => 'nullable|numeric|min:-40|max:85',
            'emergency' => 'nullable|boolean',
            'timestamp' => 'nullable|iso8601'
        ]);

        $response = parent::store($request, $device_id);
        $data = $response->getData(true);

        // V1: добавляем метаданные
        $data['telemetry_id'] = \Str::uuid()->toString();
        $data['processed_at'] = now()->toISOString();
        $data['api_version'] = '1.0.0';

        return response()->json($data);
    }

    /**
     * V1: Агрегированная статистика по телеметрии
     */
    public function statistics(Request $request, $device_id): JsonResponse
    {
        $device = \App\Models\SmartLight\SmartLightDevice::where('device_id', $device_id)->firstOrFail();
        $this->authorize('view', $device);

        $period = $request->input('period', '24h');
        $interval = match($period) {
            '1h' => 'MINUTE',
            '6h' => 'MINUTE',
            '24h' => 'HOUR',
            '7d' => 'HOUR',
            '30d' => 'DAY',
            default => 'HOUR'
        };

        $stats = \DB::table('telemetry')
            ->where('device_id', $device->id)
            ->where('created_at', '>=', now()->sub($period))
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') as time_bucket,
                       AVG(voltage) as avg_voltage,
                       MIN(voltage) as min_voltage,
                       MAX(voltage) as max_voltage,
                       COUNT(*) as count")
            ->groupBy('time_bucket')
            ->orderBy('time_bucket')
            ->get();

        return response()->json([
            'data' => [
                'device_id' => $device_id,
                'period' => $period,
                'interval' => $interval,
                'statistics' => $stats
            ],
            'api_version' => '1.0.0'
        ]);
    }
}
