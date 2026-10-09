import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axios from 'axios'
import Cookies from 'js-cookie'
import { getToken } from '@/utils/auth'
import type { Options as PusherOptions } from 'pusher-js'

// Pusher должен быть доступен глобально для laravel-echo
declare global {
    interface Window {
        Pusher: typeof Pusher
        Echo: Echo | null
        axios?: typeof axios
        getEchoInstance?: () => Echo | null
        disconnectEcho?: () => void
    }
}

window.Pusher = Pusher

let echoInstance: Echo | null = null

const log = {
    info: (...args: unknown[]): void => console.log('[Echo]', ...args),
    warn: (...args: unknown[]): void => console.warn('[Echo]', ...args),
    error: (...args: unknown[]): void => console.error('[Echo]', ...args),
}

export function createEcho(): Echo | null {
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

        const config: PusherOptions = {
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

        echoInstance.connector.pusher.connection.bind('error', (err: unknown) => {
            log.error('Ошибка Pusher:', err)
        })

        echoInstance.connector.pusher.connection.bind('connected', () => {
            log.info('✅ WebSocket подключён')
        })

        echoInstance.connector.pusher.connection.bind('disconnected', () => {
            log.warn('⚠️ WebSocket отключён')
        })

        return echoInstance
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e)
        log.error('Критическая ошибка при создании Echo:', errorMessage)
        return null
    }
}

export function updateEchoToken(newToken: string): Echo | null {
    if (!echoInstance) return createEcho()

    try {
        if (echoInstance.options?.auth?.headers) {
            (echoInstance.options.auth.headers as Record<string, string>).Authorization = `Bearer ${newToken}`
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        if (window.axios) {
            window.axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        }

        const wasConnected = echoInstance.connector?.pusher?.connection?.state === 'connected'
        echoInstance.disconnect()

        if (wasConnected) {
            setTimeout(() => echoInstance?.connect(), 1500)
        }

        return echoInstance
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e)
        log.error('Ошибка при обновлении токена:', errorMessage)
        return null
    }
}

export function getEchoInstance(): Echo | null {
    return echoInstance
}

export function disconnectEcho(): void {
    if (!echoInstance) return

    try {
        echoInstance.disconnect()
        log.info('Соединение закрыто')
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e)
        log.error('Ошибка при отключении:', errorMessage)
    } finally {
        echoInstance = null
        window.Echo = null
        if (axios.defaults.headers.common) {
            delete axios.defaults.headers.common['Authorization']
        }
    }
}

if (import.meta.env.DEV) {
    window.getEchoInstance = getEchoInstance
    window.disconnectEcho = disconnectEcho
}
