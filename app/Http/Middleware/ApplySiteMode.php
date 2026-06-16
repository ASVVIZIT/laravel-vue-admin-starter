<?php

namespace App\Http\Middleware;

use App\Models\Landing\SiteSetting;
use App\Models\Landing\LandingPage;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ApplySiteMode
{
    public function handle(Request $request, Closure $next): Response
    {
        // Игнорируем админку, API, статические файлы и favicon
        if ($request->is('admin*') ||
            $request->is('api*') ||
            $request->is('build*') ||
            $request->is('favicon.ico') ||
            $request->is('_debugbar*')) {
            return $next($request);
        }

        // ✅ Используем метод get() с кэшем (НЕ прямой запрос!)
        $config = SiteSetting::get('public_mode', [
            'mode' => 'production',
            'active_landing_id' => null,
            'maintenance_html' => null,
        ]);

        $mode = $config['mode'] ?? 'production';

        Log::info('[ApplySiteMode] Режим сайта', [
            'mode' => $mode,
            'url' => $request->url(),
            'has_html' => isset($config['maintenance_html']),
            'html_length' => isset($config['maintenance_html']) ? strlen($config['maintenance_html']) : 0,
        ]);

        // ====================================================================
        // 1. РЕЖИМ ЗАГЛУШКИ (Maintenance)
        // ====================================================================
        if ($mode === 'maintenance') {
            $html = $config['maintenance_html'] ?? $this->getDefaultMaintenanceHtml();

            Log::info('[ApplySiteMode] Отдаю HTML заглушки', [
                'length' => strlen($html),
                'from_db' => isset($config['maintenance_html']),
                'preview' => substr($html, 0, 100),
            ]);

            return response($html, 200)
                ->header('Content-Type', 'text/html; charset=UTF-8')
                ->header('X-Site-Mode', 'maintenance');
        }

        // ====================================================================
        // 2. РЕЖИМ ЛЕНДИНГА (Landing)
        // ====================================================================
        if ($mode === 'landing') {
            $landingId = $config['active_landing_id'] ?? null;

            if ($landingId) {
                $landing = LandingPage::where('id', $landingId)
                    ->where('is_published', true)
                    ->first();

                if ($landing) {
                    Log::info('[ApplySiteMode] Редирект на лендинг', [
                        'landing_id' => $landingId,
                        'slug' => $landing->slug,
                    ]);

                    return redirect('/l/' . $landing->slug, 302)
                        ->header('X-Site-Mode', 'landing');
                }
            }

            // Если лендинг не найден — фолбэк на заглушку
            $html = $config['maintenance_html'] ?? '<h1>Лендинг не найден</h1>';
            Log::warning('[ApplySiteMode] Лендинг не найден, фолбэк на заглушку', [
                'landing_id' => $landingId,
            ]);

            return response($html, 200)
                ->header('Content-Type', 'text/html; charset=UTF-8')
                ->header('X-Site-Mode', 'landing-fallback');
        }

        // ====================================================================
        // 3. РЕЖИМ ПРОДАКШН (Production)
        // ====================================================================
        if ($mode === 'production') {
            Log::info('[ApplySiteMode] Production режим — пропускаем запрос');
            return $next($request);
        }

        // ====================================================================
        // 4. РЕЖИМ ПРЕВЬЮ (Preview)
        // ====================================================================
        if ($mode === 'preview') {
            Log::info('[ApplySiteMode] Preview режим — пропускаем запрос');
            return $next($request);
        }

        // ====================================================================
        // ФОЛБЭК: неизвестный режим
        // ====================================================================
        Log::warning('[ApplySiteMode] Неизвестный режим: ' . $mode);
        return $next($request);
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            font-family: system-ui, -apple-system, sans-serif;
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
            background-clip: text;
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
