/**
 * ============================================================================
 * DEVICES API — API ДЛЯ РАБОТЫ С УСТРОЙСТВАМИ
 * ============================================================================
 * 📁 Путь: api/core/smartLight/coreDevicesApi.js
 * ✅ Используется: DeviceService, Controllers
 * ============================================================================
 */

import { CoreSmartLightResource } from '@components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { logDebug, logError } from '@components/SmartLight/api/core/utils/coreApiLogger.js';

const resource = new CoreSmartLightResource();

export const CoreDevicesApi = {
    async getDevices() {
        logDebug('coreDevicesApi', 'getDevices called');
        try {
            const response = await resource.getDevices();
            return {
                success: true,
                message: response.data?.message || 'Устройства загружены',
                data: response.data
            };
        } catch (error) {
            logError('coreDevicesApi', 'getDevices error', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Ошибка при работе с устройствами',
                error: error.response?.data || error
            };
        }
    },

    async getDeviceSettings(deviceId) {
        logDebug('coreDevicesApi', 'getDeviceSettings called', { deviceId });
        try {
            const response = await resource.getDeviceSettings(deviceId);
            return {
                success: true,
                message: 'Настройки устройства загружены',
                data: response.data
            };
        } catch (error) {
            logError('coreDevicesApi', 'getDeviceSettings error', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Ошибка загрузки настроек',
                error: error.response?.data || error
            };
        }
    },

    async checkOwnership(deviceId) {
        logDebug('coreDevicesApi', 'checkOwnership called', { deviceId });
        try {
            const response = await resource.checkOwnership(deviceId);
            return {
                success: true,
                message: 'Проверка владения выполнена',
                data: response.data
            };
        } catch (error) {
            logError('coreDevicesApi', 'checkOwnership error', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Ошибка проверки владения',
                error: error.response?.data || error
            };
        }
    }
};

export default CoreDevicesApi;
