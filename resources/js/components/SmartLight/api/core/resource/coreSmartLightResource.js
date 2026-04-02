/**
 * ============================================================================
 * SMART LIGHT RESOURCE — БАЗОВЫЙ API КЛИЕНТ
 * ============================================================================
 */

import request from '@utils/request.js';
import { logDebug, logError } from '@components/SmartLight/api/core/utils/coreApiLogger.js';

const API_BASE = '/smart-light';
const V1_API_BASE = '/v1/smart-light';

export class CoreSmartLightResource {
    constructor() {
        this.apiBase = API_BASE;
        this.v1ApiBase = V1_API_BASE;
    }

    async getDevices() {
        logDebug('coreSmartLightResource', 'Получение устройств');
        return request({
            url: `${this.apiBase}/devices`,
            method: 'get'
        });
    }

    async getDevice(deviceId) {
        logDebug('coreSmartLightResource', 'Получение устройства', { deviceId });
        return request({
            url: `${this.apiBase}/devices/${deviceId}`,
            method: 'get'
        });
    }

    async wakeDevice(deviceId) {
        logDebug('coreSmartLightResource', 'Пробуждение устройства', { deviceId });
        return request({
            url: `${this.v1ApiBase}/devices/${deviceId}/commands/wake`,
            method: 'post'
        });
    }

    async forceSleep(deviceId) {
        logDebug('coreSmartLightResource', 'Перевод в сон', { deviceId });
        return request({
            url: `${this.v1ApiBase}/devices/${deviceId}/commands/sleep`,
            method: 'post'
        });
    }

    async sendCommand(deviceId, command, intensity = 100) {
        logDebug('coreSmartLightResource', 'Отправка команды', { deviceId, command, intensity });
        return request({
            url: `${this.apiBase}/${deviceId}/commands`,
            method: 'post',
            data: { command, intensity }
        });
    }

    async getGlobalSettings() {
        logDebug('coreSmartLightResource', 'Получение глобальных настроек');
        return request({
            url: `${this.apiBase}/settings`,
            method: 'get'
        });
    }

    async updateGlobalSettings(settings) {
        logDebug('coreSmartLightResource', 'Обновление глобальных настроек', { settings });
        return request({
            url: `${this.apiBase}/settings`,
            method: 'post',
            data: { settings }
        });
    }

    async resetGlobalSettings() {
        logDebug('coreSmartLightResource', 'Сброс глобальных настроек');
        return request({
            url: `${this.apiBase}/settings/reset`,
            method: 'post'
        });
    }

    async getDeviceSettings(deviceId) {
        logDebug('coreSmartLightResource', 'Получение настроек устройства', { deviceId });
        return request({
            url: `${this.apiBase}/${deviceId}/device-settings`,
            method: 'get'
        });
    }

    async updateDeviceSettings(deviceId, settings) {
        logDebug('coreSmartLightResource', 'Обновление настроек устройства', { deviceId, settings });
        return request({
            url: `${this.apiBase}/${deviceId}/device-settings`,
            method: 'put',
            data: settings
        });
    }

    async resetDeviceSettings(deviceId) {
        logDebug('coreSmartLightResource', 'Сброс настроек устройства', { deviceId });
        return request({
            url: `${this.apiBase}/${deviceId}/device-settings/reset`,
            method: 'post'
        });
    }
}

export default CoreSmartLightResource;
