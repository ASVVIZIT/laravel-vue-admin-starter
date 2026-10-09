# TalkStream — эталонное руководство модуля (срез `audit-3.7`)

## Назначение документа

Это руководство описывает, как модуль TalkStream должен работать целиком: от инициализации приложения до отображения сообщений в интерфейсе. Документ является картой системы, а не пошаговым учебником. Полноценные отдельные руководства по установке, отладке, расширению и медиа-подсистеме будут подготовлены позже.

**Якорь ревизии:** `audit-3.7`.

Значение `audit-3.7` совпадает с полем `revision` в `config/talkstream.php` и с меткой дампа `TALKSTREAM_AUDIT_Level_3.7_Refactor_*.txt`, включённого в коммит. Это не релизная версия продукта. Это маркер среза логики, который описывает данный документ. Для отладки достаточно сверить ревизию модуля с этим значением.

**Дисклеймер:** карта реконструирована по дампам Level_3.5, Level_3.6 и Level_3.7_Refactor, а также по фактическим телам файлов. Документ не утверждает, что код идеален. Раздел «Где карта расходится с реальностью» содержит не перечень сломанного, а список зон риска.

---

## Легенда меток зрелости

Метки используются в `config/talkstream.php` и в этом руководстве.

| Метка | Значение |
| --- | --- |
| `[РЕАЛ]` | Опция, канал или событие реально работают в коде: есть подписка, валидация или бизнес-логика. |
| `[ЧАСТ]` | Часть цепочки реализована, часть отсутствует. Например, событие отправляется бэкендом, но фронтенд его не обрабатывает. |
| `[НЕТ]` | Задел. Объявлено в контракте, но в коде не применяется или фича не реализована. |
| `[РАСХ]` | Рассинхрон контракта с реальным кодом. Имя, маппинг или значение противоречат фактической реализации. |

**Сводка по 27 листовым опциям `config/talkstream.php`:**

- `[РЕАЛ]` = 7
- `[ЧАСТ]` = 3
- `[РАСХ]` = 1
- `[НЕТ]` = 16

Полный разбор каждой опции находится в комментариях внутри `config/talkstream.php`.

---

## Примечание о регистре путей

**Каноничный путь:** `resources/js/modules/...` (с маленькой буквы `m`).

Алиас `@modules/` в `jsconfig.json` и `tsconfig.json` указывает на `./resources/js/modules/`. На Linux/Docker файловая система case-sensitive, поэтому регистр критичен. На Windows в OpenServer регистр не значим, но в коде и в Git индекс должен быть корректным.

В этом документе пути к файлам приведены в каноничном стиле (маленькая `m` в `modules/`), а строки импортов — в стиле реального кода (`@/modules/TalkStream/...` или `@modules/TalkStream/...`).

---

## Структура модуля (срез `audit-3.7`)

```text
resources/js/modules/TalkStream/
├── Api/
│   └── talkStreamApi.ts              # Основной REST-клиент модуля
├── Components/
│   ├── Calls/                        # Компоненты звонков
│   │   └── CallsVideoScreen.vue
│   ├── Contacts/                     # Компоненты списка контактов
│   │   ├── ContactItem.vue
│   │   └── ContactItemWrapper.vue
│   ├── Icons/                        # SVG-иконки (префикс Icon*)
│   │   ├── IconPanelToggle.vue
│   │   ├── IconScrollDownButton.vue
│   │   └── IconSendPlane.vue
│   ├── Loading/                      # Индикаторы загрузки
│   │   ├── LoadingIndicator.vue
│   │   ├── LoadingIndicatorInline.vue
│   │   └── LoadingIndicatorSmall.vue
│   ├── Messages/                     # Компоненты ленты сообщений
│   │   ├── MessageGroup.vue
│   │   ├── MessageItem.vue
│   │   └── MessageList.vue
│   ├── Presence/                     # Статусы присутствия
│   │   ── UserPresenceStatus.vue
│   └── Realtime/                     # Индикаторы соединения
│       └── RealtimeConnectionStatus.vue
├── Composables/
│   └── useLoadingComposables.ts      # Композабл управления зонами загрузки
├── Config/                           # Фронтовые конфиги (суффикс *Config.ts)
│   ├── contactActionLabelsConfig.ts
│   ├── loadingConfig.ts
│   └── presenceLabelsConfig.ts
├── Directives/
│   ── Loading/                      # Директивы v-loading-talkstream*
│       ├── create-loading-directive.ts
│       ├── loadingDirective.ts
│       ├── v-loading-talkstream.ts
│       ├── v-loading-talkstream-small.ts
│       └── v-loading-talkstream-inline.ts
├── Docs/
│   ── README_TALKSTREAM_RU.MD       # Этот документ
├── Legacy/                           # Устаревшие компоненты (сохранены для истории)
│   ├── Call.vue
│   ├── Chat.vue
│   └── Contacts.vue
├── Main/                             # Главные экраны модуля
│   ├── TalkStream.vue
│   ├── TalkStreamContacts.vue
│   ├── TalkStreamHeader.vue
│   ├── TalkStreamHistory.vue
│   └── TalkStreamSender.vue
├── Plugin/
│   └── echoTalkStreamPlugin.ts       # Инициализация Echo/Reverb
├── Routes/
│   └── talkStreamRoutes.ts           # Регистрация маршрутов модуля
├── Services/                         # Классовый REST-слой (суффикс *Service.ts)
│   ├── talkRequestService.ts
│   ├── talkResourceService.ts
│   └── talkService.ts
├── Stores/                           # Pinia-сторы (суффикс *Store.ts)
│   ├── callStore.ts
│   ├── chatStore.ts
│   ├── contactStore.ts
│   ├── friendStore.ts
│   ├── talkStreamStore.ts
│   └── uiStore.ts
── Subscriptions/                    # WebSocket-хендлеры (суффикс *Subs.ts)
│   ├── chatEventsHandlerSubs.ts
│   ├── friendshipEventsHandlerSubs.ts
│   ── userPresenceHandlerSubs.ts
├── Types/                            # TypeScript-типы (суффикс *Type.ts)
│   ├── presenceType.ts
│   └── talkStreamType.ts
── Utils/                            # Утилиты (суффикс *Util.ts)
    ├── contactActionPresenterUtil.ts
    ├── formatPresenceDateUtil.ts
    ├── loggerTalkStreamUtil.ts
    ├── presenceBuilderUtil.ts
    └── presencePresenterUtil.ts
```

