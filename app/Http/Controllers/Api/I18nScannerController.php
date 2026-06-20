<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Services\I18nLanguageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class I18nScannerController extends BaseController
{
    protected I18nLanguageService $langService;

    public function __construct(I18nLanguageService $langService)
    {
        $this->langService = $langService;
    }

    /**
     * 🔥 Парсинг JS файла через Node.js (100% надёжно)
     */
    /**
     * 🔥 Node.js парсер — извлекает ключи из JS файлов переводов
     */
    private function extractKeysFromJsFile(string $filePath): array
    {
        $scriptPath = base_path('scripts/parse_i18n.js');

        if (!file_exists($scriptPath)) {
            Log::error("I18nScanner: Script not found: {$scriptPath}");
            return [];
        }

        // Экранируем пути для Windows
        $scriptPath = escapeshellarg($scriptPath);
        $filePath = escapeshellarg($filePath);

        // Вызываем Node.js
        $command = "node {$scriptPath} {$filePath} 2>&1";

        $output = [];
        $returnVar = 0;
        exec($command, $output, $returnVar);

        if ($returnVar !== 0 || empty($output[0])) {
            Log::warning("I18nScanner: Node.js failed for {$filePath}");
            return [];
        }

        $json = $output[0];
        $keys = json_decode($json, true);

        if (!is_array($keys)) {
            Log::warning("I18nScanner: Invalid JSON for {$filePath}");
            return [];
        }

        Log::info("I18nScanner: {$filePath} → " . count($keys) . " keys");

        return $keys;
    }

    /**
     * Нормализовать путь файла для Windows/Linux
     */
    private function normalizePath(string $path): string
    {
        return str_replace('\\', '/', $path);
    }

    // ========================================================================
    // 🔍 SCAN — полный скан
    // ========================================================================

    public function scan(): JsonResponse
    {
        try {
            $sourceDirs = [
                resource_path('js/views'),
                resource_path('js/components'),
                resource_path('js/store'),
                resource_path('js/utils'),
                resource_path('js/router'),
                resource_path('js/layout'),
                resource_path('js/modules')
            ];

            $availableLanguages = $this->langService->getAvailableLanguages();

            Log::info('I18nScanner: Available languages: ' . implode(', ', $availableLanguages));

            if (empty($availableLanguages)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No language files found'
                ], 404);
            }

            $langDir = resource_path('js/lang');

            $codePatterns = [
                '/\$t\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)/',
                '/\bt\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)/',
                '/i18n\.global\.t\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)/'
            ];

            // 1. Собираем все файлы исходного кода
            $allFiles = [];
            foreach ($sourceDirs as $dir) {
                if (File::isDirectory($dir)) {
                    foreach (File::allFiles($dir) as $file) {
                        if (in_array($file->getExtension(), ['vue', 'js', 'ts'])) {
                            $allFiles[] = $file->getPathname();
                        }
                    }
                }
            }

            Log::info('I18nScanner: Found ' . count($allFiles) . ' source files');

            // 2. Извлекаем ключи из кода
            $usedKeys = [];
            $basePath = $this->normalizePath(base_path()) . '/';

            foreach ($allFiles as $file) {
                $content = @File::get($file);
                if ($content === false) continue;

                $relativePath = str_replace($basePath, '', $this->normalizePath($file));

                foreach ($codePatterns as $pattern) {
                    if (@preg_match_all($pattern, $content, $matches)) {
                        foreach ($matches[1] as $key) {
                            $key = trim($key);
                            if (strpos($key, '${') === false && strpos($key, '+') === false) {
                                if (!isset($usedKeys[$key])) {
                                    $usedKeys[$key] = [];
                                }
                                if (!in_array($relativePath, $usedKeys[$key])) {
                                    $usedKeys[$key][] = $relativePath;
                                }
                            }
                        }
                    }
                }
            }

            Log::info('I18nScanner: Found ' . count($usedKeys) . ' unique keys in code');

            // 3. Загружаем переводы через Node.js
            $langData = [];
            foreach ($availableLanguages as $langCode) {
                $langPath = $langDir . '/' . $langCode . '.js';

                if (!File::exists($langPath)) {
                    Log::warning("I18nScanner: File not found: {$langPath}");
                    continue;
                }

                // 🔥 Используем Node.js парсер
                $flatKeys = $this->extractKeysFromJsFile($langPath);

                Log::info("I18nScanner: {$langCode} - found " . count($flatKeys) . " translation keys");

                if (!empty($flatKeys)) {
                    $langData[$langCode] = [
                        'keys' => $flatKeys,
                        'total' => count($flatKeys)
                    ];
                }
            }

            // 4. Анализируем
            $report = [
                'timestamp' => now()->toISOString(),
                'summary' => [
                    'totalUsedKeys' => count($usedKeys),
                    'languages' => []
                ],
                'missing' => [],
                'unused' => []
            ];

            foreach ($langData as $lang => $data) {
                $langKeys = $data['keys'];
                $missing = [];
                $unused = [];

                foreach ($usedKeys as $key => $files) {
                    if (!in_array($key, $langKeys)) {
                        $missing[] = [
                            'key' => $key,
                            'files' => $files
                        ];
                    }
                }

                foreach ($langKeys as $key) {
                    if (!isset($usedKeys[$key])) {
                        $unused[] = $key;
                    }
                }

                $report['missing'][$lang] = $missing;
                $report['unused'][$lang] = $unused;

                // 🔥 ИСПРАВЛЕННАЯ формула покрытия
                $totalKeys = $data['total'];
                $usedCount = $totalKeys - count($unused);
                $coverage = $totalKeys > 0 ? round($usedCount / $totalKeys * 100, 1) : 0;

                $report['summary']['languages'][$lang] = [
                    'totalKeys' => $totalKeys,
                    'usedInCode' => $usedCount,
                    'missing' => count($missing),
                    'unused' => count($unused),
                    'coverage' => $coverage . '%'
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $report
            ]);

        } catch (\Exception $e) {
            Log::error('I18n Scanner error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    // ========================================================================
    // 🔑 GET KEYS
    // ========================================================================

    public function getKeys(): JsonResponse
    {
        try {
            $sourceDirs = [
                resource_path('js/views'),
                resource_path('js/components'),
                resource_path('js/store'),
                resource_path('js/utils'),
                resource_path('js/router'),
                resource_path('js/layout'),
                resource_path('js/modules')
            ];

            $patterns = [
                '/\$t\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)/',
                '/\bt\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)/',
                '/i18n\.global\.t\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)/'
            ];

            $usedKeys = [];
            foreach ($sourceDirs as $dir) {
                if (!File::isDirectory($dir)) continue;

                foreach (File::allFiles($dir) as $file) {
                    if (!in_array($file->getExtension(), ['vue', 'js', 'ts'])) continue;

                    $content = @File::get($file->getPathname());
                    if ($content === false) continue;

                    foreach ($patterns as $pattern) {
                        if (@preg_match_all($pattern, $content, $matches)) {
                            foreach ($matches[1] as $key) {
                                $key = trim($key);
                                if (strpos($key, '${') === false && strpos($key, '+') === false) {
                                    $usedKeys[$key] = true;
                                }
                            }
                        }
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => count($usedKeys),
                    'keys' => array_keys($usedKeys)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // ========================================================================
    // 🌐 GET TRANSLATIONS
    // ========================================================================

    public function getTranslations(Request $request, string $lang): JsonResponse
    {
        try {
            if (!$this->langService->languageExists($lang)) {
                return response()->json([
                    'success' => false,
                    'message' => "Language '{$lang}' not found",
                    'available_languages' => $this->langService->getAvailableLanguages()
                ], 404);
            }

            $langPath = $this->langService->getLangFilePath($lang);

            if (!$langPath) {
                return response()->json([
                    'success' => false,
                    'message' => "Language file not found: {$lang}.js"
                ], 404);
            }

            $flatKeys = $this->extractKeysFromJsFile($langPath);

            return response()->json([
                'success' => true,
                'data' => [
                    'lang' => $lang,
                    'total' => count($flatKeys),
                    'keys' => $flatKeys
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // ========================================================================
    // 🌍 GET AVAILABLE LANGUAGES
    // ========================================================================

    public function getAvailableLanguages(): JsonResponse
    {
        $languages = $this->langService->getAvailableLanguages();

        return response()->json([
            'success' => true,
            'data' => [
                'languages' => $languages,
                'total' => count($languages),
                'excluded' => $this->langService->getExcludedLanguages()
            ]
        ]);
    }

    /**
     * 🔍 Validator Mode — проверка структуры ключей
     *
     * Находит:
     * - Дубликаты ключей на разных уровнях вложенности
     * - Плоские ключи без контекста (без точки)
     * - Неправильные пути (ключи из кода которых нет в переводах)
     */
    public function validatePaths(): JsonResponse
    {
        try {
            $langDir = resource_path('js/lang');
            $availableLanguages = $this->langService->getAvailableLanguages();

            if (empty($availableLanguages)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No language files found'
                ], 404);
            }

            // Анализируем первый язык (структура одинакова для всех)
            $primaryLang = $availableLanguages[0];
            $langPath = $langDir . '/' . $primaryLang . '.js';

            if (!File::exists($langPath)) {
                return response()->json([
                    'success' => false,
                    'message' => "Language file not found: {$primaryLang}.js"
                ], 404);
            }

            // 🔥 Используем Node.js парсер (как в scan)
            $allKeys = $this->extractKeysFromJsFile($langPath);

            $report = [
                'summary' => [
                    'totalKeys' => count($allKeys),
                    'duplicates' => 0,
                    'wrongPaths' => 0,
                    'flatKeys' => 0
                ],
                'duplicates' => [],
                'wrongPaths' => [],
                'flatKeys' => []
            ];

            // 🔥 1. Поиск дубликатов (ключи с одинаковым именем на разных уровнях)
            $keyMap = [];
            foreach ($allKeys as $fullKey) {
                $parts = explode('.', $fullKey);
                $shortKey = end($parts);

                if (!isset($keyMap[$shortKey])) {
                    $keyMap[$shortKey] = [];
                }
                $keyMap[$shortKey][] = $fullKey;
            }

            foreach ($keyMap as $shortKey => $paths) {
                if (count($paths) > 1) {
                    $report['duplicates'][] = [
                        'key' => $shortKey,
                        'paths' => $paths
                    ];
                }
            }

            $report['summary']['duplicates'] = count($report['duplicates']);

            // 🔥 2. Поиск плоских ключей (без точки — без контекста)
            $flatKeys = array_filter($allKeys, function($key) {
                return strpos($key, '.') === false;
            });

            $report['flatKeys'] = array_values($flatKeys);
            $report['summary']['flatKeys'] = count($report['flatKeys']);

            // 🔥 3. Поиск неправильных путей (ключи из кода которых нет в переводах)
            $sourceDirs = [
                resource_path('js/views'),
                resource_path('js/components'),
                resource_path('js/store'),
                resource_path('js/utils'),
                resource_path('js/router'),
                resource_path('js/layout'),
                resource_path('js/modules')
            ];

            $codePatterns = [
                '/\$t\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)/',
                '/\bt\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)/',
                '/i18n\.global\.t\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)/'
            ];

            $usedKeys = [];
            $basePath = $this->normalizePath(base_path()) . '/';

            foreach ($sourceDirs as $dir) {
                if (!File::isDirectory($dir)) continue;

                foreach (File::allFiles($dir) as $file) {
                    if (!in_array($file->getExtension(), ['vue', 'js', 'ts'])) continue;

                    $content = @File::get($file->getPathname());
                    if ($content === false) continue;

                    $relativePath = str_replace($basePath, '', $this->normalizePath($file));

                    foreach ($codePatterns as $pattern) {
                        if (@preg_match_all($pattern, $content, $matches)) {
                            foreach ($matches[1] as $key) {
                                $key = trim($key);
                                if (strpos($key, '${') === false && strpos($key, '+') === false) {
                                    if (!isset($usedKeys[$key])) {
                                        $usedKeys[$key] = [];
                                    }
                                    if (!in_array($relativePath, $usedKeys[$key])) {
                                        $usedKeys[$key][] = $relativePath;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Ключи из кода которых нет в переводах
            foreach ($usedKeys as $key => $files) {
                if (!in_array($key, $allKeys)) {
                    $report['wrongPaths'][] = [
                        'wrongPath' => $key,
                        'correctPath' => $this->suggestCorrectPath($key, $allKeys),
                        'usedIn' => $files
                    ];
                }
            }

            $report['summary']['wrongPaths'] = count($report['wrongPaths']);

            return response()->json([
                'success' => true,
                'data' => $report
            ]);

        } catch (\Exception $e) {
            Log::error('I18n Validator error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Предложить правильный путь для ключа
     */
    private function suggestCorrectPath(string $key, array $allKeys): string
    {
        $parts = explode('.', $key);
        $shortKey = end($parts);

        // Ищем похожие ключи
        $similar = array_filter($allKeys, function($fullKey) use ($shortKey) {
            return str_ends_with($fullKey, '.' . $shortKey);
        });

        if (!empty($similar)) {
            return reset($similar);
        }

        return $key;
    }
}
