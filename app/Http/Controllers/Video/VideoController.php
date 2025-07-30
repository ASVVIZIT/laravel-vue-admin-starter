<?php

namespace App\Http\Controllers\Video;

use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\Controller;
use App\Services\VideoScanner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;

ini_set('memory_limit', '1024M');
set_time_limit(0);

class VideoController extends Controller
{
    public function index(Request $request)
    {
        try {
            $videoDir = storage_path('Videos' . DIRECTORY_SEPARATOR . 'videos');

            Log::info('Video API request received', [
                'page' => $request->get('page', 1),
                'per_page' => $request->get('per_page', 48),
                'client_ip' => $request->ip(),
                'directory' => $videoDir,
                'refresh_cache' => $request->get('refresh_cache', false),
                'timestamp' => $request->get('timestamp')
            ]);

            if (!is_dir($videoDir)) {
                Log::error("Video directory not found: $videoDir");
                Storage::makeDirectory($videoDir, 0755, true);
                return response()->json([
                    'error' => 'Video directory not found',
                    'message' => 'The specified video storage path does not exist'
                ], 404);
            }

            $cacheKey = 'video_files_' . md5($videoDir . $request->get('timestamp', ''));
            $refreshCache = $request->get('refresh_cache', false);

            $isFirstPage = ($request->get('page', 1) == 1);
            if ($isFirstPage) {
                $refreshCache = true;
                Log::info("Auto-refreshing cache for first page");
            }

            if ($refreshCache) {
                Cache::forget($cacheKey);
            }

            $allVideos = Cache::remember($cacheKey, 3600, function () use ($videoDir) {
                $scanner = new VideoScanner();
                return $scanner->scan($videoDir);
            });

            $ffmpegStats = array_count_values(array_column($allVideos, 'ffmpeg_status'));
            $totalVideos = count($allVideos);

            Log::info("Video data prepared", [
                'total_videos' => $totalVideos,
                'ffmpeg_stats' => $ffmpegStats
            ]);

            foreach ($allVideos as &$video) {
                $video['created'] = $video['created'] ?? null;
                $video['modified'] = $video['modified'] ?? null;
                $video['duration'] = $video['duration'] ?? 0;
                $video['publicUrl'] = Config::get('video.paths.public_url') .
                    rawurlencode($video['filename']) . '?t=' . time();
            }

            usort($allVideos, function($a, $b) {
                return ($b['modified'] ?? 0) <=> ($a['modified'] ?? 0);
            });

            $page = max(1, (int)$request->get('page', 1));
            $perPage = max(1, (int)$request->get('per_page', 48));
            $offset = max(0, ($page - 1) * $perPage);

            $paginated = array_slice($allVideos, $offset, $perPage);
            $total = count($allVideos);
            $lastPage = max(1, ceil($total / $perPage));

            return response()->json([
                'data' => $paginated,
                'total' => $total,
                'last_page' => $lastPage,
                'current_page' => $page,
                'per_page' => $perPage,
                'ffmpeg_status' => $ffmpegStats
            ]);

        } catch (\Exception $e) {
            $ffmpegStatus = class_exists('FFMpeg\FFProbe') ? 'installed' : 'not_installed';

            Log::error('VideoController error: ' . $e->getMessage(), [
                'exception' => $e,
                'ffmpeg_status' => $ffmpegStatus
            ]);

            return response()->json([
                'error' => 'Video processing failed',
                'message' => $e->getMessage(),
                'ffmpeg_status' => $ffmpegStatus
            ], 500);
        }
    }

    public function getFileList(Request $request)
    {
        $videoDir = storage_path('Videos' . DIRECTORY_SEPARATOR . 'videos');

        if (!is_dir($videoDir)) {
            return response()->json([], 404);
        }

        $files = scandir($videoDir);
        $videoFiles = [];
        $supportedFormats = ['webm', 'mp4', 'mov', 'avi', 'mkv', 'flv'];

        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;

            $path = $videoDir . DIRECTORY_SEPARATOR . $file;
            if (!is_file($path)) continue;

            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            if (!in_array($extension, $supportedFormats)) continue;

            $videoFiles[] = [
                'filename' => $file,
                'size' => filesize($path),
                'modified' => filemtime($path),
                'created' => filectime($path),
            ];
        }

