import { BaseResource } from './BaseResource.js';

export class BulbTypeResource extends BaseResource {
    constructor() {
        super('bulb-types');
    }

    async getAll() {
        return this.get('');
    }

    async getById(id) {
        return this.get(`/${id}`);
    }

    async setDeviceType(deviceId, bulbTypeId, settings = {}) {
        return this.post('/set-device-type', {
            device_id: deviceId,
            bulb_type_id: bulbTypeId,
            settings
        });
    }

    async updateBulbType(bulbTypeId, params) {
        return this.put(`/${bulbTypeId}`, params);
    }

    async getBulbTypeStatus(deviceId) {
        return this.get(`/status/${deviceId}`);
    }

    async checkBulbTypeCompatibility(bulbTypeId, deviceId) {
        return this.post('/check-compatibility', {
            bulb_type_id: bulbTypeId,
            device_id: deviceId
        });
    }

    async simulateLightEffect(deviceId, effectType, duration = 2000) {
        return this.post('/simulate-effect', {
            device_id: deviceId,
            effect_type: effectType,
            duration
        });
    }

    async simulateColorChange(deviceId, color, duration = 2000) {
        return this.post('/simulate-color', {
            device_id: deviceId,
            color,
            duration
        });
    }

    async getBulbParameters(deviceId) {
        return this.get(`/parameters/${deviceId}`);
    }

    async setBulbParameters(deviceId, parameters) {
        return this.put(`/parameters/${deviceId}`, parameters);
    }

    async getBulbHistory(deviceId, options = {}) {
        const params = new URLSearchParams();

        if (options.start) params.append('start', options.start);
        if (options.end) params.append('end', options.end);
        if (options.interval) params.append('interval', options.interval);

        return this.get(`/history/${deviceId}`, params);
    }

    async simulateGroupEffect(deviceId, effectType, configuration) {
        return this.post('/simulate-group-effect', {
            device_id: deviceId,
            effect_type: effectType,
            configuration
        });
    }

    async getBulbTypeCompatibility(bulbTypeId, deviceId) {
        return this.get(`/compatibility/${bulbTypeId}/${deviceId}`);
    }
}
