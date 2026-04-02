/**
 * ============================================================================
 * COMMAND SERVICE — СЕРВИС ДЛЯ ОТПРАВКИ КОМАНД
 * ============================================================================
 * 📁 Путь: services/CommandService.js
 * ✅ Используется: DeviceController, CommandController
 * ============================================================================
 */

import { CoreSmartLightResource } from '@/components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { validateCommand } from '@/components/SmartLight/utils/appValidators.js';
import { ApiUtils } from '@/components/SmartLight/api/core/utils/coreApiUtils.js';
import { logDebug, logError } from '@/components/SmartLight/api/core/utils/coreApiLogger.js';

export class CommandService {
    constructor() {
        this.resource = new CoreSmartLightResource();
        this.commandHistory = new Map();
    }

    async sendCommand(deviceId, command, intensity = 100) {
        logDebug('CommandService', 'Отправка команды', { deviceId, command, intensity });

        // ЛОГИРОВАНИЕ ЗАПРОСА
        const requestId = ApiUtils.logApiRequest('POST', `/api/smart-light/devices/${deviceId}/command`, {
            command,
            intensity
        });

        const validation = validateCommand(command, deviceId);
        if (!validation.valid) {
            logError('CommandService', 'Команда не прошла валидацию', {
                deviceId, command, intensity, errors: validation.errors
            });
            return {
                success: false,
                message: 'Команда не прошла валидацию',
                errors: validation.errors,
                status: 422
            };
        }

        // ДЕМО-РЕЖИМ
        if (ApiUtils.isDebugMode()) {
            await ApiUtils.delay(300);
            const response = ApiUtils.getFakeResponse(true, 'Команда отправлена (демо)', {
                deviceId,
                command,
                intensity,
                timestamp: new Date().toISOString()
            });
            this.saveCommandHistory(deviceId, command, intensity, response);
            return response;
        }

        try {
            const response = await this.resource.sendCommand(deviceId, command, intensity);
            ApiUtils.logApiResponse('POST', `/api/smart-light/devices/${deviceId}/command`, response, requestId);
            this.saveCommandHistory(deviceId, command, intensity, response);
            return {
                success: true,
                message: 'Команда успешно отправлена',
                data: response.data
            };
        } catch (error) {
            ApiUtils.logApiError('POST', `/api/smart-light/devices/${deviceId}/command`, error, requestId);
            const errorData = ApiUtils.handleApiError(error, 'CommandService.sendCommand');
            logError('CommandService', 'Ошибка отправки команды', error);
            return errorData;
        }
    }

    saveCommandHistory(deviceId, command, intensity, response) {
        logDebug('CommandService', 'Сохранение истории команд', { deviceId, command, intensity });
        const history = this.commandHistory.get(deviceId) || [];
        history.unshift({
            deviceId, command, intensity, response,
            timestamp: new Date().toISOString()
        });
        this.commandHistory.set(deviceId, history.slice(0, 100));
    }

    getCommandHistory(deviceId) {
        logDebug('CommandService', 'Получение истории команд', { deviceId });
        return this.commandHistory.get(deviceId) || [];
    }

    async forceSleep(deviceId) {
        logDebug('CommandService', 'Отправка команды перевода в спящий режим', { deviceId });
        try {
            const response = await this.resource.forceSleep(deviceId);
            this.saveCommandHistory(deviceId, 'EMERGENCY_SLEEP', 0, response);
            return {
                success: true,
                message: 'Команда перевода в сон успешно отправлена',
                data: response.data
            };
        } catch (error) {
            logError('CommandService', 'Ошибка отправки команды перевода в сон', error);
            return {
                success: false,
                message: 'Ошибка перевода в сон',
                error: error.message,
                status: error.status || 500
            };
        }
    }

    async wakeDevice(deviceId) {
        logDebug('CommandService', 'Отправка команды пробуждения', { deviceId });
        try {
            const response = await this.resource.wakeDevice(deviceId);
            this.saveCommandHistory(deviceId, 'WAKE_UP', 100, response);
            return {
                success: true,
                message: 'Команда пробуждения успешно отправлена',
                data: response.data
            };
        } catch (error) {
            logError('CommandService', 'Ошибка отправки команды пробуждения', error);
            return {
                success: false,
                message: 'Ошибка пробуждения',
                error: error.message,
                status: error.status || 500
            };
        }
    }

    async sendStatusCommand(deviceId, status, intensity = 100) {
        logDebug('CommandService', 'Отправка команды статуса', { deviceId, status, intensity });
        const command = status === 'SLEEPING' ? 'EMERGENCY_SLEEP' : status;
        return this.sendCommand(deviceId, command, intensity);
    }

    getLastCommand(deviceId) {
        logDebug('CommandService', 'Получение последней команды', { deviceId });
        const history = this.getCommandHistory(deviceId);
        return history.length > 0 ? history[0] : null;
    }

    async cancelLastCommand(deviceId) {
        logDebug('CommandService', 'Отмена последней команды', { deviceId });
        const lastCommand = this.getLastCommand(deviceId);
        if (!lastCommand) {
            return { success: false, message: 'Нет команд для отмены' };
        }
        try {
            const response = await this.resource.cancelCommand(deviceId, lastCommand.command);
            const history = this.getCommandHistory(deviceId);
            history.shift();
            this.commandHistory.set(deviceId, history);
            return {
                success: true,
                message: 'Последняя команда отменена',
                data: response.data
            };
        } catch (error) {
            logError('CommandService', 'Ошибка отмены команды', error);
            return {
                success: false,
                message: 'Не удалось отменить команду',
                error: error.message,
                status: error.status || 500
            };
        }
    }
}

export default CommandService;
