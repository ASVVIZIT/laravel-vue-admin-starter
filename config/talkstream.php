<?php

/*
|--------------------------------------------------------------------------
| TALKSTREAM MODULE CONFIG — контракт настроек модуля чата
|--------------------------------------------------------------------------
|
| ⚠️ ЭТО КОНТРАКТ/ЗАДЕЛ, НЕ ВСЕ ФЛАГИ ПРИМЕНЯЮТСЯ В КОДЕ.
| Значения ниже — декларация намерений. Реальная зрелость каждой опции
| помечена тегом справа. Не считай [НЕТ]-флаги «выключенными фичами» —
| это фичи, которых ещё нет в реализации.
|
| ЛЕГЕНДА МЕТОК:
|   [РЕАЛ]  опция/канал/событие реально работает в коде (подписка/валидация/логика есть)
|   [ЧАСТ]  часть цепочки есть, часть отсутствует (напр. событие шлётся, но фронт не ловит)
|   [НЕТ]   задел: объявлено в контракте, в коде не применяется / фича не реализована
|   [РАСХ]  рассинхрон контракта с реальным кодом (имя/маппинг врёт) — требует правки значения
|
| РЕВИЗИЯ (якорь отладки, НЕ релизная версия):
|   Привязана к срезу аудита tools/modules/TalkStream/ScriptTalkStreamAudit/reports/TALKSTREAM_AUDIT_Level_*.txt.
|   Для «какая версия чата» теху на экране — читать это поле через
|   ConfigController::getConfig (когда фронт-читалка /talkstream/config будет
|   подключена; сейчас она НЕ подключена — см. примечание в конце файла).
|   Настоящая версия модуля в будущем = git describe --tags, не ручной счётчик.
|
| СВОДКА ЗРЕЛОСТИ (27 листовых опций):
|   [РЕАЛ]=8  [ЧАСТ]=3  [РАСХ]=0  [НЕТ]=16
|   Реально работают: channels.user/presence/friends; events.NewMessage/message_read/
|   friend_request_sent/friend_accepted; limits.max_message_length;
|   базовая логика read-receipt (но НЕ флаг-выключатель enable_read_receipts).
|   Остальное — задел под будущие итерации (typing, пагинация, медиа, WebRTC,
|   реакции, редактирование/удаление, rate-limit, фронт-читалка конфига).
|
*/

