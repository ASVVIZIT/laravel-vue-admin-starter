<?php
require 'vendor/autoload.php';
use Symfony\Component\Panther\Client;
use Facebook\WebDriver\WebDriverBy;
use Facebook\WebDriver\WebDriverDimension;
use Facebook\WebDriver\Exception\NoSuchElementException;

// Конфигурация
$storyId = '17167163942362';
$targetUrl = "https://iframe.coomeet.com/stories/all/ {$storyId}";
$sessionPath = 'storage/logs/video_pages/' . $storyId . '/';
$downloadPath = 'storage/videos/';
$downloadInterval = 15; // Интервал скачивания в секундах

// Создаем необходимые директории
if (!is_dir($sessionPath)) mkdir($sessionPath, 0755, true);
if (!is_dir($downloadPath)) mkdir($downloadPath, 0755, true);

// Функция человеческих задержек
function humanDelay($min = 1, $max = 3) {
    $seconds = rand($min, $max);
    echo "  Задержка: {$seconds} секунд\n";
    sleep($seconds);
}

// Функция для сохранения диагностических данных
function saveDiagnostics($client, $sessionPath, $cycle, $stage, $status = 'success', $method = null) {
    $timestamp = time();
    $prefix = $method ? "{$cycle}_{$stage}_{$method}_{$status}_{$timestamp}" : "{$cycle}_{$stage}_{$status}_{$timestamp}";
    // Сохраняем скриншот
    $screenshotFile = $sessionPath . $prefix . '.png';
    $client->takeScreenshot($screenshotFile);
    // Сохраняем HTML
    $htmlFile = $sessionPath . $prefix . '.html';
    file_put_contents($htmlFile, $client->getPageSource());
    // Сохраняем cookies
    $cookiesFile = $sessionPath . $prefix . '_cookies.json';
    $cookies = $client->manage()->getCookies();
    // Фильтруем пустые куки
    $filteredCookies = [];
    foreach ($cookies as $cookie) {
        if (!empty($cookie->getName())) {
            $filteredCookies[] = [
                'name' => $cookie->getName(),
                'value' => $cookie->getValue(),
                'domain' => $cookie->getDomain(),
                'path' => $cookie->getPath(),
                'expiry' => $cookie->getExpiry(),
                'secure' => $cookie->isSecure(),
                'httpOnly' => $cookie->isHttpOnly()
            ];
        }
    }
    file_put_contents($cookiesFile, json_encode($filteredCookies, JSON_PRETTY_PRINT));
    return [
        'screenshot' => $screenshotFile,
        'html' => $htmlFile,
        'cookies' => $cookiesFile
    ];
}
// Улучшенная функция проверки успеха выбора пола
function isGenderSelected($client) {
    try {
        // Проверка через JavaScript
        $isSelected = $client->executeScript("
            return !!document.querySelector('.gender-item.male.active') || 
                   !!document.querySelector('.ui-simple-button.size-56.color-blue:not([disabled])');
        ");
        if ($isSelected) return true;
        // Проверка видимости кнопки "Продолжить"
        $continueButton = $client->findElements(WebDriverBy::cssSelector('.ui-simple-button.size-56.color-blue'));
        if (count($continueButton) > 0 && $continueButton[0]->isDisplayed()) {
            return true;
        }
        return false;
    } catch (Exception $e) {
        return false;
    }
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
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36');
        curl_setopt($ch, CURLOPT_REFERER, 'https://iframe.coomeet.com/ ');
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
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
                return [
                    'success' => true,
                    'path' => $filePath,
                    'size' => $fileSize
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Файл создан, но пуст'
                ];
            }
        }
        return [
            'success' => false,
            'error' => "HTTP $httpCode - $error"
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}
/**
 * УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ КНОПКИ "ПРОДОЛЖИТЬ"
 */
