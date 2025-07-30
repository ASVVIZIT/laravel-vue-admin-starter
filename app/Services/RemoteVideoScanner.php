<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RemoteVideoScanner
{
    public $storagePath;
    public $htmlLogPath;

    public function __construct()
    {
        $this->storagePath = storage_path('Videos' . DIRECTORY_SEPARATOR . 'videos');
        $this->htmlLogPath = storage_path('logs' . DIRECTORY_SEPARATOR . 'video_pages');

        // Создаем необходимые директории
        $dirs = [$this->storagePath, $this->htmlLogPath];
        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }

    public function scanAndDownload(array $urls): void
    {
        foreach ($urls as $url) {
            try {
                Log::channel('video_download')->info("Starting scan", ['url' => $url]);

                $storyId = $this->extractStoryId($url);
                Log::channel('video_download')->debug('Extracted story ID', [
                    'url' => $url,
                    'storyId' => $storyId
                ]);

                if (!$storyId) {
                    Log::channel('video_download')->warning('No story ID found', ['url' => $url]);
                    continue;
                }

                $videoPageUrl = "https://iframe.coomeet.com/stories/all/{$storyId}";
                Log::channel('video_download')->debug('Video page URL', [
                    'url' => $url,
                    'videoPage' => $videoPageUrl
                ]);

                $this->processVideoPage($videoPageUrl, $url, $storyId);
            } catch (\Exception $e) {
                Log::channel('video_download')->error('Scan error', [
                    'url' => $url,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    protected function extractStoryId(string $url): ?string
    {
        $query = parse_url($url, PHP_URL_QUERY);
        parse_str($query, $params);
        return $params['story'] ?? null;
    }

    protected function processVideoPage(string $videoPageUrl, string $sourceUrl, string $storyId): void
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Referer' => 'https://coomeet.com/',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language' => 'en-US,en;q=0.9',
                'Accept-Encoding' => 'gzip, deflate',
                'Connection' => 'keep-alive',
                'Upgrade-Insecure-Requests' => '1',
                'Sec-Fetch-Dest' => 'document',
                'Sec-Fetch-Mode' => 'navigate',
                'Sec-Fetch-Site' => 'same-origin',
                'Sec-Fetch-User' => '?1',
                'Pragma' => 'no-cache',
                'Cache-Control' => 'no-cache',
            ])->withoutRedirecting()
                ->get($videoPageUrl);

            if (!$response->successful()) {
                Log::channel('video_download')->error('Page request failed', [
                    'url' => $sourceUrl,
                    'status' => $response->status(),
                    'videoPage' => $videoPageUrl,
                    'headers' => $response->headers()
                ]);
                return;
            }

            $html = $response->body();
            Log::channel('video_download')->debug('HTML content received', [
                'url' => $sourceUrl,
                'length' => strlen($html)
            ]);

            // Сохраняем HTML в файл
            $htmlFileName = 'video_page_' . $storyId . '_' . now()->format('Ymd_His') . '.html';
            $htmlFilePath = $this->htmlLogPath . DIRECTORY_SEPARATOR . $htmlFileName;
            file_put_contents($htmlFilePath, $html);

            Log::channel('video_download')->info('HTML page saved', [
                'url' => $sourceUrl,
                'path' => $htmlFilePath
            ]);

            // Добавляем дополнительные паттерны поиска
            $patterns = [
                '/<video[^>]+data-video-src="([^"]+\.(webm|mp4))"/i',
                '/"videoUrl":"([^"]+\.(webm|mp4))"/i',
                '/src="([^"]+\.(webm|mp4))"/i',
                '/video-src="([^"]+\.(webm|mp4))"/i',
                '/source src="([^"]+\.(webm|mp4))"/i',
                '/contentUrl":"([^"]+\.(webm|mp4))"/i'
            ];

            $found = false;
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $html, $matches)) {
                    $videoUrl = html_entity_decode(stripslashes($matches[1]));
                    $this->downloadVideo($videoUrl, $sourceUrl, $storyId);
                    $found = true;
                    break;
                }
            }

            if (!$found) {
                Log::channel('video_download')->warning('Video URL not found', [
                    'url' => $sourceUrl,
                    'videoPage' => $videoPageUrl,
                    'html_file' => $htmlFilePath
                ]);
            }
        } catch (\Exception $e) {
            Log::channel('video_download')->error('Page processing error', [
                'url' => $sourceUrl,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    protected function downloadVideo(string $videoUrl, string $sourceUrl, string $storyId): void
    {
        try {
            $videoUrl = str_replace('\/', '/', $videoUrl);

            // Нормализация URL
            if (strpos($videoUrl, '//') === 0) {
                $videoUrl = 'https:' . $videoUrl;
            } elseif (!parse_url($videoUrl, PHP_URL_SCHEME)) {
                $videoUrl = 'https://' . $videoUrl;
            }

            Log::channel('video_download')->info('Downloading video', [
                'sourceUrl' => $sourceUrl,
                'videoUrl' => $videoUrl
            ]);

            $response = Http::withHeaders([
                'Referer' => 'https://iframe.coomeet.com/',
                'Origin' => 'https://iframe.coomeet.com',
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept-Encoding' => 'gzip, deflate'
            ])->withoutRedirecting()
                ->get($videoUrl);

            if ($response->successful()) {
                $filename = basename(parse_url($videoUrl, PHP_URL_PATH));

                // Генерация имени файла с storyId
                $filePath = $this->storagePath . DIRECTORY_SEPARATOR . $storyId . '_' . uniqid() . '_' . $filename;

                file_put_contents($filePath, $response->body());
                Log::channel('video_download')->info('Video downloaded', [
                    'sourceUrl' => $sourceUrl,
                    'videoUrl' => $videoUrl,
                    'path' => $filePath,
                    'size' => filesize($filePath)
                ]);
            } else {
                Log::channel('video_download')->error('Download failed', [
                    'sourceUrl' => $sourceUrl,
                    'videoUrl' => $videoUrl,
                    'status' => $response->status(),
                    'response' => substr($response->body(), 0, 500) // Логируем часть тела ответа
                ]);
            }
        } catch (\Exception $e) {
            Log::channel('video_download')->error('Download error', [
                'sourceUrl' => $sourceUrl,
                'videoUrl' => $videoUrl,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
