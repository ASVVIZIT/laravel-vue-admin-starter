/**
 * ============================================================================
 * COMMAND RESOURCE — ЯДРО (БАЗОВАЯ ЛОГИКА КОМАНД)
 * ============================================================================
 * 📁 Путь: api/core/resource/coreCommandResource.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebug, logError } from '@components/SmartLight/api/core/utils/coreApiLogger.js';

export class CoreCommandResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    /**
     * Отправить команду устройству
     */
    async send(deviceId, command, intensity = 100) {
        logDebug('coreCommandResource', 'send', { deviceId, command, intensity });
        return this.post(`/${deviceId}/commands`, { command, intensity });
    }

    /**
     * Получить pending команду
     */
    async getPending(deviceId) {
        logDebug('coreCommandResource', 'getPending', { deviceId });
        return this.get(`/${deviceId}/commands`);
    }

    /**
     * Перевести в сон
     */
    async sleep(deviceId) {
        logDebug('coreCommandResource', 'sleep', { deviceId });
        return this.post(`/${deviceId}/commands`, { command: 'SLEEPING' });
    }

    /**
     * Пробудить
     */
    async wake(deviceId) {
        logDebug('coreCommandResource', 'wake', { deviceId });
        return this.post(`/${deviceId}/commands`, { command: 'WAKE_UP', intensity: 100 });
    }

    /**
     * Экстренный сон
     */
    async emergencySleep(deviceId, reason = 'low_battery') {
        logDebug('coreCommandResource', 'emergencySleep', { deviceId, reason });
        return this.post(`/${deviceId}/commands`, {
            command: 'EMERGENCY_SLEEP',
            reason
        });
    }

    /**
     * Обновить статус
     */
    async updateStatus(deviceId, status) {
        logDebug('coreCommandResource', 'updateStatus', { deviceId, status });
        return this.post(`/${deviceId}/commands`, { command: 'STATUS_UPDATE', status });
    }

    /**
     * Отменить команду
     */
    async cancel(deviceId, commandId) {
        logDebug('coreCommandResource', 'cancel', { deviceId, commandId });
        return this.delete(`/${deviceId}/commands/${commandId}`);
    }
}

export default CoreCommandResource;
