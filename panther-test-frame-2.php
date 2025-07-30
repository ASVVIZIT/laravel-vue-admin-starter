<?php

require 'vendor/autoload.php';

use Symfony\Component\Panther\Client;
use Symfony\Component\Panther\DomCrawler\Crawler;
use Facebook\WebDriver\WebDriverBy;
use Illuminate\Support\Facades\Http;

// Конфигурация
$storyId = '17167163942362';
$targetUrl = "https://iframe.coomeet.com/stories/all/{$storyId}";
$screenshotPath = 'storage/logs/video_pages/';
$downloadPath = 'storage/videos/';
$downloadInterval = 15; // Интервал скачивания в секундах

// Создаем необходимые директории
if (!is_dir($screenshotPath)) mkdir($screenshotPath, 0755, true);
if (!is_dir($downloadPath)) mkdir($downloadPath, 0755, true);

try {
    // Указываем явно использовать Chrome
    putenv('PANTHER_BROWSER=chrome');

    $client = Client::createChromeClient(
        __DIR__.'/public/chromedriver_64.exe',
        [
            '--headless=new',
            '--window-size=1920,1080',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-infobars',
            '--disable-extensions',
            '--disable-setuid-sandbox',
            '--disable-software-rasterizer',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        ],
        [],
        'http://127.0.0.1:8000'
    );

    // Устанавливаем таймауты
    $client->manage()->timeouts()->pageLoadTimeout(60);
    $client->manage()->timeouts()->implicitlyWait(30);
    $client->manage()->window()->maximize();

    // Основной цикл скачивания
    $counter = 1;
    while (true) {
        echo "\n[Цикл #{$counter}] Начало в " . date('H:i:s') . "\n";

        try {
            // Этап 1: Загрузка целевой страницы
            $client->request('GET', $targetUrl);
            $client->waitFor('#app', 10);
            echo "Этап 1: Страница загружена\n";

            // Этап 2: Обработка выбора пола
            try {
                $maleElement = $client->waitFor('.gender-item.male', 5);
                $classes = $maleElement->getAttribute('class') ?? '';

                if (strpos($classes, 'active') === false) {
                    $maleElement->click();
                    $client->waitFor('.gender-item.active.male', 5);
                    echo "Этап 2: Выбран мужской пол\n";

                    // Нажатие кнопки "Продолжить"
                    $continueButton = $client->waitFor('.ui-simple-button.size-56.color-blue', 5);
                    $continueButton->click();
                    echo "Этап 2: Нажата кнопка 'Продолжить'\n";
                }
            } catch (Exception $e) {
                echo "Этап 2: Пропуск выбора пола: " . $e->getMessage() . "\n";
            }
            /*
                        // Этап 3: Обработка соглашения
                        try {
                            $client->waitFor('.popup-overlay.visible', 3);
                            $client->waitFor('.terms-of-service', 3);

                            $acceptButton = $client->getCrawler()->filter('.ui-simple-button.terms-actions__button.color-blue.size-46');
                            if ($acceptButton->count() > 0 && $acceptButton->isDisplayed()) {
                                $acceptButton->click();
                                echo "Этап 3: Принято соглашение\n";
                            }
                        } catch (Exception $e) {
                            echo "Этап 3: Пропуск соглашения: " . $e->getMessage() . "\n";
                        }*/

            /*            // Этап 4: Обработка кнопки "Попробуйте бесплатно"
                        try {
                            $freeButton = $client->getCrawler()->filter('#open-app');
                            if ($freeButton->count() > 0 && $freeButton->isDisplayed()) {
                                $freeButton->click();
                                echo "Этап 4: Нажата кнопка 'Попробуйте бесплатно'\n";
                            }
                        } catch (Exception $e) {
                            echo "Этап 4: Пропуск кнопки бесплатной пробной версии\n";
                        }

                        // Этап 5: Закрытие Google модалки
                        try {
                            $googleModal = $client->waitFor('#credential_picker_container', 5);
                            $closeButton = $client->getCrawler()->filter('#close');
                            if ($closeButton->count() > 0 && $closeButton->isDisplayed()) {
                                $closeButton->click();
                                echo "Этап 5: Закрыта Google модалка\n";
                            }
                        } catch (Exception $e) {
                            echo "Этап 5: Google модалка не найдена\n";
                        }*/

            // Этап 6: Поиск и скачивание видео
            try {
                // Ожидаем появления и видимости видео элемента
                $client->waitForVisibility('video', 30);

                // Получаем элемент видео через JavaScript
                $videoElement = $client->executeScript('return document.querySelector("video")');

                if ($videoElement) {
                    // Получаем src из JavaScript
                    $videoPath = $client->executeScript('return document.querySelector("video").src');

                    if (empty($videoPath)) {
                        // Альтернативный способ через атрибут
                        $videoPath = $client->getCrawler()->filter('video')->attr('src');
                    }

                    if (empty($videoPath)) {
                        throw new Exception("Путь к видео не найден");
                    }

                    // Формируем полный URL видео
                    $videoUrl = $videoPath;
                    if (strpos($videoUrl, '//') === 0) {
                        $videoUrl = 'https:' . $videoUrl;
                    }

                    echo "Этап 6: Найдено видео: $videoUrl\n";

                    // Скачивание видео
                    downloadVideo($videoUrl, $downloadPath, $storyId);
                } else {
                    echo "Этап 6: Видео элемент не найден в DOM\n";
                }
            } catch (Exception $e) {
                echo "Этап 6: Ошибка поиска видео: " . $e->getMessage() . "\n";

                // Сохраняем HTML для отладки
                $html = $client->getPageSource();
                $htmlFile = $screenshotPath . 'error_' . time() . '.html';
                file_put_contents($htmlFile, $html);
                echo "Сохранен HTML для отладки: $htmlFile\n";
            }

            // Сохраняем скриншот для отладки
            $screenshotFile = $screenshotPath . 'cycle_' . $counter . '.png';
            $client->takeScreenshot($screenshotFile);
            echo "Скриншот сохранен: $screenshotFile\n";

        } catch (Exception $e) {
            echo "Критическая ошибка: " . $e->getMessage() . "\n";

            // Пересоздаем клиент при критических ошибках
            $client->quit();
            $client = Client::createChromeClient(
                __DIR__.'/public/chromedriver_64.exe',
                [
                    '--headless=new',
                    '--window-size=1920,1080',
                    '--disable-gpu',
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-infobars',
                    '--disable-extensions',
                    '--disable-setuid-sandbox',
                    '--disable-software-rasterizer',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
                ],
                [],
                'http://127.0.0.1:8000'
            );
        }

        echo "[Цикл #{$counter}] Ожидание {$downloadInterval} секунд\n";
        sleep($downloadInterval);
        $counter++;
    }

} catch (Exception $e) {
    echo "ФАТАЛЬНАЯ ОШИБКА: " . $e->getMessage() . "\n";
    exit(1);
}

