<?php

namespace App\Http\Controllers\Api\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteSettingsController extends Controller
{
    /**
     * GET /api/landing/settings/public-mode
     */
    public function getPublicMode(): JsonResponse
    {
        $setting = SiteSetting::where('key', 'public_mode')->first();

        if (!$setting) {
            return response()->json([
                'mode' => 'maintenance',
                'active_landing_id' => null,
                'maintenance' => [
                    'enabled' => true,
                    'title' => 'Сайт в разработке',
                    'message' => 'Мы готовим что-то невероятное',
                    'target_date' => '2026-11-25T23:59:59',
                    'show_countdown' => true,
                ],
                'landing' => ['enabled' => false, 'page_id' => null],
                'production' => ['enabled' => false, 'features' => []],
            ]);
        }

        return response()->json($setting->value);
    }

    /**
     * POST /api/landing/settings/public-mode
     */
    public function updatePublicMode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => 'required|in:maintenance,landing,production',
            'active_landing_id' => 'nullable|integer|exists:landing_pages,id',
            'maintenance' => 'nullable|array',
            'landing' => 'nullable|array',
            'production' => 'nullable|array',
        ]);

        $setting = SiteSetting::updateOrCreate(
            ['key' => 'public_mode'],
            [
                'value' => $validated,
                'description' => 'Режим работы публичной части',
                'group' => 'public',
            ]
        );

        return response()->json($setting->value);
    }

    /**
     * POST /api/landing/settings/switch/{mode}
     */
    public function switchMode(string $mode): JsonResponse
    {
        if (!in_array($mode, ['maintenance', 'landing', 'production'])) {
            return response()->json(['error' => 'Недопустимый режим'], 400);
        }

        $setting = SiteSetting::where('key', 'public_mode')->first();
        $value = $setting?->value ?? [];

        $value['mode'] = $mode;

        SiteSetting::updateOrCreate(
            ['key' => 'public_mode'],
            [
                'value' => $value,
                'description' => 'Режим работы публичной части',
                'group' => 'public',
            ]
        );

        return response()->json([
            'message' => "Режим переключён на: {$mode}",
            'mode' => $mode,
        ]);
    }
}
