<?php

namespace App\Services;

use FFMpeg\FFProbe;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;

class VideoScanner
{
    protected $ffprobe;

    public function __construct()
    {
        $ffprobeBin = Config::get('ffmpeg.ffprobe.binaries', 'ffprobe');
        $this->ffprobe = FFProbe::create([
            'ffprobe.binaries' => $ffprobeBin
        ]);
    }

    public function scan(string $directory): array
    {
        $config = Config::get('video.scanner');
        $cacheKey = 'video_scan:' . md5($directory);
        $cacheTtl = $config['cache_ttl'];
        $maxProcessingTime = $config['max_processing_time'] ?? 45;
        $recentThreshold = $config['recent_threshold'] ?? 2592000;

        Log::info("[VideoScanner] Starting prioritized scan", [
            'directory' => $directory,
            'strategy' => 'PRIORITIZE_RECENT',
            'max_processing_time' => $maxProcessingTime,
            'recent_threshold' => $recentThreshold
        ]);

        if (!File::isDirectory($directory)) {
            Log::error("[VideoScanner] Directory does not exist: $directory");
            return [];
        }

        try {
            $files = File::files($directory);
            $videoFiles = [];

            foreach ($files as $file) {
                $extension = strtolower($file->getExtension());
                if (in_array($extension, $config['supported_formats'])) {
                    $videoFiles[] = [
                        'name' => $file->getFilename(),
                        'path' => $file->getPathname(),
                        'size' => $file->getSize(),
                        'modified' => $file->getMTime(),
                        'created' => $file->getCTime(),
                    ];
                }
            }

            Log::debug("[VideoScanner] Found files", [
                'total_files' => count($files),
                'video_files' => count($videoFiles),
                'sample_files' => array_slice(array_column($videoFiles, 'name'), 0, 5)
            ]);

            usort($videoFiles, function($a, $b) {
                return ($b['modified'] ?? 0) <=> ($a['modified'] ?? 0);
            });

            $videos = [];
            $startTime = time();

            foreach ($videoFiles as $fileInfo) {
                $file = $fileInfo['name'];
                $path = $fileInfo['path'];
                $isRecent = ($fileInfo['modified'] >= (time() - $recentThreshold));

                $video = [
                    'filename' => $file,
                    'publicUrl' => Config::get('video.paths.public_url') . rawurlencode($file) . '?t=' . time(),
                    'size' => $fileInfo['size'],
                    'modified' => $fileInfo['modified'],
                    'created' => $fileInfo['created'],
                    'filetype' => mime_content_type($path),
                    'width' => 0,
                    'height' => 0,
                    'codec' => 'unknown',
                    'bitrate' => 0,
                    'duration' => 0,
                    'ffmpeg_status' => 'pending',
                    'quality' => 'normal',
                    'processing_time' => 0
                ];

                if ((time() - $startTime) > $maxProcessingTime) {
                    Log::info("Processing time limit reached", [
                        'processed' => count($videos),
                        'remaining' => count($videoFiles) - count($videos)
                    ]);
                    $video['ffmpeg_status'] = 'timeout';
                    $video['quality'] = $this->determineQuality($video);
                    $videos[] = $video;
                    continue;
                }

                if ($isRecent) {
                    try {
                        $processStart = microtime(true);
                        $format = $this->ffprobe->format($path);
                        $video['duration'] = $format->get('duration', 0);

                        $streams = $this->ffprobe->streams($path);
                        $videoStream = $streams->videos()->first();

                        if ($videoStream) {
                            $video['width'] = $videoStream->get('width', 0);
                            $video['height'] = $videoStream->get('height', 0);
                            $video['codec'] = $videoStream->get('codec_name', 'unknown');
                            $video['bitrate'] = $videoStream->get('bit_rate', 0) ?: $format->get('bit_rate', 0);
                            $video['ffmpeg_status'] = 'success';
                            $video['quality'] = $this->determineQuality($video);
                        } else {
                            $video['ffmpeg_status'] = 'no_video_stream';
                            $video['quality'] = $this->determineQuality($video);
                        }
                        $video['processing_time'] = round((microtime(true) - $processStart) * 1000);
                    } catch (\Exception $e) {
                        Log::error("[VideoScanner] Error for $file: " . $e->getMessage());
                        // Добавляем детализацию ошибки
                        $video['ffmpeg_error'] = $e->getMessage();
                        $video['ffmpeg_status'] = strpos($e->getMessage(), 'timeout') !== false
                            ? 'timeout'
                            : 'error';

                        $video['quality'] = $this->determineQuality($video);
                    }
                } else {
                    $video['ffmpeg_status'] = 'skipped_old';
                    $video['quality'] = $this->determineQuality($video);
                }

                $videos[] = $video;
            }
        } catch (\Exception $e) {
            Log::error("[VideoScanner] Critical error: " . $e->getMessage());
            return [];
        }

        $ffprobeStats = array_count_values(array_column($videos, 'ffmpeg_status'));
        $qualityStats = array_count_values(array_column($videos, 'quality'));

        Log::info("[VideoScanner] Scan completed", [
            'total_videos' => count($videos),
            'ffprobe_stats' => $ffprobeStats,
            'quality_stats' => $qualityStats
        ]);

        Cache::put($cacheKey, $videos, $cacheTtl);
        return $videos;
    }

