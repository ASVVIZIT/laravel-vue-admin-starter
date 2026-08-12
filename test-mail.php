<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Читаем напрямую из .env, чтобы избежать проблем с кэшем конфигов (config:cache)
$recipient = env('MAIL_TEST_TO', 'dillerasvasviner@gmail.com');
$fromAddress = env('MAIL_FROM_ADDRESS', 'DillerASV@yandex.ru');
$fromName = env('MAIL_FROM_NAME', 'FenixPortal Test');

echo "🚀 Начинаем тестирование отправки почты...\n";
echo "📤 Отправитель: {$fromName} <{$fromAddress}>\n";
echo "📥 Получатель: {$recipient}\n";
echo "🔌 SMTP: " . env('MAIL_HOST') . ":" . env('MAIL_PORT') . " (" . env('MAIL_ENCRYPTION') . ")\n";
echo str_repeat("-", 60) . "\n";

try {
    \Illuminate\Support\Facades\Mail::raw(
        "Привет! Это тестовое письмо от FenixPortal.\n\n" .
        "Время отправки: " . date('Y-m-d H:i:s') . "\n\n" .
        "Если ты видишь это сообщение, значит SMTP-сервер настроен и работает корректно!",
        function ($message) use ($recipient, $fromAddress, $fromName) {
            $message->to($recipient)
                ->from($fromAddress, $fromName)
                ->subject('🔥 [Тест SMTP] FenixPortal - Проверка связи');
        }
    );

    echo "✅ УСПЕХ! Письмо успешно передано на SMTP-сервер.\n";
    echo "📬 Пожалуйста, проверь ящик Gmail (папки 'Входящие' или 'Спам').\n";
    echo "💡 Если письма нет, проверь файл storage/logs/laravel.log\n";

} catch (\Exception $e) {
    echo "❌ ОШИБКА ОТПРАВКИ!\n";
    echo "🔴 Основное сообщение: " . $e->getMessage() . "\n";

    // Выводим детальную причину, если она есть (часто там лежит истинная причина от SMTP)
    if ($e->getPrevious()) {
        echo "🔴 Детали (Previous): " . $e->getPrevious()->getMessage() . "\n";
    }

    echo "\n💡 Частые причины ошибок с Яндекс SMTP:\n";
    echo "1. В MAIL_PASSWORD указан обычный пароль от аккаунта. Нужен именно 'Пароль приложения'!\n";
    echo "2. Порт 587 заблокирован провайдером или OpenServer (попробуй порт 465 и ssl).\n";
    echo "3. Яндекс заблокировал вход как 'подозрительный' (проверь почту Яндекса на наличие уведомлений о безопасности).\n";
}
