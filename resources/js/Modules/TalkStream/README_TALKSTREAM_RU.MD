##Эталонная цепочка рукопожатий всей системы модуля
####Ниже — как система должна работать по слоям, от входа в приложение до пикселя на экране. Это моя сводка по дампам 3.5/3.6 и присланным телам файлов. Каждое «рукопожатие» = конкретная связь файл→файл / метод→метод / событие→хендлер. В конце — отдельный раздел «где эталон может расходиться с реальностью», потому что это эталон понимания, а не гарантия отсутствия багов.

```text
СЛОЙ 0 — ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ (вне модуля, но точка входа)
  app.js  ──(async IIFE)──▶  initAuthConfig()  ──▶  appStore / settings.js  (глобальные конфиги)
  ⚠ РАЗРЫВ ПО ДИЗАЙНУ: читалка /talkstream/config НЕ подключена сюда.
     ConfigController::getConfig существует и роут есть, но appStore его не дёргает.
     Следствие: все [НЕТ]/[ЧАСТ]-флаги ui.* и features.* физически ни на что не влияют.

СЛОЙ 1 — IDENTITY (кто я)
  userStore (токен/csrf)  ──▶  .id, .avatar
       ▲                              │
       │                              ▼
  бэкенд User::getAvatarAttribute  ◀──┘  резолвит путь по полю sex через config('content.*'):
       свой файл → avatar-male/female.png → фолбэк avatar-main.png
  contactStore.refreshUserFrom()  ──▶  .userFrom (текущий пользователь в контексте чата)
       ▲
       │ вызывается в
  TalkStream.vue onMounted

СЛОЙ 2 — ВХОД В МОДУЛЬ (роутинг + бутстрап чата)
  routes.ts  ──(lazy)──▶  TalkStream.vue   meta.permissions:['view menu talkstream']
  TalkStream.vue onMounted, по порядку:
    1) loadContacts()            ──▶  contactStore.contacts
    2) refreshUserFrom()         ──▶  contactStore.userFrom        (СЛОЙ 1)
    3) initWebSockets()          ──▶  talkStreamStore              (СЛОЙ 3)
    4) восстановление last-selected-contact ──▶  chatStore.loadHistory(contact.id)  (СЛОЙ 6)

СЛОЙ 3 — WS-ТРАНСПОРТ (Echo/Reverb)
  talkStreamStore.initWebSockets()  ──▶  createEcho()  (echoTalkStream.ts)
       │                                      │
       │                                      ▼
       │                            new Echo({broadcaster:'reverb', key, wsHost, wsPort,
       │                                     authEndpoint:'/broadcasting/auth', auth.headers
       │                                     {Authorization: Bearer token, X-CSRF-TOKEN}})
       │                                      │
       ▼                                      ▼
  subscribeToChannels()  ──▶  window.Echo  +  подписки:
       ├─ echo.private(`user.${id}`)        ──▶  setupChatEventsChannel      (СЛОЙ 5)
       ├─ echo.join('chat')  [presence]     ──▶  setupUserPresenceChannel    (СЛОЙ 5)
       ├─ echo.private(`friends.${id}`)     ──▶  setupFriendRequestsChannel  (СЛОЙ 5)
       └─ echo.private(`chat.read.${id}`)   ──▶  setupChatEventsChannel      (СЛОЙ 5)
  ⚠ канал signal.{id} объявлен в channels.php, но подписки НЕТ  → [НЕТ] в конфиге.

СЛОЙ 4 — БЭКЕНД: КАНАЛЫ И СОБЫТИЯ (источник истины для push)
  channels.php  ── правила авторизации private-/presence-каналов (user.{id}, chat, friends.{id},
                  chat.read.{from_id}, call.{id}, signal.{id}).
  MessageService::create(from,to,content):
       FriendService::areFriends? ─нет─▶ throw
       │да
       ▼
       Message::create(...)  ──▶  broadcast(new NewMessage([...formatted_created_at, read_at]))
                                          ──toOthers()──▶  private канал user.{to_id}
  ChatController::markAsRead(userReadId):
       update messages set read_at=now where from_id=userReadId and to_id=me and read_at null
       │ updated>0
       ▼
       broadcast(new MessageRead({from_id:userReadId, to_id:me, updated_count}))
              ──toOthers()──▶  private канал chat.read.{from_id}   (← ВАЖНО: отправка, не читатель)

СЛОЙ 5 — ФРОНТ-ХЕНДЛЕРЫ СОБЫТИЙ (приём push)
  chatEventsHandler.setupChatEventsChannel(echo, myUserId):
       .listen('.NewMessage',  e ▶ e.message ▶ chatStore.addIncomingMessage(msg)        (СЛОЙ 6)
       .listen('.MessageRead', e ▶ e.message.to_id ▶ chatStore.markSentAsRead(to_id)   (СЛОЙ 6)
       ⚠ обе ветки разворачивают обёртку e.message — согласовано с broadcastWith=['message'=>…].
  userPresenceHandler:  here/joining/leaving ▶ contactStore.setUserOnline/Offline  (→ isOnline в СЛОЙ 7)
  friendshipEventsHandler: FriendRequestSent/Accepted ▶ friendStore

СЛОЙ 6 — STORE СООБЩЕНИЙ (chatStore, мозг данных)
  loadHistory(contactId):
       cacheKey=`${userId}_${contactId}`; если history[cacheKey] непустой ▶ messages=кэш (ранний выход)
       │нет
       ▼
       TalkStreamAPI.getHistory ──▶ MessageResource[] ──▶ enrich{is_mine, status=read_at?'read':'delivered'}
       ──▶ messages + history[cacheKey]
  sendMessage(to_id, content):
       temp={id:-Date.now(), status:'sending', isLocal:true} ──push──▶ messages
       │
       ▼
       TalkStreamAPI.sendMessage ──успех──▶ replaceLocalMessage(tempId, {...data, status:'delivered'})
                                  ──ошибка─▶ markFailed(tempId)   (пузырь НЕ удаляется)
  addIncomingMessage(msg):  дедуп Number(m.id)===Number(msg.id) ▶ enrich ▶ push в messages(если selected)
                            + history[cacheKey]
  markAsRead(contactId):     мутация ВХОДЯЩИХ  (to_id===me && from_id===contact)  → сброс счётчика на моём экране
  markSentAsRead(contactId): мутация ИСХОДЯЩИХ (from_id===me && to_id===contact)  → синие галочки отправителю
  markFailed(tempId) / retryMessage(tempId):  status='failed' ↔ resend через TalkStreamAPI.sendMessage
  getters.unreadCount:  filter(m.to_id===me && m.status!=='read').length   (гейт сетевого /read в СЛОЙ 7)

СЛОЙ 7 — UI-КОМПОЗИЦИЯ ЛЕНТЫ (мозг → ножка стола → пузырь)
  TalkStreamHistory.vue  (props: userFrom, contact, messages, isOnline):
       groupedMessages = сгруппировать messages по from_id (подряд идущие)
       хелпер isMine(fromId)      = (userFrom?.id ?? userStore.id) === fromId
       хелпер getAvatarUrl(fromId)= isMine ? (userFrom.avatar ?? userStore.avatar ?? fallback)
                                           : (contact.avatar ?? fallback)
       │
       ▼  (рукопожатие 1: мозг → тупая ножка стола)
  <MessageGroup :avatar-url :is-mine :messages :is-online :show-avatar>   ← НОЛЬ логики, только рендер
       аватар слева (theirs) | slot сообщений | аватар справа (mine); индикатор 🟢/ эмодзи
       │
       ▼  (рукопожатие 2: слот → пузырь)
  <MessageItem :userFrom :contact :message :is-first-in-group :is-last-in-group :is-group-start>
       isMine = message.from_id === userStore.id          (не зависит от null-пропсов)
       пузырь: max-width:100% от контейнера(≤80%), сжимается по контенту, justify-content прижимает
       футер: formatted_created_at · ⋮(formatted_read_at, клик-toggle) · галочки(v-if isMine)
              галочки: sending🕒 / delivered✔✔ / read✔✔(синие+readPulse) / failed✖(клик→retryMessage)
       retry-рукопожатие: клик ✖ ▶ chatStore.retryMessage(message.id)   (СЛОЙ 6)

  ТРИГГЕРЫ ПРОЧТЕНИЯ (замыкают read-цепь, СЛОЙ 6+4+5):
       checkScrollPosition()        ─внизу+newMessagesCount>0─▶ markCurrentChatAsRead()
       handleScrollToBottomAndMarkRead() ─клик шторки─────────▶ markCurrentChatAsRead()
       watch(messages.length) isAtBottom ─новое внизу─────────▶ markCurrentChatAsRead()
       markCurrentChatAsRead():
            chatStore.markAsRead(contactId)            (локально, мгновенно, ВСЕГДА)
            if (chatStore.unreadCount > 0 before)      (гейт от спама)
                 TalkStreamAPI.markAsRead(contactId)   ──▶ POST /read/{id}  (СЛОЙ 4)
                                    │
                                    ▼  бэкенд проставляет read_at и бродкастит MessageRead
                          отправитель ловит через СЛОЙ 5 → markSentAsRead → синие галочки

СЛОЙ 8 — ОТПРАВКА (ввод → стор)
  TalkStreamSender @send{content,to_id}  ──▶  TalkStream.vue.handleSendMessage
       ──▶  chatStore.sendMessage(to_id, content)   (СЛОЙ 6; БЕЗ дубля temp-сообщения здесь)
       ──▶  historyRef.scrollToBottom()

СЛОЙ 9 — БЭКЕНД-ВАЛИДАЦИЯ / РЕСУРС / МОДЕЛЬ (контракт REST)
  SendMessageRequest:  content ≤ config('talkstream.limits.max_message_length')   [РЕАЛ]
  Message (модель):    casts read_at/created_at=datetime; appends=[formatted_created_at, formatted_read_at];
                       аксессоры formattedCreatedAt()/formattedReadAt() (null→'')
  MessageResource:     явный toArray() возвращает formatted_created_at + formatted_read_at
                       ⚠ явный toArray НЕ прокидывает $appends модели автоматически —
                         обязанность ресурса вернуть явно (это и чинит время после F5)

СЛОЙ 10 — ТРАНСПОРТ REST (два сосуществующих слоя; основной — нижний)
  ОСНОВНОЙ (используется chatStore/History напрямую):
       api/talkstream.ts  ──▶  @utils/request  (режим BEFORE ▶ возвращает response.data = HTTP-body)
       методы: getHistory, sendMessage, markAsRead, getContacts, getUser, getConfig, friends, calls
  АЛЬТЕРНАТИВНЫЙ (классовый, в основной цепи chat НЕ используется — держать в уме при рефакторе):
       talkService.ts ▶ talkResource.ts ▶ talkRequest.ts ▶ @utils/request
       (talkRequest сам лепит префикс /talkstream; TalkStreamAPI префикс пишет вручную в путях)
```

