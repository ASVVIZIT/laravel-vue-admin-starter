/**
 * ============================================================================
 * DEVICE SERVICE — СЕРВИС ДЛЯ РАБОТЫ С УСТРОЙСТВАМИ
 * ============================================================================
 * 📁 Путь: services/DeviceService.js
 * ✅ Бизнес-логика + API вызовы
 * ✅ Отвечает за: CRUD устройств, статус, команды
 * ============================================================================
 */

import { CoreSmartLightResource } from '@/components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger.js';

export class DeviceService {
    constructor() {
        this.resource = new CoreSmartLightResource();
    }

    /**
     * Получение всех устройств
     * @returns {Promise<Object>} Результат загрузки
     */
    async getAllDevices() {
        logDebug('DeviceService', 'Получение всех устройств');
        try {
            const response = await this.resource.getDevices();
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
     * @param {string} deviceId - ID устройства
     * @param {string} status - Статус
     * @param {number} intensity - Интенсивность
     * @returns {Promise<Object>} Результат обновления
     */
    async updateDeviceStatus(deviceId, status, intensity = 100) {
        logDebug('DeviceService', 'Обновление статуса', { deviceId, status, intensity });
        try {
            const response = await this.resource.sendCommand(deviceId, status, intensity);
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
     * Перевод в спящий режим
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Результат операции
     */
    async forceSleep(deviceId) {
        logDebug('DeviceService', 'Перевод в спящий режим', { deviceId });
        try {
            const response = await this.resource.forceSleep(deviceId);
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
     * @param {string} deviceId - ID устройства
     * @returns {Promise<Object>} Результат операции
     */
    async wakeDevice(deviceId) {
        logDebug('DeviceService', 'Пробуждение устройства', { deviceId });
        try {
            const response = await this.resource.wakeDevice(deviceId);
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

export default DeviceService;
