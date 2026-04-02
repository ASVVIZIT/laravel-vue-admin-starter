/**
 * ============================================================================
 * POWER SUPPLY API — API ДЛЯ ИСТОЧНИКОВ ПИТАНИЯ УСТРОЙСТВ
 * ============================================================================
 * 📁 Путь: api/core/powerSupplies/corePowerSupplyApi.js
 * ✅ Используется: CoreTypesApi, Services, Controllers
 * ============================================================================
 */

import { CorePowerSupplyResource } from '@components/SmartLight/api/core/resource/corePowerSupplyResource.js';
import { logDebug, logError } from '@components/SmartLight/api/core/utils/coreApiLogger.js';

export class CorePowerSupplyApi {
    constructor() {
        this.resource = new CorePowerSupplyResource();
    }

    async getAllPowerSupplies() {
        logDebug('corePowerSupplyApi', 'getAllPowerSupplies');

        try {
            const response = await this.resource.getAll();

            if (!response || !response.data || !Array.isArray(response.data)) {
                return {
                    success: true,
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
            logError('corePowerSupplyApi', 'Ошибка загрузки', error);
            return {
                success: false,
                message: 'Не удалось загрузить источники питания',
                error: error.message
            };
        }
    }

    async getPowerSupplyById(id) {
        logDebug('corePowerSupplyApi', 'getPowerSupplyById', { id });

        try {
            const response = await this.resource.getById(id);

            if (!response || !response.data) {
                return {
                    success: true,
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
            logError('corePowerSupplyApi', 'Ошибка загрузки', error);
            return {
                success: false,
                message: 'Не удалось загрузить источник питания',
                error: error.message
            };
        }
    }

    async setDeviceType(deviceId, supplyId, settings = {}) {
        logDebug('corePowerSupplyApi', 'setDeviceType', { deviceId, supplyId });

        try {
            const response = await this.resource.setDeviceType(deviceId, supplyId, settings);

            return {
                success: true,
                response: response,
                message: 'Тип источника питания установлен'
            };
        } catch (error) {
            logError('corePowerSupplyApi', 'Ошибка установки', error);
            return {
                success: false,
                message: 'Не удалось установить тип источника питания',
                error: error.message
            };
        }
    }

    async activatePowerSupply(deviceId, supplyId) {
        logDebug('corePowerSupplyApi', 'activatePowerSupply', { deviceId, supplyId });

        try {
            const response = await this.resource.activatePowerSupply(deviceId, supplyId);

            return {
                success: true,
                response: response,
                message: 'Источник питания активирован'
            };
        } catch (error) {
            logError('corePowerSupplyApi', 'Ошибка активации', error);
            return {
                success: false,
                message: 'Не удалось активировать источник питания',
                error: error.message
            };
        }
    }

    async deactivatePowerSupply(deviceId) {
        logDebug('corePowerSupplyApi', 'deactivatePowerSupply', { deviceId });

        try {
            const response = await this.resource.deactivatePowerSupply(deviceId);

            return {
                success: true,
                response: response,
                message: 'Источник питания деактивирован'
            };
        } catch (error) {
            logError('corePowerSupplyApi', 'Ошибка деактивации', error);
            return {
                success: false,
                message: 'Не удалось деактивировать источник питания',
                error: error.message
            };
        }
    }

    async checkPowerSupplyCompatibility(supplyId, deviceId) {
        logDebug('corePowerSupplyApi', 'checkCompatibility', { supplyId, deviceId });

        try {
            const response = await this.resource.checkPowerSupplyCompatibility(supplyId, deviceId);

            return {
                success: true,
                response: response,
                message: 'Совместимость проверена'
            };
        } catch (error) {
            logError('corePowerSupplyApi', 'Ошибка проверки совместимости', error);
            return {
                success: false,
                message: 'Не удалось проверить совместимость',
                error: error.message
            };
        }
    }

    async simulateVoltageChange(deviceId, targetVoltage, duration = 2000) {
        logDebug('corePowerSupplyApi', 'simulateVoltageChange', { deviceId, targetVoltage, duration });

        try {
            const response = await this.resource.simulateVoltageChange(deviceId, targetVoltage, duration);

            return {
                success: true,
                response: response,
                message: 'Напряжение успешно изменено'
            };
        } catch (error) {
            logError('corePowerSupplyApi', 'Ошибка симуляции напряжения', error);
            return {
                success: false,
                message: 'Не удалось симулировать напряжение',
                error: error.message
            };
        }
    }

    async simulatePowerFailure(deviceId, duration = 2000) {
        logDebug('corePowerSupplyApi', 'simulatePowerFailure', { deviceId, duration });

        try {
            const response = await this.resource.simulatePowerFailure(deviceId, duration);

            return {
                success: true,
                response: response,
                message: 'Отказ питания симулирован'
            };
        } catch (error) {
            logError('corePowerSupplyApi', 'Ошибка симуляции отказа', error);
            return {
                success: false,
                message: 'Не удалось симулировать отказ питания',
                error: error.message
            };
        }
    }

    async getPowerSupplyStatus(deviceId) {
        logDebug('corePowerSupplyApi', 'getPowerSupplyStatus', { deviceId });

        try {
            const response = await this.resource.getPowerSupplyStatus(deviceId);

            return {
                success: true,
                response: response,
                message: 'Статус источника питания получен'
            };
        } catch (error) {
            logError('corePowerSupplyApi', 'Ошибка получения статуса', error);
            return {
                success: false,
                message: 'Не удалось получить статус источника питания',
                error: error.message
            };
        }
    }

    async getPowerParameters(deviceId) {
        logDebug('corePowerSupplyApi', 'getPowerParameters', { deviceId });

        try {
            const response = await this.resource.getPowerParameters(deviceId);

            return {
                success: true,
                response: response,
                message: 'Параметры питания получены'
            };
        } catch (error) {
            logError('corePowerSupplyApi', 'Ошибка получения параметров', error);
            return {
                success: false,
                message: 'Не удалось получить параметры питания',
                error: error.message
            };
        }
    }

    async simulateCharging(deviceId, targetVoltage, duration = 2000) {
        logDebug('corePowerSupplyApi', 'simulateCharging', { deviceId, targetVoltage, duration });

        try {
            const response = await this.resource.simulateCharging(deviceId, targetVoltage, duration);

            return {
                success: true,
                response: response,
                message: 'Заряд симулирован'
            };
        } catch (error) {
            logError('corePowerSupplyApi', 'Ошибка симуляции заряда', error);
            return {
                success: false,
                message: 'Не удалось симулировать заряд',
                error: error.message
            };
        }
    }

    async simulateDischarging(deviceId, targetVoltage, duration = 2000) {
        logDebug('corePowerSupplyApi', 'simulateDischarging', { deviceId, targetVoltage, duration });

        try {
            const response = await this.resource.simulateDischarging(deviceId, targetVoltage, duration);

            return {
                success: true,
                response: response,
                message: 'Разряд симулирован'
            };
        } catch (error) {
            logError('corePowerSupplyApi', 'Ошибка симуляции разряда', error);
            return {
                success: false,
                message: 'Не удалось симулировать разряд',
                error: error.message
            };
        }
    }

    async simulateEmergency(deviceId) {
        logDebug('corePowerSupplyApi', 'simulateEmergency', { deviceId });

        try {
            const response = await this.resource.simulateEmergency(deviceId);

            return {
                success: true,
                response: response,
                message: 'Аварийное событие симулировано'
            };
        } catch (error) {
            logError('corePowerSupplyApi', 'Ошибка симуляции аварийного события', error);
            return {
                success: false,
                message: 'Не удалось симулировать аварийное событие',
                error: error.message
            };
        }
    }
}

export const corePowerSupplyApi = new CorePowerSupplyApi();
