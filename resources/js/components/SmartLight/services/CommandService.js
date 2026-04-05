/**
 * ============================================================================
 * COMMAND SERVICE — СЕРВИС ДЛЯ ОТПРАВКИ КОМАНД
 * ============================================================================
 * 📁 Путь: services/CommandService.js
 * ✅ Используется: DeviceController, CommandController
 * ✅ Рефакторинг: методы получили суффикс Service(), импорты обновлены на *Utils
 * ============================================================================
 */

import { CoreSmartLightResource } from '@/components/SmartLight/api/core/resource/coreSmartLightResource.js';
import { validateCommandUtils } from '@/components/SmartLight/utils/appValidatorsUtils.js';
import { CoreApiUtils } from '@/components/SmartLight/api/core/utils/coreApiUtils.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class CommandService {
    constructor() {
        this.resource = new CoreSmartLightResource();
        this.commandHistory = new Map();
    }

    async sendCommandService(deviceId, command, intensity = 100) {
        logDebugUtils('CommandService', 'Отправка команды', { deviceId, command, intensity });

        const requestId = CoreApiUtils.logApiRequest('POST', `/api/smart-light/devices/${deviceId}/command`, {
            command,
            intensity
        });

        const validation = validateCommandUtils(command, deviceId);
        if (!validation.valid) {
            logErrorUtils('CommandService', 'Команда не прошла валидацию', {
                deviceId, command, intensity, errors: validation.errors
            });
            return {
                success: false,
                message: 'Команда не прошла валидацию',
                errors: validation.errors,
                status: 422
            };
        }

        if (CoreApiUtils.isDebugMode()) {
            await CoreApiUtils.delay(300);
            const response = CoreApiUtils.getFakeResponse(true, 'Команда отправлена (демо)', {
                deviceId,
                command,
                intensity,
                timestamp: new Date().toISOString()
            });
            this.saveCommandHistoryService(deviceId, command, intensity, response);
            return response;
        }

        try {
            const response = await this.resource.sendCommandResource(deviceId, command, intensity);
            CoreApiUtils.logApiResponse('POST', `/api/smart-light/devices/${deviceId}/command`, response, requestId);
            this.saveCommandHistoryService(deviceId, command, intensity, response);
            return {
                success: true,
                message: 'Команда успешно отправлена',
                data: response.data
            };
        } catch (error) {
            CoreApiUtils.logApiError('POST', `/api/smart-light/devices/${deviceId}/command`, error, requestId);
            const errorData = CoreApiUtils.handleApiError(error, 'CommandService.sendCommandService');
            logErrorUtils('CommandService', 'Ошибка отправки команды', error);
            return errorData;
        }
    }

    saveCommandHistoryService(deviceId, command, intensity, response) {
        logDebugUtils('CommandService', 'Сохранение истории команд', { deviceId, command, intensity });
        const history = this.commandHistory.get(deviceId) || [];
        history.unshift({
            deviceId, command, intensity, response,
            timestamp: new Date().toISOString()
        });
        this.commandHistory.set(deviceId, history.slice(0, 100));
    }

    getCommandHistoryService(deviceId) {
        logDebugUtils('CommandService', 'Получение истории команд', { deviceId });
        return this.commandHistory.get(deviceId) || [];
    }

    async forceSleepService(deviceId) {
        logDebugUtils('CommandService', 'Отправка команды перевода в спящий режим', { deviceId });
        try {
            const response = await this.resource.forceSleepResource(deviceId);
            this.saveCommandHistoryService(deviceId, 'EMERGENCY_SLEEP', 0, response);
            return {
                success: true,
                message: 'Команда перевода в сон успешно отправлена',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('CommandService', 'Ошибка отправки команды перевода в сон', error);
            return {
                success: false,
                message: 'Ошибка перевода в сон',
                error: error.message,
                status: error.status || 500
            };
        }
    }

    async wakeDeviceService(deviceId) {
        logDebugUtils('CommandService', 'Отправка команды пробуждения', { deviceId });
        try {
            const response = await this.resource.wakeDeviceResource(deviceId);
            this.saveCommandHistoryService(deviceId, 'WAKE_UP', 100, response);
            return {
                success: true,
                message: 'Команда пробуждения успешно отправлена',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('CommandService', 'Ошибка отправки команды пробуждения', error);
            return {
                success: false,
                message: 'Ошибка пробуждения',
                error: error.message,
                status: error.status || 500
            };
        }
    }

    async sendStatusCommandService(deviceId, status, intensity = 100) {
        logDebugUtils('CommandService', 'Отправка команды статуса', { deviceId, status, intensity });
        const command = status === 'SLEEPING' ? 'EMERGENCY_SLEEP' : status;
        return this.sendCommandService(deviceId, command, intensity);
    }

    getLastCommandService(deviceId) {
        logDebugUtils('CommandService', 'Получение последней команды', { deviceId });
        const history = this.getCommandHistoryService(deviceId);
        return history.length > 0 ? history[0] : null;
    }

    async cancelLastCommandService(deviceId) {
        logDebugUtils('CommandService', 'Отмена последней команды', { deviceId });
        const lastCommand = this.getLastCommandService(deviceId);
        if (!lastCommand) {
            return { success: false, message: 'Нет команд для отмены' };
        }
        try {
            const response = await this.resource.cancelCommandResource(deviceId, lastCommand.command);
            const history = this.getCommandHistoryService(deviceId);
            history.shift();
            this.commandHistory.set(deviceId, history);
            return {
                success: true,
                message: 'Последняя команда отменена',
                data: response.data
            };
        } catch (error) {
            logErrorUtils('CommandService', 'Ошибка отмены команды', error);
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
