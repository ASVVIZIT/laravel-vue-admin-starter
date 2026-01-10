import { BaseResource } from './BaseResource.js';

export class SmartLightResource extends BaseResource {
    constructor() {
        super('smart-light');
    }

    async getGlobalSettings() {
        return this.get('settings');
    }

    async updateGlobalSettings(settings) {
        return this.post('settings', { settings });
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

    async sendTelemetry(deviceId, data) {
        return this.post(`${deviceId}/telemetry`, data);
    }

    async getCommands(deviceId) {
        return this.get(`${deviceId}/commands`);
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

    async getDropdownList() {
        return this.get('devices/dropdown');
    }

    async checkOwnership(deviceId) {
        return this.get(`${deviceId}/ownership`);
    }
}
