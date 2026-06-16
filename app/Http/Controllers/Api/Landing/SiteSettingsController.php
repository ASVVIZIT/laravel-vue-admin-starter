<?php

namespace App\Http\Controllers\Api\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SiteSettingsController extends Controller
{
    /**
     * GET /api/landing/settings/public-mode
     * Получить текущий режим сайта
     */
    public function getPublicMode(): JsonResponse
    {
        try {
            Log::info('🔵 [CONTROLLER] Запрос текущих настроек');

            $setting = SiteSetting::where('key', 'public_mode')->first();

            if (!$setting) {
                Log::info('⚠️ [CONTROLLER] Запись не найдена в БД, возвращаю дефолт');
                return response()->json([
                    'mode' => 'maintenance',
                    'active_landing_id' => null,
                    'maintenance_html' => $this->getDefaultMaintenanceHtml(),
                ]);
            }

            $value = $setting->value ?? [];

            Log::info('🟢 [CONTROLLER] Данные из БД:', [
                'mode' => $value['mode'] ?? 'не установлен',
                'has_html' => isset($value['maintenance_html']),
                'html_length' => isset($value['maintenance_html']) ? strlen($value['maintenance_html']) : 0,
                'html_preview' => isset($value['maintenance_html']) ? substr($value['maintenance_html'], 0, 100) : 'нет'
            ]);

            return response()->json([
                'mode' => $value['mode'] ?? 'maintenance',
                'active_landing_id' => $value['active_landing_id'] ?? null,
                'maintenance_html' => $value['maintenance_html'] ?? $this->getDefaultMaintenanceHtml(),
            ]);

        } catch (\Throwable $e) {
            Log::error('🔴 [CONTROLLER] Ошибка чтения настроек:', ['error' => $e->getMessage()]);
            return response()->json([
                'mode' => 'maintenance',
                'maintenance_html' => $this->getDefaultMaintenanceHtml(),
            ]);
        }
    }

    /**
     * POST /api/landing/settings/public-mode
     * Обновить режим сайта (полные настройки)
     */
    public function updatePublicMode(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'mode' => 'required|in:maintenance,landing,production,preview',
                'active_landing_id' => 'nullable|integer|exists:landing_pages,id',
                'maintenance_html' => 'nullable|string',
            ]);

            $currentSetting = SiteSetting::where('key', 'public_mode')->first();
            $currentValue = $currentSetting?->value ?? [];

            $newValue = array_merge($currentValue, [
                'mode' => $validated['mode'],
                'active_landing_id' => $validated['active_landing_id'] ?? null,
            ]);

            // Сохраняем HTML заглушки если передан
            if (isset($validated['maintenance_html'])) {
                $newValue['maintenance_html'] = $validated['maintenance_html'];
            }

            SiteSetting::updateOrCreate(
                ['key' => 'public_mode'],
                [
                    'value' => $newValue,
                    'description' => 'Режим работы публичной части',
                    'group' => 'public',
                ]
            );

            return response()->json([
                'message' => 'Режим обновлён',
                'mode' => $newValue['mode'],
                'active_landing_id' => $newValue['active_landing_id'],
            ]);

        } catch (\Throwable $e) {
            Log::error('[SiteSettingsController@updatePublicMode] Ошибка', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Ошибка обновления режима'], 500);
        }
    }

    /**
     * POST /api/landing/settings/switch/{mode}
     * Переключить режим (maintenance/landing/production/preview)
     */
    public function switchMode(string $mode): JsonResponse
    {
        try {
            if (!in_array($mode, ['maintenance', 'landing', 'production', 'preview'])) {
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

        } catch (\Throwable $e) {
            Log::error('[SiteSettingsController@switchMode] Ошибка', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Ошибка переключения режима'], 500);
        }
    }

    /**
     * POST /api/landing/settings/maintenance-html
     * Сохранить HTML заглушки
     */
    public function updateMaintenanceHtml(Request $request): JsonResponse
    {
        try {
            Log::info('🔵 [CONTROLLER] Получен запрос на сохранение HTML');
            Log::info('   Длина HTML:', ['length' => strlen($request->input('html', ''))]);

            $validated = $request->validate([
                'html' => 'required|string',
            ]);

            $currentSetting = SiteSetting::where('key', 'public_mode')->first();
            $currentValue = $currentSetting?->value ?? [];

            Log::info('🔵 [CONTROLLER] Текущее значение из БД:', ['value' => $currentValue]);

            $currentValue['maintenance_html'] = $validated['html'];

            Log::info(' [CONTROLLER] Новое значение для сохранения:', [
                'html_length' => strlen($currentValue['maintenance_html']),
                'first_100_chars' => substr($currentValue['maintenance_html'], 0, 100)
            ]);

            SiteSetting::updateOrCreate(
                ['key' => 'public_mode'],
                [
                    'value' => $currentValue,
                    'description' => 'Режим работы публичной части',
                    'group' => 'public',
                ]
            );

            Log::info('🟢 [CONTROLLER] HTML успешно сохранён в БД');

            return response()->json([
                'message' => 'HTML заглушки сохранён',
                'saved_length' => strlen($validated['html'])
            ]);

        } catch (\Throwable $e) {
            Log::error('🔴 [CONTROLLER] Ошибка сохранения HTML:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Ошибка сохранения HTML'], 500);
        }
    }

    /**
     * HTML заглушки по умолчанию
     */
    private function getDefaultMaintenanceHtml(): string
    {
        return <<<'HTML'
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Сайт в разработке</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%);
      color: #fff;
      font-family: system-ui, sans-serif;
      text-align: center;
      padding: 2rem;
    }
    .container { max-width: 600px; }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { font-size: 1.2rem; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚧 Сайт в разработке</h1>
    <p>Мы готовим что-то невероятное. Скоро открытие!</p>
  </div>
</body>
</html>
HTML;
    }
}
