/**
 * ============================================================================
 * DEVICE CONTROLLER — КОНТРОЛЛЕР ДЛЯ УПРАВЛЕНИЯ УСТРОЙСТВАМИ
 * ============================================================================
 * 📁 Путь: controllers/DeviceController.js
 * ✅ Координация устройств
 * ✅ Отвечает за: загрузку, статус, команды устройств
 * ============================================================================
 */

import { DeviceService } from '@/components/SmartLight/services/DeviceService.js';
import { useSmartlightStore } from '@/components/SmartLight/stores/index.js';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger.js';

export class DeviceController {
    constructor() {
        this.store = useSmartlightStore();
        this.deviceService = new DeviceService();
    }

    /**
     * Загрузка всех устройств
     * @returns {Promise<Array>} Массив устройств
     */
    async loadDevices() {
        logDebug('DeviceController', 'Загрузка устройств');
        try {
            const result = await this.deviceService.getAllDevices();
            if (result.success) {
                result.devices.forEach(device => {
                    this.store.deviceUpdateDevice(device);
                });
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
     * @param {string} deviceId - ID устройства
     * @param {string} status - Статус
     * @param {number} intensity - Интенсивность
     * @returns {Promise<Object>} Результат операции
     */
    async updateDeviceStatus(deviceId, status, intensity = 100) {
        logDebug('DeviceController', 'Обновление статуса', { deviceId, status, intensity });
        try {
            const result = await this.deviceService.updateDeviceStatus(deviceId, status, intensity);
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
            logError('DeviceController', 'Ошибка обновления статуса', error);
            throw error;
        }
    }

    /**
     * Перевод в спящий режим
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Результат операции
     */
    async forceSleep(deviceId) {
        logDebug('DeviceController', 'Перевод в сон', { deviceId });
        try {
            const result = await this.deviceService.forceSleep(deviceId);
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
            logError('DeviceController', 'Ошибка перевода в сон', error);
            throw error;
        }
    }

    /**
     * Пробуждение устройства
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Результат операции
     */
    async wakeDevice(deviceId) {
        logDebug('DeviceController', 'Пробуждение', { deviceId });
        try {
            const result = await this.deviceService.wakeDevice(deviceId);
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
            logError('DeviceController', 'Ошибка пробуждения', error);
            throw error;
        }
    }

    /**
     * Получение устройства
     * @param {string} deviceId - ID устройства
     * @returns {Object} Устройство
     */
    getDevice(deviceId) {
        return this.store.deviceGetDevice(deviceId);
    }
}

export default DeviceController;
