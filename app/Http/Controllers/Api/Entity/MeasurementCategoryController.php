<?php

namespace App\Http\Controllers\Api\Entity;

use App\Http\Controllers\Controller;
use App\Models\ElectricalProtection\MeasurementCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MeasurementCategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index(Request $request)
    {
        try {
            $categories = MeasurementCategory::all();
            return response()->json([
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            Log::error('MeasurementCategory index error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Ошибка при загрузке категорий измерений'
            ], 500);
        }
    }
}
