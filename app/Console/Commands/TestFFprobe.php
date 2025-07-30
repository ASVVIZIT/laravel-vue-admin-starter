<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use FFMpeg\FFProbe;
use Illuminate\Support\Facades\Config;

class TestFFprobe extends Command
{
    protected $signature = 'test:ffprobe {file}';
    protected $description = 'Test FFprobe on a video file';

    public function handle()
    {
        $file = $this->argument('file');

        if (!file_exists($file)) {
            $this->error("File not found: $file");
            return 1;
        }

        try {
            $ffprobe = FFProbe::create([
                'ffprobe.binaries' => Config::get('ffmpeg.ffprobe.binaries', 'ffprobe')
            ]);

            $this->info("FFprobe initialized successfully");

            // Test format
            $format = $ffprobe->format($file);
            $this->info("Duration: " . $format->get('duration'));

            // Test video stream
            $videoStream = $ffprobe->streams($file)
                ->videos()
                ->first();

            if ($videoStream) {
                $this->info("Video codec: " . $videoStream->get('codec_name'));
                $this->info("Resolution: " . $videoStream->get('width') . 'x' . $videoStream->get('height'));
            } else {
                $this->warn("No video stream found");
            }

            return 0;
        } catch (\Exception $e) {
            $this->error("FFprobe error: " . $e->getMessage());
            return 2;
        }
    }
}
