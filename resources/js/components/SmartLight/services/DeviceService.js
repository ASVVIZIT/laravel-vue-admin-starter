/**
 * ============================================================================
 * DEVICE SERVICE — СЕРВИС ДЛЯ РАБОТЫ С УСТРОЙСТВАМИ
 * ============================================================================
 * 📁 Путь: services/DeviceService.js
 * ✅ Бизнес-логика + API вызовы
 * ✅ Рефакторинг: методы получили суффикс Service(), импорты обновлены на *Utils
 * ============================================================================
 */

import { CoreSmartLightResource } from '@/components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class DeviceService {
    constructor() {
        this.resource = new CoreSmartLightResource();
    }

    async getAllDevicesService() {
        logDebugUtils('DeviceService', 'Получение всех устройств');
        try {
            const response = await this.resource.getDevicesResource();
            return {
                success: true,
                data: response.data || [],
                message: 'Устройства успешно загружены'
            };
        } catch (error) {
            logErrorUtils('DeviceService', 'Ошибка загрузки устройств', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось загрузить устройства'
            };
        }
    }

    async updateDeviceStatusService(deviceId, status, intensity = 100) {
        logDebugUtils('DeviceService', 'Обновление статуса', { deviceId, status, intensity });
        try {
            const response = await this.resource.sendCommandResource(deviceId, status, intensity);
            return {
                success: true,
                data: response.data,
                message: 'Статус устройства успешно обновлен'
            };
        } catch (error) {
            logErrorUtils('DeviceService', 'Ошибка обновления статуса', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось обновить статус устройства'
            };
        }
    }

    async forceSleepService(deviceId) {
        logDebugUtils('DeviceService', 'Перевод в спящий режим', { deviceId });
        try {
            const response = await this.resource.forceSleepResource(deviceId);
            return {
                success: true,
                data: response.data,
                message: 'Устройство успешно переведено в спящий режим'
            };
        } catch (error) {
            logErrorUtils('DeviceService', 'Ошибка перевода в спящий режим', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось перевести устройство в спящий режим'
            };
        }
    }

    async wakeDeviceService(deviceId) {
        logDebugUtils('DeviceService', 'Пробуждение устройства', { deviceId });
        try {
            const response = await this.resource.wakeDeviceResource(deviceId);
            return {
                success: true,
                data: response.data,
                message: 'Устройство успешно пробуждено'
            };
        } catch (error) {
            logErrorUtils('DeviceService', 'Ошибка пробуждения', error);
            return {
                success: false,
                error: error.message,
                message: 'Не удалось пробудить устройство'
            };
        }
    }
}

export default DeviceService;
