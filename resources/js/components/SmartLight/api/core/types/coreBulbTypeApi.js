/**
 * API для работы с типами ламп
 * Совместим с системой типов источников света
 */
import { CoreBaseResource } from '@components/SmartLight/api/core/resource/coreBaseResource.js';
import { logDebug, logError } from '@components/SmartLight/utils/appLogger.js';

export class CoreBulbTypeApi {
    constructor() {
        this.resource = new CoreBaseResource();
    }

    /**
     * Получение всех типов ламп
     */
    async getAllBulbTypes() {
        logDebug('coreBulbTypeApi', 'Получение всех типов ламп');

        try {
            const response = await this.resource.get('');

            // Проверяем структуру ответа
            if (!response || !response.data || !Array.isArray(response.data)) {
                logDebug('coreBulbTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: false,
                    data: [],
                    message: 'Получен некорректный ответ от API'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Типы ламп успешно загружены'
            };
        } catch (error) {
            logError('coreBulbTypeApi', 'Ошибка загрузки типов ламп', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы ламп',
                error: error.message
            };
        }
    }

    /**
     * Получение типа лампы по ID
     */
    async getBulbTypeById(id) {
        logDebug('coreBulbTypeApi', 'Получение типа лампы по ID', { id });

        try {
            const response = await this.resource.get(`/${id}`);

            // Проверяем структуру ответа
            if (!response || !response.data) {
                logDebug('coreBulbTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: false,
                    data: null,
                    message: 'Получен некорректный ответ от API'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Тип лампы успешно загружен'
            };
        } catch (error) {
            logError('coreBulbTypeApi', 'Ошибка загрузки типа лампы', error);
            return {
                success: false,
                message: 'Не удалось загрузить тип лампы',
                error: error.message
            };
        }
    }

    /**
     * Получение типов ламп для выпадающего списка
     */
    async getBulbTypesForDropdown() {
        logDebug('coreBulbTypeApi', 'Получение типов ламп для выпадающего списка');

        try {
            const response = await this.resource.get('/dropdown');

            // Проверяем структуру ответа
            if (!response || !response.data || !Array.isArray(response.data)) {
                logDebug('coreBulbTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: false,
                    data: [],
                    message: 'Получен некорректный ответ от API'
                };
            }

            return {
                success: true,
                data: response.data.map(type => ({
                    id: type.id,
                    label: type.name,
                    value: type.id,
                    disabled: false,
                    category: type.category,
                    baseType: type.base_type
                })),
                message: 'Типы ламп успешно загружены'
            };
        } catch (error) {
            logError('coreBulbTypeApi', 'Ошибка загрузки типов ламп', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы ламп',
                error: error.message
            };
        }
    }

    /**
     * Проверка совместимости типа лампы с устройством
     */
    async checkBulbTypeCompatibility(bulbTypeId, deviceId) {
        logDebug('coreBulbTypeApi', 'Проверка совместимости типа лампы', {
            bulbTypeId,
            deviceId
        });

        try {
            const response = await this.resource.post('/check-compatibility', {
                bulb_type_id: bulbTypeId,
                device_id: deviceId
            });

            return {
                success: true,
                response,
                message: 'Совместимость проверена'
            };
        } catch (error) {
            logError('coreBulbTypeApi', 'Ошибка проверки совместимости', error);
            return {
                success: false,
                message: 'Не удалось проверить совместимость',
                error: error.message
            };
        }
    }

    /**
     * Установка типа лампы для устройства
     */
    async setDeviceType(deviceId, bulbTypeId, settings = {}) {
        logDebug('coreBulbTypeApi', 'Установка типа лампы для устройства', {
            deviceId,
            bulbTypeId,
            settings
        });

        try {
            const response = await this.resource.post('/set-device-type', {
                device_id: deviceId,
                bulb_type_id: bulbTypeId,
                settings
            });

            return {
                success: true,
                response,
                message: 'Тип лампы установлен'
            };
        } catch (error) {
            logError('coreBulbTypeApi', 'Ошибка установки типа лампы', error);
            return {
                success: false,
                message: 'Не удалось установить тип лампы',
                error: error.message
            };
        }
    }

    /**
     * Обновление типа лампы
     */
    async updateBulbType(bulbTypeId, params) {
        logDebug('coreBulbTypeApi', 'Обновление типа лампы', {
            bulbTypeId,
            params
        });

        try {
            const response = await this.resource.put(`/${bulbTypeId}`, params);

            return {
                success: true,
                response,
                message: 'Тип лампы обновлен'
            };
        } catch (error) {
            logError('coreBulbTypeApi', 'Ошибка обновления типа лампы', error);
            return {
                success: false,
                message: 'Не удалось обновить тип лампы',
                error: error.message
            };
        }
    }

    /**
     * Получение статуса типа лампы
     */
    async getBulbTypeStatus(deviceId) {
        logDebug('coreBulbTypeApi', 'Получение статуса типа лампы', { deviceId });

        try {
            const response = await this.resource.get(`/status/${deviceId}`);
            return {
                success: true,
                response,
                message: 'Статус типа лампы успешно загружен'
            };
        } catch (error) {
            logError('coreBulbTypeApi', 'Ошибка загрузки статуса типа лампы', error);
            return {
                success: false,
                message: 'Не удалось загрузить статус типа лампы',
                error: error.message
            };
        }
    }

    /**
     * Симуляция светового эффекта
     */
    async simulateLightEffect(deviceId, effectType, duration = 2000) {
        logDebug('coreBulbTypeApi', 'Симуляция светового эффекта', {
            deviceId,
            effectType,
            duration
        });

        try {
            const response = await this.resource.post('/simulate-effect', {
                device_id: deviceId,
                effect_type: effectType,
                duration
            });

            return {
                success: true,
                response,
                message: 'Световой эффект симулирован'
            };
        } catch (error) {
            logError('coreBulbTypeApi', 'Ошибка симуляции светового эффекта', error);
            return {
                success: false,
                message: 'Не удалось симулировать световой эффект',
                error: error.message
            };
        }
    }

    /**
     * Симуляция изменения цвета
     */
    async simulateColorChange(deviceId, color, duration = 2000) {
        logDebug('coreBulbTypeApi', 'Симуляция изменения цвета', {
            deviceId,
            color,
            duration
        });

        try {
            const response = await this.resource.post('/simulate-color', {
                device_id: deviceId,
                color,
                duration
            });

            return {
                success: true,
                response,
                message: 'Цвет успешно изменен'
            };
        } catch (error) {
            logError('coreBulbTypeApi', 'Ошибка симуляции изменения цвета', error);
            return {
                success: false,
                message: 'Не удалось симулировать изменение цвета',
                error: error.message
            };
        }
    }
};

// Экспорт экземпляра
export const coreBulbTypeApi = new CoreBulbTypeApi();
