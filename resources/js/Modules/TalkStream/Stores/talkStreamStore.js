import { defineStore } from 'pinia'
import { createEcho, disconnectEcho } from '@/modules/TalkStream/plugins/echoTalkStream'
import { setupUserPresenceChannel } from '@/modules/TalkStream/Subscriptions/userPresenceHandler'
import { setupFriendRequestsChannel } from '@/modules/TalkStream/Subscriptions/friendshipEventsHandler'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'
import { userStore } from '@/store/userStore'
import { isLogged } from '@/utils/auth'

const createLogger = () => {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR']
    const current = import.meta.env.VITE_LOG_LEVEL || 'INFO'
    const allowed = (lvl) => levels.indexOf(lvl) >= levels.indexOf(current)

    const stateLabels = {
        connecting: '🟡 Подключение...',
        connected: '🟢 Подключено',
        disconnected: '🔴 Отключено',
        unavailable: '🟠 Недоступно',
    }

    return {
        debug: (...a) => allowed('DEBUG') && console.debug('[TalkStream][DEBUG]', ...a),
        info: (...a) => allowed('INFO') && console.info('[TalkStream][INFO]', ...a),
        warn: (...a) => allowed('WARN') && console.warn('[TalkStream][WARN]', ...a),
        error: (...a) => allowed('ERROR') && console.error('[TalkStream][ERROR]', ...a),
        state: (s) => allowed('INFO') && console.info(`[TalkStream] ${stateLabels[s] || s}`),
    }
}

const logger = createLogger()