---

## Общая архитектура модуля

Модуль построен как сквозная цепочка слоёв. Каждый слой отвечает за свою зону и передаёт данные следующему слою через явные контракты: пропсы, методы Pinia, HTTP-ответы, WebSocket-события или ресурсы Laravel.

- **Слой 0** — Инициализация приложения
- **Слой 1** — Identity: кто текущий пользователь
- **Слой 2** — Вход в модуль и бутстрап чата
- **Слой 3** — WebSocket-транспорт Echo/Reverb
- **Слой 4** — Backend: каналы, события, сервисы, контроллеры
- **Слой 5** — Frontend handlers: приём WebSocket-событий
- **Слой 6** — ChatStore: мозг данных сообщений
- **Слой 7** — UI-композиция ленты сообщений
- **Слой 8** — Отправка сообщения из формы ввода
- **Слой 9** — Backend REST-контракт: модель, ресурс, валидация
- **Слой 10** — REST-транспорт: API и axios-обёртки

---

## Слой 0. Инициализация приложения

Точка входа приложения загружает глобальные конфигурации до монтирования основного интерфейса.

```text
app.js
  └─ async IIFE
      └─ initAuthConfig()
           appStore / settings.js
```

**Важное состояние на срезе `audit-3.7`:** читалка `/talkstream/config` не подключена к глобальному `appStore`.

`ConfigController::getConfig` существует, роут `GET /talkstream/config` зарегистрирован, но фронтенд пока не запрашивает этот эндпоинт. Следствие: все флаги `ui.*` и `features.*` из `config/talkstream.php` физически ни на что не влияют, пока не будет подключена фронтенд-читалка конфига.

Это не баг текущей сборки, а осознанный задел.

---

## Слой 1. Identity: кто текущий пользователь

Единый источник правды о текущем пользователе — глобальный `userStore`.

```text
resources/js/store/userStore.js
  ├─ id
  ├─ avatar
  ├─ токен
  └─ csrf
```

Для чата дополнительно используется `contactStore.userFrom` — профиль текущего пользователя в контексте модуля TalkStream.

```text
contactStore.refreshUserFrom()
  └─ contactStore.userFrom
```

Аватары резолвятся на бэкенде. Модель `User` имеет аксессор аватара, который выбирает изображение по полу пользователя через `config('content.*')`.

**Логика выбора аватара:**

```text
пользовательский аватар, если файл существует
  └─ иначе avatar-male.png или avatar-female.png по полю sex
      └─ иначе avatar-main.png
```

Фронтенд не дублирует гендерную логику. Он получает уже готовую строку `avatar`.

**Ключевой инвариант слоя:** определение «моё сообщение или чужое» должно выполняться через `userStore.id`, а не через сравнение с `contact.id`.

---

## Слой 2. Вход в модуль и бутстрап чата

Маршрут модуля регистрируется в роутере как ленивая загрузка.

```text
resources/js/modules/TalkStream/Routes/talkStreamRoutes.ts
  └─ path: talkstream
      └─ component: TalkStream.vue
          └─ meta.permissions: ['view menu talkstream']
```

Главный компонент модуля:

```text
resources/js/modules/TalkStream/Main/TalkStream.vue
```

**Порядок инициализации в `onMounted`:**

1. Восстановить состояние панели контактов из localStorage.
2. Передать userId в contactStore, если он ещё не установлен.
3. Инициализировать WebSocket, если нет соединения.
4. Загрузить контакты, если список пуст.
5. Вызвать `contactStore.refreshUserFrom()`.
6. Восстановить последний выбранный контакт из localStorage.
7. Загрузить историю выбранного контакта через `chatStore.loadHistory()`.

**Важно:** `refreshUserFrom()` обязателен после загрузки контактов, потому что `contactStore.userFrom` используется для аватаров и проверки принадлежности сообщений.

---

## Слой 3. WebSocket-транспорт Echo/Reverb

Транспорт отвечает за соединение с Reverb и подписку на приватные и presence-каналы.

```text
talkStreamStore.initWebSockets()
  └─ createEcho()
      └─ new Echo({
           broadcaster: 'reverb',
           key: VITE_REVERB_APP_KEY,
           wsHost / wsPort,
           authEndpoint: '/broadcasting/auth',
           auth.headers: {
             Authorization: Bearer token,
             X-CSRF-TOKEN: csrf
           }
         })
```

После создания Echo модуль подписывается на каналы:

```text
echo.private(`user.${myUserId}`)
  ─ setupChatEventsChannel()

echo.join('chat')
  └─ setupUserPresenceChannel()

echo.private(`friends.${myUserId}`)
  ─ setupFriendRequestsChannel()

echo.private(`chat.read.${myUserId}`)
  └─ setupChatEventsChannel()
```

Канал `signal.{userId}` объявлен в `routes/channels.php`, но активной подписки и обработчика на срезе `audit-3.7` нет. Статус: `[НЕТ]`.

---

## Слой 4. Backend: каналы, события, сервисы, контроллеры

### Правила авторизации каналов

Файл `routes/channels.php` описывает, кто имеет доступ к приватным и presence-каналам.

**Используемые каналы:**

- `user.{id}`
- `App.Models.User.{id}`
- `chat`
- `chat.{userId}`
- `chat.read.{from_id}`
- `friends.{userId}`
- `call.{userId}`
- `signal.{userId}`

