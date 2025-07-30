<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\RemoteVideoScanner;

class ScanRemoteVideos extends Command
{
    protected $signature = 'videos:scan-remote';
    protected $description = 'Scan remote URLs for videos and download new ones';


    public function handle()
    {
        $scanner = new RemoteVideoScanner();
        $urls = [
            'https://coomeet.com/ru?story=17167163942362',
        ];

        // Обновленные пути логов
        $this->info("Starting video scanner. Press Ctrl+C to stop.");
        $this->info("Log file: " . storage_path('logs/video_download.log')); // Изменено
        $this->info("Storage path: " . $scanner->storagePath);

        while (true) {
            try {
                $this->info('[' . now()->format('Y-m-d H:i:s') . '] Scanning URLs...');
                $scanner->scanAndDownload($urls);
                $this->info('[' . now()->format('Y-m-d H:i:s') . '] Scan completed');
            } catch (\Exception $e) {
                $this->error('Error: ' . $e->getMessage());
            }

            sleep(20);
        }
    }
}
