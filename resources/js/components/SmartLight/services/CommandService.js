import { SmartLightResource } from '@/components/SmartLight/api/core/SmartLightResource';
import { validateCommand } from '@/components/SmartLight/utils/validators';
import { logDebug, logError } from '@/components/SmartLight/api/utils/apilogger';

export class CommandService {
    constructor() {
        this.resource = new SmartLightResource();
        this.commandHistory = new Map();
    }

    /**
     * Отправка команды на устройство
     */
    async sendCommand(deviceId, command, intensity = 100) {
        logDebug('CommandService', 'Отправка команды', { deviceId, command, intensity });

        // Валидация команды
        const validation = validateCommand(command, deviceId);
        if (!validation.valid) {
            logError('CommandService', 'Команда не прошла валидацию', {
                deviceId,
                command,
                intensity,
                errors: validation.errors
            });

            return {
                success: false,
                message: 'Команда не прошла валидацию',
                errors: validation.errors,
                status: 422
            };
        }

        try {
            const response = await this.resource.sendCommand(deviceId, command, intensity);

            // Сохраняем историю команд
            this.saveCommandHistory(deviceId, command, intensity, response);

            return {
                success: true,
                message: 'Команда успешно отправлена',
                data: response.data
            };
        } catch (error) {
            logError('CommandService', 'Ошибка отправки команды', error);
            return {
                success: false,
                message: 'Ошибка отправки команды',
                error: error.message,
                status: error.status || 500
            };
        }
    }

    /**
     * Сохранение истории команд
     */
    saveCommandHistory(deviceId, command, intensity, response) {
        logDebug('CommandService', 'Сохранение истории команд', { deviceId, command, intensity });

        const history = this.commandHistory.get(deviceId) || [];
        history.unshift({
            deviceId,
            command,
            intensity,
            response,
            timestamp: new Date().toISOString()
        });

        // Ограничиваем историю 100 записями
        this.commandHistory.set(deviceId, history.slice(0, 100));
    }

    /**
     * Получение истории команд
     */
    getCommandHistory(deviceId) {
        logDebug('CommandService', 'Получение истории команд', { deviceId });
        return this.commandHistory.get(deviceId) || [];
    }

    /**
     * Отправка команды перевода в спящий режим
     */
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

    /**
     * Отправка команды пробуждения
     */
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

    /**
     * Отправка команды статуса
     */
    async sendStatusCommand(deviceId, status, intensity = 100) {
        logDebug('CommandService', 'Отправка команды статуса', {
            deviceId,
            status,
            intensity
        });

        // Определяем команду в зависимости от статуса
        const command = status === 'SLEEPING' ? 'EMERGENCY_SLEEP' : status;

        return this.sendCommand(deviceId, command, intensity);
    }

    /**
     * Отправка команды с подтверждением
     */
    async sendCommandWithConfirmation(deviceId, command, intensity = 100) {
        logDebug('CommandService', 'Отправка команды с подтверждением', {
            deviceId,
            command,
            intensity
        });

        // Валидация
        const validation = validateCommand(command, deviceId);
        if (!validation.valid) {
            logError('CommandService', 'Команда не прошла валидацию', {
                deviceId,
                command,
                intensity,
                errors: validation.errors
            });

            return {
                success: false,
                message: 'Команда не прошла валидацию',
                errors: validation.errors
            };
        }

        try {
            // Сначала отправляем команду
            const commandResponse = await this.sendCommand(deviceId, command, intensity);

            if (!commandResponse.success) {
                return commandResponse;
            }

            // Проверяем статус устройства после команды
            const statusCheck = await this.checkDeviceStatus(deviceId);

            if (statusCheck.success) {
                logDebug('CommandService', 'Команда подтверждена', {
                    deviceId,
                    command,
                    intensity,
                    status: statusCheck.data.status,
                    voltage: statusCheck.data.voltage
                });

                return {
                    success: true,
                    message: 'Команда успешно подтверждена',
                    data: commandResponse.data,
                    status: statusCheck.data.status
                };
            } else {
                logDebug('CommandService', 'Команда не подтверждена', {
                    deviceId,
                    command,
                    statusCheck
                });

                return {
                    success: true,
                    message: 'Команда отправлена, но статус не подтвержден',
                    data: commandResponse.data,
                    statusCheck
                };
            }
        } catch (error) {
            logError('CommandService', 'Ошибка отправки команды с подтверждением', error);
            return {
                success: false,
                message: 'Ошибка отправки команды',
                error: error.message,
                status: error.status || 500
            };
        }
    }

    /**
     * Проверка статуса устройства
     */
    async checkDeviceStatus(deviceId) {
        logDebug('CommandService', 'Проверка статуса устройства', { deviceId });

        try {
            const response = await this.resource.getDevice(deviceId);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            logError('CommandService', 'Ошибка проверки статуса устройства', error);
            return {
                success: false,
                error: error.message,
                status: error.status || 500
            };
        }
    }

    /**
     * Получение последней команды
     */
    getLastCommand(deviceId) {
        logDebug('CommandService', 'Получение последней команды', { deviceId });

        const history = this.getCommandHistory(deviceId);
        return history.length > 0 ? history[0] : null;
    }

    /**
     * Отмена последней команды
     */
    async cancelLastCommand(deviceId) {
        logDebug('CommandService', 'Отмена последней команды', { deviceId });

        const lastCommand = this.getLastCommand(deviceId);
        if (!lastCommand) {
            return {
                success: false,
                message: 'Нет команд для отмены'
            };
        }

        try {
            // Отправляем команду отмены
            const response = await this.resource.cancelCommand(deviceId, lastCommand.command);

            // Удаляем из истории
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