return [

    // Якорь среза контракта (совпадает с меткой последнего аудита, включённого в коммит).
    'revision' => 'audit-3.7',

    /*
    |--------------------------------------------------------------------------
    | Broadcasting Settings (Channels & Events)
    |--------------------------------------------------------------------------
    */
    'broadcasting' => [
        'channels' => [
            // [РЕАЛ] echo.private('user.{id}') в setupChatEventsChannel; ловит .NewMessage и .MessageRead
            'user'      => 'user.{id}',
            // [РЕАЛ] echo.join('chat')→presence-chat + setupUserPresenceChannel (here/joining/leaving→setUserOnline/Offline)
            'presence'  => 'chat',
            // [РЕАЛ] echo.private('friends.{id}') + setupFriendRequestsChannel (ловит FriendRequestSent/Accepted)
            'friends'   => 'friends.{userId}',
            // [ЧАСТ] канал объявлен в channels.php, роуты call/* и CallController есть,
            //        но WebRTC-сигналинг (offer/answer/ICE) не реализован → медиасоединение не установится
            'call'      => 'call.{userId}',
            // [НЕТ]  канал объявлен в channels.php, но ни одной подписки/слушателя signal.* в модуле нет
            'signal'    => 'signal.{userId}',
        ],
        'events' => [
            // [РЕАЛ] Исправлено рассинхронизация. Реальный класс события = App\Events\TalkStream\NewMessage (broadcastAs 'NewMessage').
            //        Фронт-хендлер корректно слушает '.NewMessage'. Контракт теперь правдив.
            'message_sent'          => 'NewMessage',
            // [РЕАЛ] App\Events\TalkStream\MessageRead; broadcastWith=['message'=>…]; фронт разворачивает e.message.to_id→markSentAsRead
            'message_read'          => 'MessageRead',
            // [РЕАЛ] App\Events\TalkStream\FriendRequestSent; ловится friendshipEventsHandler
            'friend_request_sent'   => 'FriendRequestSent',
            // [РЕАЛ] App\Events\TalkStream\FriendRequestAccepted; ловится friendshipEventsHandler
            'friend_accepted'       => 'FriendRequestAccepted',
            // [ЧАСТ] App\Events\TalkStream\IncomingCall шлётся из CallController::initiate,
            //        но фронт-обработчик входящего звонка/сигнализации отсутствует
            'incoming_call'         => 'IncomingCall',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | UI & Display Settings (Настройки отображения)
    |--------------------------------------------------------------------------
    | НИ ОДИН флаг ниже сейчас НЕ гейтит рендер: фронт-читалка /talkstream/config
    | не подключена, значения захардкожены/дефолтны в компонентах.
    */
    'ui' => [
        // [НЕТ] getHistory тянет ВСЮ историю без пагинации; поле отдаётся ConfigController, но фронт не читает
        'messages_per_page'       => 50,          // Пагинация истории

        // [НЕТ] chatStore.history/messages не обрезаются по лимиту; переполнение кэша не контролируется
        'history_cache_limit'     => 200,         // Лимит кэша сообщений на фронтенде

        // [НЕТ] индикатора «печатает…» нет ни в сторе, ни в UI, ни WS-события Typing*
        'typing_indicator_timeout' => 800,       // Задержка исчезновения "печатает..." (мс)

        // [НЕТ] таймауты ElMessage/ElNotification = дефолт ElementPlus, конфиг не читается
        'status_message_timeout'  => 1500,        // Время показа уведомлений "Успешно/Ошибка" (мс)

        // [НЕТ] фичи typing нет → флаг нечего включать/выключать
        'enable_typing_indicator' => true,        // Включить индикатор набора текста

        // [ЧАСТ] БАЗОВАЯ логика read-receipt РЕАЛИЗОВАНА (POST /read + MessageRead + markSentAsRead + синие галочки),
        //        но сам ФЛАГ-ВЫКЛЮЧАТЕЛЬ не применяется: MessageItem рисует галочки безусловно,
        //        без проверки config('talkstream.ui.enable_read_receipts') на фронте.
        'enable_read_receipts'    => true,        // Включить галочки прочтения

        // [НЕТ] анимации набора текста нет (зависит от typing-фичи)
        'enable_typing_animation' => true,        // Анимация набора текста
    ],

    /*
    |--------------------------------------------------------------------------
    | Content Limits & Constraints (Лимиты контента)
    |--------------------------------------------------------------------------
    */
    'limits' => [
        // [РЕАЛ] SendMessageRequest валидирует content по max_message_length; ConfigController отдаёт поле
        'max_message_length'    => 5000,          // Макс. длина сообщения (символов)

        // [НЕТ] медиа/вложений нет (type всегда 'text'), размер файла не проверяется
        'max_attachment_size'   => 25600,         // Макс. размер файла (KB -> ~25MB)

        // [НЕТ] mime-типы не используются (нет загрузки файлов в чат)
        'allowed_mime_types'    => [              // Разрешенные типы медиа
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm',
            'application/pdf',
        ],

        // [НЕТ] в группе роутов talkstream (routes/api.php) НЕТ throttle middleware на /send и др.
        'rate_limit_per_minute' => 60,            // API запросов в минуту

        // [НЕТ для чата] поиск контактов не реализован (contactStore.loadContacts тянет всех без фильтра);
        //        поле пересекается по смыслу с Training-конфигом, в TalkStream не читается
        'search_min_length'     => 3,             // Мин. символов для поиска контактов
    ],

    /*
    |--------------------------------------------------------------------------
    | Feature Flags (Вкл/Выкл функций)
    |--------------------------------------------------------------------------
    | Все флаги ниже — ЗАДЕЛ: соответствующих фич в коде нет, и флаги НЕ гейтят UI.
    | Значения оставлены как есть (контракт намерений), не понижай их молча.
    */
    'features' => [
        // [НЕТ] голосовых сообщений нет (нет type='voice', нет записи/воспроизведения)
        'enable_voice_messages'     => true,

        // [НЕТ] видеозвонков нет: роуты/события инициации есть, WebRTC-соединения нет; флаг не гейтит
        'enable_video_calls'        => true,

        // [НЕТ] реакций нет; значение false согласовано с реальностью (единственный честный флаг секции)
        'enable_reactions'          => false,     // Beta

        // [НЕТ] редактирования сообщений нет (нет UI, нет эндпоинта, нет события); флаг не гейтит
        'enable_editing_messages'   => true,

        // [НЕТ] удаления сообщений нет (нет UI, нет эндпоинта, нет события); флаг не гейтит
        'enable_message_deletion'   => true,      // Возможность удалить свое сообщение
    ],
];

/*
|--------------------------------------------------------------------------
| ПРИМЕЧАНИЕ ДЛЯ ТЕХА / ДОРАБОТКИ
|--------------------------------------------------------------------------
| 1. РАСХОЖДЕНИЕ message_sent: ИСПРАВЛЕНО в срезе audit-3.7. Значение изменено на 'NewMessage',
|    чтобы соответствовать реальному broadcastAs класса App\Events\TalkStream\NewMessage.
|    Теперь контракт правдив, фронт слушает '.NewMessage', всё работает корректно.
| 2. Фронт-читалка /talkstream/config НЕ подключена: ConfigController::getConfig отдаёт
|    subset (ui.enable_read_receipts, ui.messages_per_page, limits.max_message_length),
|    но ни appStore, ни initAuthConfig, ни settings.js этот эндпоинт не дёргают.
|    Пока это так — ВСЕ [НЕТ]/[ЧАСТ]-флаги ui.* и features.* физически ни на что не влияют.
| 3. Чтобы показывать теху «ревизию чата» на экране — достаточно добавить в ответ
|    ConfigController::getConfig строку 'revision' => config('talkstream.revision')
|    и вывести её бейджем, когда фронт-читалка будет подключена. Саму читалку и бейдж
|    сейчас НЕ делаем (согласовано: экосистема пишется, git есть, 0.0.x избыточно).
| 4. Порядок закрытия заделов (рекомендация, не обязательство):
|    сначала [НЕТ]-фичи, видимые пользователю (typing, пагинация, rate-limit),
|    затем медиа/вложения (разблокирует max_attachment_size + allowed_mime_types),
|    затем WebRTC-сигналинг (разблокирует call/signal/incoming_call/enable_video_calls),
|    затем редактирование/удаление/реакции, затем фронт-читалка конфига + гейты флагов.
*/
