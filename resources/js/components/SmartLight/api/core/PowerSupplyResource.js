import { BaseResource } from './BaseResource';
import { logDebug, logError } from '@/components/SmartLight/api/utils/apilogger';

export class PowerSupplyResource extends BaseResource {
    constructor() {
        super('power-supplies');
    }

    /**
     * Получение всех типов источников питания
     */
    async getAll() {
        logDebug('PowerSupplyResource', 'Получение всех типов источников питания');
        return this.get('');
    }

    /**
     * Получение типа источника питания по ID
     */
    async getById(id) {
        logDebug('PowerSupplyResource', 'Получение типа источника питания', { id });
        return this.get(`/${id}`);
    }

    /**
     * Установка типа источника питания для устройства
     */
    async setDeviceType(deviceId, supplyId, settings = {}) {
        logDebug('PowerSupplyResource', 'Установка типа источника питания для устройства', {
            deviceId,
            supplyId,
            settings
        });

        return this.post('/set-device-type', {
            device_id: deviceId,
            power_supply_id: supplyId,
            settings
        });
    }

    /**
     * Обновление типа источника питания
     */
    async updatePowerSupply(supplyId, params) {
        logDebug('PowerSupplyResource', 'Обновление типа источника питания', {
            supplyId,
            params
        });
        return this.put(`/${supplyId}`, params);
    }

    /**
     * Активация источника питания
     */
    async activatePowerSupply(deviceId, supplyId) {
        logDebug('PowerSupplyResource', 'Активация источника питания', {
            deviceId,
            supplyId
        });

        return this.post('/activate', {
            device_id: deviceId,
            power_supply_id: supplyId
        });
    }

    /**
     * Деактивация источника питания
     */
    async deactivatePowerSupply(deviceId) {
        logDebug('PowerSupplyResource', 'Деактивация источника питания', { deviceId });

        return this.post('/deactivate', {
            device_id: deviceId
        });
    }

    /**
     * Симуляция изменения напряжения
     */
    async simulateVoltageChange(deviceId, targetVoltage, duration = 2000) {
        logDebug('PowerSupplyResource', 'Симуляция изменения напряжения', {
            deviceId,
            targetVoltage,
            duration
        });

        return this.post('/simulate-voltage', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration
        });
    }

    /**
     * Симуляция отказа питания
     */
    async simulatePowerFailure(deviceId, duration = 2000) {
        logDebug('PowerSupplyResource', 'Симуляция отказа питания', {
            deviceId,
            duration
        });

        return this.post('/simulate-failure', {
            device_id: deviceId,
            duration
        });
    }

    /**
     * Получение статуса источника питания
     */
    async getPowerSupplyStatus(deviceId) {
        logDebug('PowerSupplyResource', 'Получение статуса источника питания', { deviceId });
        return this.get(`/status/${deviceId}`);
    }

    /**
     * Проверка совместимости источника питания
     */
    async checkPowerSupplyCompatibility(supplyId, deviceId) {
        logDebug('PowerSupplyResource', 'Проверка совместимости источника питания', {
            supplyId,
            deviceId
        });

        return this.post('/check-compatibility', {
            power_supply_id: supplyId,
            device_id: deviceId
        });
    }

    /**
     * Симуляция заряда
     */
    async simulateCharging(deviceId, targetVoltage, duration = 2000) {
        logDebug('PowerSupplyResource', 'Симуляция заряда', {
            deviceId,
            targetVoltage,
            duration
        });

        return this.post('/simulate-charging', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration
        });
    }

    /**
     * Симуляция разряда
     */
    async simulateDischarging(deviceId, targetVoltage, duration = 2000) {
        logDebug('PowerSupplyResource', 'Симуляция разряда', {
            deviceId,
            targetVoltage,
            duration
        });

        return this.post('/simulate-discharging', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration
        });
    }

    /**
     * Получение параметров питания
     */
    async getPowerParameters(deviceId) {
        logDebug('PowerSupplyResource', 'Получение параметров питания', { deviceId });
        return this.get(`/parameters/${deviceId}`);
    }

    /**
     * Установка параметров питания
     */
    async setPowerParameters(deviceId, parameters) {
        logDebug('PowerSupplyResource', 'Установка параметров питания', {
            deviceId,
            parameters
        });
        return this.put(`/parameters/${deviceId}`, parameters);
    }

    /**
     * Симуляция аварийного события
     */
    async simulateEmergency(deviceId) {
        logDebug('PowerSupplyResource', 'Симуляция аварийного события', { deviceId });

        return this.post('/simulate-emergency', {
            device_id: deviceId
        });
    }

    /**
     * Получение истории питания
     */
    async getPowerHistory(deviceId, options = {}) {
        logDebug('PowerSupplyResource', 'Получение истории питания', {
            deviceId,
            options
        });

        const params = new URLSearchParams();
        if (options.start) params.append('start', options.start);
        if (options.end) params.append('end', options.end);
        if (options.interval) params.append('interval', options.interval);

        return this.get(`/history/${deviceId}`, params);
    }

    /**
     * Симуляция подключения солнечной панели
     */
    async simulateSolarConnection(deviceId, options = {}) {
        logDebug('PowerSupplyResource', 'Симуляция подключения солнечной панели', {
            deviceId,
            options
        });

        return this.post('/simulate-solar', {
            device_id: deviceId,
            ...options
        });
    }

    /**
     * Симуляция отключения солнечной панели
     */
    async simulateSolarDisconnection(deviceId) {
        logDebug('PowerSupplyResource', 'Симуляция отключения солнечной панели', { deviceId });

        return this.post('/simulate-solar-disconnect', {
            device_id: deviceId
        });
    }

    /**
     * Получение информации о совместимости
     */
    async getPowerSupplyCompatibility(supplyId, deviceId) {
        logDebug('PowerSupplyResource', 'Получение информации о совместимости', {
            supplyId,
            deviceId
        });
        return this.get(`/compatibility/${supplyId}/${deviceId}`);
    }

    /**
     * Симуляция подключения к сети
     */
    async simulateGridConnection(deviceId, options = {}) {
        logDebug('PowerSupplyResource', 'Симуляция подключения к сети', {
            deviceId,
            options
        });

        return this.post('/simulate-grid', {
            device_id: deviceId,
            ...options
        });
    }

    /**
     * Симуляция отключения от сети
     */
    async simulateGridDisconnection(deviceId) {
        logDebug('PowerSupplyResource', 'Симуляция отключения от сети', { deviceId });

        return this.post('/simulate-grid-disconnect', {
            device_id: deviceId
        });
    }
}
