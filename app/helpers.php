<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\HtmlString;

if (!function_exists('responseSuccess')) {
    /**
     * Success response
     * @param array|LengthAwarePaginator $data
     * @param string $msg
     * @param array $other
     * @return JsonResponse
     */
    function responseSuccess($data = [],string $msg = 'Успешная операция', array $other = [], int $statusCode = 200): JsonResponse
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
     * @param string $msg
     * @param integer $statusCode
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
    function vite_assets(): HtmlString
    {
        $isProduction = app()->isProduction();
        $isDocker = config('app.env') === 'docker';
        $viteBase = config('vite.base', '/build/');

        // ==================== PRODUCTION MODE ====================
        if ($isProduction) {
            $manifestPath = public_path('build/manifest.json');

            if (!file_exists($manifestPath)) {
                throw new \RuntimeException(
                    'Vite manifest not found. Run "npm run build" and check public directory.'
                );
            }

            $manifest = json_decode(file_get_contents($manifestPath), true, 512, JSON_THROW_ON_ERROR);
            $entry = $manifest['resources/js/app.js'] ?? throw new \RuntimeException('Entry point not found');

            // Основные теги
            $tags = sprintf(
                '<script type="module" src="%s%s"></script>',
                $viteBase,
                htmlspecialchars($entry['file'], ENT_QUOTES)
            );

            // CSS файлы
            foreach ($entry['css'] ?? [] as $css) {
                $tags .= sprintf(
                    '<link rel="stylesheet" href="%s%s">',
                    $viteBase,
                    htmlspecialchars($css, ENT_QUOTES)
                );
            }

            // Предзагрузка ассетов
            foreach ($entry['assets'] ?? [] as $asset) {
                $ext = pathinfo($asset, PATHINFO_EXTENSION);
                if (in_array($ext, ['woff', 'woff2', 'ttf', 'eot', 'otf'])) {
                    $tags .= sprintf(
                        '<link rel="preload" href="%s%s" as="font" type="font/%s" crossorigin>',
                        $viteBase,
                        htmlspecialchars($asset, ENT_QUOTES),
                        $ext
                    );
                }
            }

            return new HtmlString($tags);
        }

        // ==================== DEVELOPMENT MODE ====================
        $devServer = $isDocker
            ? rtrim(env('VITE_DOCKER_SERVER_URL', 'http://host.docker.internal:5173'), '/')
            : rtrim(env('VITE_DEV_SERVER_URL', 'http://localhost:5173'), '/');

        return new HtmlString(<<<HTML
            <script type="module" src="$devServer/@vite/client"></script>
            <script type="module" src="$devServer/resources/js/app.js"></script>
            <link rel="icon" type="image/x-icon" href="$devServer/resources/images/favicon.ico">
        HTML);
    }
}


/*if (!function_exists('vite_assets')) {
    function vite_assets(): HtmlString
    {
        $env = config('app.env');
        $isProduction = $env === 'production';
        $isDocker = $env === 'docker';
        $manifestPath = public_path('build/manifest.json');

        // Production mode
        if ($isProduction && file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);

            if (!isset($manifest['resources/js/app.js'])) {
                throw new Exception('Vite manifest entry not found');
            }

            $script = '/build/' . $manifest['resources/js/app.js']['file'];
            $css = $manifest['resources/js/app.js']['css'][0] ?? '';

            $html = "<script type=\"module\" src=\"$script\"></script>";
            if ($css) {
                $html .= "<link rel=\"stylesheet\" href=\"/build/$css\">";
            }

            return new HtmlString($html);
        }

        // Development modes
        $devServer = $isDocker
            ? env('VITE_DOCKER_SERVER_URL', 'http://host.docker.internal:5173')
            : env('VITE_DEV_SERVER_URL', 'http://localhost:5173');

        return new HtmlString(<<<HTML
            <script type="module" src="$devServer/@vite/client"></script>
            <script type="module" src="$devServer/resources/js/app.js"></script>
        HTML);
    }
}*/
