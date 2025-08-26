// resources/js/api/referenceApi.js
import request from '@/utils/request';

export const referenceApi = {
    // Получение списка типов справочников
    getTypes() {
        const cleanEntityType = entityType.replace(/\/$/, '');
        return request({
            url: `references/${cleanEntityType}`,
            method: 'get'
        }).catch(error => {
            // === УЛУЧШЕННАЯ ОБРАБОТКА ОШИБОК ===
            console.error('[referenceApi] Ошибка загрузки типов справочников:', error);

            // Проверяем статус ошибки
            if (error.response) {
                // Сервер ответил ошибкой
                const status = error.response.status;
                const data = error.response.data;

                switch (status) {
                    case 404:
                        // Маршрут не найден
                        throw new Error('Маршрут для получения типов справочников не найден (404).');
                    case 500:
                        // Внутренняя ошибка сервера
                        const serverMessage = data?.error || data?.message || 'Внутренняя ошибка сервера';
                        throw new Error(`Ошибка сервера при загрузке типов справочников (500): ${serverMessage}`);
                    default:
                        // Другая ошибка
                        throw new Error(`Ошибка ${status} при загрузке типов справочников: ${serverMessage || error.message}`);
                }
            } else if (error.request) {
                // Запрос был сделан, но ответ не получен
                throw new Error('Нет ответа от сервера при загрузке типов справочников. Проверьте подключение к сети.');
            } else {
                // Что-то пошло не так при настройке запроса
                throw new Error(`Ошибка при настройке запроса к типам справочников: ${error.message}`);
            }
        });
    },

    // Получение данных справочника по типу
    getData(entityType) {
        // Убираем завершающий слэш из entityType
        const cleanEntityType = entityType.replace(/\/$/, '');

        return request({
            url: `references/${cleanEntityType}`,
            method: 'get'
        }).catch(error => {
            // === УЛУЧШЕННАЯ ОБРАБОТКА ОШИБОК ===
            console.error(`[referenceApi] Ошибка загрузки данных справочника (${cleanEntityType}):`, error);

            // Проверяем статус ошибки
            if (error.response) {
                // Сервер ответил ошибкой
                const status = error.response.status;
                const data = error.response.data;

                switch (status) {
                    case 404:
                        // Модель не найдена
                        throw new Error(`Справочник "${cleanEntityType}" не найден (404). Проверьте корректность названия модели.`);
                    case 500:
                        // Внутренняя ошибка сервера
                        const serverMessage = data?.error || data?.message || 'Внутренняя ошибка сервера';
                        throw new Error(`Ошибка сервера при загрузке данных справочника "${cleanEntityType}" (500): ${serverMessage}`);
                    default:
                        // Другая ошибка
                        throw new Error(`Ошибка ${status} при загрузке данных справочника "${cleanEntityType}": ${serverMessage || error.message}`);
                }
            } else if (error.request) {
                // Запрос был сделан, но ответ не получен
                throw new Error(`Нет ответа от сервера при загрузке данных справочника "${cleanEntityType}". Проверьте подключение к сети.`);
            } else {
                // Что-то пошло не так при настройке запроса
                throw new Error(`Ошибка при настройке запроса к данным справочника "${cleanEntityType}": ${error.message}`);
            }
        });
    },

    // === НОВЫЙ МЕТОД: Получение информации о полях модели справочника ===
    getFieldInfo(entityType) {
        // Убираем завершающий слэш из entityType
        const cleanEntityType = entityType.replace(/\/$/, '');

        return request({
            url: `references/${cleanEntityType}/info`,
            method: 'get'
        }).catch(error => {
            // === УЛУЧШЕННАЯ ОБРАБОТКА ОШИБОК ===
            console.error(`[referenceApi] Ошибка загрузки информации о полях справочника (${cleanEntityType}):`, error);

            // Проверяем статус ошибки
            if (error.response) {
                // Сервер ответил ошибкой
                const status = error.response.status;
                const data = error.response.data;

                switch (status) {
                    case 404:
                        // Модель не найдена
                        throw new Error(`Информация о полях справочника "${cleanEntityType}" не найдена (404). Проверьте корректность названия модели.`);
                    case 500:
                        // Внутренняя ошибка сервера
                        const serverMessage = data?.error || data?.message || 'Внутренняя ошибка сервера';
                        throw new Error(`Ошибка сервера при загрузке информации о полях справочника "${cleanEntityType}" (500): ${serverMessage}`);
                    default:
                        // Другая ошибка
                        throw new Error(`Ошибка ${status} при загрузке информации о полях справочника "${cleanEntityType}": ${serverMessage || error.message}`);
                }
            } else if (error.request) {
                // Запрос был сделан, но ответ не получен
                throw new Error(`Нет ответа от сервера при загрузке информации о полях справочника "${cleanEntityType}". Проверьте подключение к сети.`);
            } else {
                // Что-то пошло не так при настройке запроса
                throw new Error(`Ошибка при настройке запроса к информации о полях справочника "${cleanEntityType}": ${error.message}`);
            }
        });
    }
    // === КОНЕЦ НОВОГО МЕТОДА ===
};
