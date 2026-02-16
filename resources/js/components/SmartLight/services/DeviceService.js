import { SmartLightResource } from '@/components/SmartLight/api/core/SmartLightResource';
import { logDebug, logError } from '@/components/SmartLight/api/utils/apilogger';

export class DeviceService {
    /**
     * Получение всех устройств
     */
    async getAllDevices() {
        logDebug('DeviceService', 'Получение всех устройств');

        const resource = new SmartLightResource();

        try {
            const response = await resource.getDevices();
            return {
                success: true,
                data: response.data || [],
                message: 'Устройства успешно загружены'
            };
        } catch (error) {
            logError('DeviceService', 'Ошибка загрузки устройств', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось загрузить устройства'
            };
        }
    }

    /**
     * Обновление статуса устройства
     */
    async updateDeviceStatus(deviceId, status, intensity) {
        logDebug('DeviceService', 'Обновление статуса', {
            deviceId,
            status,
            intensity
        });

        const resource = new SmartLightResource();

        try {
            const response = await resource.sendCommand(deviceId, status, intensity);
            return {
                success: true,
                data: response.data,
                message: 'Статус устройства успешно обновлен'
            };
        } catch (error) {
            logError('DeviceService', 'Ошибка обновления статуса', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось обновить статус устройства'
            };
        }
    }

    /**
     * Перевод устройства в спящий режим
     */
    async forceSleep(deviceId) {
        logDebug('DeviceService', 'Перевод в спящий режим', { deviceId });

        const resource = new SmartLightResource();

        try {
            const response = await resource.forceSleep(deviceId);
            return {
                success: true,
                data: response.data,
                message: 'Устройство успешно переведено в спящий режим'
            };
        } catch (error) {
            logError('DeviceService', 'Ошибка перевода в спящий режим', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось перевести устройство в спящий режим'
            };
        }
    }

    /**
     * Пробуждение устройства
     */
    async wakeDevice(deviceId) {
        logDebug('DeviceService', 'Пробуждение устройства', { deviceId });

        const resource = new SmartLightResource();

        try {
            const response = await resource.wakeDevice(deviceId);
            return {
                success: true,
                data: response.data,
                message: 'Устройство успешно пробуждено'
            };
        } catch (error) {
            logError('DeviceService', 'Ошибка пробуждения', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось пробудить устройство'
            };
        }
    }
}