function clickContinueButton(
    $client,
    $sessionPath,
    $counter,
    $stage,
    $successIndicator = null
) {
    echo "\n[ПРОДОЛЖИТЬ] Поиск кнопки продолжения\n";
    $continueButtonMethods = [
        'direct_click' => function($client, $element) {
            $element->click();
            return "Прямой клик";
        },
        'js_click' => function($client, $element) {
            $client->executeScript("arguments[0].click();", [$element]);
            return "JavaScript клик";
        },
        'mouse_simulation' => function($client, $element) {
            $client->executeScript("
                const rect = arguments[0].getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                const mouseMove = new MouseEvent('mousemove', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: x,
                    clientY: y
                });
                arguments[0].dispatchEvent(mouseMove);
                const mouseDown = new MouseEvent('mousedown', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: x,
                    clientY: y
                });
                arguments[0].dispatchEvent(mouseDown);
                const mouseUp = new MouseEvent('mouseup', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: x,
                    clientY: y
                });
                arguments[0].dispatchEvent(mouseUp);
                const click = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: x,
                    clientY: y
                });
                arguments[0].dispatchEvent(click);
            ", [$element]);
            return "Полная симуляция мыши";
        },
        'focus_and_enter' => function($client, $element) {
            $client->executeScript("
                arguments[0].focus();
                const keyDown = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true
                });
                arguments[0].dispatchEvent(keyDown);
                const keyUp = new KeyboardEvent('keyup', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true
                });
                arguments[0].dispatchEvent(keyUp);
                const keyPress = new KeyboardEvent('keypress', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true
                });
                arguments[0].dispatchEvent(keyPress);
                arguments[0].click();
            ", [$element]);
            return "Фокус + Enter";
        },
        'scroll_and_click' => function($client, $element) {
            $client->executeScript("
                arguments[0].scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
                setTimeout(() => {
                    arguments[0].click();
                }, 500);
            ", [$element]);
            return "Прокрутка + клик";
        },
        'force_visibility_and_click' => function($client, $element) {
            $client->executeScript("
                function forceStyles(el) {
                    const originalStyles = {};
                    const props = ['display', 'visibility', 'opacity', 'pointerEvents', 'position', 'zIndex'];
                    props.forEach(prop => {
                        originalStyles[prop] = el.style[prop];
                    });
                    el.style.display = 'block';
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                    el.style.pointerEvents = 'auto';
                    el.style.position = 'relative';
                    el.style.zIndex = '999999';
                    return originalStyles;
                }
                let current = arguments[0];
                while (current && current !== document.body) {
                    forceStyles(current);
                    current = current.parentElement;
                }
                arguments[0].click();
            ", [$element]);
            return "Принудительная видимость + клик";
        }
    ];

    $button = null;
    $foundBy = '';
    $selectors = [
        '.ui-simple-button.size-56.color-blue',
        '//button[contains(@class, "ui-simple-button") and contains(@class, "size-56") and contains(@class, "color-blue")]',
        '//*[contains(text(), "Продолжить")]',
        '//*[contains(text(), "Continue")]'
    ];

    foreach ($selectors as $selector) {
        try {
            if (strpos($selector, '//') === 0) {
                $elements = $client->findElements(WebDriverBy::xpath($selector));
            } else {
                $elements = $client->findElements(WebDriverBy::cssSelector($selector));
            }
            if (count($elements) > 0) {
                $button = $elements[0];
                $foundBy = $selector;
                break;
            }
        } catch (Exception $e) {
            continue;
        }
    }

    if (!$button) {
        echo "  [ОШИБКА] Кнопка 'Продолжить' не найдена\n";
        return [
            'success' => false,
            'method' => 'none',
            'message' => 'Button not found'
        ];
    }

    echo "  Найдена кнопка: {$foundBy}\n";
    $result = [
        'success' => false,
        'method' => '',
        'message' => ''
    ];

    saveDiagnostics($client, $sessionPath, $counter, $stage, "continue_before");
    foreach ($continueButtonMethods as $methodName => $method) {
        echo "  Пробуем метод: {$methodName}\n";
        try {
            $methodDescription = $method($client, $button);
            $result['method'] = $methodName;
            $result['message'] = $methodDescription;
            humanDelay(1, 2);
            if ($successIndicator) {
                $successCheck = $successIndicator($client);
                if ($successCheck) {
                    $result['success'] = true;
                    echo "  УСПЕХ: {$methodDescription}\n";
                    break;
                } else {
                    echo "  Метод не привел к успеху, пробуем следующий\n";
                }
            } else {
                $result['success'] = true;
                echo "  Предполагаемый успех: {$methodDescription}\n";
                break;
            }
        } catch (Exception $e) {
            echo "  Ошибка метода {$methodName}: " . $e->getMessage() . "\n";
            $result['message'] = $e->getMessage();
        }
    }

    saveDiagnostics($client, $sessionPath, $counter, $stage, "continue_after");
    return $result;
}
// Функции-индикаторы успеха для разных кнопок
$successIndicators = [
    'gender_continue' => function($client) {
        try {
            $appState = $client->executeScript('
                return {
                    genderVisible: document.querySelector(".gender-overlay-select") !== null,
                    chatVisible: document.querySelector(".coomeet-chat") !== null,
                    termsVisible: document.querySelector(".terms-of-service") !== null,
                    videoVisible: document.querySelector("video") !== null
                };
            ');
            if ($appState['chatVisible'] || $appState['videoVisible']) {
                return true;
            }
            if (!$appState['genderVisible']) {
                return true;
            }
            return false;
        } catch (Exception $e) {
            return false;
        }
    },
    'terms_accept' => function($client) {
        try {
            $popup = $client->findElements(WebDriverBy::cssSelector('.popup-overlay.visible'));
            return count($popup) === 0;
        } catch (Exception $e) {
            return true;
        }
    },
    'google_close' => function($client) {
        try {
            $googleModal = $client->findElements(WebDriverBy::cssSelector('#credential_picker_container'));
            return count($googleModal) === 0;
        } catch (Exception $e) {
            return true;
        }
    }
];
// Улучшенные методы клика с обработкой "шторки" для выбора пола
$genderSelectionMethods = [
    'replace_gender_block' => function($client, $element) {
        $customHtml = <<<HTML
<div class="gender-select">
    <div class="gender-select__title">Я<span class="gender-select__sex color-blue">Мужчина</span></div>
    <div class="gender-items">
        <div class="gender-item active male">
            <div class="gender-item__icon">
                <div class="selected-indicator">
                    <div class="selected-indicator__icon"></div>
                </div>
            </div>
            <div class="gender-item__label">Мужчина</div>
        </div>
        <div class="gender-item female disabled">
            <div class="gender-item__icon">
                <div class="selected-indicator">
                    <div class="selected-indicator__icon"></div>
                </div>
            </div>
            <div class="gender-item__label">Женщина</div>
        </div>
    </div>
    <div class="ui-simple-button size-56 color-blue">
        <div class="ui-simple-button__label">Продолжить</div>
    </div>
</div>
HTML;

        $client->executeScript("
            const genderBlock = document.querySelector('.gender-overlay-select');
            if (genderBlock) {
                genderBlock.innerHTML = arguments[0];
                console.log('Блок выбора пола заменен!');
                const continueButton = document.querySelector('.ui-simple-button.size-56.color-blue');
                if (continueButton) {
                    continueButton.click();
                }
            }
        ", [$customHtml]);
        echo "  → Блок выбора пола заменен на кастомный HTML\n";
    },
    'remove_shadow_overlay' => function($client, $element) {
        $client->executeScript("
            const elements = document.elementsFromPoint(
                arguments[0].getBoundingClientRect().left + arguments[0].offsetWidth / 2,
                arguments[0].getBoundingClientRect().top + arguments[0].offsetHeight / 2
            );
            elements.forEach(el => {
                if (el !== arguments[0] && 
                    (el.style.pointerEvents === 'none' || 
                     getComputedStyle(el).pointerEvents === 'none' ||
                     el.classList.contains('overlay') ||
                     el.id === 'shadow-overlay')) {
                    el.style.display = 'none';
                }
            });
            arguments[0].click();
        ", [$element]);
        echo "  → Удаление перекрывающих элементов + клик\n";
    },
    'simulate_tab_enter' => function($client, $element) {
        $client->executeScript("
            arguments[0].focus();
            const keyboardEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                bubbles: true,
                cancelable: true
            });
            arguments[0].dispatchEvent(keyboardEvent);
        ", [$element]);
        echo "  → Имитация Tab+Enter\n";
    }
];
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
            '--use-gl=swiftshader',
            '--disable-gpu-compositing',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        ],
        [],
        'http://localhost:8000'
    );
    // Устанавливаем увеличенные таймауты
    $client->manage()->timeouts()->pageLoadTimeout(180);
    $client->manage()->timeouts()->implicitlyWait(60);
    $client->manage()->window()->setSize(new WebDriverDimension(1920, 1080));

    // Основной цикл скачивания
    $counter = 1;
    while (true) {
        echo "\n[Цикл #{$counter}] Начало в " . date('H:i:s') . "\n";
        $cycleFiles = [];
        try {
            // Этап 1: Загрузка целевой страницы
            $client->request('GET', $targetUrl);
            echo "Этап 1: Запрос отправлен\n";
            // Ждем загрузки основного приложения
            $client->waitFor('#app', 60);
            echo "Этап 1: Основное приложение загружено\n";

            // Сохраняем диагностику после загрузки
            $cycleFiles['stage1_after_load'] = saveDiagnostics($client, $sessionPath, $counter, 'stage1_after_load');
            humanDelay(2, 3);

            // Этап 2: Обработка выбора пола
            echo "Этап 2: Начало обработки выбора пола\n";
            $genderSelected = false;
            $attempts = 0;
            try {
                // Проверяем, не выбран ли уже пол
                if (isGenderSelected($client)) {
                    echo "  Пол уже выбран, пропускаем выбор\n";
                    $genderSelected = true;
                } else {
                    echo "  Пробуем методы выбора пола:\n";
                    // Перебираем все методы клика, начиная с замены блока
                    foreach ($genderSelectionMethods as $methodName => $method) {
                        $attempts++;
                        echo "  Попытка #{$attempts}: {$methodName}\n";
                        try {
                            // Сохраняем состояние ДО попытки
                            $cycleFiles["stage2_{$methodName}_before"] = saveDiagnostics(
                                $client,
                                $sessionPath,
                                $counter,
                                'stage2_before',
                                'attempt',
                                $methodName
                            );
                            // Применяем метод
                            $method($client, $client->getCrawler()->filter('.gender-item.male'));
                            humanDelay(1, 2);
                            // Сохраняем состояние ПОСЛЕ попытки
                            $cycleFiles["stage2_{$methodName}_after"] = saveDiagnostics(
                                $client,
                                $sessionPath,
                                $counter,
                                'stage2_after',
                                'attempt',
                                $methodName
                            );
                            // Проверяем успех
                            if (isGenderSelected($client)) {
                                echo "  УСПЕХ: Метод {$methodName} сработал!\n";
                                $genderSelected = true;
                                break;
                            } else {
                                echo "  Не сработало, пробуем следующий метод\n";
                            }
                        } catch (\Exception $e) {
                            echo "  Ошибка при выполнении {$methodName}: " . $e->getMessage() . "\n";
                            $cycleFiles["stage2_{$methodName}_error"] = saveDiagnostics(
                                $client,
                                $sessionPath,
                                $counter,
                                'stage2',
                                'error',
                                $methodName
                            );
                        }
                    }
                }
                // Если пол выбран, нажимаем "Продолжить"
                if ($genderSelected) {
                    echo "Этап 2: Пол успешно выбран\n";
                    // Сохраняем DOM до нажатия для отладки
                    $domBefore = $client->getPageSource();
                    file_put_contents($sessionPath . "dom_before_continue_{$counter}.html", $domBefore);
                    // Сохраняем URL до нажатия
                    $urlBefore = $client->getCurrentURL();
                    // Нажатие кнопки "Продолжить" через специализированную функцию
                    $continueResult = clickContinueButton(
                        $client,
                        $sessionPath,
                        $counter,
                        'stage2',
                        $successIndicators['gender_continue']
                    );
                    if ($continueResult['success']) {
                        echo "Этап 2: Кнопка 'Продолжить' успешно нажата ({$continueResult['method']})\n";
                    } else {
                        echo "Этап 2: Не удалось нажать кнопку 'Продолжить'\n";
                    }
                } else {
                    throw new Exception("Не удалось выбрать пол после {$attempts} попыток");
                }
            } catch (Exception $e) {
                echo "Этап 2: Критическая ошибка: " . $e->getMessage() . "\n";
                $cycleFiles['stage2_final_error'] = saveDiagnostics($client, $sessionPath, $counter, 'stage2', 'critical_error');
            }

            // Этап 3: Обработка соглашения
            echo "Этап 3: Обработка соглашения\n";
            try {
                // Явное ожидание появления кнопки соглашения
                $termsButton = $client->waitFor('.ui-simple-button.terms-actions__button.color-blue.size-46', 15);
                if ($termsButton->isDisplayed()) {
                    $termsResult = clickContinueButton(
                        $client,
                        $sessionPath,
                        $counter,
                        'stage3',
                        $successIndicators['terms_accept']
                    );
                    if ($termsResult['success']) {
                        echo "Этап 3: Соглашение успешно принято ({$termsResult['method']})\n";
                    } else {
                        echo "Этап 3: Не удалось принять соглашение\n";
                    }
                }
            } catch (Exception $e) {
                echo "Этап 3: Пропуск соглашения: " . $e->getMessage() . "\n";
            }

            // Этап 4: Поиск и скачивание видео
            try {
                echo "Этап 4: Поиск видео (игнорируем silent.mp4)\n";
                $realVideoFound = false;
                $videoUrl = '';
                $maxAttempts = 12; // 12 попыток по 5 секунд = 60 сек
                $attempt = 0;
                while (!$realVideoFound && $attempt < $maxAttempts) {
                    $attempt++;
                    echo "  Попытка #$attempt найти видео\n";
                    // Поиск через JavaScript с фильтрацией
                    $videoUrl = $client->executeScript('
                        const videos = document.querySelectorAll("video");
                        for (let i = 0; i < videos.length; i++) {
                            const style = window.getComputedStyle(videos[i]);
                            if (style.display !== "none" && 
                                style.visibility !== "hidden" && 
                                style.opacity !== "0") {
                                const src = videos[i].currentSrc || videos[i].src || "";
                                if (src && !src.includes("silent.mp4")) {
                                    return src;
                                }
                            }
                        }
                        return "";
                    ');
                    if (!empty($videoUrl)) {
                        $realVideoFound = true;
                        break;
                    }
                    sleep(5); // Ожидание между попытками
                }
                if (!$realVideoFound) {
                    throw new Exception("Реальное видео не найдено после $maxAttempts попыток");
                }
                echo "Этап 4: Найдено видео: $videoUrl\n";
                // Скачивание видео
                $downloadResult = downloadVideo($videoUrl, $downloadPath, $storyId);
                if ($downloadResult['success']) {
                    echo "Видео скачано: {$downloadResult['path']} ({$downloadResult['size']} байт)\n";
                } else {
                    echo "Ошибка скачивания: {$downloadResult['error']}\n";
                }
                // Сохраняем диагностику после скачивания
                $cycleFiles['stage6'] = saveDiagnostics($client, $sessionPath, $counter, 'stage6');
            } catch (Exception $e) {
                echo "Этап 4: Ошибка поиска видео: " . $e->getMessage() . "\n";
                $cycleFiles['stage6_error'] = saveDiagnostics($client, $sessionPath, $counter, 'stage6', 'error');
            }

            // Выводим информацию о сохраненных файлах
            echo "\nСохраненные диагностические данные для цикла #$counter:\n";
            foreach ($cycleFiles as $key => $files) {
                echo "- $key:\n";
                foreach ($files as $type => $path) {
                    echo "  $type: $path\n";
                }
            }
            echo "\n[Цикл #{$counter}] Ожидание {$downloadInterval} секунд\n";
            sleep($downloadInterval);
            $counter++;
        } catch (Exception $e) {
            echo "Критическая ошибка: " . $e->getMessage() . "\n";
            $cycleFiles['critical_error'] = saveDiagnostics($client, $sessionPath, $counter, 'critical', 'error');
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
                    '--use-gl=swiftshader',
                    '--disable-gpu-compositing',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
                ],
                [],
                'http://localhost:8000'
            );
            // Устанавливаем увеличенные таймауты для нового клиента
            $client->manage()->timeouts()->pageLoadTimeout(180);
            $client->manage()->timeouts()->implicitlyWait(60);
            $client->manage()->window()->setSize(new WebDriverDimension(1920, 1080));
        }
    }
} catch (Exception $e) {
    echo "ФАТАЛЬНАЯ ОШИБКА: " . $e->getMessage() . "\n";
    echo "Трассировка: " . $e->getTraceAsString() . "\n";
    exit(1);
}
