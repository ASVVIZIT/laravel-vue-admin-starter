// resources/js/components/SmartLight/api/core/PowerSupplyResource.js
import { BaseResource } from './BaseResource.js';

export class PowerSupplyResource extends BaseResource {
    constructor() {
        super('power-supplies');
    }

    async getAll() {
        return this.get('');
    }

    async getById(id) {
        return this.get(`/${id}`);
    }

    async setDeviceType(deviceId, supplyId, settings = {}) {
        return this.post('/set-device-type', {
            device_id: deviceId,
            power_supply_id: supplyId,
            settings
        });
    }

    async updatePowerSupply(supplyId, params) {
        return this.put(`/${supplyId}`, params);
    }

    async activatePowerSupply(deviceId, supplyId) {
        return this.post('/activate', {
            device_id: deviceId,
            power_supply_id: supplyId
        });
    }

    async deactivatePowerSupply(deviceId) {
        return this.post('/deactivate', {
            device_id: deviceId
        });
    }

    async simulateVoltageChange(deviceId, targetVoltage, duration = 2000) {
        return this.post('/simulate-voltage', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration
        });
    }

    async simulatePowerFailure(deviceId, duration = 2000) {
        return this.post('/simulate-failure', {
            device_id: deviceId,
            duration
        });
    }

    async getPowerSupplyStatus(deviceId) {
        return this.get(`/status/${deviceId}`);
    }

    async checkPowerSupplyCompatibility(supplyId, deviceId) {
        return this.post('/check-compatibility', {
            power_supply_id: supplyId,
            device_id: deviceId
        });
    }

    async simulateCharging(deviceId, targetVoltage, duration = 2000) {
        return this.post('/simulate-charging', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration
        });
    }

    async simulateDischarging(deviceId, targetVoltage, duration = 2000) {
        return this.post('/simulate-discharging', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration
        });
    }

    async getPowerParameters(deviceId) {
        return this.get(`/parameters/${deviceId}`);
    }

    async setPowerParameters(deviceId, parameters) {
        return this.put(`/parameters/${deviceId}`, parameters);
    }

    async simulateEmergency(deviceId) {
        return this.post('/simulate-emergency', {
            device_id: deviceId
        });
    }

    async getPowerHistory(deviceId, options = {}) {
        const params = new URLSearchParams();

        if (options.start) params.append('start', options.start);
        if (options.end) params.append('end', options.end);
        if (options.interval) params.append('interval', options.interval);

        return this.get(`/history/${deviceId}`, params);
    }

    async simulateSolarConnection(deviceId, options = {}) {
        return this.post('/simulate-solar', {
            device_id: deviceId,
            ...options
        });
    }

    async simulateSolarDisconnection(deviceId) {
        return this.post('/simulate-solar-disconnect', {
            device_id: deviceId
        });
    }

    async getPowerSupplyCompatibility(supplyId, deviceId) {
        return this.get(`/compatibility/${supplyId}/${deviceId}`);
    }

    async simulateGridConnection(deviceId, options = {}) {
        return this.post('/simulate-grid', {
            device_id: deviceId,
            ...options
        });
    }

    async simulateGridDisconnection(deviceId) {
        return this.post('/simulate-grid-disconnect', {
            device_id: deviceId
        });
    }
}