Для чата критичны:

- `user.{id}`
- `chat.read.{from_id}`

### Создание и отправка сообщения

**Сервис:** `App\Services\TalkStream\MessageService`

**Метод `create`:**

1. Проверить дружбу через `FriendService::areFriends()`.
2. Создать запись `Message` в БД.
3. Отправить `broadcast(new NewMessage(...))`.
4. Использовать `toOthers()`, чтобы не возвращать событие отправителю.

**Payload `NewMessage` включает:**

- `id`
- `from_id`
- `to_id`
- `content`
- `type`
- `read_at`
- `created_at`
- `formatted_created_at`

Наличие `formatted_created_at` в WebSocket-ответе важно, потому что новое сообщение должно сразу показывать время без дополнительного REST-запроса.

### Отметка о прочтении

**Контроллер:** `App\Http\Controllers\TalkStream\ChatController`

**Метод `markAsRead`:**

1. Получить `userReadId` из маршрута.
2. Найти сообщения, где `from_id = userReadId`, `to_id = текущий пользователь`, `read_at is null`.
3. Проставить `read_at = now()`.
4. Если обновлений больше нуля, отправить `broadcast(new MessageRead(...))`.
5. Использовать `toOthers()`.

**Payload `MessageRead`:**

- `from_id = userReadId`
- `to_id = текущий пользователь`
- `updated_count = количество обновлённых сообщений`

**Канал события:** `chat.read.{from_id}`

**Ключевая семантика:** событие приходит отправителю сообщений, а не читателю. Поэтому у получателя события выполняется:

- `myUserId === payload.from_id`

А собеседник, который прочитал сообщения:

- `payload.to_id`

---

## Слой 5. Frontend handlers: приём WebSocket-событий

Основные обработчики находятся в:

```text
resources/js/modules/TalkStream/Subscriptions/chatEventsHandlerSubs.ts
```

**Функция:** `setupChatEventsChannel(echo, myUserId)`

**Подписки:**

```text
user.{myUserId}
  └─ .NewMessage

chat.read.{myUserId}
  └─ .MessageRead
```

**Обработка `NewMessage`:**

```text
e.message
  ─ chatStore.addIncomingMessage(msg)
```

**Обработка `MessageRead`:**

```text
e.message
  ─ payload.to_id
      └─ chatStore.markSentAsRead(payload.to_id)
```

**Важно:** бэкенд оборачивает payload в ключ `message`. Поэтому корректный доступ:

```text
e.message.from_id
e.message.to_id
```

А не плоский доступ:

```text
e.from_id
e.to_id
```

Плоский доступ для `MessageRead` был исторической причиной, по которой синие галочки не загорались.

**Presence-обработчик:**

```text
userPresenceHandlerSubs
  ├─ here
  ├─ joining
  └─ leaving
      └─ contactStore.setUserOnline / setUserOffline
```

**Friendship-обработчик:**

```text
friendshipEventsHandlerSubs
  ├─ FriendRequestSent
  ─ FriendRequestAccepted
      └─ friendStore
```

---

## Слой 6. ChatStore: мозг данных сообщений

**Файл:** `resources/js/modules/TalkStream/Stores/chatStore.ts`

### Состояние:

- `messages`
- `history`
- `readStatus`
- `isTyping`

### `loadHistory`

1. Получить userId из `userStore`.
2. Сформировать `cacheKey`: `${userId}_${contactId}`.
3. Если кэш непустой, вернуть messages из кэша.
4. Иначе вызвать `TalkStreamAPI.getHistory(contactId)`.
5. Обогатить сообщения:
    - `is_mine = from_id === userId`
    - `isLocal = false`
    - `status = read_at ? 'read' : 'delivered'`
6. Сохранить в `history` и `messages`.

После подключения `MessageResource` с `formatted_created_at` и `formatted_read_at` этот метод автоматически подхватывает поля через spread `...msg`.

### `sendMessage`

1. Проверить userId и непустой content.
2. Создать `tempMessage`:
    - `id = -Date.now()`
    - `from_id = userId`
    - `to_id = to_id`
    - `status = 'sending'`
    - `isLocal = true`
3. Добавить tempMessage в messages.
4. Вызвать `TalkStreamAPI.sendMessage(to_id, content)`.
5. При успехе вызвать `replaceLocalMessage(tempId, realMessage)`.
6. При ошибке вызвать `markFailed(tempId)`.

**Критично:** при ошибке сообщение не удаляется. Оно остаётся в ленте со статусом `failed`.

### `replaceLocalMessage`

1. Найти сообщение по `Number(m.id) === Number(tempId)`.
2. Заменить temp-сообщение на реальное.
3. Проставить `is_mine = true`, `isLocal = false`.
4. Сохранить status из ответа или использовать `delivered`.
5. Обновить тот же элемент в `history[cacheKey]`.

### `addIncomingMessage`

1. Проверить дубликат по `Number(m.id) === Number(message.id)`.
2. Обогатить сообщение:
    - `is_mine`
    - `isLocal = false`
    - `status` по `read_at`
3. Если контакт выбран, добавить в messages.
4. Всегда обновить `history[cacheKey]`.

### `markAsRead`

Мутация входящих сообщений.

**Условия:**

- `m.to_id === userId`
- `m.from_id === contactId`
- `m.status !== 'read'`

**Действия:**

- `m.status = 'read'`
- `m.read_at = now()`

Используется для мгновенного сброса счётчика непрочитанных на экране читателя.

### `markSentAsRead`

Мутация исходящих сообщений.

**Условия:**

- `m.from_id === userId`
- `m.to_id === contactId`
- `m.status !== 'read'`

**Действия:**

- `m.status = 'read'`
- `m.read_at = now()`

Используется отправителем для покраски своих сообщений в синие галочки после события `MessageRead`.

