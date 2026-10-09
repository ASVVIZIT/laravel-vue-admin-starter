import {isLogged, getToken, setToken, getCsrfToken} from '@/utils/auth';
import axios from 'axios';
import videoMessage from '@/modules/Video/utils/videoMessage/videoMessage.js';

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 300000, // Увеличено до 5 минут
    withCredentials: true,
});

// Объединенный интерцептор запросов
service.interceptors.request.use(
    async (config) => { // Добавим async
        const token = getToken();
        const csrfToken = getCsrfToken(); // Добавим await

        // Для всех запросов, кроме CSRF, добавляем токен авторизации
        if (!config.url.includes('sanctum/csrf-cookie')) {
            if (token && isLogged()) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        // Всегда добавляем CSRF-токен, если он есть
        if (csrfToken) {
            config.headers['X-XSRF-TOKEN'] = csrfToken;
        }

        console.debug('[AXIOS] Request to:', config.method?.toUpperCase(), config.url);
        return config;
    },
    error => {
        console.error('[AXIOS] Request error:', error);

        // Показываем сообщение об ошибке только для неотмененных запросов
        if (!axios.isCancel(error)) {
            videoMessage.error('Ошибка формирования запроса');
        }

        return Promise.reject(error);
    }
);

// Улучшенный интерцептор ответов
service.interceptors.response.use(
    response => {
        // Обновление токена, если он пришел в заголовках
        const newToken = response.headers['authorization'] || response.headers['Authorization'];
        if (newToken) {
            setToken(newToken);
            response.data.token = newToken;
        }

        // Показываем уведомления для определенных статусов
        if (response.status >= 200 && response.status < 300) {
            const successMessages = {
                201: 'Ресурс успешно создан',
                202: 'Запрос принят на обработку',
                204: 'Данные успешно удалены'
            };

            if (successMessages[response.status]) {
                videoMessage.success(successMessages[response.status]);
            }
        }

        return response.data;
    },
    error => {
        // Пропускаем отмененные запросы
        if (axios.isCancel(error)) {
            return Promise.reject(error);
        }

        // Обработка сетевых ошибок и таймаутов
        if (!error.response) {
            let message = 'Сетевая ошибка';

            if (error.code === 'ECONNABORTED') {
                message = 'Превышено время ожидания ответа от сервера';
            } else if (error.message.includes('Network Error')) {
                message = 'Проблемы с сетевым подключением';
            }

            videoMessage.error(message);
            return Promise.reject(error);
        }

        const response = error.response;
        const status = response.status;
        let message = 'Произошла ошибка';
        let details = '';
        let customMessage = '';

        // Обработка специфичных HTTP статусов
        switch (status) {
            case 400:
                message = 'Неверный запрос';
                customMessage = 'Сервер не смог обработать ваш запрос';
                break;
            case 401:
                message = 'Требуется авторизация';
                customMessage = 'Ваша сессия истекла. Пожалуйста, войдите снова';
                window.location.href = '#/login';
                break;
            case 403:
                message = 'Доступ запрещен';
                customMessage = 'У вас нет прав для выполнения этого действия';
                break;
            case 404:
                message = 'Ресурс не найден';
                customMessage = 'Запрашиваемые видео не найдены';
                break;
            case 405:
                message = 'Метод не разрешен';
                customMessage = 'Используемый метод запроса не поддерживается';
                break;
            case 408:
                message = 'Таймаут запроса';
                customMessage = 'Сервер не ответил вовремя';
                break;
            case 429:
                message = 'Слишком много запросов';
                customMessage = 'Превышен лимит запросов. Попробуйте позже';
                break;
            case 500:
                message = 'Ошибка сервера';
                customMessage = 'Внутренняя ошибка сервера. Попробуйте позже';
                break;
            case 502:
                message = 'Плохой шлюз';
                customMessage = 'Проблемы с соединением между серверами';
                break;
            case 503:
                message = 'Сервис недоступен';
                customMessage = 'Сервер временно недоступен. Попробуйте позже';
                break;
            case 504:
                message = 'Таймаут шлюза';
                customMessage = 'Сервер не получил ответ вовремя';
                break;
            default:
                if (status >= 500) {
                    customMessage = 'Ошибка сервера';
                } else {
                    customMessage = 'Ошибка при обработке запроса';
                }
        }

        // Расширенная обработка ошибок FFMpeg
        if (response.data?.ffmpeg_status) {
            customMessage += `. FFMpeg: ${response.data.ffmpeg_status}`;
        }

        // Извлечение деталей ошибки из ответа
        if (response.data) {
            // Приоритетные поля для сообщения об ошибке
            const errorFields = [
                'error',
                'message',
                'detail',
                'details',
                'error_description',
                'err'
            ];

            for (const field of errorFields) {
                if (response.data[field]) {
                    details = response.data[field];
                    break;
                }
            }

            // Обработка ошибок валидации
            if (status === 422 && response.data.errors) {
                details = Object.values(response.data.errors)
                    .flat()
                    .join('; ');
            }
        }

        // Формирование финального сообщения
        const fullMessage = customMessage + (details ? `: ${details}` : '');

        // Показываем сообщение в зависимости от типа ошибки
        if (status >= 500) {
            videoMessage.error(fullMessage);
        } else if (status >= 400) {
            videoMessage.warning(fullMessage);
        } else {
            videoMessage.info(fullMessage);
        }

        // Возвращаем структурированную ошибку
        return Promise.reject({
            status,
            message,
            details,
            response,
            fullMessage
        });
    }
);

export default service;
