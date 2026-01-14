import { BaseResource } from './BaseResource.js';

export class BatteryTypeResource extends BaseResource {
    constructor() {
        super('battery-types');
    }

    async getAll() {
        return this.get('');
    }

    async getById(id) {
        return this.get(`/${id}`);
    }

    async setDeviceType(deviceId, batteryTypeId, settings = {}) {
        return this.post('/set-device-type', {
            device_id: deviceId,
            battery_type_id: batteryTypeId,
            settings
        });
    }

    async updateBatteryType(batteryTypeId, params) {
        return this.put(`/${batteryTypeId}`, params);
    }

    async getBatteryTypeStatus(deviceId) {
        return this.get(`/status/${deviceId}`);
    }

    async checkBatteryTypeCompatibility(batteryTypeId, deviceId) {
        return this.post('/check-compatibility', {
            battery_type_id: batteryTypeId,
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

    async simulateDischarge(deviceId, targetVoltage, duration = 2000) {
        return this.post('/simulate-discharge', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration
        });
    }

    async simulateCharge(deviceId, targetVoltage, duration = 2000) {
        return this.post('/simulate-charge', {
            device_id: deviceId,
            target_voltage: targetVoltage,
            duration
        });
    }

    async simulateSelfDischarge(deviceId, duration = 2000) {
        return this.post('/simulate-self-discharge', {
            device_id: deviceId,
            duration
        });
    }

    async simulateDegradation(deviceId, cycles) {
        return this.post('/simulate-degradation', {
            device_id: deviceId,
            cycles
        });
    }

    async getBatteryParameters(deviceId) {
        return this.get(`/parameters/${deviceId}`);
    }

    async setBatteryParameters(deviceId, parameters) {
        return this.put(`/parameters/${deviceId}`, parameters);
    }

    async getBatteryHistory(deviceId, options = {}) {
        const params = new URLSearchParams();

        if (options.start) params.append('start', options.start);
        if (options.end) params.append('end', options.end);
        if (options.interval) params.append('interval', options.interval);

        return this.get(`/history/${deviceId}`, params);
    }

    async simulateCriticalVoltage(deviceId) {
        return this.post('/simulate-critical', {
            device_id: deviceId
        });
    }

    async simulateEmergencySleep(deviceId) {
        return this.post('/simulate-emergency-sleep', {
            device_id: deviceId
        });
    }

    async getBatteryGroupStatus(deviceId) {
        return this.get(`/group-status/${deviceId}`);
    }

    async setBatteryGroup(deviceId, groupConfig) {
        return this.post('/set-group', {
            device_id: deviceId,
            group_config: groupConfig
        });
    }

    async simulateBatteryFailure(deviceId, duration = 2000) {
        return this.post('/simulate-failure', {
            device_id: deviceId,
            duration
        });
    }
}