### `markFailed`

1. Найти tempMessage по id.
2. Установить `status = 'failed'`.
3. Установить `isLocal = true`.
4. Обновить то же сообщение в history.

### `retryMessage`

1. Найти failed-сообщение по id.
2. Проверить, что `status === 'failed'`.
3. Вернуть `status = 'sending'`.
4. Повторно вызвать `TalkStreamAPI.sendMessage(failed.to_id, failed.content)`.
5. При успехе заменить на реальное сообщение через `replaceLocalMessage`.
6. При новой ошибке снова вызвать `markFailed`.

### `unreadCount`

Количество сообщений, где:

- `m.to_id === userId`
- `m.status !== 'read'`

Этот getter используется как гейт для сетевого `POST /read`, чтобы не спамить бэкенд, когда непрочитанных сообщений нет.

---

## Слой 7. UI-композиция ленты сообщений

Лента собирается из трёх компонентов:

```text
TalkStreamHistory.vue
  └─ MessageGroup.vue
      └─ MessageItem.vue
```

### TalkStreamHistory.vue

**Файл:** `resources/js/modules/TalkStream/Main/TalkStreamHistory.vue`

**Пропсы:**

- `userFrom: User | null`
- `contact: Contact | null`
- `messages: Message[]`
- `isOnline: boolean`

**Основные задачи:**

1. Сгруппировать сообщения по `from_id`.
2. Определить `isMine` для группы.
3. Определить `avatarUrl` для группы.
4. Передать готовые данные в MessageGroup.
5. Управлять прокруткой.
6. Управлять счётчиком новых сообщений.
7. Запускать `markCurrentChatAsRead` при прочтении.

**Хелпер `isMine`:**

```text
currentUserId = userFrom?.id ?? userStore.id
isMine(fromId) = currentUserId === fromId
```

**Хелпер `getAvatarUrl`:**

```text
Если isMine:
  userFrom?.avatar || userStore.avatar || '/images/avatar-main.png'
Иначе:
  contact?.avatar || '/images/avatar-main.png'
```

### MessageGroup.vue

**Файл:** `resources/js/modules/TalkStream/Components/Messages/MessageGroup.vue`

Это тупой компонент. Он не содержит бизнес-логики.

**Пропсы:**

- `avatarUrl: string`
- `isMine: boolean`
- `messages: Message[]`
- `isOnline: boolean`
- `showAvatar: boolean`

**Задачи:**

1. Отрисовать аватар собеседника слева, если `isMine === false`.
2. Отрисовать контейнер сообщений через slot.
3. Отрисовать свой аватар справа, если `isMine === true`.
4. Показать индикатор онлайн как эмодзи 🟢 или .

**Геометрия:**

```text
.message-group:
  display: flex
  width: 100%

&.mine:
  justify-content: flex-end

&.theirs:
  justify-content: flex-start

.message-group-container:
  max-width: 80%
```

**Важно:** у контейнера группы нет `width: 100%`, иначе пузырь перестанет прижиматься к краю.

### MessageItem.vue

**Файл:** `resources/js/modules/TalkStream/Components/Messages/MessageItem.vue`

**Пропсы:**

- `userFrom?: User | null`
- `contact?: Contact | null`
- `message: Message`
- `isOnline?: boolean`
- `isFirstInGroup?: boolean`
- `isLastInGroup?: boolean`
- `isGroupStart?: boolean`

**Логика принадлежности:**

```text
isMine = message.from_id === userStore.id
```

Эта проверка не зависит от `contact` и не падает при `null`.

**Геометрия пузыря:**

```text
.message-wrapper:
  display: flex
  width: 100%

&.message-mine:
  justify-content: flex-end

&.message-theirs:
  justify-content: flex-start

.message-bubble:
  max-width: 100%
```

**Важно:** у пузыря нет `width: 100%`. Он сжимается по контенту, а `justify-content` прижимает его к левому или правому краю.

**Футер сообщения:**

```text
formatted_created_at
  ─ , если есть formatted_read_at и сообщение моё
      └─ галочки или 
```

**Статусы:**

- `sending` → 🕒
- `delivered` → ✔✔ серые
- `read` → ✔✔ синие с анимацией `readPulse`
- `failed` → ✖ красный, клик вызывает `retryMessage`

Галочки отображаются только на своих сообщениях:

```text
v-if="isMine"
```

**Слот времени прочтения:**

Показывается только если:

- `isMine === true`
- `formatted_read_at` непустой

Клик по ⋮ переключает показ `formatted_read_at`.

**Кнопка повторной отправки:**

Клик по ✖ вызывает `chatStore.retryMessage(message.id)`.

---

## Слой 8. Отправка сообщения из формы ввода

**Компонент отправителя:** `resources/js/modules/TalkStream/Main/TalkStreamSender.vue`

**Эмит:**

```text
send({ content, to_id })
```

**Родитель:**

```text
TalkStream.vue
  └─ handleSendMessage(data)
      └─ chatStore.sendMessage(data.to_id, data.content)
      └─ historyRef.scrollToBottom()
```

**Критично:** в `TalkStream.vue` не должно быть локального создания `tempMessage`. Оптимистичное добавление сообщения — исключительная ответственность `chatStore.sendMessage`.

Дублирование temp-сообщения на уровне UI приводило к фантомным пузырям и рассинхрону статусов.

---

## Слой 9. Backend REST-контракт: модель, ресурс, валидация

### Модель Message

**Файл:** `app/Models/TalkStream/Message.php`

**Ключевые элементы:**

```text
$fillable:
  from_id
  to_id
  content
  type
  read_at

$casts:
  read_at => datetime
  created_at => datetime

$appends:
  formatted_created_at
  formatted_read_at
```

**Аксессоры:**

- `formattedCreatedAt()`
- `formattedReadAt()`

**Формат времени:**

