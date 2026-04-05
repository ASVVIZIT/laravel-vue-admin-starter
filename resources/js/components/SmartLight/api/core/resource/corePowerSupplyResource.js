/**
 * ============================================================================
 * POWER SUPPLY RESOURCE — ЯДРО (ОПЕРАЦИИ С ПИТАНИЕМ)
 * ============================================================================
 * 📁 Путь: api/core/resource/corePowerSupplyResource.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ✅ Рефакторинг: методы с суффиксом Resource(), вызовы через Base()
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class CorePowerSupplyResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    async getAllResource() {
        logDebugUtils('corePowerSupplyResource', 'getAllResource');
        return this.getBase('/power-supplies');
    }

    async getByIdResource(id) {
        logDebugUtils('corePowerSupplyResource', 'getByIdResource', { id });
        return this.getBase(`/power-supplies/${id}`);
    }

    async setDeviceTypeResource(deviceId, supplyId, settings = {}) {
        logDebugUtils('corePowerSupplyResource', 'setDeviceTypeResource', { deviceId, supplyId });
        return this.postBase('/power-supplies/set-device-type', {
            device_id: deviceId,
            power_supply_id: supplyId,
            settings
        });
    }

    async activatePowerSupplyResource(deviceId, supplyId) {
        logDebugUtils('corePowerSupplyResource', 'activatePowerSupplyResource', { deviceId, supplyId });
        return this.postBase('/power-supplies/activate', {
            device_id: deviceId,
            power_supply_id: supplyId
        });
    }

    async deactivatePowerSupplyResource(deviceId) {
        logDebugUtils('corePowerSupplyResource', 'deactivatePowerSupplyResource', { deviceId });
        return this.postBase('/power-supplies/deactivate', {
            device_id: deviceId
        });
    }

    async checkPowerSupplyCompatibilityResource(supplyId, deviceId) {
        logDebugUtils('corePowerSupplyResource', 'checkPowerSupplyCompatibilityResource', { supplyId, deviceId });
        return this.postBase('/power-supplies/check-compatibility', {
            power_supply_id: supplyId,
            device_id: deviceId
        });
    }

    async simulateVoltageChangeResource(deviceId, targetVoltage, duration = 2000) {
        logDebugUtils('corePowerSupplyResource', 'simulateVoltageChangeResource', { deviceId, targetVoltage, duration });
        return this.postBase('/power-supplies/simulate-voltage', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration
        });
    }

    async simulatePowerFailureResource(deviceId, duration = 2000) {
        logDebugUtils('corePowerSupplyResource', 'simulatePowerFailureResource', { deviceId, duration });
        return this.postBase('/power-supplies/simulate-failure', {
            device_id: deviceId,
            duration
        });
    }

    async getPowerSupplyStatusResource(deviceId) {
        logDebugUtils('corePowerSupplyResource', 'getPowerSupplyStatusResource', { deviceId });
        return this.getBase(`/power-supplies/status/${deviceId}`);
    }

    async getPowerParametersResource(deviceId) {
        logDebugUtils('corePowerSupplyResource', 'getPowerParametersResource', { deviceId });
        return this.getBase(`/power-supplies/parameters/${deviceId}`);
    }

    async simulateChargingResource(deviceId, targetVoltage, duration = 2000) {
        logDebugUtils('corePowerSupplyResource', 'simulateChargingResource', { deviceId, targetVoltage, duration });
        return this.postBase('/power-supplies/simulate-charging', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration
        });
    }

    async simulateDischargingResource(deviceId, targetVoltage, duration = 2000) {
        logDebugUtils('corePowerSupplyResource', 'simulateDischargingResource', { deviceId, targetVoltage, duration });
        return this.postBase('/power-supplies/simulate-discharging', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration
        });
    }

    async simulateEmergencyResource(deviceId) {
        logDebugUtils('corePowerSupplyResource', 'simulateEmergencyResource', { deviceId });
        return this.postBase('/power-supplies/simulate-emergency', {
            device_id: deviceId
        });
    }
}

export default CorePowerSupplyResource;
