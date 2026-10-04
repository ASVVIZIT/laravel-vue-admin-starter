import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axios from 'axios'
import Cookies from 'js-cookie'
import { getToken } from '@utils/auth.js'

// Pusher должен быть доступен глобально для laravel-echo
window.Pusher = Pusher

let echoInstance = null

const log = {
    info: (...args) => console.log('[Echo]', ...args),
    warn: (...args) => console.warn('[Echo]', ...args),
    error: (...args) => console.error('[Echo]', ...args),
}

export function createEcho() {
    const token = getToken()

    if (!token) {
        log.warn('Токен отсутствует, Echo не создаётся')
        return null
    }

    if (echoInstance) {
        log.info('Используем существующий экземпляр')
        return echoInstance
    }

    try {
        log.info('Создаём новый экземпляр Echo')

        // Глобальные заголовки axios (для auth-запросов Echo)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        axios.defaults.withCredentials = true
        if (window.axios) {
            window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            window.axios.defaults.withCredentials = true
        }

        const csrfToken =
            Cookies.get('XSRF-TOKEN') ||
            document.querySelector('meta[name="csrf-token"]')?.content ||
            ''

        const config = {
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
            wsPort: parseInt(import.meta.env.VITE_REVERB_PORT) || 8080,
            wssPort: parseInt(import.meta.env.VITE_REVERB_PORT) || 8080,
            wsPath: '',                              // ← строго пусто! pusher-js сам добавит /app/{key}
            scheme: import.meta.env.VITE_REVERB_SCHEME || 'ws',
            authEndpoint: import.meta.env.VITE_REVERB_AUTH_ENDPOINT || '/broadcasting/auth',
            forceTLS: false,
            disableStats: true,
            enabledTransports: ['ws'],               // без XHR-fallback
            disabledTransports: ['wss', 'sockjs'],
            withCredentials: true,
            activityTimeout: 30000,
            pongTimeout: 20000,                      // должен быть < activityTimeout
            auth: {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
            },
        }

        log.info(`Подключение к: ${config.scheme}://${config.wsHost}:${config.wsPort}`)

        echoInstance = new Echo(config)

        // Глобальный доступ для хендлеров подписок
        window.Echo = echoInstance

        echoInstance.connector.pusher.connection.bind('error', (err) => {
            log.error('Ошибка Pusher:', err)
        })

        echoInstance.connector.pusher.connection.bind('connected', () => {
            log.info('✅ WebSocket подключён')
        })

        echoInstance.connector.pusher.connection.bind('disconnected', () => {
            log.warn('⚠️ WebSocket отключён')
        })

        return echoInstance
    } catch (e) {
        log.error('Критическая ошибка при создании Echo:', e)
        return null
    }
}

export function updateEchoToken(newToken) {
    if (!echoInstance) return createEcho()

    try {
        echoInstance.options.auth.headers.Authorization = `Bearer ${newToken}`
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        if (window.axios) window.axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

        const wasConnected = echoInstance.connector?.pusher?.connection?.state === 'connected'
        echoInstance.disconnect()

        if (wasConnected) {
            setTimeout(() => echoInstance.connect(), 1500)
        }

        return echoInstance
    } catch (e) {
        log.error('Ошибка при обновлении токена:', e)
        return null
    }
}

export function getEchoInstance() {
    return echoInstance
}

export function disconnectEcho() {
    if (!echoInstance) return

    try {
        echoInstance.disconnect()
        log.info('Соединение закрыто')
    } catch (e) {
        log.error('Ошибка при отключении:', e)
    } finally {
        echoInstance = null
        window.Echo = null
        delete axios.defaults.headers.common['Authorization']
    }
}

if (import.meta.env.DEV) {
    window.getEchoInstance = getEchoInstance
    window.disconnectEcho = disconnectEcho
}
