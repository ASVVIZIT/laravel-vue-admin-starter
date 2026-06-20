<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$path = resource_path('js/lang');
echo "=== Путь: $path ===\n\n";

// Тест 1: glob()
echo "Тест 1: glob()\n";
$files = glob($path . '/*.js');
echo "Найдено файлов: " . count($files) . "\n";
foreach ($files as $f) {
    echo "  - " . basename($f) . "\n";
}

// Тест 2: scandir()
echo "\nТест 2: scandir()\n";
$files2 = scandir($path);
echo "Найдено файлов: " . count($files2) . "\n";
foreach ($files2 as $f) {
    if ($f !== '.' && $f !== '..') {
        echo "  - $f\n";
    }
}

// Тест 3: File::files()
echo "\nТест 3: File::files()\n";
$files3 = \Illuminate\Support\Facades\File::files($path);
echo "Найдено файлов: " . count($files3) . "\n";
foreach ($files3 as $f) {
    echo "  - " . $f->getFilename() . "\n";
}