#### Как читается эта цепочка на живом примере «А пишет, Б читает»:
```text
А печатает → 
СЛОЙ 8 → 
СЛОЙ 6 sendMessage (temp 🕒) → 
СЛОЙ 10 POST /send → 
СЛОЙ 4 MessageService::create (строка в БД + NewMessage→user.{Б}) → ответ А → 
СЛОЙ 6 replaceLocalMessage (✔✔ серые = «на сервере») → 
СЛОЙ 5 Б ловит .NewMessage → 
СЛОЙ 6 addIncomingMessage → 
СЛОЙ 7 Б видит пузырь слева. Б смотрит вниз/кликает шторку → 
СЛОЙ 7 markCurrentChatAsRead → 
СЛОЙ 6 локальный markAsRead + гейт unreadCount → 
СЛОЙ 10 POST /read/{А} → 
СЛОЙ 4 ChatController::markAsRead (read_at + MessageRead→chat.read.{А}) → 
СЛОЙ 5 А ловит .MessageRead (e.message.to_id=Б) → 
СЛОЙ 6 markSentAsRead(Б) → 
СЛОЙ 7 у А галочки становятся синими ✔✔. F5 на Б → 
СЛОЙ 6 loadHistory → 
СЛОЙ 9 MessageResource (с formatted_*) → время и read_at на месте.
```

