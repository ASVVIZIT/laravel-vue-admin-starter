<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Broadcasting Settings (Channels & Events)
    |--------------------------------------------------------------------------
    */
    'broadcasting' => [
        'channels' => [
            'user'      => 'user.{id}',
            'presence'  => 'chat',
            'friends'   => 'friends.{userId}',
            'call'      => 'call.{userId}',
            'signal'    => 'signal.{userId}',
        ],
        'events' => [
            'message_sent'          => 'MessageSent',
            'message_read'          => 'MessageRead',
            'friend_request_sent'   => 'FriendRequestSent',
            'friend_accepted'       => 'FriendRequestAccepted',
            'incoming_call'         => 'IncomingCall',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | UI & Display Settings (Настройки отображения)
    |--------------------------------------------------------------------------
    */
    'ui' => [
        'messages_per_page'       => 50,          // Пагинация истории
        'history_cache_limit'     => 200,         // Лимит кэша сообщений на фронтенде
        'typing_indicator_timeout' => 1500,       // Задержка исчезновения "печатает..." (мс)
        'status_message_timeout'  => 3000,        // Время показа уведомлений "Успешно/Ошибка"
        'enable_typing_indicator' => true,        // Включить индикатор набора текста
        'enable_read_receipts'    => true,        // Включить галочки прочтения
        'enable_typing_animation' => true,        // Анимация набора текста
    ],

    /*
    |--------------------------------------------------------------------------
    | Content Limits & Constraints (Лимиты контента)
    |--------------------------------------------------------------------------
    */
    'limits' => [
        'max_message_length'    => 5000,          // Макс. длина сообщения (символов)
        'max_attachment_size'   => 25600,         // Макс. размер файла (KB -> ~25MB)
        'allowed_mime_types'    => [              // Разрешенные типы медиа
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm',
            'application/pdf',
        ],
        'rate_limit_per_minute' => 60,            // API запросов в минуту
        'search_min_length'     => 3,             // Мин. символов для поиска контактов
    ],

    /*
    |--------------------------------------------------------------------------
    | Feature Flags (Вкл/Выкл функций)
    |--------------------------------------------------------------------------
    */
    'features' => [
        'enable_voice_messages'     => true,
        'enable_video_calls'        => true,
        'enable_reactions'          => false,     // Beta
        'enable_editing_messages'   => true,
        'enable_message_deletion'   => true,      // Возможность удалить свое сообщение
    ],
];
