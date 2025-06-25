import { defineStore } from 'pinia'
import { createEcho, disconnectEcho } from '@/modules/TalkStream/plugins/echoTalkStream'
import { setupUserPresenceChannel } from '@/modules/TalkStream/Subscriptions/userPresenceHandler'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { useChatStore } from '@/modules/TalkStream/Stores/chatStore'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'
import { userStore } from '@/store/user'
import { isLogged } from '@/utils/auth'

// Расширенная система логирования с уровнями и цветами
const createLogger = () => {
    const logLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR']
    const currentLevel = import.meta.env.VITE_LOG_LEVEL || 'INFO'
    const shouldLog = (level) => {
        return logLevels.indexOf(level) >= logLevels.indexOf(currentLevel)
    }

    // Состояния соединения
    const stateLabels = {
        initialized: '🟢 Инициализировано',
        connecting: '🟡 Подключение...',
        connected: '🟢 Подключено',
        disconnected: '🔴 Отключено',
        error: '🔴 Ошибка',
        state_change: '🔄 Изменение состояния',
        unavailable: '🟠 Недоступно',
        failed: '❌ Неудача',
        reconnecting: '🔄 Переподключение...'
    }

    // Цвета для вывода
    const colors = {
        initialized: 'color: blue; font-weight: bold;',
        connecting: 'color: orange; font-weight: bold;',
        connected: 'color: green; font-weight: bold;',
        disconnected: 'color: red; font-weight: bold;',
        error: 'color: darkred; background: yellow; font-weight: bold;',
        state_change: 'color: purple; font-weight: bold;',
        unavailable: 'color: gray; font-style: italic;',
        failed: 'color: white; background: red; font-weight: bold;',
        reconnecting: 'color: gold; font-weight: bold;'
    }

    return {
        debug: (...args) => {
            if (shouldLog('DEBUG')) console.debug('[TalkStream][DEBUG]', ...args)
        },
        info: (...args) => {
            if (shouldLog('INFO')) console.info('[TalkStream][INFO]', ...args)
        },
        warn: (...args) => {
            if (shouldLog('WARN')) console.warn('[TalkStream][WARN]', ...args)
        },
        error: (...args) => {
            if (shouldLog('ERROR')) console.error('[TalkStream][ERROR]', ...args)
        },
        logConnectionState: (state) => {
            if (!shouldLog('INFO')) return

            const label = stateLabels[state] || `❓ Неизвестное состояние: ${state}`
            const colorStyle = colors[state] || 'color: black;'

            console.info(`%c[TalkStream] ${label}`, colorStyle)
        }
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
        reconnectInterval: 3000,
        subscribedChannels: [],
        reconnectTimer: null,
        isHandlersBound: false,
        selectedContactId: null
    }),

    getters: {
        socketId() {
            return this.echo?.socketId()
        },
        channelNames() {
            return this.subscribedChannels.map(c => c.name)
        },
        connectionState() {
            return this.echo?.connector?.pusher?.connection?.state
        }
    },

    actions: {
        async initWebSockets() {
            if (!isLogged()) {
                logger.warn('Пользователь не авторизован, подключение отменено')
                return
            }

            const useUserStore = userStore()
            if (!useUserStore.id) {
                logger.warn('Не удалось получить ID пользователя')
                return
            }

            this.clearReconnectTimer()
            if (this.isConnected) {
                logger.info('Уже подключено к серверу')
                return
            }

            try {
                logger.info('Создание экземпляра Echo...')
                this.echo = createEcho()

                if (!this.echo) {
                    logger.error('Не удалось создать экземпляр Echo')
                    this.handleConnectionError(new Error('Failed to create Echo instance'))
                    return
                }

                if (!this.echo.connector || !this.echo.connector.pusher) {
                    logger.error('Отсутствует pusher connector')
                    this.handleConnectionError(new Error('Pusher connector missing'))
                    return
                }

                // Установка обработчиков
                this.setupConnectionHandlers()
                // Инициируем подключение
                this.echo.connect()
                logger.info('Инициировано подключение к серверу')
            } catch (error) {
                logger.error('Ошибка при инициализации:', error)
                this.handleConnectionError(error)
            }
        },

        setupConnectionHandlers() {
            if (this.isHandlersBound) {
                logger.debug('Обработчики уже установлены')
                return
            }

            const pusher = this.echo.connector.pusher

            // 1. Регистрируем обработчик для события инициализации
            pusher.connection.bind('initialized', () => {
                logger.info('Соединение Pusher инициализировано')
                this.bindConnectionHandlers()
                this.isHandlersBound = true
            })

            // 2. Проверяем текущее состояние соединения
            const connectionState = pusher.connection.state
            logger.debug(`Текущее состояние соединения: ${connectionState}`)

            // 3. Если соединение уже инициализировано, устанавливаем обработчики сразу
            if (connectionState !== 'uninitialized') {
                logger.info('Соединение уже инициализировано, устанавливаем обработчики')
                this.bindConnectionHandlers()
                this.isHandlersBound = true
            }
        },

        bindConnectionHandlers() {
            const pusher = this.echo.connector.pusher

            logger.debug('Установка обработчиков событий соединения')

            pusher.connection.bind('connecting', () => {
                logger.logConnectionState('connecting')
                this.isConnected = false
                this.connectionError = null
            })

            pusher.connection.bind('connected', () => {
                logger.logConnectionState('connected')
                this.isConnected = true
                this.connectionError = null
                this.reconnectAttempts = 0
                this.subscribeToChannels()
            })

            pusher.connection.bind('disconnected', () => {
                logger.logConnectionState('disconnected')
                this.isConnected = false
                this.isHandlersBound = false
                this.scheduleReconnect()
            })

            pusher.connection.bind('error', (error) => {
                logger.error('Ошибка соединения Pusher:', error)
                this.handleConnectionError(error)
            })

            pusher.connection.bind('state_change', (states) => {
                logger.debug(`Изменение состояния: ${states.previous} -> ${states.current}`)
            })
        },

        handleConnectionError(error) {
            this.isConnected = false
            this.connectionError = error
            this.reconnectAttempts++

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                logger.warn(`Ошибка подключения, попытка ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
                this.scheduleReconnect()
            } else {
                logger.error(`Превышено максимальное количество попыток подключения (${this.maxReconnectAttempts})`)
            }
        },

        scheduleReconnect() {
            this.clearReconnectTimer()

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                return
            }

            const delay = this.calculateReconnectDelay()
            logger.info(`Повторная попытка подключения через ${delay} мс`)
            this.reconnectTimer = setTimeout(() => {
                this.reconnect()
            }, delay)
        },

        calculateReconnectDelay() {
            const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
            return baseDelay + Math.floor(Math.random() * 1000)
        },

        clearReconnectTimer() {
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer)
                this.reconnectTimer = null
                logger.debug('Таймер переподключения очищен')
            }
        },

        reconnect() {
            logger.info(`Попытка переподключения (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)
            this.disconnect()
            this.initWebSockets()
        },

        subscribeToChannels() {
            if (!this.echo) {
                logger.warn('Попытка подписки без экземпляра Echo')
                return
            }

            const user = userStore()
            if (!user.id) {
                logger.warn('Не удалось подписаться: отсутствует ID пользователя')
                return
            }

            // Очищаем предыдущие подписки
            this.unsubscribeFromAllChannels()

            try {
                // Приватный канал пользователя
                const privateChannelName = `private-user.${user.id}`
                logger.info(`Подписка на приватный канал: ${privateChannelName}`)

                const userChannel = this.echo.private(privateChannelName)
                userChannel
                    .listen('.UserEvent', (e) => {
                        const chatStore = useChatStore()
                        const contactStore = useContactStore()

                        if (e.message.from_id === setSelectedContact(contactStore.selectedContact.id)) return

                        logger.info('Новое сообщение от пользователя:', e.message)
                        chatStore.addLocalMessage(e.message)

                        // Автоскролл истории
                        if (this.historyContainer?.scrollToBottom) {
                            this.historyContainer.scrollToBottom()
                        }
                    })
                    .listen('.CallEvent', (e) => {
                        logger.info('Событие звонка:', e)
                        // Логика обработки входящего звонка
                    })

                this.subscribedChannels.push({
                    name: privateChannelName,
                    channel: userChannel
                })

                logger.info(`Успешно подписался на канал ${privateChannelName}`)
            } catch (error) {
                logger.error('Ошибка при подписке на приватные каналы:', error)
            }

            try {
                // Presence-канал для онлайна
                logger.info('Подписка на presence-канал: presence-chat')

                const presenceChannel = setupUserPresenceChannel()
                if (presenceChannel) {
                    this.subscribedChannels.push({
                        name: 'presence-chat',
                        channel: presenceChannel
                    })
                }

                logger.info('Успешно подписался на presence-канал')
            } catch (error) {
                logger.error('Ошибка при подписке на presence-канал:', error)
            }


            try {
                // Presence-канал для онлайна
                logger.info('Подписка на presence-канал: presence-chat')

                const presenceChannel = setupUserPresenceChannel()
                if (presenceChannel) {
                    this.subscribedChannels.push({
                        name: 'presence-chat',
                        channel: presenceChannel
                    })
                }

                logger.info('Успешно подписался на presence-канал')
            } catch (error) {
                logger.error('Ошибка при подписке на presence-канал:', error)
            }

        },

        unsubscribeFromAllChannels() {
            if (!this.echo) return

            for (const channelInfo of this.subscribedChannels) {
                try {
                    this.echo.leave(channelInfo.name)
                    logger.debug(`Отписались от канала: ${channelInfo.name}`)
                } catch (error) {
                    logger.warn(`Ошибка при отписке от канала ${channelInfo.name}:`, error)
                }
            }

            this.subscribedChannels = []
        },

        disconnect() {
            this.clearReconnectTimer()

            if (this.echo) {
                try {
                    this.unsubscribeFromAllChannels()
                    this.echo.disconnect()
                    logger.info('Соединение закрыто')
                } catch (error) {
                    logger.error('Ошибка при отключении:', error)
                } finally {
                    this.echo = null
                    this.isConnected = false
                    this.isHandlersBound = false
                }
            }

            // Очистка глобального экземпляра Echo
            disconnectEcho()
        },

        forceReconnect() {
            logger.info('Принудительное переподключение')
            this.reconnectAttempts = 0
            this.reconnect()
        },

        setSelectedContact(contactId) {
            this.selectedContactId = contactId
            localStorage.setItem('last-selected-contact', contactId)
            logger.info(`Выбранный контакт обновлён: ${contactId}`)
        }
    }
})