        usort($videoFiles, function($a, $b) {
            return $b['modified'] - $a['modified'];
        });

        return response()->json(['data' => $videoFiles]);
    }

    public function scanSingleFile(Request $request)
    {
        $filename = $request->input('filename');
        $ignoreConfig = $request->input('ignore_config', false);
        $priority = $request->input('priority', 'normal'); // Новый параметр

        // Увеличиваем ресурсы для приоритетных запросов
        if ($priority === 'high') {
            ini_set('memory_limit', '1024M');
            set_time_limit(60);
        }

        $videoDir = storage_path('Videos' . DIRECTORY_SEPARATOR . 'videos');
        $filePath = $videoDir . DIRECTORY_SEPARATOR . $filename;

        if (!file_exists($filePath)) {
            return response()->json([
                'error' => 'File not found',
                'path' => $filePath
            ], 404);
        }

        try {
            $scanner = new VideoScanner();
            $videoData = $scanner->scanSingleFileFull($filePath);
            $videoData['publicUrl'] = Config::get('video.paths.public_url') .
                rawurlencode($filename) . '?t=' . time();
            $videoData['key'] = 'video-' . $filename . '-' . time();

            return response()->json([
                'data' => $videoData,
                'metaUpdated' => time()
            ]);
        } catch (\Exception $e) {
            Log::error('Error scanning single file: ' . $e->getMessage(), [
                'exception' => $e,
                'file' => $filename,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Processing failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function scanMultipleFiles(Request $request)
    {
        $filenames = $request->input('filenames', []);
        $ignoreConfig = $request->input('ignore_config', false);
        $results = [];
        $scanner = new VideoScanner();
        $videoDir = storage_path('Videos' . DIRECTORY_SEPARATOR . 'videos');

        Log::info('Scanning multiple video files', [
            'count' => count($filenames),
            'ignore_config' => $ignoreConfig
        ]);

        foreach ($filenames as $filename) {
            $filePath = $videoDir . DIRECTORY_SEPARATOR . $filename;
            $startTime = microtime(true);

            if (file_exists($filePath)) {
                try {
                    if (!$ignoreConfig) {
                        $videoData = Cache::remember('video_meta_'.md5($filePath), 3600,
                            function() use ($scanner, $filePath) {
                                return $scanner->scanSingleFile($filePath);
                            }
                        );
                    } else {
                        $videoData = $scanner->scanSingleFileFull($filePath);
                    }

                    $videoData['publicUrl'] = Config::get('video.paths.public_url') .
                        rawurlencode($filename) . '?t=' . time();
                    $videoData['key'] = 'video-' . $filename . '-' . time();
                    $videoData['filetype'] = $videoData['filetype'] ?? mime_content_type($filePath);
                    $videoData['size'] = $videoData['size'] ?? filesize($filePath);
                    $videoData['modified'] = $videoData['modified'] ?? filemtime($filePath);
                    $videoData['created'] = $videoData['created'] ?? filectime($filePath);
                    $videoData['metaUpdated'] = time();
                    $videoData['processing_time'] = round((microtime(true) - $startTime) * 1000);

                    $results[$filename] = $videoData;
                } catch (\Exception $e) {
                    $results[$filename] = [
                        'error' => 'Ошибка обработки: ' . $e->getMessage(),
                        'filename' => $filename,
                        'processing_time' => round((microtime(true) - $startTime) * 1000)
                    ];
                }
            } else {
                $results[$filename] = [
                    'error' => 'Файл не найден',
                    'filename' => $filename,
                    'processing_time' => 0
                ];
            }
        }

        return response()->json(['data' => $results]);
    }
}
