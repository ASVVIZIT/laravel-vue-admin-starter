<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\HtmlString;

// ============================================================================
// БАЗОВЫЕ ХЕЛПЕРЫ
// ============================================================================

if (!function_exists('responseSuccess')) {
    function responseSuccess($data = [], string $msg = 'Успешная операция', array $other = [], int $statusCode = 200): JsonResponse
    {
        $res = ['message' => $msg, 'data' => $data, 'code' => $statusCode];
        if (!empty($other)) $res = array_merge($res, $other);

        if ($data instanceof LengthAwarePaginator) {
            $arr = $data->toArray();
            $res['data'] = $arr['data'];
            $res['count'] = (int) $arr['total'];
            $res['pages'] = [
                'current_page' => (int) $arr['current_page'],
                'last_page' => (int) $arr['last_page'],
                'per_page' => (int) $arr['per_page'],
                'total' => (int) $arr['total'],
            ];
        }

        return response()->json($res);
    }
}

if (!function_exists('responseFailed')) {
    function responseFailed(string $msg = 'Операция завершилась неудачей', int $statusCode = 400, array $data = []): JsonResponse
    {
        return response()->json(['message' => $msg, 'data' => $data])->setStatusCode($statusCode);
    }
}

if (!function_exists('randomString')) {
    function randomString(int $length = 0): string
    {
        if ($length === 0) $length = mt_rand(10, 100);
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $result = '';
        for ($i = 0; $i < $length; $i++) {
            $result .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $result;
    }
}

if (!function_exists('randomDateTime')) {
    function randomDateTime(): \DateTime
    {
        $dt = new \DateTime();
        $dt->modify(sprintf('-%s hours', mt_rand(0, 1000)));
        return $dt;
    }
}

if (!function_exists('randomInArray')) {
    function randomInArray($array) { return $array[array_rand($array)]; }
}

if (!function_exists('randomBoolean')) {
    function randomBoolean(): bool { return (bool) mt_rand(0, 1); }
}

// ============================================================================
// VITE ASSETS
// ============================================================================

if (!function_exists('vite_assets')) {
    /**
     * Генерирует HTML-теги для подключения Vite ассетов
     */
    function vite_assets(string $entryPoint = 'resources/js/app.js'): HtmlString
    {
        $isProduction = app()->isProduction();

        // ==================== DEVELOPMENT MODE ====================
        if (!$isProduction) {
            $devServer = rtrim(env('VITE_DEV_SERVER_URL', 'http://localhost:5173'), '/');
            return new HtmlString(
                '<script type="module" src="' . $devServer . '/@vite/client"></script>' .
                '<script type="module" src="' . $devServer . '/' . ltrim($entryPoint, '/') . '"></script>'
            );
        }

        // ==================== PRODUCTION MODE ====================
        $manifestPath = public_path('build/manifest.json');

        if (!file_exists($manifestPath)) {
            Log::error('[Vite] manifest.json не найден');
            return new HtmlString('<!-- Vite manifest not found -->');
        }

        $manifest = json_decode(file_get_contents($manifestPath), true, 512, JSON_THROW_ON_ERROR);

        // 🔥 Поиск entry: по полному пути ИЛИ по basename
        $entry = $manifest[$entryPoint]
            ?? $manifest[pathinfo($entryPoint, PATHINFO_FILENAME)]
            ?? null;

        if (!$entry) {
            Log::error('[Vite] Entry не найден', [
                'entry_point' => $entryPoint,
                'available_keys' => array_keys($manifest),
            ]);
            return new HtmlString("<!-- Vite: entry '{$entryPoint}' not found -->");
        }

        $basePath = 'build/';
        $html = '';
        $preloaded = []; // ✅ Массив для уникальных preload

        // ✅ 1. Preload CSS
        foreach ($entry['css'] ?? [] as $css) {
            $html .= '<link rel="preload" as="style" href="' . asset($basePath . $css) . '">' . PHP_EOL;
        }

        // ✅ 2. Preload main JS
        if (!empty($entry['file'])) {
            $html .= '<link rel="modulepreload" href="' . asset($basePath . $entry['file']) . '">' . PHP_EOL;
            $preloaded[] = $entry['file'];
        }

        // ✅ 3. Preload dynamic imports (ИСПРАВЛЕНО: $html вместо $tags)
        foreach ($entry['dynamicImports'] ?? [] as $dynamicImport) {
            if (isset($manifest[$dynamicImport]['file'])) {
                $file = $manifest[$dynamicImport]['file'];
                if (!in_array($file, $preloaded)) {
                    $preloaded[] = $file;
                    // ✅ ИСПРАВЛЕНО: $html .= вместо $tags .=
                    $html .= '<link rel="modulepreload" href="' . asset($basePath . $file) . '">' . PHP_EOL;
                }
            }
        }

        // ✅ 4. Подключить CSS
        foreach ($entry['css'] ?? [] as $css) {
            $html .= '<link rel="stylesheet" href="' . asset($basePath . $css) . '">' . PHP_EOL;
        }

        // ✅ 5. Подключить main JS
        if (!empty($entry['file'])) {
            $html .= '<script type="module" src="' . asset($basePath . $entry['file']) . '"></script>' . PHP_EOL;
        }

        return new HtmlString($html);
    }
}

if (!function_exists('vite_public_assets')) {
    function vite_public_assets(): HtmlString
    {
        return vite_assets('resources/js/public/public.js');
    }
}

if (!function_exists('vite_admin_assets')) {
    function vite_admin_assets(): HtmlString
    {
        return vite_assets('resources/js/app.js');
    }
}
