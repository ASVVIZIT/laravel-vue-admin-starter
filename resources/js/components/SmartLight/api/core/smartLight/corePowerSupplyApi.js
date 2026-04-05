/**
 * ============================================================================
 * POWER SUPPLY API — API ДЛЯ ИСТОЧНИКОВ ПИТАНИЯ УСТРОЙСТВ
 * ============================================================================
 * 📁 Путь: api/core/smartLight/corePowerSupplyApi.js (перенесён из powerSupplies/)
 * ✅ Используется: CoreTypesApi, Services, Controllers
 * ✅ Рефакторинг: методы с суффиксом Api(), вызовы через Resource(), исправлен синтаксис data:
 * ============================================================================
 */

import { CorePowerSupplyResource } from '@components/SmartLight/api/core/resource/corePowerSupplyResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class CorePowerSupplyApi {
    constructor() {
        this.resource = new CorePowerSupplyResource();
    }

    async getAllPowerSuppliesApi() {
        logDebugUtils('corePowerSupplyApi', 'getAllPowerSuppliesApi');
        try {
            const response = await this.resource.getAllResource();
            if (!response || !response.data || !Array.isArray(response.data)) {
                return { success: true, data: [], message: 'Получен некорректный ответ' };
            }
            return { success: true, data: response.data, message: 'Источники питания загружены' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка загрузки', error);
            return { success: false, message: 'Не удалось загрузить источники', error: error.message };
        }
    }

    async getPowerSupplyByIdApi(id) {
        logDebugUtils('corePowerSupplyApi', 'getPowerSupplyByIdApi', { id });
        try {
            const response = await this.resource.getByIdResource(id);
            if (!response || !response.data) {
                return { success: true, data: null, message: 'Получен некорректный ответ' };
            }
            return { success: true, data: response.data, message: 'Источник питания загружен' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка загрузки', error);
            return { success: false, message: 'Не удалось загрузить источник', error: error.message };
        }
    }

    async setDeviceTypeApi(deviceId, supplyId, settings = {}) {
        logDebugUtils('corePowerSupplyApi', 'setDeviceTypeApi', { deviceId, supplyId });
        try {
            const response = await this.resource.setDeviceTypeResource(deviceId, supplyId, settings);
            return { success: true, response: response, message: 'Тип установлен' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка установки', error);
            return { success: false, message: 'Не удалось установить тип', error: error.message };
        }
    }

    async activatePowerSupplyApi(deviceId, supplyId) {
        logDebugUtils('corePowerSupplyApi', 'activatePowerSupplyApi', { deviceId, supplyId });
        try {
            const response = await this.resource.activatePowerSupplyResource(deviceId, supplyId);
            return { success: true, response: response, message: 'Источник активирован' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка активации', error);
            return { success: false, message: 'Не удалось активировать', error: error.message };
        }
    }

    async deactivatePowerSupplyApi(deviceId) {
        logDebugUtils('corePowerSupplyApi', 'deactivatePowerSupplyApi', { deviceId });
        try {
            const response = await this.resource.deactivatePowerSupplyResource(deviceId);
            return { success: true, response: response, message: 'Источник деактивирован' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка деактивации', error);
            return { success: false, message: 'Не удалось деактивировать', error: error.message };
        }
    }

    async checkPowerSupplyCompatibilityApi(supplyId, deviceId) {
        logDebugUtils('corePowerSupplyApi', 'checkPowerSupplyCompatibilityApi', { supplyId, deviceId });
        try {
            const response = await this.resource.checkPowerSupplyCompatibilityResource(supplyId, deviceId);
            return { success: true, response: response, message: 'Совместимость проверена' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка проверки', error);
            return { success: false, message: 'Не удалось проверить совместимость', error: error.message };
        }
    }

    async simulateVoltageChangeApi(deviceId, targetVoltage, duration = 2000) {
        logDebugUtils('corePowerSupplyApi', 'simulateVoltageChangeApi', { deviceId, targetVoltage, duration });
        try {
            const response = await this.resource.simulateVoltageChangeResource(deviceId, targetVoltage, duration);
            return { success: true, response: response, message: 'Напряжение изменено' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка симуляции', error);
            return { success: false, message: 'Не удалось изменить напряжение', error: error.message };
        }
    }

    async simulatePowerFailureApi(deviceId, duration = 2000) {
        logDebugUtils('corePowerSupplyApi', 'simulatePowerFailureApi', { deviceId, duration });
        try {
            const response = await this.resource.simulatePowerFailureResource(deviceId, duration);
            return { success: true, response: response, message: 'Отказ питания симулирован' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка симуляции', error);
            return { success: false, message: 'Не удалось симулировать отказ', error: error.message };
        }
    }

    async getPowerSupplyStatusApi(deviceId) {
        logDebugUtils('corePowerSupplyApi', 'getPowerSupplyStatusApi', { deviceId });
        try {
            const response = await this.resource.getPowerSupplyStatusResource(deviceId);
            return { success: true, response: response, message: 'Статус получен' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка получения статуса', error);
            return { success: false, message: 'Не удалось получить статус', error: error.message };
        }
    }

    async getPowerParametersApi(deviceId) {
        logDebugUtils('corePowerSupplyApi', 'getPowerParametersApi', { deviceId });
        try {
            const response = await this.resource.getPowerParametersResource(deviceId);
            return { success: true, response: response, message: 'Параметры получены' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка получения параметров', error);
            return { success: false, message: 'Не удалось получить параметры', error: error.message };
        }
    }

    async simulateChargingApi(deviceId, targetVoltage, duration = 2000) {
        logDebugUtils('corePowerSupplyApi', 'simulateChargingApi', { deviceId, targetVoltage, duration });
        try {
            const response = await this.resource.simulateChargingResource(deviceId, targetVoltage, duration);
            return { success: true, response: response, message: 'Заряд симулирован' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка симуляции заряда', error);
            return { success: false, message: 'Не удалось симулировать заряд', error: error.message };
        }
    }

    async simulateDischargingApi(deviceId, targetVoltage, duration = 2000) {
        logDebugUtils('corePowerSupplyApi', 'simulateDischargingApi', { deviceId, targetVoltage, duration });
        try {
            const response = await this.resource.simulateDischargingResource(deviceId, targetVoltage, duration);
            return { success: true, response: response, message: 'Разряд симулирован' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка симуляции разряда', error);
            return { success: false, message: 'Не удалось симулировать разряд', error: error.message };
        }
    }

    async simulateEmergencyApi(deviceId) {
        logDebugUtils('corePowerSupplyApi', 'simulateEmergencyApi', { deviceId });
        try {
            const response = await this.resource.simulateEmergencyResource(deviceId);
            return { success: true, response: response, message: 'Авария симулирована' };
        } catch (error) {
            logErrorUtils('corePowerSupplyApi', 'Ошибка симуляции аварии', error);
            return { success: false, message: 'Не удалось симулировать аварию', error: error.message };
        }
    }
}

// ✅ Экспорт экземпляра
export const corePowerSupplyApi = new CorePowerSupplyApi();
export default corePowerSupplyApi;
