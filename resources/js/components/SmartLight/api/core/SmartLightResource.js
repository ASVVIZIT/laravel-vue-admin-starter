import { BaseResource } from './BaseResource.js';

export class SmartLightResource extends BaseResource {
    constructor() {
        super('smart-light');
    }

    async getGlobalSettings() {
        return this.get('settings');
    }

    async updateGlobalSettings(settings) {
        return this.post('settings', settings);
    }

    async resetGlobalSettings() {
        return this.post('settings/reset');
    }

    async getDevices() {
        return this.get('devices');
    }

    async getDeviceSettings(deviceId) {
        return this.get(`${deviceId}/settings`);
    }

    async sendCommand(deviceId, command, intensity = 100) {
        return this.post(`${deviceId}/commands`, {
            command,
            intensity
        });
    }

    async forceSleep(deviceId) {
        return this.post(`${deviceId}/sleep`);
    }

    async wakeDevice(deviceId) {
        return this.get(`${deviceId}/wake`);
    }
}
