<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class I18nLanguageService
{
    protected string $langPath;

    protected array $excludedLanguages = [];

    protected array $serviceFiles = ['index', 'helper', 'utils', 'common', 'app'];

    public function __construct()
    {
        $this->langPath = resource_path('js/lang');
    }

    /**
     * Получить все доступные языки из папки
     */
    public function getAvailableLanguages(): array
    {
        if (!is_dir($this->langPath)) {
            Log::error('I18nLanguageService: Directory not found: ' . $this->langPath);
            return [];
        }

        $languages = [];

        // 🔥 Используем glob() — работает на Windows
        $files = glob($this->langPath . '/*.js');

        if ($files === false) {
            Log::error('I18nLanguageService: glob() failed');
            return [];
        }

        foreach ($files as $filePath) {
            $basename = pathinfo($filePath, PATHINFO_FILENAME);

            // Пропускаем служебные файлы
            if (in_array($basename, $this->serviceFiles)) {
                continue;
            }

            // Пропускаем исключённые языки
            if (in_array($basename, $this->excludedLanguages)) {
                continue;
            }

            $languages[] = $basename;
        }

        Log::info('I18nLanguageService: Found languages: ' . implode(', ', $languages));

        return $languages;
    }

    public function languageExists(string $lang): bool
    {
        return in_array($lang, $this->getAvailableLanguages());
    }

    public function getLangFilePath(string $lang): ?string
    {
        if (!$this->languageExists($lang)) {
            return null;
        }

        $path = $this->langPath . '/' . $lang . '.js';
        return file_exists($path) ? $path : null;
    }

    public function excludeLanguage(string $lang): void
    {
        if (!in_array($lang, $this->excludedLanguages)) {
            $this->excludedLanguages[] = $lang;
        }
    }

    public function includeLanguage(string $lang): void
    {
        $key = array_search($lang, $this->excludedLanguages);
        if ($key !== false) {
            unset($this->excludedLanguages[$key]);
            $this->excludedLanguages = array_values($this->excludedLanguages);
        }
    }

    public function getExcludedLanguages(): array
    {
        return $this->excludedLanguages;
    }
}
