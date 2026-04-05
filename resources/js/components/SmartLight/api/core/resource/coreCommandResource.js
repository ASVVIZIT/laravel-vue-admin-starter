/**
 * ============================================================================
 * COMMAND RESOURCE — ЯДРО (БАЗОВАЯ ЛОГИКА КОМАНД)
 * ============================================================================
 * 📁 Путь: api/core/resource/coreCommandResource.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ✅ Рефакторинг: методы с суффиксом Resource(), вызовы через Base()
 * ============================================================================
 */

import { CoreBaseResource } from './coreBaseResource.js';
import { logDebugUtils, logErrorUtils } from '@components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class CoreCommandResource extends CoreBaseResource {
    constructor() {
        super('/smart-light', null);
    }

    /**
     * Отправить команду устройству (суффикс Resource)
     */
    async sendResource(deviceId, command, intensity = 100) {
        logDebugUtils('coreCommandResource', 'sendResource', { deviceId, command, intensity });
        return this.postBase(`/${deviceId}/commands`, { command, intensity });
    }

    /**
     * Получить pending команду (суффикс Resource)
     */
    async getPendingResource(deviceId) {
        logDebugUtils('coreCommandResource', 'getPendingResource', { deviceId });
        return this.getBase(`/${deviceId}/commands`);
    }

    /**
     * Перевести в сон (суффикс Resource)
     */
    async sleepResource(deviceId) {
        logDebugUtils('coreCommandResource', 'sleepResource', { deviceId });
        return this.postBase(`/${deviceId}/commands`, { command: 'SLEEPING' });
    }

    /**
     * Пробудить (суффикс Resource)
     */
    async wakeResource(deviceId) {
        logDebugUtils('coreCommandResource', 'wakeResource', { deviceId });
        return this.postBase(`/${deviceId}/commands`, { command: 'WAKE_UP', intensity: 100 });
    }

    /**
     * Экстренный сон (суффикс Resource)
     */
    async emergencySleepResource(deviceId, reason = 'low_battery') {
        logDebugUtils('coreCommandResource', 'emergencySleepResource', { deviceId, reason });
        return this.postBase(`/${deviceId}/commands`, {
            command: 'EMERGENCY_SLEEP',
            reason
        });
    }

    /**
     * Обновить статус (суффикс Resource)
     */
    async updateStatusResource(deviceId, status) {
        logDebugUtils('coreCommandResource', 'updateStatusResource', { deviceId, status });
        return this.postBase(`/${deviceId}/commands`, { command: 'STATUS_UPDATE', status });
    }

    /**
     * Отменить команду (суффикс Resource)
     */
    async cancelResource(deviceId, commandId) {
        logDebugUtils('coreCommandResource', 'cancelResource', { deviceId, commandId });
        return this.deleteBase(`/${deviceId}/commands/${commandId}`);
    }
}

export default CoreCommandResource;
