<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\HtmlString;

/**
 * ============================================================================
 * GLOBAL HELPER FUNCTIONS — FenixPortal
 * ============================================================================
 *
 * 📁 Файл: app/helpers.php
 * 📝 Описание: Глобальные хелпер-функции приложения
 * 🔗 Подключён: composer.json → autoload.files
 *
 * ============================================================================
 * 🔥 IDE HINTS — Объявления функций для PhpStorm (только для автодополнения)
 * ============================================================================
 *
 * Эти объявления нужны ТОЛЬКО для IDE. Они не выполняются (обёрнуты в
 * if (false)), но PhpStorm видит их и подсвечивает вызовы жёлтым цветом.
 *
 * Реальные функции определены ниже внутри if (!function_exists()) блоков.
 */

if (false) {
    /**
     * Success response
     *
     * @param array|LengthAwarePaginator $data
     * @param string $msg
     * @param array $other
     * @param int $statusCode
     * @return JsonResponse
     */
    function responseSuccess($data = [], string $msg = 'Успешная операция', array $other = [], int $statusCode = 200): JsonResponse {}

    /**
     * Error response
     *
     * @param string $msg
     * @param int $statusCode
     * @param array $data
     * @return JsonResponse
     */
    function responseFailed(string $msg = 'Операция завершилась неудачей', int $statusCode = 400, array $data = []): JsonResponse {}

    /**
     * Return random string with $length
     *
     * @param int $length
     * @return string
     */
    function randomString(int $length = 0): string {}

    /**
     * Return random DateTime in past
     *
     * @return \DateTime
     */
    function randomDateTime(): \DateTime {}

    /**
     * Return random element from array
     *
     * @param array $array
     * @return mixed
     */
    function randomInArray($array) {}

    /**
     * Return random boolean
     *
     * @return bool
     */
    function randomBoolean(): bool {}

    /**
     * Генерирует HTML-теги для подключения Vite ассетов
     * Автоматически определяет режим (production/development/docker)
     *
     * @param string $entryPoint Entry point (по умолчанию 'resources/js/app.js')
     * @return HtmlString
     */
    function vite_assets(string $entryPoint = 'resources/js/app.js'): HtmlString {}

    /**
     * Генерирует HTML-теги для публичной части (public.js)
     * Обёртка над vite_assets() с предопределённым entry point
     *
     * @return HtmlString
     */
    function vite_public_assets(): HtmlString {}
}

/**
 * ============================================================================
 * РЕАЛЬНЫЕ ФУНКЦИИ (определены ниже)
 * ============================================================================
 */

if (!function_exists('responseSuccess')) {
    /**
     * Success response
     *
     * @param array|LengthAwarePaginator $data
     * @param string $msg
     * @param array $other
     * @param int $statusCode
     * @return JsonResponse
     */
    function responseSuccess($data = [], string $msg = 'Успешная операция', array $other = [], int $statusCode = 200): JsonResponse
    {
        $res = [
            'message' => $msg,
            'data' => $data,
            'code' => $statusCode,
        ];

        $res = !empty($other) ? array_merge($res, $other) : $res;
        if ($data instanceof LengthAwarePaginator) {
            $data = $data->toArray();
            $page = [
                'current_page' => (int)$data['current_page'],
                'last_page' => (int)$data['last_page'],
                'per_page' => (int)$data['per_page'],
                'total' => (int)$data['total'],
            ];

            $res['data'] = $data['data'];
            $res['count'] = (int)$data['total'];
            $res['pages'] = $page;
        }

        return response()->json($res);
    }
}

if (!function_exists('responseFailed')) {
    /**
     * Error response
     *
     * @param string $msg
     * @param int $statusCode
     * @param array $data
     * @return JsonResponse
     */
    function responseFailed(string $msg = 'Операция завершилась неудачей', int $statusCode = 400, array $data = []): JsonResponse
    {
        if (config('app.debug')) {
            return response()->json([
                'message' => $msg,
                'data' => $data,
            ])->setStatusCode($statusCode);
        }

        return response()->json([
            'message' => $msg,
            'data' => $data,
        ])->setStatusCode($statusCode);
    }
}

if (!function_exists('randomString')) {
    /**
     * Return random string with $length
     *
     * @param int $length
     * @return string
     */
    function randomString(int $length = 0): string
    {
        if ($length === 0) {
            $length = mt_rand(10, 100);
        }

        $characters = ' 0123456789 abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($index = 0; $index < $length; $index++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }

        return $randomString;
    }
}

if (!function_exists('randomDateTime')) {
    /**
     * @return \DateTime
     */
    function randomDateTime(): \DateTime
    {
        $dateTime = new \DateTime();
        $randomHours = mt_rand(0, 1000);
        $dateTime->modify(sprintf('-%s hours', $randomHours));

        return $dateTime;
    }
}

if (!function_exists('randomInArray')) {
    /**
     * @param array $array
     * @return mixed
     */
    function randomInArray($array)
    {
        return $array[array_rand($array)];
    }
}

if (!function_exists('randomBoolean')) {
    /**
     * @return bool
     */
    function randomBoolean(): bool
    {
        return (bool)mt_rand(0, 1);
    }
}

if (!function_exists('vite_assets')) {
    /**
     * Генерирует HTML-теги для подключения Vite ассетов
     * Автоматически определяет режим (production/development/docker)
     *
     * @param string $entryPoint Entry point (по умолчанию 'resources/js/app.js')
     * @return HtmlString
     */
    function vite_assets(string $entryPoint = 'resources/js/app.js'): HtmlString
    {
        $isProduction = app()->isProduction();
        $isDocker = config('app.env') === 'docker';
        $viteBase = config('vite.base', '/build/');

        // ==================== PRODUCTION MODE ====================
        if ($isProduction) {
            $manifestPath = public_path('build/manifest.json');

            if (!file_exists($manifestPath)) {
                throw new \RuntimeException('Vite manifest not found.');
            }

            $manifest = json_decode(file_get_contents($manifestPath), true, 512, JSON_THROW_ON_ERROR);
            $entry = $manifest[$entryPoint] ?? throw new \RuntimeException("Entry point '{$entryPoint}' not found in manifest");

            $tags = '';

            $tags .= sprintf(
                '<script type="module" src="%s"></script>',
                asset($viteBase . $entry['file'])
            );

            foreach ($entry['css'] ?? [] as $css) {
                $tags .= sprintf(
                    '<link rel="stylesheet" href="%s">',
                    asset($viteBase . $css)
                );
            }

            return new HtmlString($tags);
        }

        // ==================== DEVELOPMENT MODE ====================
        $devServer = $isDocker
            ? rtrim(env('VITE_DOCKER_SERVER_URL', 'http://host.docker.internal:5173'), '/')
            : rtrim(env('VITE_DEV_SERVER_URL', 'http://localhost:5173'), '/');

        $tags = <<<HTML
            <script type="module" src="$devServer/@vite/client"></script>
            <script type="module" src="$devServer/$entryPoint"></script>
        HTML;

        $tags .= sprintf(
            '<link rel="icon" type="image/x-icon" href="%s">',
            asset('favicon.ico')
        );

        return new HtmlString($tags);
    }
}

if (!function_exists('vite_public_assets')) {
    /**
     * Генерирует HTML-теги для публичной части (public.js)
     * Обёртка над vite_assets() с предопределённым entry point
     *
     * @return HtmlString
     */
    function vite_public_assets(): HtmlString
    {
        return vite_assets('resources/js/public/public.js');
    }
}
