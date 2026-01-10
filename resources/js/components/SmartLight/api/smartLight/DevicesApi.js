// resources/js/components/SmartLight/api/smartLight/DevicesApi.js
import { SmartLightResource } from '../core/SmartLightResource.js';
import { logger } from '../utils/logger.js';

const resource = new SmartLightResource();

export const DevicesApi = {
    async getDevices() {
        logger.debug('DevicesApi.getDevices called');
        try {
            const response = await resource.getDevices();
            return this.handleResponse(response);
        } catch (error) {
            logger.error('DevicesApi.getDevices error', error);
            throw this.handleError(error);
        }
    },

    async getDeviceSettings(deviceId) {
        logger.debug('DevicesApi.getDeviceSettings called', { deviceId });
        try {
            const response = await resource.getDeviceSettings(deviceId);
            return this.handleResponse(response);
        } catch (error) {
            logger.error('DevicesApi.getDeviceSettings error', error);
            throw this.handleError(error);
        }
    },

    async checkOwnership(deviceId) {
        logger.debug('DevicesApi.checkOwnership called', { deviceId });
        try {
            const response = await resource.checkOwnership(deviceId);
            return this.handleResponse(response);
        } catch (error) {
            logger.error('DevicesApi.checkOwnership error', error);
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
