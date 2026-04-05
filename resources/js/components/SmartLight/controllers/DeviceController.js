/**
 * ============================================================================
 * DEVICE CONTROLLER — КОНТРОЛЛЕР ДЛЯ УПРАВЛЕНИЯ УСТРОЙСТВАМИ
 * ============================================================================
 * 📁 Путь: controllers/DeviceController.js
 * ✅ Координация устройств
 * ✅ Рефакторинг: методы получили суффикс Controller(), импорты обновлены на *Utils
 * ============================================================================
 */

import { DeviceService } from '@/components/SmartLight/services/DeviceService.js';
import { useSmartlightStore } from '@/components/SmartLight/stores/smartlightStore.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

export class DeviceController {
    constructor() {
        this.store = useSmartlightStore();
        this.deviceService = new DeviceService();
    }

    /**
     * Загрузка всех устройств (суффикс Controller)
     * @returns {Promise<Array>} Массив устройств
     */
    async loadDevicesController() {
        logDebugUtils('DeviceController', 'Загрузка устройств');
        try {
            const result = await this.deviceService.getAllDevicesService();
            if (result.success) {
                result.data.forEach(device => {
                    this.store.deviceUpdateDevice(device);
                });
                logDebugUtils('DeviceController', 'Устройства загружены', {
                    count: result.data.length
                });
                return result.data;
            } else {
                throw new Error(result.message || 'Ошибка загрузки устройств');
            }
        } catch (error) {
            logErrorUtils('DeviceController', 'Ошибка загрузки устройств', error);
            throw error;
        }
    }

    /**
     * Обновление статуса устройства (суффикс Controller)
     * @param {string} deviceId - ID устройства
     * @param {string} status - Статус
     * @param {number} intensity - Интенсивность
     * @returns {Promise<Object>} Результат операции
     */
    async updateDeviceStatusController(deviceId, status, intensity = 100) {
        logDebugUtils('DeviceController', 'Обновление статуса', { deviceId, status, intensity });
        try {
            const result = await this.deviceService.updateDeviceStatusService(deviceId, status, intensity);
            if (result.success) {
                const device = this.store.deviceGetDevice(deviceId);
                if (device) {
                    this.store.deviceUpdateDevice({
                        ...device,
                        status,
                        intensity
                    });
                }
                return result;
            } else {
                throw new Error(result.message || 'Ошибка обновления статуса');
            }
        } catch (error) {
            logErrorUtils('DeviceController', 'Ошибка обновления статуса', error);
            throw error;
        }
    }

    /**
     * Перевод в спящий режим (суффикс Controller)
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Результат операции
     */
    async forceSleepController(deviceId) {
        logDebugUtils('DeviceController', 'Перевод в сон', { deviceId });
        try {
            const result = await this.deviceService.forceSleepService(deviceId);
            if (result.success) {
                const device = this.store.deviceGetDevice(deviceId);
                if (device) {
                    this.store.deviceUpdateDevice({ ...device, status: 'SLEEPING' });
                }
                return result;
            } else {
                throw new Error(result.message || 'Ошибка перевода в сон');
            }
        } catch (error) {
            logErrorUtils('DeviceController', 'Ошибка перевода в сон', error);
            throw error;
        }
    }

    /**
     * Пробуждение устройства (суффикс Controller)
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Результат операции
     */
    async wakeDeviceController(deviceId) {
        logDebugUtils('DeviceController', 'Пробуждение', { deviceId });
        try {
            const result = await this.deviceService.wakeDeviceService(deviceId);
            if (result.success) {
                const device = this.store.deviceGetDevice(deviceId);
                if (device) {
                    this.store.deviceUpdateDevice({
                        ...device,
                        status: 'ON',
                        intensity: 100
                    });
                }
                return result;
            } else {
                throw new Error(result.message || 'Ошибка пробуждения');
            }
        } catch (error) {
            logErrorUtils('DeviceController', 'Ошибка пробуждения', error);
            throw error;
        }
    }

    /**
     * Получение устройства (суффикс Controller)
     * @param {string} deviceId - ID устройства
     * @returns {Object} Устройство
     */
    getDeviceController(deviceId) {
        return this.store.deviceGetDevice(deviceId);
    }
}

export default DeviceController;
