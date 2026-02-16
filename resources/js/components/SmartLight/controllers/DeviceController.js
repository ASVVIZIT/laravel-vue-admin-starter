import { DeviceService } from '@/components/SmartLight/services/DeviceService';
import { logDebug, logError } from '@/components/SmartLight/api/utils/apilogger';
import { useDeviceStore } from '@/components/SmartLight/stores';

export class DeviceController {
    constructor() {
        this.deviceStore = useDeviceStore();
        this.deviceService = new DeviceService();
        this.cache = new Map();
    }

    /**
     * Загрузка устройств
     */
    async loadDevices() {
        logDebug('DeviceController', 'Загрузка устройств');

        try {
            const result = await this.deviceService.getAllDevices();

            if (result.success) {
                // Обновляем состояние в store
                this.deviceStore.actions.updateDeviceInStore(result.devices);

                logDebug('DeviceController', 'Устройства загружены', {
                    count: result.devices.length
                });

                return result.devices;
            } else {
                throw new Error(result.message || 'Ошибка загрузки устройств');
            }
        } catch (error) {
            logError('DeviceController', 'Ошибка загрузки устройств', error);
            throw error;
        }
    }

    /**
     * Обновление статуса устройства
     */
    async updateDeviceStatus(deviceId, status, intensity = 100) {
        logDebug('DeviceController', 'Обновление статуса устройства', {
            deviceId,
            status,
            intensity
        });

        try {
            const result = await this.deviceService.updateDeviceStatus(deviceId, status, intensity);

            if (result.success) {
                // Обновляем состояние в store
                this.deviceStore.actions.updateDeviceStatus(deviceId, status);
                this.deviceStore.actions.updateDeviceIntensity(deviceId, intensity);

                return result;
            } else {
                throw new Error(result.message || 'Ошибка обновления статуса');
            }
        } catch (error) {
            logError('DeviceController', 'Ошибка обновления статуса', error);
            throw error;
        }
    }

    /**
     * Перевод устройства в спящий режим
     */
    async forceSleep(deviceId) {
        logDebug('DeviceController', 'Перевод в спящий режим', { deviceId });

        try {
            const result = await this.deviceService.forceSleep(deviceId);

            if (result.success) {
                // Обновляем состояние в store
                this.deviceStore.actions.updateDeviceStatus(deviceId, 'SLEEPING');

                return result;
            } else {
                throw new Error(result.message || 'Ошибка перевода в сон');
            }
        } catch (error) {
            logError('DeviceController', 'Ошибка перевода в сон', error);
            throw error;
        }
    }

    /**
     * Пробуждение устройства
     */
    async wakeDevice(deviceId) {
        logDebug('DeviceController', 'Пробуждение устройства', { deviceId });

        try {
            const result = await this.deviceService.wakeDevice(deviceId);

            if (result.success) {
                // Обновляем состояние в store
                this.deviceStore.actions.updateDeviceStatus(deviceId, 'ON');
                this.deviceStore.actions.updateDeviceIntensity(deviceId, 100);

                return result;
            } else {
                throw new Error(result.message || 'Ошибка пробуждения');
            }
        } catch (error) {
            logError('DeviceController', 'Ошибка пробуждения', error);
            throw error;
        }
    }

    /**
     * Получение устройства по ID
     */
    getDevice(deviceId) {
        // Сначала проверяем кеш
        if (this.cache.has(deviceId)) {
            return this.cache.get(deviceId);
        }

        // Получаем из store
        const device = this.deviceStore.actions.getDevice(deviceId);
        if (device) {
            this.cache.set(deviceId, device);
        }

        return device;
    }
}
