/**
 * ============================================================================
 * POWER SUPPLY RESOURCE — ЯДРО (ОПЕРАЦИИ С ПИТАНИЕМ)
 * ============================================================================
 * 📁 Путь: api/core/resource/corePowerSupplyResource.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebug, logError } from '@components/SmartLight/api/core/utils/coreApiLogger.js';

export class CorePowerSupplyResource extends CoreBaseResource {
    constructor() {
        super('power-supplies');
    }

    async getAll() {
        logDebug('corePowerSupplyResource', 'getAll');
        return this.get('');
    }

    async getById(id) {
        logDebug('corePowerSupplyResource', 'getById', { id });
        return this.get(`/${id}`);
    }

    async setDeviceType(deviceId, supplyId, settings = {}) {
        logDebug('corePowerSupplyResource', 'setDeviceType', { deviceId, supplyId });
        return this.post('/set-device-type', {
            device_id: deviceId,
            power_supply_id: supplyId,
            settings: settings
        });
    }

    async activatePowerSupply(deviceId, supplyId) {
        logDebug('corePowerSupplyResource', 'activatePowerSupply', { deviceId, supplyId });
        return this.post('/activate', {
            device_id: deviceId,
            power_supply_id: supplyId
        });
    }

    async deactivatePowerSupply(deviceId) {
        logDebug('corePowerSupplyResource', 'deactivatePowerSupply', { deviceId });
        return this.post('/deactivate', {
            device_id: deviceId
        });
    }

    async checkPowerSupplyCompatibility(supplyId, deviceId) {
        logDebug('corePowerSupplyResource', 'checkCompatibility', { supplyId, deviceId });
        return this.post('/check-compatibility', {
            power_supply_id: supplyId,
            device_id: deviceId
        });
    }

    async simulateVoltageChange(deviceId, targetVoltage, duration = 2000) {
        logDebug('corePowerSupplyResource', 'simulateVoltageChange', { deviceId, targetVoltage, duration });
        return this.post('/simulate-voltage', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration: duration
        });
    }

    async simulatePowerFailure(deviceId, duration = 2000) {
        logDebug('corePowerSupplyResource', 'simulatePowerFailure', { deviceId, duration });
        return this.post('/simulate-failure', {
            device_id: deviceId,
            duration: duration
        });
    }

    async getPowerSupplyStatus(deviceId) {
        logDebug('corePowerSupplyResource', 'getPowerSupplyStatus', { deviceId });
        return this.get(`/status/${deviceId}`);
    }

    async getPowerParameters(deviceId) {
        logDebug('corePowerSupplyResource', 'getPowerParameters', { deviceId });
        return this.get(`/parameters/${deviceId}`);
    }

    async simulateCharging(deviceId, targetVoltage, duration = 2000) {
        logDebug('corePowerSupplyResource', 'simulateCharging', { deviceId, targetVoltage, duration });
        return this.post('/simulate-charging', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration: duration
        });
    }

    async simulateDischarging(deviceId, targetVoltage, duration = 2000) {
        logDebug('corePowerSupplyResource', 'simulateDischarging', { deviceId, targetVoltage, duration });
        return this.post('/simulate-discharging', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration: duration
        });
    }

    async simulateEmergency(deviceId) {
        logDebug('corePowerSupplyResource', 'simulateEmergency', { deviceId });
        return this.post('/simulate-emergency', {
            device_id: deviceId
        });
    }
}

export default CorePowerSupplyResource;