/**
 * Скачивает видеофайл
 */
function downloadVideo($videoUrl, $downloadPath, $storyId) {
    try {
        // Нормализация URL
        if (strpos($videoUrl, '//') === 0) {
            $videoUrl = 'https:' . $videoUrl;
        }

        // Получение имени файла
        $path = parse_url($videoUrl, PHP_URL_PATH);
        $filename = basename($path);

        if (empty($filename)) {
            $filename = 'video_' . time() . '.webm';
        }

        // Добавляем storyId в имя файла
        $filename = $storyId . '_' . $filename;
        $filePath = $downloadPath . DIRECTORY_SEPARATOR . $filename;

        // Создаем cURL-ресурс
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $videoUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
        curl_setopt($ch, CURLOPT_REFERER, 'https://iframe.coomeet.com/');
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        // Заголовки для обхода возможных ограничений
        $headers = [
            'Accept: */*',
            'Accept-Language: en-US,en;q=0.9',
            'Connection: keep-alive',
            'DNT: 1',
            'Sec-Fetch-Dest: video',
            'Sec-Fetch-Mode: no-cors',
            'Sec-Fetch-Site: cross-site',
        ];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $videoData = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode == 200 && !empty($videoData)) {
            file_put_contents($filePath, $videoData);
            $fileSize = filesize($filePath);

            if ($fileSize > 0) {
                echo "Видео скачано: $filePath ($fileSize байт)\n";
                return true;
            } else {
                echo "Ошибка: файл создан, но пуст\n";
                return false;
            }
        }

        echo "Ошибка скачивания: HTTP $httpCode - $error\n";
        return false;

    } catch (Exception $e) {
        echo "Ошибка скачивания видео: " . $e->getMessage() . "\n";
        return false;
    }
}