export const useTalkStreamStore = defineStore('talkStream', {
    state: () => ({
        echo: null,
        isConnected: false,
        connectionError: null,
        reconnectAttempts: 0,
        maxReconnectAttempts: 5,
        reconnectTimer: null,
        subscribedChannels: [],        // [{ type: 'private'|'presence', shortName, channel }]
        isHandlersBound: false,
        selectedContactId: null,
    }),

    getters: {
        socketId: (state) => state.echo?.socketId(),
        channelNames: (state) => state.subscribedChannels.map((c) => c.shortName),
        connectionState: (state) => state.echo?.connector?.pusher?.connection?.state,
    },

    actions: {
        // =========================================================
        // ИНИЦИАЛИЗАЦИЯ
        // =========================================================
        async initWebSockets() {
            if (!isLogged()) {
                logger.warn('Пользователь не авторизован, подключение отменено')
                return
            }

            const user = userStore()
            if (!user.id) {
                logger.warn('Нет ID пользователя')
                return
            }

            this.clearReconnectTimer()

            if (this.isConnected) {
                logger.info('Уже подключено')
                return
            }

            try {
                logger.info('Создание экземпляра Echo...')
                this.echo = createEcho()

                if (!this.echo?.connector?.pusher) {
                    logger.error('Echo или pusher-коннектор недоступны')
                    this.handleConnectionError(new Error('Echo init failed'))
                    return
                }

                this.setupConnectionHandlers()
                this.echo.connect()
                logger.info('Подключение инициировано')
            } catch (e) {
                logger.error('Ошибка инициализации:', e)
                this.handleConnectionError(e)
            }
        },

        setupConnectionHandlers() {
            if (this.isHandlersBound) return

            const pusher = this.echo.connector.pusher

            pusher.connection.bind('connected', () => {
                logger.state('connected')
                this.isConnected = true
                this.connectionError = null
                this.reconnectAttempts = 0
                this.subscribeToChannels()
            })

            pusher.connection.bind('connecting', () => {
                logger.state('connecting')
                this.isConnected = false
                this.connectionError = null
            })

            pusher.connection.bind('disconnected', () => {
                logger.state('disconnected')
                this.isConnected = false
                this.isHandlersBound = false
                this.scheduleReconnect()
            })

            pusher.connection.bind('error', (err) => {
                logger.error('Ошибка Pusher:', err)
                this.handleConnectionError(err)
            })

            pusher.connection.bind('state_change', (states) => {
                logger.debug(`${states.previous} -> ${states.current}`)
            })

            this.isHandlersBound = true
        },

        // =========================================================
        // ПОДПИСКИ (без двойных префиксов!)
        // =========================================================
        subscribeToChannels() {
            if (!this.echo) {
                logger.warn('Нет Echo для подписки')
                return
            }

            const user = userStore()
            if (!user.id) {
                logger.warn('Нет ID пользователя для подписки')
                return
            }

            // Чистим старые подписки
            this.unsubscribeFromAllChannels()

            // -----------------------------------------------------
            // 1. Приватный канал пользователя
            //    echo.private('user.1') → Reverb: 'private-user.1'
            //    Правило: Broadcast::channel('private-user.{id}', ...)
            // -----------------------------------------------------
            try {
                const shortName = `user.${user.id}`
                logger.info(`Подписка на private-канал: ${shortName}`)

                const userChannel = this.echo.private(shortName)

                userChannel
                    .listen('.UserEvent', (e) => this.handleIncomingMessage(e))
                    .listen('.CallEvent', (e) => {
                        logger.info('Событие звонка:', e)
                    })
                    .error((err) => {
                        logger.error(`Ошибка канала ${shortName}:`, err)
                    })

                this.subscribedChannels.push({
                    type: 'private',
                    shortName,
                    channel: userChannel,
                })

                logger.info(`✅ Подписан на ${shortName}`)
            } catch (e) {
                logger.error('Ошибка подписки на user-канал:', e)
            }

            // -----------------------------------------------------
            // 2. Presence-канал онлайн-статусов
            //    echo.join('chat') → Reverb: 'presence-chat'
            //    Правило: Broadcast::channel('presence-chat', ...)
            // -----------------------------------------------------
            try {
                const presenceChannel = setupUserPresenceChannel(this.echo)
                if (presenceChannel) {
                    this.subscribedChannels.push({
                        type: 'presence',
                        shortName: 'chat',
                        channel: presenceChannel,
                    })
                    logger.info('✅ Подписан на presence-канал chat')
                }
            } catch (e) {
                logger.error('Ошибка подписки на presence-канал:', e)
            }

            // -----------------------------------------------------
            // 3. Канал заявок в друзья
            //    echo.private('friends.1') → Reverb: 'private-friends.1'
            //    Правило: Broadcast::channel('private-friends.{userId}', ...)
            // -----------------------------------------------------
            try {
                const friendsChannel = setupFriendRequestsChannel(this.echo)
                if (friendsChannel) {
                    const user2 = userStore()
                    this.subscribedChannels.push({
                        type: 'private',
                        shortName: `friends.${user2.id}`,
                        channel: friendsChannel,
                    })
                    logger.info(`✅ Подписан на friends.${user2.id}`)
                }
            } catch (e) {
                logger.error('Ошибка подписки на friends-канал:', e)
            }

            logger.info(`Всего активных подписок: ${this.subscribedChannels.length}`)
        },

        handleIncomingMessage(e) {
            const chatStore = useChatStore()
            const contactStore = useContactStore()

            // Если сообщение от выбранного контакта — добавляем в историю
            const selectedId = contactStore.selectedContact?.id
            if (e.message?.from_id && e.message.from_id === selectedId) {
                chatStore.addLocalMessage(e.message)
                logger.info('Новое сообщение добавлено в историю')
                return
            }

            logger.info('Новое сообщение (не от выбранного контакта):', e.message)
        },

        // =========================================================
        // ОТПИСКА
        // =========================================================
        unsubscribeFromAllChannels() {
            if (!this.echo) return

            for (const { type, shortName } of this.subscribedChannels) {
                try {
                    // Для presence используем leave(), для private — leaveChannel()
                    if (type === 'presence') {
                        this.echo.leave(shortName)
                    } else {
                        this.echo.leaveChannel(shortName)
                    }
                    logger.debug(`Отписка от ${shortName}`)
                } catch (e) {
                    logger.warn(`Ошибка отписки от ${shortName}:`, e)
                }
            }

            this.subscribedChannels = []
        },

        // =========================================================
        // РЕКОННЕКТ
        // =========================================================
        handleConnectionError(error) {
            this.isConnected = false
            this.connectionError = error
            this.reconnectAttempts++

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                logger.warn(`Попытка ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
                this.scheduleReconnect()
            } else {
                logger.error(`Превышен лимит попыток (${this.maxReconnectAttempts})`)
            }
        },

        scheduleReconnect() {
            this.clearReconnectTimer()
            if (this.reconnectAttempts >= this.maxReconnectAttempts) return

            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
                + Math.floor(Math.random() * 1000)

            logger.info(`Переподключение через ${delay} мс`)
            this.reconnectTimer = setTimeout(() => this.reconnect(), delay)
        },

        clearReconnectTimer() {
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer)
                this.reconnectTimer = null
            }
        },

        reconnect() {
            logger.info(`Переподключение (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)
            this.disconnect()
            this.initWebSockets()
        },

        forceReconnect() {
            logger.info('Принудительное переподключение')
            this.reconnectAttempts = 0
            this.reconnect()
        },

        // =========================================================
        // ОТКЛЮЧЕНИЕ
        // =========================================================
        disconnect() {
            this.clearReconnectTimer()

            if (this.echo) {
                try {
                    this.unsubscribeFromAllChannels()
                    this.echo.disconnect()
                    logger.info('Соединение закрыто')
                } catch (e) {
                    logger.error('Ошибка отключения:', e)
                } finally {
                    this.echo = null
                    this.isConnected = false
                    this.isHandlersBound = false
                }
            }

            disconnectEcho()
        },

        setSelectedContact(contactId) {
            this.selectedContactId = contactId
            localStorage.setItem('last-selected-contact', contactId)
        },
    },
})