    public function scanSingleFile(string $filePath): array
    {
        if (!File::exists($filePath)) {
            Log::error("[VideoScanner] File not found: $filePath");
            return [];
        }

        $file = new \SplFileInfo($filePath);
        $config = Config::get('video.scanner');
        $recentThreshold = $config['recent_threshold'] ?? 2592000;
        $isRecent = ($file->getMTime() >= (time() - $recentThreshold));

        $video = [
            'filename' => $file->getFilename(),
            'publicUrl' => Config::get('video.paths.public_url') . rawurlencode($file->getFilename()) . '?t=' . time(),
            'size' => $file->getSize(),
            'modified' => $file->getMTime(),
            'created' => $file->getCTime(),
            'filetype' => mime_content_type($filePath),
            'width' => 0,
            'height' => 0,
            'codec' => 'unknown',
            'bitrate' => 0,
            'duration' => 0,
            'ffmpeg_status' => 'pending',
            'quality' => 'normal',
            'processing_time' => 0
        ];

        if (!$isRecent) {
            $video['ffmpeg_status'] = 'skipped_old';
            $video['quality'] = $this->determineQuality($video);
            return $video;
        }

        try {
            $startTime = microtime(true);
            $format = $this->ffprobe->format($filePath);
            $video['duration'] = $format->get('duration', 0);

            $streams = $this->ffprobe->streams($filePath);
            $videoStream = $streams->videos()->first();

            if ($videoStream) {
                $video['width'] = $videoStream->get('width', 0);
                $video['height'] = $videoStream->get('height', 0);
                $video['codec'] = $videoStream->get('codec_name', 'unknown');
                $video['bitrate'] = $videoStream->get('bit_rate', 0) ?: $format->get('bit_rate', 0);
                $video['ffmpeg_status'] = 'success';
            } else {
                $video['ffmpeg_status'] = 'no_video_stream';
            }

            $video['quality'] = $this->determineQuality($video);
            $video['processing_time'] = round((microtime(true) - $startTime) * 1000);
        } catch (\Exception $e) {
            Log::error("[VideoScanner] Error: " . $e->getMessage());
            $video['ffmpeg_status'] = 'error';
            $video['quality'] = $this->determineQuality($video);
        }

        return $video;
    }

    public function scanSingleFileFull(string $filePath): array
    {
        if (!File::exists($filePath)) {
            Log::error("[VideoScanner] File not found: $filePath");
            return [];
        }

        $file = new \SplFileInfo($filePath);

        $video = [
            'filename' => $file->getFilename(),
            'key' => 'video-' . $file->getFilename() . '-' . time(),
            'publicUrl' => Config::get('video.paths.public_url') . rawurlencode($file->getFilename()) . '?t=' . time(),
            'size' => $file->getSize(),
            'modified' => $file->getMTime(),
            'created' => $file->getCTime(),
            'filetype' => mime_content_type($filePath),
            'width' => 0,
            'height' => 0,
            'codec' => 'unknown',
            'bitrate' => 0,
            'duration' => 0,
            'ffmpeg_status' => 'pending',
            'quality' => 'normal',
            'processing_time' => 0
        ];

        try {
            $startTime = microtime(true);
            $format = $this->ffprobe->format($filePath);
            $video['duration'] = $format->get('duration', 0);

            $streams = $this->ffprobe->streams($filePath);
            $videoStream = $streams->videos()->first();

            if ($videoStream) {
                $video['width'] = $videoStream->get('width', 0);
                $video['height'] = $videoStream->get('height', 0);
                $video['codec'] = $videoStream->get('codec_name', 'unknown');
                $video['bitrate'] = $videoStream->get('bit_rate', 0) ?: $format->get('bit_rate', 0);
                $video['ffmpeg_status'] = 'success';
            } else {
                $video['ffmpeg_status'] = 'no_video_stream';
            }

            $video['quality'] = $this->determineQuality($video);
            $video['processing_time'] = round((microtime(true) - $startTime) * 1000);
        } catch (\Exception $e) {
            Log::error("[VideoScanner] Error: " . $e->getMessage());
            $video['ffmpeg_status'] = 'error';
            $video['quality'] = $this->determineQuality($video);
        }

        return $video;
    }

    public function quickScan(string $directory): array
    {
        $files = File::files($directory);
        $videoFiles = [];

        foreach ($files as $file) {
            $extension = strtolower($file->getExtension());
            if (in_array($extension, Config::get('video.scanner.supported_formats'))) {
                $videoFiles[] = [
                    'filename' => $file->getFilename(),
                    'path' => $file->getPathname(),
                    'size' => $file->getSize(),
                    'modified' => $file->getMTime(),
                    'created' => $file->getCTime(),
                    'ffmpeg_status' => 'pending',
                    'quality' => $this->estimateQuality($file->getFilename()),
                ];
            }
        }

        return $videoFiles;
    }

    private function estimateQuality(string $filename): string
    {
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        $hdExts = ['webm', 'mkv', 'mov', 'mp4', 'avi'];
        return in_array(strtolower($ext), $hdExts) ? 'high' : 'normal';
    }

    protected function determineQuality(array $video): string
    {
        if ($video['width'] > 0 && $video['height'] > 0) {
            if ($video['width'] >= 1920 && $video['height'] >= 1080) {
                return 'high';
            }

            if ($video['width'] >= 1280 && $video['height'] >= 720) {
                return 'high';
            }
        }

        if ($video['bitrate'] > 0) {
            if ($video['bitrate'] > 5000000) {
                return 'high';
            }
        }

        return 'normal';
    }
}
