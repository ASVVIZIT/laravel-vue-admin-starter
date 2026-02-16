import { BaseResource } from './BaseResource.js';
import { logDebug, logError } from '@/components/SmartLight/api/utils/apilogger';

export class SmartLightResource extends BaseResource {
    constructor() {
        super('smart-light');
    }

    async getGlobalSettings() {
        logDebug('SmartLightResource', 'Получение глобальных настроек');
        return this.get('settings');
    }

    async updateGlobalSettings(settings) {
        logDebug('SmartLightResource', 'Обновление глобальных настроек', { settings });
        return this.post('settings', settings);
    }

    async resetGlobalSettings() {
        logDebug('SmartLightResource', 'Сброс глобальных настроек');
        return this.post('settings/reset');
    }

    async getDevices() {
        logDebug('SmartLightResource', 'Получение устройств');
        return this.get('devices');
    }

    async getDeviceSettings(deviceId) {
        logDebug('SmartLightResource', 'Получение настроек устройства', { deviceId });
        return this.get(`${deviceId}/settings`);
    }

    async sendCommand(deviceId, command, intensity = 100) {
        logDebug('SmartLightResource', 'Отправка команды', {
            deviceId,
            command,
            intensity
        });

        return this.post(`${deviceId}/commands`, {
            command,
            intensity
        });
    }

    async forceSleep(deviceId) {
        logDebug('SmartLightResource', 'Перевод в спящий режим', { deviceId });
        return this.post(`${deviceId}/sleep`);
    }

    async wakeDevice(deviceId) {
        logDebug('SmartLightResource', 'Пробуждение устройства', { deviceId });
        return this.get(`${deviceId}/wake`);
    }
}
