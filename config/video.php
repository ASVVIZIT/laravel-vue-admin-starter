<?php

return [
    'ffmpeg' => [
        'ffmpeg.binaries'  => env('FFMPEG_BINARIES', 'ffmpeg'),
        'ffprobe.binaries' => env('FFPROBE_BINARIES', 'ffprobe'),
        'timeout'          => 7200,
        'ffmpeg.threads'   => 12,
    ],

    'ffprobe' => [
        'binaries' => env('FFPROBE_BINARIES', 'ffprobe'),
    ],

    'timeout' => 3600,

    'scanner' => [
        'ffprobe_limit' => env('VIDEO_FFPROBE_LIMIT', 5),
        'max_processing_time' => env('VIDEO_MAX_PROCESSING_TIME', 30),
        'cache_ttl' => env('VIDEO_CACHE_TTL', 3600),
        'supported_formats' => ['webm', 'mp4', 'mov', 'avi', 'mkv', 'flv'],
        'sort_by' => 'modified',
        'sort_direction' => 'desc',
        'recent_threshold' => 0, // 2592000 30 дней
    ],

    'paths' => [
        'storage' => str_replace('/', DIRECTORY_SEPARATOR, storage_path('Videos/videos')),
        'public_url' => '/storage/Videos/videos/',
    ],
];

/*
   Эта реализация дает полную картину о процессе обработки видео и
   позволяет быстро идентифицировать проблемы с отдельными файлами.

    Ключевые особенности реализации:
        Индикатор статуса FFmpeg:
            Показывается в правом верхнем углу каждого видео
            Разные цвета для разных статусов
            Иконка внутри индикатора
            Всплывающая подсказка при наведении

        Статусы обработки:
            success - видео успешно обработано
            processed - алиас для success
            skipped - проверка пропущена (новое видео)
            skipped_old - проверка пропущена (старое видео)
            timeout - не хватило времени на проверку
            no_video_stream - не найден видеопоток
            error - ошибка обработки
            unknown - неизвестный статус

        Визуальное представление:
            Зеленый: успешная обработка
            Желтый: пропущено
            Оранжевый: таймаут
            Красный: ошибки
            Серый: неизвестный статус

        Интеграция в метаданные:
            Статус отображается в панели метаданных
            Обновляется при ручном обновлении метаданных

        Логирование на сервере:
            Подробная статистика по статусам
            Отслеживание времени обработки
            Логирование ошибок

        Гибкая настройка:
            Порог "свежести" видео в конфиге
            Максимальное время обработки
            Поддерживаемые форматы
*/
