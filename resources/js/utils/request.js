import '@/bootstrap';
import { ElMessage } from 'element-plus';
import { isLogged, getToken, setToken } from '@/utils/auth';

const service = window.axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
});

// Интерцептор запросов
service.interceptors.request.use(
    config => {
        const token = getToken(); // Получаем токен из хранилища

        if (token && isLogged()) {
            config.headers['Authorization'] = 'Bearer ' + token;
            config.withCredentials = true; // Важно для передачи кук
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Интерцептор ответов
service.interceptors.response.use(
    response => {
        // Обновление токена, если он пришел в заголовках
        const newToken = response.headers['authorization'] || response.headers['Authorization'];

        if (newToken) {
            setToken(newToken); // Сохраняем новый токен
            response.data.token = newToken; // Для возможного использования
        }

        return response.data;
    },
    error => {
        if (!error.response) {
            ElMessage.error({
                message: 'Сетевая ошибка: ' + error.message,
                duration: 5000,
            });
            return Promise.reject(error);
        }

        const response = error.response;
        const status = response.status;
        let message = 'Произошла ошибка';
        let details = '';

        // Обработка 401 ошибки (неавторизован)
        if (status === 401) {
            message = 'Требуется авторизация';
            // Перенаправление на страницу входа
            window.location.href = '#/login';
            return Promise.reject(error);
        }

        // Стандартная обработка ошибок
        if (response.data) {
            message = response.data.error || response.data.message || message;
            details = response.data.details || '';
        }

        // Ошибки валидации
        if (status === 422 && response.data.errors) {
            message = 'Ошибка валидации';
            details = Object.values(response.data.errors)
                .flat()
                .join('; ');
        }

        const fullMessage = details ? `${message}: ${details}` : message;

        ElMessage.error({
            message: fullMessage,
            duration: 5000,
        });

        return Promise.reject({
            status,
            message,
            details,
            response
        });
    }
);

export default service;