- Сегодня: `H:i:s`
- Вчера: `Вчера в H:i:s`
- Текущий год: `d M в H:i:s`
- Иной год: `d.m.Y в H:i:s`

Если `read_at` пустой, `formatted_read_at` возвращает пустую строку.

### Ресурс MessageResource

**Файл:** `app/Http/Resources/TalkStream/MessageResource.php`

**Важное правило Laravel:** если `JsonResource::toArray()` возвращает явный массив, `$appends` модели не пробрасываются автоматически.

Поэтому ресурс обязан явно вернуть:

- `formatted_created_at`
- `formatted_read_at`

Без этих полей история после F5 теряет время, потому что REST-путь не совпадает с WebSocket-путём.

### Валидация SendMessageRequest

**Файл:** `app/Http/Requests/TalkStream/SendMessageRequest.php`

Используется:

```text
config('talkstream.limits.max_message_length')
```

Статус: `[РЕАЛ]`.

---

## Слой 10. REST-транспорт

В модуле сосуществуют два транспортных подхода.

**Основной путь для чата:**

```text
resources/js/modules/TalkStream/Api/talkStreamApi.ts
  ─ @utils/request
      └─ axios instance
```

**Методы основного API:**

- `getConfig()`
- `getUser()`
- `getContacts()`
- `getContact(id)`
- `getHistory(userId)`
- `sendMessage(to_id, content)`
- `markAsRead(userId)`
- `getFriendsList()`
- `getIncomingRequests()`
- `getSentRequests()`
- `isFriend(userId)`
- `sendFriendRequest(friend_id)`
- `acceptFriendRequest(id)`
- `initiateCall()`
- `startCall()`
- `acceptCall()`
- `declineCall()`
- `endCall()`
- `endCallFixed()`

**Альтернативный классовый слой:**

```text
resources/js/modules/TalkStream/Services/talkService.ts
  └─ resources/js/modules/TalkStream/Services/talkResourceService.ts
      └─ resources/js/modules/TalkStream/Services/talkRequestService.ts
          └─ @utils/request
```

На срезе `audit-3.7` основной чат использует не классовый слой, а `TalkStreamAPI`. Поэтому правки в `talkService.ts` не повлияют на работу ленты сообщений. Это важно учитывать при рефакторинге.

---

## Живой пример: пользователь A пишет, пользователь B читает

### Шаг 1. A отправляет сообщение

```text
TalkStreamSender
  └─ TalkStream.handleSendMessage
      ─ chatStore.sendMessage
```

В `chatStore`:

Создаётся `tempMessage`:

- `id = отрицательное число`
- `status = sending`
- `isLocal = true`

Интерфейс A показывает пузырь справа с часами .

### Шаг 2. Запрос уходит на сервер

```text
TalkStreamAPI.sendMessage
  └─ POST /talkstream/send
      └─ ChatController.sendMessage
          └─ MessageService.create
```

Бэкенд:

1. Проверяет дружбу.
2. Сохраняет сообщение в БД.
3. Отправляет `NewMessage` на канал `user.{B}`.
4. Возвращает `MessageResource` пользователю A.

### Шаг 3. A получает подтверждение от сервера

```text
chatStore.replaceLocalMessage
```

Статус меняется:

- `sending` → `delivered`

Интерфейс A показывает серые ✔✔.

**Важно:** серые ✔✔ означают «сохранено на сервере», а не «доставлено на устройство B».

### Шаг 4. B получает новое сообщение через WebSocket

```text
Echo listener .NewMessage
  └─ e.message
      └─ chatStore.addIncomingMessage
```

Интерфейс B показывает пузырь слева с аватаром B.

### Шаг 5. B читает сообщение

**Триггеры прочтения:**

1. Пользователь B вручную доскроллил вниз.
2. Пользователь B нажал кнопку-шторку.
3. Новое сообщение пришло, когда B уже находился внизу.

Во всех случаях вызывается:

```text
markCurrentChatAsRead()
```

**Логика:**

1. Локально вызвать `chatStore.markAsRead(contactId)`.
2. Проверить `unreadCount` до мутации.
3. Если были непрочитанные, вызвать `TalkStreamAPI.markAsRead(A)`.

### Шаг 6. Бэкенд проставляет `read_at`

```text
POST /talkstream/read/{A}
  ─ ChatController.markAsRead
```

Бэкенд обновляет сообщения:

- `from_id = A`
- `to_id = B`
- `read_at = now()`

Затем отправляет:

```text
MessageRead
  └─ канал chat.read.{A}
  ─ toOthers()
```

### Шаг 7. A получает событие прочтения

```text
Echo listener .MessageRead
  └─ e.message
      ─ payload.to_id = B
          ─ chatStore.markSentAsRead(B)
```

`markSentAsRead` мутирует исходящие сообщения A:

- `from_id = A`
- `to_id = B`
- `status = read`

Интерфейс A показывает синие ✔✔.

### Шаг 8. B обновляет страницу

```text
TalkStream.loadHistory
  └─ chatStore.loadHistory
      └─ GET /talkstream/history/{A}
          ─ MessageResource
```

Так как `MessageResource` явно возвращает:

- `formatted_created_at`
- `formatted_read_at`

время сохраняется после F5, а слот `` получает данные.

---

## Read-цепочка: как должны работать галочки

### Входящие сообщения

Когда текущий пользователь читает сообщения собеседника:

```text
markAsRead(contactId)
```

Мутируются сообщения:

- `to_id === me`
- `from_id === contactId`

Это сбрасывает локальный счётчик непрочитанных.

### Исходящие сообщения

Когда собеседник прочитал сообщения текущего пользователя:

```text
markSentAsRead(contactId)
```

Мутируются сообщения:

- `from_id === me`
- `to_id === contactId`

Это красит синие галочки отправителю.

### Критическое различие

`markAsRead` и `markSentAsRead` не взаимозаменяемы.

