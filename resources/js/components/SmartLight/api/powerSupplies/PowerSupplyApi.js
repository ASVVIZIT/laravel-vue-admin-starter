/**
 * API для работы с источниками питания
 *
 * Совместим с системой типов источников питания
 *
 * @file resources/js/components/SmartLight/api/powerSupplies/PowerSupplyApi.js
 */

import { BaseResource } from '@components/SmartLight/api/core/BaseResource.js';
import { logDebug, logError } from '@components/SmartLight/utils/appLogger.js';

export class PowerSupplyApi {
    constructor() {
        this.resource = new BaseResource('power-supplies');
    }

    /**
     * Получение всех источников питания
     */
    async getAllPowerSupplies() {
        logDebug('PowerSupplyApi', 'Получение всех источников питания');

        try {
            const response = await this.resource.get('');

            // Проверяем структуру ответа
            if (!response || !response.data || !Array.isArray(response.data)) {
                logDebug('PowerSupplyApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: false,
                    data: [],
                    message: 'Получен некорректный ответ от API'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Источники питания успешно загружены'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка загрузки источников питания', error);
            return {
                success: false,
                message: 'Не удалось загрузить источники питания',
                error: error.message
            };
        }
    }

    /**
     * Получение источника питания по ID
     */
    async getPowerSupplyById(id) {
        logDebug('PowerSupplyApi', 'Получение источника питания по ID', { id });

        try {
            const response = await this.resource.get(`/${id}`);

            // Проверяем структуру ответа
            if (!response || !response.data) {
                logDebug('PowerSupplyApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: false,
                    data: null,
                    message: 'Получен некорректный ответ от API'
                };
            }

            return {
                success: true,
                data: response.data,
                message: 'Источник питания успешно загружен'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка загрузки источника питания', error);
            return {
                success: false,
                message: 'Не удалось загрузить источник питания',
                error: error.message
            };
        }
    }

    /**
     * Получение источников питания для выпадающего списка
     */
    async getPowerSuppliesForDropdown() {
        logDebug('PowerSupplyApi', 'Получение источников питания для выпадающего списка');

        try {
            const response = await this.resource.get('/dropdown');

            // Проверяем структуру ответа
            if (!response || !response.data || !Array.isArray(response.data)) {
                logDebug('PowerSupplyApi', 'Получен некорректный ответ от API', { response });
                return {
                    success: false,
                    data: [],
                    message: 'Получен некорректный ответ от API'
                };
            }

            return {
                success: true,
                data: response.data.map(supply => ({
                    id: supply.id,
                    label: supply.name,
                    value: supply.id,
                    disabled: false,
                    category: supply.category,
                    description: supply.description
                })),
                message: 'Источники питания успешно загружены'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка загрузки источников питания', error);
            return {
                success: false,
                message: 'Не удалось загрузить источники питания',
                error: error.message
            };
        }
    }

    /**
     * Проверка совместимости источника питания с устройством
     */
    async checkPowerSupplyCompatibility(supplyId, deviceId) {
        logDebug('PowerSupplyApi', 'Проверка совместимости источника питания', {
            supplyId,
            deviceId
        });

        try {
            const response = await this.resource.post('/check-compatibility', {
                power_supply_id: supplyId,
                device_id: deviceId
            });

            return {
                success: true,
                response,
                message: 'Совместимость проверена'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка проверки совместимости', error);
            return {
                success: false,
                message: 'Не удалось проверить совместимость',
                error: error.message
            };
        }
    }

    /**
     * Установка источника питания для устройства
     */
    async setDeviceType(deviceId, supplyId, settings = {}) {
        logDebug('PowerSupplyApi', 'Установка источника питания для устройства', {
            deviceId,
            supplyId,
            settings
        });

        try {
            const response = await this.resource.post('/set-device-type', {
                device_id: deviceId,
                power_supply_id: supplyId,
                settings
            });

            return {
                success: true,
                response,
                message: 'Источник питания установлен'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка установки источника питания', error);
            return {
                success: false,
                message: 'Не удалось установить источник питания',
                error: error.message
            };
        }
    }

    /**
     * Обновление источника питания
     */
    async updatePowerSupply(supplyId, params) {
        logDebug('PowerSupplyApi', 'Обновление источника питания', {
            supplyId,
            params
        });

        try {
            const response = await this.resource.put(`/${supplyId}`, params);

            return {
                success: true,
                response,
                message: 'Источник питания обновлен'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка обновления источника питания', error);
            return {
                success: false,
                message: 'Не удалось обновить источник питания',
                error: error.message
            };
        }
    }

    /**
     * Получение статуса источника питания
     */
    async getPowerSupplyStatus(deviceId) {
        logDebug('PowerSupplyApi', 'Получение статуса источника питания', { deviceId });

        try {
            const response = await this.resource.get(`/status/${deviceId}`);
            return {
                success: true,
                response,
                message: 'Статус источника питания успешно загружен'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка загрузки статуса источника питания', error);
            return {
                success: false,
                message: 'Не удалось загрузить статус источника питания',
                error: error.message
            };
        }
    }

    /**
     * Симуляция отключения питания
     */
    async simulatePowerFailure(deviceId, duration = 2000) {
        logDebug('PowerSupplyApi', 'Симуляция отключения питания', {
            deviceId,
            duration
        });

        try {
            const response = await this.resource.post('/simulate-failure', {
                device_id: deviceId,
                duration
            });

            return {
                success: true,
                response,
                message: 'Отключение питания симулировано'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка симуляции отключения питания', error);
            return {
                success: false,
                message: 'Не удалось симулировать отключение питания',
                error: error.message
            };
        }
    }

    /**
     * Симуляция изменения напряжения
     */
    async simulateVoltageChange(deviceId, targetVoltage, duration = 2000) {
        logDebug('PowerSupplyApi', 'Симуляция изменения напряжения', {
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
            logError('PowerSupplyApi', 'Ошибка симуляции изменения напряжения', error);
            return {
                success: false,
                message: 'Не удалось симулировать изменение напряжения',
                error: error.message
            };
        }
    }

    /**
     * Симуляция зарядки
     */
    async simulateCharging(deviceId, targetVoltage, duration = 2000) {
        logDebug('PowerSupplyApi', 'Симуляция зарядки', {
            deviceId,
            targetVoltage,
            duration
        });

        try {
            const response = await this.resource.post('/simulate-charging', {
                device_id: deviceId,
                target_voltage: targetVoltage,
                duration
            });

            return {
                success: true,
                response,
                message: 'Зарядка симулирована'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка симуляции зарядки', error);
            return {
                success: false,
                message: 'Не удалось симулировать зарядку',
                error: error.message
            };
        }
    }

    /**
     * Симуляция разрядки
     */
    async simulateDischarging(deviceId, targetVoltage, duration = 2000) {
        logDebug('PowerSupplyApi', 'Симуляция разрядки', {
            deviceId,
            targetVoltage,
            duration
        });

        try {
            const response = await this.resource.post('/simulate-discharging', {
                device_id: deviceId,
                target_voltage: targetVoltage,
                duration
            });

            return {
                success: true,
                response,
                message: 'Разрядка симулирована'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка симуляции разрядки', error);
            return {
                success: false,
                message: 'Не удалось симулировать разрядку',
                error: error.message
            };
        }
    }

    /**
     * Получение параметров питания
     */
    async getPowerParameters(deviceId) {
        logDebug('PowerSupplyApi', 'Получение параметров питания', { deviceId });

        try {
            const response = await this.resource.get(`/parameters/${deviceId}`);
            return {
                success: true,
                response,
                message: 'Параметры питания успешно загружены'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка загрузки параметров питания', error);
            return {
                success: false,
                message: 'Не удалось загрузить параметры питания',
                error: error.message
            };
        }
    }

    /**
     * Симуляция аварийной ситуации с питанием
     */
    async simulatePowerEmergency(deviceId) {
        logDebug('PowerSupplyApi', 'Симуляция аварийной ситуации с питанием', { deviceId });

        try {
            const response = await this.resource.post('/simulate-emergency', {
                device_id: deviceId
            });

            return {
                success: true,
                response,
                message: 'Аварийная ситуация с питанием симулирована'
            };
        } catch (error) {
            logError('PowerSupplyApi', 'Ошибка симуляции аварийной ситуации', error);
            return {
                success: false,
                message: 'Не удалось симулировать аварийную ситуацию с питанием',
                error: error.message
            };
        }
    }
};

// Экспорт экземпляра
export const powerSupplyApi = new PowerSupplyApi();
