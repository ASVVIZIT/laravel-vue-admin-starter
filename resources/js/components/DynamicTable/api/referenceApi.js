// resources/js/components/DynamicTable/api/referenceApi.js
import request from '@/utils/request';

export const referenceApi = {
    /**
     * Получение списка типов справочников
     * @returns {Promise<Array>} Массив типов справочников
     * @throws {Error} При ошибке загрузки
     */
    async getTypes() {
        console.log('[referenceApi.getTypes] Starting API call...');
        try {
            const response = await request({
                url: `references/types`,
                method: 'get'
            });
            console.log('[referenceApi.getTypes] API call successful:', response);

            // Правильная обработка ответа API
            let types;
            if (response && response.data !== undefined) {
                // Если ответ приходит в свойстве data
                types = response.data;
            } else {
                // Если ответ приходит напрямую
                types = response;
            }

            // Убедимся, что types - это массив
            if (!Array.isArray(types)) {
                console.warn('[referenceApi.getTypes] Expected array, got:', types);
                types = [];
            }

            console.log('[referenceApi.getTypes] Final types:', types);
            return types;
        } catch (error) {
            console.error('[referenceApi.getTypes] Error:', error);

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
        }
    },

    /**
     * Получение данных справочника по типу
     * @param {string} entityType - Тип справочника
     * @returns {Promise<Array>} Данные справочника
     * @throws {Error} При ошибке загрузки
     */
    async getData(entityType) {
        // Убираем завершающий слэш из entityType
        const cleanEntityType = entityType.replace(/\/$/, '');
        console.log(`[referenceApi.getData] Starting API call for: ${cleanEntityType}`);

        try {
            const response = await request({
                url: `references/${cleanEntityType}`,
                method: 'get'
            });
            console.log(`[referenceApi.getData] API call successful for: ${cleanEntityType}`, response);

            // Правильная обработка ответа API
            let data;
            if (response && response.data !== undefined) {
                // Если ответ приходит в свойстве data
                data = response.data;
            } else {
                // Если ответ приходит напрямую
                data = response;
            }

            // Убедимся, что data - это массив
            if (!Array.isArray(data)) {
                console.warn(`[referenceApi.getData] Expected array for ${cleanEntityType}, got:`, data);
                data = [];
            }

            console.log(`[referenceApi.getData] Final data for ${cleanEntityType}:`, data);
            return data;
        } catch (error) {
            console.error(`[referenceApi.getData] Error for ${cleanEntityType}:`, error);

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
        }
    },

    /**
     * Получение информации о полях модели справочника
     * @param {string} entityType - Тип справочника
     * @returns {Promise<Object>} Информация о полях справочника
     * @throws {Error} При ошибке загрузки
     */
    async getFieldInfo(entityType) {
        // Убираем завершающий слэш из entityType
        const cleanEntityType = entityType.replace(/\/$/, '');
        console.log(`[referenceApi.getFieldInfo] Starting API call for: ${cleanEntityType}`);

        try {
            const response = await request({
                url: `references/${cleanEntityType}/info`,
                method: 'get'
            });
            console.log(`[referenceApi.getFieldInfo] API call successful for: ${cleanEntityType}`, response);

            // Правильная обработка ответа API
            let info;
            if (response && response.data !== undefined) {
                // Если ответ приходит в свойстве data
                info = response.data;
            } else {
                // Если ответ приходит напрямую
                info = response;
            }

            // Убедимся, что info - это объект
            if (typeof info !== 'object' || info === null) {
                console.warn(`[referenceApi.getFieldInfo] Expected object for ${cleanEntityType}, got:`, info);
                info = {};
            }

            console.log(`[referenceApi.getFieldInfo] Final info for ${cleanEntityType}:`, info);
            return info;
        } catch (error) {
            console.error(`[referenceApi.getFieldInfo] Error for ${cleanEntityType}:`, error);

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
        }
    }
};