**Ошибка, из-за которой синие галочки не работали:**

Хендлер `MessageRead` вызывал `markAsRead`. Но `markAsRead` красит входящие. А событие `MessageRead` приходит отправителю о его исходящих.

**Корректная схема:**

```text
MessageRead
   payload.to_id
      └─ markSentAsRead(payload.to_id)
```

---

## Failed-цепочка: как должна работать ошибка отправки

### Ожидаемое поведение

Если HTTP-запрос `sendMessage` упал:

- Пузырь не удаляется.
- Статус меняется на `failed`.
- Пользователь видит ✖.
- Клик по ✖ вызывает повторную отправку.

### Логика в chatStore

```text
sendMessage catch
  └─ markFailed(tempId)

retryMessage(tempId)
  ├─ status = sending
  ├─ TalkStreamAPI.sendMessage
  ├─ успех → replaceLocalMessage
  └─ ошибка → markFailed
```

### Логика в MessageItem

```text
isFailed = message.status === 'failed'
```

Если `isFailed`:

- Показывается ✖.
- Клик вызывает `chatStore.retryMessage(message.id)`.

### Почему крестик может не появляться сразу при Offline

DevTools Offline часто не даёт мгновенную сетевую ошибку для XHR. Браузер может держать соединение до таймаута. В `@utils/request` таймаут равен 30 секундам.

Поэтому при Offline можно наблюдать:

```text
 висит долго → затем ✖
```

Для мгновенной проверки `failed` лучше использовать:

- Request Blocking для `/talkstream/send`
- или временный битый путь, например `/talkstream/sendXXX`

---

## Time-цепочка: как должно работать время сообщения

### Новые сообщения

Время приходит через WebSocket:

```text
MessageService.create
  └─ broadcast(new NewMessage([...formatted_created_at]))
```

Поэтому новый пузырь сразу показывает время.

### История после F5

Время приходит через REST:

```text
GET /talkstream/history/{userId}
  └─ MessageResource
```

Так как `MessageResource` имеет явный `toArray()`, он обязан вернуть:

- `formatted_created_at`
- `formatted_read_at`

Иначе модель посчитает аксессоры, но JSON их не содержит.

### Время прочтения

Хранится в БД:

```text
messages.read_at
```

Форматируется моделью:

```text
formatted_read_at
```

Отдаётся ресурсом:

```text
formatted_read_at
```

Отображается в UI:

```text
Слот ⋮ в MessageItem
```

---

## Аватарная цепочка

### Бэкенд

```text
User::getAvatarAttribute
  └─ config('content.default_avatar_male')
  └─ config('content.default_avatar_female')
  └─ фолбэк avatar-main.png
```

### Frontend

```text
TalkStreamHistory.getAvatarUrl
  ├─ свои сообщения: userFrom.avatar || userStore.avatar || fallback
  └─ чужие сообщения: contact.avatar || fallback

MessageGroup
  Получает готовый avatarUrl.
  Не вычисляет аватар самостоятельно.
```

Это сохраняет принцип: бизнес-логика не дублируется в JS и не живёт в тупых UI-компонентах.

---

## Геометрическая цепочка ленты

### Правило 1. Строка группы занимает всю ширину

```text
.message-group {
  width: 100%;
}
```

### Правило 2. Блок сообщений ограничен сверху

```text
.message-group-container {
  max-width: 80%;
}
```

Нельзя ставить контейнеру `width: 100%` вместе с `max-width`, если ожидается прижатие пузыря к краю через родительский flex.

### Правило 3. Пузырь сжимается по контенту

```text
.message-bubble {
  max-width: 100%;
}
```

Нельзя ставить пузырю `width: 100%`, иначе он растянется на весь контейнер и потеряется смысл `justify-content`.

### Правило 4. Прижатие выполняет wrapper или группа

Для своих:

```text
justify-content: flex-end;
```

Для чужих:

```text
justify-content: flex-start;
```

### Правило 5. Мобильный адаптив

При ширине до 768px свои сообщения принудительно выравниваются влево.

---

## Состояния сообщений

| Статус | Значение | UI |
| --- | --- | --- |
| `sending` | Сообщение локально создано, запрос в полёте |  |
| `delivered` | Сервер сохранил сообщение | ✔✔ серые |
| `read` | Собеседник прочитал сообщение | ✔✔ синие |
| `failed` | Запрос не выполнен | ✖, клик = retry |

**Важно:** `delivered` на текущем срезе не означает доставку на устройство собеседника. Это статус серверного сохранения.

---

## Триггеры прочтения

Прочтение должно отмечаться в трёх случаях.

### 1. Ручной скролл вниз

```text
checkScrollPosition()
  └─ isAtBottom && newMessagesCount > 0
      └─ markCurrentChatAsRead()
```

### 2. Клик по кнопке-шторке

```text
handleScrollToBottomAndMarkRead()
  └─ markCurrentChatAsRead()
```

### 3. Новое сообщение приходя, когда пользователь уже внизу

```text
watch(messages.length)
  └─ isAtBottom
      ─ scrollToBottomAfterRender()
      └─ markCurrentChatAsRead()
```

Без третьего триггера синие галочки у отправителя появились бы только после того, как читатель вручную поскроллит или нажмёт кнопку.

---

## Гейт против спама POST /read

Сетевой запрос на прочтение отправляется только если до локальной мутации были непрочитанные сообщения.

```text
hadUnread = chatStore.unreadCount > 0
chatStore.markAsRead(contactId)
if (hadUnread) {
  TalkStreamAPI.markAsRead(contactId)
}
```

Локальная мутация выполняется всегда, чтобы UI реагировал мгновенно. Сетевой вызов — только при реальной необходимости.

---

## Где карта расходится с реальностью

Это не список сломанного. Это список зон, где ожидаемое поведение может отличаться от интуитивного.

### 1. Конфиг-читалка не подключена

