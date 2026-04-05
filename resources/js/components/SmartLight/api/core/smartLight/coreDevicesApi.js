/**
 * ============================================================================
 * DEVICES API — API ДЛЯ РАБОТЫ С УСТРОЙСТВАМИ
 * ============================================================================
 * 📁 Путь: api/core/smartLight/coreDevicesApi.js
 * ✅ Используется: DeviceStore, Controllers
 * ✅ Рефакторинг: методы с суффиксом Api(), вызовы через Resource(), корректный синтаксис data:
 * ============================================================================
 */

import { CoreSmartLightResource } from '@components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

const resource = new CoreSmartLightResource();

export const CoreDevicesApi = {
    async getDevicesApi() {
        logDebugUtils('CoreDevicesApi', 'getDevicesApi called');
        try {
            const response = await resource.getDevicesResource();
            return {
                success: true,
                message: response.data?.message || 'Устройства загружены',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('CoreDevicesApi', 'getDevicesApi error', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Ошибка при работе с устройствами',
                error: error.response?.data || error
            };
        }
    },

    async getDeviceSettingsApi(deviceId) {
        logDebugUtils('CoreDevicesApi', 'getDeviceSettingsApi called', { deviceId });
        try {
            const response = await resource.getDeviceSettingsResource(deviceId);
            return {
                success: true,
                message: 'Настройки устройства загружены',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('CoreDevicesApi', 'getDeviceSettingsApi error', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Ошибка загрузки настроек',
                error: error.response?.data || error
            };
        }
    },

    async checkOwnershipApi(deviceId) {
        logDebugUtils('CoreDevicesApi', 'checkOwnershipApi called', { deviceId });
        try {
            const response = await resource.checkOwnershipResource(deviceId);
            return {
                success: true,
                message: 'Проверка владения выполнена',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('CoreDevicesApi', 'checkOwnershipApi error', error);
            throw {
                success: false,
                message: error.response?.data?.message || 'Ошибка проверки владения',
                error: error.response?.data || error
            };
        }
    }
};

export default CoreDevicesApi;
