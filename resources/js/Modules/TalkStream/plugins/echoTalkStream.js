import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axios from 'axios'
import logger from '@/modules/TalkStream/utils/logger'
import { getToken } from '@utils/auth.js'
import { userStore } from '@/store/userStore'
window.Pusher = Pusher

let echoInstance = null

// Упрощенная система логирования
const log = {
    info: (...args) => console.log('[Echo]', ...args),
    warn: (...args) => console.warn('[Echo]', ...args),
    error: (...args) => console.error('[Echo]', ...args),
    debug: (...args) => {
        if (import.meta.env.DEV) console.debug('[Echo]', ...args)
    }
}

export function createEcho() {
    const token = getToken()

    if (!token) {
        log.warn('Токен отсутствует, пропускаем создание экземпляра');
        return null;
    }

    if (echoInstance) {
        log.info('Используем существующий экземпляр');
        return echoInstance;
    }

    try {
        log.info('Создаем новый экземпляр Echo');

        // Установка глобального заголовка
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.withCredentials = true
        window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        window.axios.defaults.withCredentials = true

        // Получение CSRF токена
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

        // Используем текущий хост из URL вместо .env переменных
        const currentHost = window.location.hostname;
        const isSecure = window.location.protocol === 'https:';

        const configEcho = {
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: 'fenixlaravel.loc',    // ✅ Здесь должно быть 94.41.87.10
            wsPort: window.location.port || (isSecure ? 443 : 80), // Автопорт
            wssPort: window.location.port || (isSecure ? 443 : 80),
            scheme: isSecure ? 'wss' : 'ws',
            authEndpoint: import.meta.env.VITE_REVERB_AUTH_ENDPOINT || '/api/broadcasting/auth',
            wsPath: import.meta.env.VITE_REVERB_PATH || '/reverb',
            forceTLS: isSecure,
            disableStats: true,
            enabledTransports: ['ws'],
            withCredentials: true,
            auth: {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                withCredentials: true,
            },
            /*options: {
                auth: {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    withCredentials: true,
                }
            }*/
        };

        log.debug('Конфигурация Echo:', configEcho);

        echoInstance = new Echo(configEcho);

        // Обработчик ошибок
        echoInstance.connector.pusher.connection.bind('error', err => {
            log.error('Ошибка подключения Pusher:', err);
        });

        log.info('Экземпляр Echo успешно создан');
        log.info('Connection state:', echoInstance.connector.pusher.connection.state);
        log.info('Subscribed channels:', Object.keys(echoInstance.connector.channels));
        return echoInstance;
    } catch (e) {
        log.error('Критическая ошибка при создании экземпляра:', e);
        return null;
    }
}

export function updateEchoToken(newToken) {
    if (!echoInstance) {
        log.warn('Экземпляр не инициализирован, создаем новый');
        return createEcho();
    }

    try {
        log.info('Обновление токена авторизации');

        // Обновляем токен во всех местах
        //echoInstance.options.auth.headers.Authorization = `Bearer ${newToken}`;
        echoInstance.options.auth.headers.Authorization = `Bearer ${newToken}`;
        echoInstance.options.auth.headers['X-Requested-With'] = `XMLHttpRequest`;
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        window.axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Безопасное переподключение
        if (echoInstance.connector?.pusher?.connection) {
            const wasConnected = echoInstance.connector.pusher.connection.state === 'connected';
            echoInstance.disconnect();

            if (wasConnected) {
                setTimeout(() => {
                    log.info('Переподключение через 1500 mc');
                    if (echoInstance.connector?.pusher?.connection) {
                        echoInstance.connect();
                    }
                }, 1500);
            }
        }

        return echoInstance;
    } catch (e) {
        log.error('Ошибка при обновлении токена:', e);
        return null;
    }
}

export function getEchoInstance() {
    return echoInstance;
}

export function disconnectEcho() {
    if (echoInstance) {
        try {
            if (typeof echoInstance.disconnect === 'function') {
                echoInstance.disconnect();
            }
            log.info('Соединение закрыто');
        } catch (error) {
            log.error('Ошибка при отключении:', error);
        } finally {
            echoInstance = null;
            delete axios.defaults.headers.common['Authorization'];
        }
    }
}

// Для отладки
if (import.meta.env.DEV) {
    window.getEchoInstance = getEchoInstance;
    window.disconnectEcho = disconnectEcho;
}
