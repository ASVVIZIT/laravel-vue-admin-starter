// resources/js/echo.js
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axios from 'axios'
import { getToken } from '@utils/auth.js'

window.Pusher = Pusher

let echoInstance = null

export function createEcho() {
    const token = getToken()

    if (!token) {
        console.warn('[Echo] Токен отсутствует, возможно пользователь не авторизован')
    }

    // Установим глобальный заголовок для Axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    if (echoInstance) {
        console.log('[Echo] Используем существующий экземпляр')
        return echoInstance
    }

    console.log('[Echo] Создаём новый экземпляр с токеном:', token ? 'да' : 'нет')
    if (window.echoTalkStream) return window.echoTalkStream
    try {
        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT,
            forceTLS: false,
            enabledTransports: ['ws'],
            authEndpoint: '/api/broadcasting/auth',
            options: {
                bearerToken: `${token}`,
            },
            auth: {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`
                }
            },
            error: (err) => {
                console.error('[TalkStream] Ошибка подключения к WebSocket:', err)
            }
        })

        window.echoTalkStream = echoInstance

        return echoInstance
    } catch (e) {
        console.error('[Echo] Ошибка при инициализации:', e)
        return null
    }
}
