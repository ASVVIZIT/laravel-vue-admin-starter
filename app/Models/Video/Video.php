<?php

namespace App\Models\Video;

class Video
{
    public string $filename;
    public string $path;
    public string $publicUrl;

    public function __construct(string $path, string $publicUrl)
    {
        $this->filename = basename($path);
        $this->path = $path;
        $this->publicUrl = $publicUrl;
    }
}
