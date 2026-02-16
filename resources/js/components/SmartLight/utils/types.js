/**
 * Утилиты для работы с API
 */

export const ApiUtils = {
    /**
     * Задержка для имитации сетевых запросов
     * @param {number} ms - Время задержки в миллисекундах
     * @returns {Promise} Промис, разрешающийся после задержки
     */
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    /**
     * Проверяет, является ли устройство тестовым
     * @param {string} deviceId - ID устройства
     * @returns {boolean} true если устройство тестовое
     */
    isFakeDevice: (deviceId) => {
        return deviceId?.includes('fake') || deviceId?.includes('test') || false;
    },

    /**
     * Возвращает фейковый ответ
     * @param {boolean} success - Успех операции
     * @param {string} message - Сообщение
     * @param {Object} data - Данные
     * @returns {Object} Стандартный формат ответа
     */
    getFakeResponse: (success = true, message = 'Операция выполнена', data = {}) => {
        return {
            success,
            message,
            data,
            fake: true
        };
    },

    /**
     * Возвращает фейковый ответ с ошибкой
     * @param {string} message - Сообщение об ошибке
     * @param {Object} error - Объект ошибки
     * @returns {Object} Стандартный формат ответа с ошибкой
     */
    getErrorResponse: (message = 'Ошибка', error = {}) => {
        return {
            success: false,
            message,
            error: {
                ...error,
                fake: true
            }
        };
    }
};