### Где эталон может расходиться с реальностью (честная оговорка: это понимание, не гарантия)
####Эталон выше — моя реконструкция по дампам и присланным телам. Он не утверждает, что код идеален. Вот точки, где реальность может вести себя иначе, и их надо держать в голове при отладке:

1) Конфиг-читалка не подключена (СЛОЙ 0). Это не баг, а задел, но он делает бессмысленными все [НЕТ]/[ЧАСТ]-флаги ui.*/features.*: они ни на что не влияют, пока appStore не начнёт дёргать /talkstream/config. Если тех увидит «галочки есть, хотя enable_read_receipts должен был бы выключать» — причина здесь, а не в MessageItem.
2) message_sent => 'MessageSent' врёт контракту ([РАСХ]). Рантайм работает, потому что фронт слушает .NewMessage, а не читает это имя из конфига. Но любой, кто попытается завязать логику на маппинг из конфига, получит несуществующее событие. Значение в конфиге не менял — это твоё решение.
3) Серые ✔✔ ≠ «дошло до трубки Б». Нет delivery-ACK: toOthers() — ephemeral push без回执. Серые = «сохранено на сервере». Если Б оффлайн в момент бродкаста, А всё равно увидит серые, а Б не получит ничего до F5/REST-догона. Это архитектурное ограничение push-без-очереди, не регрессия галочек.
4) Оффлайн-очереди/догона нет. Пропущенные NewMessage при разрыве WS у Б не восстанавливаются переподключением (scheduleRecover с бэкоффом возвращает подписку, но не историю). Лечится только REST getHistory (F5/фокус). Эталон это фиксирует как «известный пробел», не как «работает».
5) Локальный read_at=now() vs серверный timestamp. markSentAsRead/markAsRead ставят now() на фронте мгновенно; реальный read_at с БД приедет только после следующего getHistory. Возможное расхождение на секунды между локальной меткой и серверной — не критично для галочек, но если позже строить «точное время прочтения» для аудита/сортировки — опираться на серверный, а не на фронт-now().
6) Два транспортных слоя (СЛОЙ 10). chatStore/History ходят через TalkStreamAPI→@utils/request (BEFORE). Классовый talkService/talkResource/talkRequest в этой цепи не участвует. Если кто-то «починит» чат, правив talkService, — изменений в рантайме не будет, потому что основной путь другой. Держать в уме при рефакторе, не смешивать.
7) ConfigController — двойной статус в git. Пока не перестейдишь (шаг 1 раздела 2), в коммит уедет старая индексная копия контроллера. Это не баг кода, а баг индекса — но по эффекту на свежем чекауте контроллер будет не тем, что на диске.
8) Presence-канал chat. Эталон считает echo.join('chat')+setupUserPresenceChannel рабочими ([РЕАЛ] в конфиге). Если на стенде зелёные кружки в списке контактов ведут себя странно — сверить именно этот хендлер (here/joining/leaving→setUserOnline/Offline), а не chatEventsHandler: это разные подписки на разные каналы.
9) retryMessage при всё ещё мёртвой сети. Цикл failed→sending→failed без залипания — ожидаемое поведение, не баг. Но если interceptor в @utils/request когда-нибудь начнёт глотать сетевые ошибки (возвращать resolve вместо reject), catch в sendMessage не сработает и пузырь зависнет в 🕒 навсегда. Сейчас interceptor ре-throw-ит (проверено), поэтому ✖ появляется — но после timeout:30000 при Offline (Chrome держит соединение), а не мгновенно; для мгновенного ✖ использовать Request Blocking / битый путь, не Offline.

#### Ни один пункт 1–9 не отменяет read-цепи и failed-retry, которые мы собрали по шагам 1–6. Это именно «где эталон тонкий лёд», а не «что сломано». Коммит после перестейджа 18 путей остаётся атомарным и запускаемым на чистом чекауте; перечисленное выше — карта рисков для следующей итерации (typing / пагинация / delivery-ACK / оффлайн-догон / подключение читалки конфига), которую я в сообщении коммита явно помечу как задел, а не как готовое.
