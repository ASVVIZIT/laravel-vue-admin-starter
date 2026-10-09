import { defineStore } from 'pinia'
import Echo, { Channel, PresenceChannel } from 'laravel-echo'
import { createEcho, disconnectEcho, getEchoInstance } from '@/modules/TalkStream/Plugin/echoTalkStreamPlugin'
import { setupUserPresenceChannel } from '@/modules/TalkStream/Subscriptions/userPresenceHandlerSubs'
import { setupFriendRequestsChannel } from '@/modules/TalkStream/Subscriptions/friendshipEventsHandlerSubs'
import { setupChatEventsChannel } from '@/modules/TalkStream/Subscriptions/chatEventsHandlerSubs'
import { userStore } from '@/store/userStore'
import { isLogged } from '@/utils/auth'
import logger from '@/modules/TalkStream/Utils/loggerTalkStreamUtil'

// Интерфейс для отслеживания активных каналов
interface SubscribedChannel {
    name: string
    channel: Channel | PresenceChannel
}

export const useTalkStreamStore = defineStore('talkStream', {
    state: () => ({
        echo: null as Echo | null,
        isConnected: false,
        connectionError: null as string | null,
        reconnectAttempts: 0,
        maxReconnectAttempts: 5,
        reconnectTimer: null as ReturnType<typeof setTimeout> | null,
        subscribedChannels: [] as SubscribedChannel[],
        isHandlersBound: false,
        isInitialized: false,
    }),

    actions: {
        /**
         * Инициализация WebSocket соединения
         */
        async initWebSockets(): Promise<void> {
            if (!isLogged()) {
                return
            }

            const user = userStore()
            if (!user.id) {
                logger.warn('[TalkStream] User ID not available, skipping WS init')
                return
            }

            // Если уже инициализировано и подключено, не делаем ничего
            if (this.isInitialized && this.isConnected) {
                return
            }

            try {
                logger.info('[TalkStream] Initializing WebSockets...')

                // Создаем экземпляр Echo через плагин
                this.echo = createEcho()

                if (!this.echo?.connector?.pusher) {
                    this.connectionError = 'Failed to create Echo instance'
                    logger.error('[TalkStream] Echo init failed: No connector/pusher')
                    return
                }

                // Настраиваем обработчики состояния подключения
                this.setupConnectionHandlers()

                // Подключаемся
                this.echo.connect()
                this.isInitialized = true
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                logger.error('[TalkStream] Init error:', errorMessage)
                this.connectionError = errorMessage
            }
        },

        /**
         * Настройка обработчиков событий Pusher/Echo
         */
        setupConnectionHandlers(): void {
            if (this.isHandlersBound || !this.echo) {
                return
            }

            const pusher = this.echo.connector.pusher

            // Событие: Успешное подключение
            pusher.connection.bind('connected', () => {
                logger.info('[TalkStream] ✅ WebSocket connected')
                this.isConnected = true
                this.connectionError = null
                this.reconnectAttempts = 0

                // При успешном подключении подписываемся на все необходимые каналы
                this.subscribeToChannels()
            })

            // Событие: Разрыв соединения
            pusher.connection.bind('disconnected', () => {
                logger.warn('[TalkStream] 🔴 WebSocket disconnected')
                this.isConnected = false
                this.isHandlersBound = false
                this.scheduleReconnect()
            })

            // Событие: Ошибка соединения
            pusher.connection.bind('error', (err: unknown) => {
                logger.error('[TalkStream] Pusher error:', err)
                this.connectionError = (err as Error)?.message || 'Connection error'
            })

            this.isHandlersBound = true
        },

        /**
         * Подписка на каналы (Presence, Friends, Chat)
         */
        subscribeToChannels(): void {
            const user = userStore()

            if (!user.id || !this.echo) {
                logger.warn('[TalkStream] Cannot subscribe: No user ID or Echo instance')
                return
            }

            // Сначала отписываемся от старых каналов, чтобы избежать дубликатов
            this.unsubscribeFromAllChannels()

            // 1. Private Channel: user.{id} (Новые сообщения и прочтение)
            try {
                const userChannel = this.echo.private(`user.${user.id}`)

                // Делегируем обработку событий чата в отдельный хендлер
                // Но так как мы используем глобальные хендлеры, вызываем их здесь
                // В данной архитектуре мы используем внешние функции setup*
                // Однако, для сохранения совместимости с предыдущей логикой,
                // мы можем вызвать setupChatEventsChannel прямо здесь или в initWebSockets.
                // Ниже используется подход с вызовом внешних хендлеров для чистоты кода.

                this.subscribedChannels.push({ name: `user.${user.id}`, channel: userChannel })
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                logger.error('[TalkStream] User channel error:', errorMessage)
            }

            // 2. Presence Channel: chat (Онлайн статусы)
            try {
                const presenceChannel = this.echo.join('chat')

                // Логика Presence вынесена в setupUserPresenceChannel,
                // но если мы хотим сохранить локальную логику, раскомментируйте ниже:
                /*
                presenceChannel
                    .here((users: any[]) => { ... })
                    .joining((user: any) => { ... })
                    .leaving((user: any) => { ... })
                */

                this.subscribedChannels.push({ name: 'chat', channel: presenceChannel })
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                logger.error('[TalkStream] Presence channel error:', errorMessage)
            }

            // 3. Private Channel: friends.{id} (Заявки в друзья)
            try {
                const friendsChannel = this.echo.private(`friends.${user.id}`)
                this.subscribedChannels.push({ name: `friends.${user.id}`, channel: friendsChannel })
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                logger.error('[TalkStream] Friends channel error:', errorMessage)
            }

            // 🔥 ВАЖНО: После создания каналов, запускаем глобальные хендлеры,
            // которые привяжут слушатели (.listen) к этим каналам.
            // Мы передаем экземпляр Echo и ID пользователя.
            const echoInstance = getEchoInstance()
            if (echoInstance) {
                setupUserPresenceChannel(echoInstance)
                setupFriendRequestsChannel(echoInstance, user.id)
                setupChatEventsChannel(echoInstance, user.id)
            }
        },

        /**
         * Отписка от всех каналов
         */
        unsubscribeFromAllChannels(): void {
            this.subscribedChannels.forEach(({ name }) => {
                try {
                    if (this.echo) {
                        this.echo.leave(name)
                    }
                } catch (e: unknown) {
                    const errorMessage = e instanceof Error ? e.message : 'Unknown error'
                    logger.warn(`[TalkStream] Leave error ${name}:`, errorMessage)
                }
            })
            this.subscribedChannels = []
        },

        /**
         * Планирование повторного подключения (Exponential Backoff)
         */
        scheduleReconnect(): void {
            this.clearReconnectTimer()

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                logger.warn('[TalkStream] Max reconnect attempts reached. Stopping retries.')
                return
            }

            // Задержка: 1с, 2с, 4с, 8с, 16с, макс 30с
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

            this.reconnectTimer = setTimeout(() => {
                this.reconnectAttempts++
                logger.info(`[TalkStream] Reconnecting... (attempt ${this.reconnectAttempts})`)
                this.initWebSockets()
            }, delay)
        },

        /**
         * Очистка таймера переподключения
         */
        clearReconnectTimer(): void {
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer)
                this.reconnectTimer = null
            }
        },

        /**
         * Полное отключение и очистка ресурсов
         */
        disconnect(): void {
            logger.info('[TalkStream] Disconnecting...')
            this.clearReconnectTimer()
            this.unsubscribeFromAllChannels()

            if (this.echo) {
                disconnectEcho()
                this.echo = null
            }

            this.isConnected = false
            this.isInitialized = false
            this.connectionError = null
        },

        /**
         * Сброс состояния стора
         */
        reset(): void {
            this.disconnect()
            this.reconnectAttempts = 0
        }
    }
})