Пока `appStore` не запрашивает `/talkstream/config`, флаги `ui.*` и `features.*` не влияют на интерфейс.

Пример:

```text
enable_read_receipts = true
```

Не означает, что где-то есть выключатель галочек. Галочки рисуются по текущей логике `MessageItem`.

### 2. `message_sent => 'MessageSent'` противоречит коду

Реальное событие называется:

```text
NewMessage
```

В конфиге указано:

```text
MessageSent
```

Рантайм работает, потому что фронтенд слушает `.NewMessage` напрямую, а не читает имя из конфига. Но контракт вводит в заблуждение.

Статус: `[РАСХ]`.

### 3. Серые галочки не означают доставку на устройство

Текущая архитектура не имеет client ACK. Бэкенд не знает, получил ли браузер B событие `NewMessage` в момент push.

Поэтому:

- серые ✔✔ = сохранено на сервере

Не:

- серые ✔✔ = доставлено на устройство B

### 4. Оффлайн-очереди нет

Если B был оффлайн в момент `NewMessage`, событие теряется. Переподключение WebSocket восстанавливает подписку, но не догоняет пропущенные сообщения.

Догон возможен только через REST:

```text
getHistory
```

Поэтому после возврата сети B может не увидеть новые сообщения до F5 или принудительной перезагрузки истории.

### 5. Локальное `read_at` может отличаться от серверного

Фронтенд ставит:

```text
read_at = now()
```

мгновенно для UI. Реальное значение из БД приедет только после следующего `getHistory`.

Для галочек это не критично. Для аудита времени прочтения нужно опираться на серверный timestamp.

### 6. Два транспортных слоя могут запутать при рефакторинге

**Основной путь:**

```text
TalkStreamAPI → @utils/request
```

**Альтернативный:**

```text
TalkService → TalkResource → talkRequest → @utils/request
```

Правка альтернативного слоя не изменит текущий чат.

### 7. Presence и chat events — разные подписки

Зелёные индикаторы онлайн в списке контактов относятся к presence-каналу:

```text
chat
```

А не к:

```text
user.{id}
```

Если индикаторы онлайн ведут себя странно, проверять нужно `userPresenceHandlerSubs`, а не `chatEventsHandlerSubs`.

### 8. Retry при мёртвой сети ожидаемо цикличен

Если сеть всё ещё недоступна, цикл:

```text
failed → sending → failed
```

не является багом. Это корректное поведение повторной отправки.

### 9. Offline не всегда даёт мгновенный failed

Из-за таймаута axios можно долго видеть `sending`. Для быстрой проверки `failed` лучше использовать блокировку запроса или ошибку 404/500.

---

## Текущий задел модуля

Ниже перечислены возможности, которые заложены в контракт или частично существуют, но не реализованы полностью.

### 1. Typing indicator

**Конфиг:**

- `ui.enable_typing_indicator`
- `ui.typing_indicator_timeout`
- `ui.enable_typing_animation`

**Статус:** `[НЕТ]`.

Отсутствуют:

- debounce ввода
- WebSocket-событие TypingStart / TypingStop
- UI-индикатор в header или ленте
- гейт через конфиг

### 2. Пагинация истории

**Конфиг:**

- `ui.messages_per_page`

**Статус:** `[НЕТ]`.

Текущий `getHistory` возвращает всю историю. Пагинация не реализована.

### 3. Rate limit

**Конфиг:**

- `limits.rate_limit_per_minute`

**Статус:** `[НЕТ]`.

В группе роутов `talkstream` нет `throttle` middleware для `/send` и других эндпоинтов.

### 4. Медиа и вложения

**Конфиг:**

- `limits.max_attachment_size`
- `limits.allowed_mime_types`

**Статус:** `[НЕТ]`.

Текущий тип сообщения всегда:

```text
text
```

Загрузка файлов, превью, прогресс отправки и обработка MIME не реализованы.

### 5. Реальные аватары и групповые аватары

**Статус:** отдельная целевая задача.

Требуется общий подмодуль для:

- чата
- профиля пользователя
- редактирования аватара
- медиа-хранилища

Сейчас используется только строка `avatar`, резолвящаяся бэкендом.

### 6. WebRTC-сигналинг

**Конфиг:**

- `broadcasting.channels.call`
- `broadcasting.channels.signal`
- `broadcasting.events.incoming_call`
- `features.enable_video_calls`

**Статус:** `[ЧАСТ]` или `[НЕТ]` в зависимости от элемента.

Есть:

- роуты звонков
- CallController
- событие IncomingCall
- частичные UI-компоненты

Нет:

- offer / answer / ICE exchange
- полноценного сигнального канала
- обработчика входящего звонка на фронтенде

### 7. Редактирование и удаление сообщений

**Конфиг:**

- `features.enable_editing_messages`
- `features.enable_message_deletion`

**Статус:** `[НЕТ]`.

Нет:

- UI
- эндпоинтов
- событий
- валидации
- истории изменений

### 8. Реакции

**Конфиг:**

- `features.enable_reactions = false`

**Статус:** `[НЕТ]`.

Значение `false` честно отражает реальность.

### 9. Delivery ACK

**Статус:** отсутствует.

Требуется:

- client подтверждает получение NewMessage
- бэкенд фиксирует доставку
- бэкенд отправляет событие DeliveryConfirmed отправителю
- фронтенд различает server-delivered и device-delivered

### 10. Оффлайн-догон

**Статус:** отсутствует.

Возможные реализации:

- серверная очередь событий
- запрос missing messages по `last_message_id`
- запрос истории при фокусе вкладки
- запрос истории при reconnect

### 11. Фронтенд-читалка конфига

**Статус:** отсутствует.

После подключения появятся:

- гейты UI по флагам
- реальная работа `enable_read_receipts`
- реальная работа `enable_typing_indicator`
- вывод `revision` на экране чата для отладки

