import { BaseResource } from './BaseResource';
import { logDebug, logError } from '@/components/SmartLight/api/utils/apilogger';

export class BulbTypeResource extends BaseResource {
    constructor() {
        super('bulb-types');
    }

    /**
     * Получение всех типов ламп
     */
    async getAll() {
        logDebug('BulbTypeResource', 'Получение всех типов ламп');
        return this.get('');
    }

    /**
     * Получение типа лампы по ID
     */
    async getById(id) {
        logDebug('BulbTypeResource', 'Получение типа лампы', { id });
        return this.get(`/${id}`);
    }

    /**
     * Установка типа лампы для устройства
     */
    async setDeviceType(deviceId, bulbTypeId, settings = {}) {
        logDebug('BulbTypeResource', 'Установка типа лампы для устройства', {
            deviceId,
            bulbTypeId,
            settings
        });

        return this.post('/set-device-type', {
            device_id: deviceId,
            bulb_type_id: bulbTypeId,
            settings
        });
    }

    /**
     * Обновление типа лампы
     */
    async updateBulbType(bulbTypeId, params) {
        logDebug('BulbTypeResource', 'Обновление типа лампы', {
            bulbTypeId,
            params
        });
        return this.put(`/${bulbTypeId}`, params);
    }

    /**
     * Получение статуса типа лампы
     */
    async getBulbTypeStatus(deviceId) {
        logDebug('BulbTypeResource', 'Получение статуса типа лампы', { deviceId });
        return this.get(`/status/${deviceId}`);
    }

    /**
     * Проверка совместимости типа лампы
     */
    async checkBulbTypeCompatibility(bulbTypeId, deviceId) {
        logDebug('BulbTypeResource', 'Проверка совместимости типа лампы', {
            bulbTypeId,
            deviceId
        });

        return this.post('/check-compatibility', {
            bulb_type_id: bulbTypeId,
            device_id: deviceId
        });
    }

    /**
     * Симуляция светового эффекта
     */
    async simulateLightEffect(deviceId, effectType, duration = 2000) {
        logDebug('BulbTypeResource', 'Симуляция светового эффекта', {
            deviceId,
            effectType,
            duration
        });

        return this.post('/simulate-effect', {
            device_id: deviceId,
            effect_type: effectType,
            duration
        });
    }

    /**
     * Симуляция изменения цвета
     */
    async simulateColorChange(deviceId, color, duration = 2000) {
        logDebug('BulbTypeResource', 'Симуляция изменения цвета', {
            deviceId,
            color,
            duration
        });

        return this.post('/simulate-color', {
            device_id: deviceId,
            color,
            duration
        });
    }

    /**
     * Получение параметров лампы
     */
    async getBulbParameters(deviceId) {
        logDebug('BulbTypeResource', 'Получение параметров лампы', { deviceId });
        return this.get(`/parameters/${deviceId}`);
    }

    /**
     * Установка параметров лампы
     */
    async setBulbParameters(deviceId, parameters) {
        logDebug('BulbTypeResource', 'Установка параметров лампы', {
            deviceId,
            parameters
        });
        return this.put(`/parameters/${deviceId}`, parameters);
    }

    /**
     * Получение истории лампы
     */
    async getBulbHistory(deviceId, options = {}) {
        logDebug('BulbTypeResource', 'Получение истории лампы', {
            deviceId,
            options
        });

        const params = new URLSearchParams();
        if (options.start) params.append('start', options.start);
        if (options.end) params.append('end', options.end);
        if (options.interval) params.append('interval', options.interval);

        return this.get(`/history/${deviceId}`, params);
    }

    /**
     * Симуляция группового эффекта
     */
    async simulateGroupEffect(deviceId, effectType, configuration) {
        logDebug('BulbTypeResource', 'Симуляция группового эффекта', {
            deviceId,
            effectType,
            configuration
        });

        return this.post('/simulate-group-effect', {
            device_id: deviceId,
            effect_type: effectType,
            configuration
        });
    }

    /**
     * Получение информации о совместимости
     */
    async getBulbTypeCompatibility(bulbTypeId, deviceId) {
        logDebug('BulbTypeResource', 'Получение информации о совместимости', {
            bulbTypeId,
            deviceId
        });
        return this.get(`/compatibility/${bulbTypeId}/${deviceId}`);
    }
}
