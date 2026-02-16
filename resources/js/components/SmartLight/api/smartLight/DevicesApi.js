// resources/js/components/SmartLight/api/smartLight/DevicesApi.js
import { SmartLightResource } from '../core/SmartLightResource.js';
import {logDebug, logError} from '../utils/apiLogger.js';

const resource = new SmartLightResource();

export const DevicesApi = {
    async getDevices() {
        logDebug('DevicesApi','getDevices called');
        try {
            const response = await resource.getDevices();
            return this.handleResponse(response);
        } catch (error) {
            logError('DevicesApi','getDevices error', error);
            throw this.handleError(error);
        }
    },

    async getDeviceSettings(deviceId) {
        logDebug('DevicesApi','getDeviceSettings called', { deviceId });
        try {
            const response = await resource.getDeviceSettings(deviceId);
            return this.handleResponse(response);
        } catch (error) {
            logError('DevicesApi','getDeviceSettings error', error);
            throw this.handleError(error);
        }
    },

    async checkOwnership(deviceId) {
        logDebug('DevicesApi','checkOwnership called', { deviceId });
        try {
            const response = await resource.checkOwnership(deviceId);
            return this.handleResponse(response);
        } catch (error) {
            logError('DevicesApi','checkOwnership error', error);
            throw this.handleError(error);
        }
    },

    handleResponse(response) {
        return {
            success: true,
            message: response.data?.message || 'Устройства загружены',
            data: response.data
        };
    },

    handleError(error) {
        const errorMessage = error.response?.data?.message ||
            error.message ||
            'Ошибка при работе с устройствами';

        return {
            success: false,
            message: errorMessage,
            error: error.response?.data || error
        };
    }
};