---

## Рекомендуемый порядок закрытия заделов

Опорный порядок, не обязательный контракт.

1. **Видимые пользователю мелкие фичи:**
    - typing indicator, пагинация, rate limit.
2. **Медиа-подсистема:**
    - загрузка файлов, превью, MIME, размеры, прогресс.
3. **Реальные аватары:**
    - общий подмодуль для чата и профиля.
4. **WebRTC:**
    - сигнализация, входящие звонки, состояние вызова.
5. **Редактирование, удаление, реакции.**
6. **Фронтенд-читалка `/talkstream/config` и гейты флагов.**
7. **Delivery ACK и оффлайн-догон.**

---

## Чек-лист отладки ленты сообщений

### Проверка сторон и цветов

**Ожидаемо:**

- Свои сообщения: справа, синий пузырь.
- Чужие сообщения: слева, тёмно-серый пузырь.

**Если всё слева:**

- Проверить `userStore.id`.
- Проверить `message.from_id`.
- Проверить, что `isMine` сравнивает с `userStore.id`, а не с `contact.id`.

### Проверка аватаров

**Ожидаемо:**

- Свои сообщения: аватар текущего пользователя.
- Чужие сообщения: аватар собеседника.

**Если аватар не по полу:**

- Проверить `User::getAvatarAttribute`.
- Проверить `config('content.*')`.
- Проверить, что `contactStore.refreshUserFrom()` вызван.

### Проверка времени после F5

**Ожидаемо:**

- Время есть на всех сообщениях после перезагрузки.

**Если времени нет:**

- Проверить `MessageResource`.
- Убедиться, что `toArray()` явно возвращает `formatted_created_at`.
- Проверить, что модель имеет аксессор `formattedCreatedAt`.

### Проверка синих галочек

**Ожидаемо:**

- После прочтения B сообщения от A, у A галочки становятся синими.

**Если не загораются:**

1. Проверить, что `TalkStreamHistory` вызывает сетевой `POST /read`.
2. Проверить роут `POST /talkstream/read/{userReadId}`.
3. Проверить, что `ChatController::markAsRead` отправляет `MessageRead`.
4. Проверить канал `chat.read.{from_id}`.
5. Проверить, что хендлер разворачивает `e.message`.
6. Проверить, что хендлер вызывает `markSentAsRead(payload.to_id)`.
7. Проверить, что `markSentAsRead` мутирует исходящие, а не входящие.

### Проверка failed и retry

**Ожидаемо:**

- При ошибке отправки пузырь остаётся.
- Появляется ✖.
- Клик по ✖ повторяет отправку.

**Если ✖ не появляется:**

1. Проверить, что в types `MessageStatus` содержит `failed`.
2. Проверить, что `sendMessage` в catch вызывает `markFailed`, а не `removeLocalMessage`.
3. Проверить, что `MessageItem` имеет ветку `isFailed`.
4. Проверить, что interceptor в `@utils/request` ре-throw-ит ошибки.
5. Для быстрой проверки использовать Request Blocking или битый URL, а не Offline.

### Проверка прокрутки и счётчика

**Ожидаемо:**

- Новое сообщение внизу плавно скроллит ленту.
- Если пользователь наверху, появляется шторка и счётчик.
- Клик по шторке скроллит вниз и отмечает прочтение.

**Если счётчик не сбрасывается:**

- Проверить `newMessagesCount`.
- Проверить `checkScrollPosition`.
- Проверить `markCurrentChatAsRead`.
- Проверить `chatStore.unreadCount`.

---

## Ключевые инварианты модуля

Эти правила нельзя нарушать при рефакторинге.

1. `isMine` всегда определяется через `userStore.id` или `userFrom.id` с фолбэком.
2. `MessageGroup` не содержит бизнес-логики.
3. `MessageItem` не определяет аватар.
4. Аватары резолвятся на бэкенде по полу.
5. `tempMessage` создаётся только в `chatStore.sendMessage`.
6. Ошибка отправки не удаляет сообщение, а помечает его `failed`.
7. `markAsRead` мутирует входящие.
8. `markSentAsRead` мутирует исходящие.
9. `MessageRead` payload разворачивается через `e.message`.
10. `markSentAsRead` вызывается с `payload.to_id`.
11. `MessageResource` явно возвращает `formatted_created_at` и `formatted_read_at`.
12. Пузырь не должен иметь `width: 100%`.
13. Контейнер группы сообщений имеет `max-width`, но не обязательный `width: 100%`.
14. Сетевой `POST /read` отправляется только при наличии непрочитанных.
15. Флаги конфига не влияют на UI, пока не подключена фронтенд-читалка `/talkstream/config`.

---

## Как пользоваться этим документом

При появлении бага нужно искать не «весь модуль», а границу рукопожатия.

**Примеры границ:**

- `TalkStreamHistory` → `MessageGroup`
- `MessageGroup` slot → `MessageItem`
- `MessageItem` → `chatStore.retryMessage`
- `chatEventsHandlerSubs` → `chatStore.markSentAsRead`
- `TalkStreamHistory` → `TalkStreamAPI.markAsRead`
- `ChatController` → `MessageRead` event
- `MessageRead` event → `chatEventsHandlerSubs`
- `MessageService` → `NewMessage` event
- `NewMessage` event → `chatStore.addIncomingMessage`
- `MessageResource` → `chatStore.loadHistory`
- `Message` model → `MessageResource`

**Если поведение расходится с документом, сначала проверить:**

1. Актуальность среза: revision `audit-3.7`.
2. Наличие файла в дампе `TALKSTREAM_AUDIT_Level_3.7_Refactor_*.txt`.
3. Границу рукопожатия, где данные теряются.
4. Не подключена ли фича как задел, а не как реализованная логика.

Этот документ — эталон понимания системы. Он не отменяет возможность локальных багов, но задаёт правильную карту для их поиска.
