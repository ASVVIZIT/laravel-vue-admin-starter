/**
 * API для работы с типами аккумуляторов
 * Совместим с системой типов аккумуляторов
 */
import { CoreBatteryTypeResource } from '@components/SmartLight/api/core/resource/coreBatteryTypeResource.js';
import { logDebug, logError } from '@components/SmartLight/utils/appLogger.js';

export class CoreBatteryTypeApi {
    constructor() {
        this.resource = new CoreBatteryTypeResource();
    }

    /**
     * Получение всех типов аккумуляторов
     */
    async getAllBatteryTypes() {
        logDebug('coreBatteryTypeApi', 'Получение всех типов аккумуляторов');

        try {
            const response = await this.resource.getAll();

            // Проверяем структуру ответа
            if (!response || !response.data || !Array.isArray(response.data)) {
                logDebug('coreBatteryTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: true,
                    data: [],
                    message: 'Получен некорректный ответ от API, используется локальная кэшированная версия'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Типы аккумуляторов успешно загружены'
            };
        } catch (error) {
            logError('coreBatteryTypeApi', 'Ошибка загрузки типов аккумуляторов', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы аккумуляторов',
                error: error.message
            };
        }
    }

    /**
     * Получение типа аккумулятора по ID
     */
    async getBatteryTypeById(id) {
        logDebug('coreBatteryTypeApi', 'Получение типа аккумулятора по ID', { id });

        try {
            const response = await this.resource.getById(`/${id}`);

            // Проверяем структуру ответа
            if (!response || !response.data) {
                logDebug('coreBatteryTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: true,
                    data: null,
                    message: 'Получен некорректный ответ от API, используется локальная кэшированная версия'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Тип аккумулятора успешно загружен'
            };
        } catch (error) {
            logError('coreBatteryTypeApi', 'Ошибка загрузки типа аккумулятора', error);
            return {
                success: false,
                message: 'Не удалось загрузить тип аккумулятора',
                error: error.message
            };
        }
    }

    /**
     * Получение типов аккумуляторов для выпадающего списка
     */
    async getBatteryTypesForDropdown() {
        logDebug('coreBatteryTypeApi', 'Получение типов аккумуляторов для выпадающего списка');

        try {
            const response = await this.resource.getForDropdown();

            // Проверяем структуру ответа
            if (!response || !response.data || !Array.isArray(response.data)) {
                logDebug('coreBatteryTypeApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: true,
                    data: [],
                    message: 'Получен некорректный ответ от API, используется локальная кэшированная версия'
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
                    chemistry: type.chemistry
                })),
                message: 'Типы аккумуляторов успешно загружены'
            };
        } catch (error) {
            logError('coreBatteryTypeApi', 'Ошибка загрузки типов аккумуляторов', error);
            return {
                success: false,
                message: 'Не удалось загрузить типы аккумуляторов',
                error: error.message
            };
        }
    }

    // Остальные методы без изменений
    async checkBatteryTypeCompatibility(batteryTypeId, deviceId) {
        logDebug('coreBatteryTypeApi', 'Проверка совместимости типа аккумулятора', {
            batteryTypeId,
            deviceId
        });

        try {
            const response = await this.resource.checkCompatibility('', {
                battery_type_id: batteryTypeId,
                device_id: deviceId
            });

            return {
                success: true,
                response,
                message: 'Совместимость проверена'
            };
        } catch (error) {
            logError('coreBatteryTypeApi', 'Ошибка проверки совместимости', error);
            return {
                success: false,
                message: 'Не удалось проверить совместимость',
                error: error.message
            };
        }
    }

    async setDeviceType(deviceId, batteryTypeId, settings = {}) {
        logDebug('coreBatteryTypeApi', 'Установка типа аккумулятора для устройства', {
            deviceId,
            batteryTypeId,
            settings
        });

        try {
            const response = await this.resource.post('/set-device-type', {
                device_id: deviceId,
                battery_type_id: batteryTypeId,
                settings
            });

            return {
                success: true,
                response,
                message: 'Тип аккумулятора установлен'
            };
        } catch (error) {
            logError('coreBatteryTypeApi', 'Ошибка установки типа аккумулятора', error);
            return {
                success: false,
                message: 'Не удалось установить тип аккумулятора',
                error: error.message
            };
        }
    }

    async updateBatteryType(batteryTypeId, params) {
        logDebug('coreBatteryTypeApi', 'Обновление типа аккумулятора', {
            batteryTypeId,
            params
        });

        try {
            const response = await this.resource.put(`/${batteryTypeId}`, params);

            return {
                success: true,
                response,
                message: 'Тип аккумулятора обновлен'
            };
        } catch (error) {
            logError('coreBatteryTypeApi', 'Ошибка обновления типа аккумулятора', error);
            return {
                success: false,
                message: 'Не удалось обновить тип аккумулятора',
                error: error.message
            };
        }
    }

    async getBatteryTypeStatus(deviceId) {
        logDebug('coreBatteryTypeApi', 'Получение статуса типа аккумулятора', { deviceId });

        try {
            const response = await this.resource.get(`/status/${deviceId}`);
            return {
                success: true,
                response,
                message: 'Статус типа аккумулятора успешно загружен'
            };
        } catch (error) {
            logError('coreBatteryTypeApi', 'Ошибка загрузки статуса типа аккумулятора', error);
            return {
                success: false,
                message: 'Не удалось загрузить статус типа аккумулятора',
                error: error.message
            };
        }
    }

    async simulateVoltageChange(deviceId, targetVoltage, duration = 2000) {
        logDebug('coreBatteryTypeApi', 'Симуляция изменения напряжения', {
            deviceId,
            targetVoltage,
            duration
        });

        try {
            const response = await this.resource.post('/simulate-voltage', {
                device_id: deviceId,
                target_voltage: targetVoltage,
                duration
            });

            return {
                success: true,
                response,
                message: 'Напряжение успешно изменено'
            };
        } catch (error) {
            logError('coreBatteryTypeApi', 'Ошибка симуляции напряжения', error);
            return {
                success: false,
                message: 'Не удалось симулировать напряжение',
                error: error.message
            };
        }
    }
};

// Экспорт экземпляра
export const coreBatteryTypeApi = new CoreBatteryTypeApi();
