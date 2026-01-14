import { BATTERY_TYPES } from '@/components/SmartLight/stores/batteryTypes.js';
import { logger } from '@/components/SmartLight/api/utils/logger.js';
import { ApiUtils } from '@/components/SmartLight/api/utils/types.js';

export const BatteryTypeApi = {
    async getAll() {
        logger.debug('BatteryTypeApi.getAll called');
        try {
            await ApiUtils.delay(200);

            return {
                success: true,
                message: 'Типы аккумуляторов загружены',
                data: BATTERY_TYPES
            };
        } catch (error) {
            logger.error('BatteryTypeApi.getAll error', error);
            return {
                success: false,
                message: 'Ошибка загрузки типов аккумуляторов',
                error: error.message || 'Network error'
            };
        }
    },

    async getById(id) {
        logger.debug('BatteryTypeApi.getById called', { id });
        try {
            await ApiUtils.delay(100);

            const batteryType = BATTERY_TYPES.find(type => type.id === id);

            if (!batteryType) {
                throw new Error('Тип аккумулятора не найден');
            }

            return {
                success: true,
                message: 'Тип аккумулятора получен',
                data: batteryType
            };
        } catch (error) {
            logger.error('BatteryTypeApi.getById error', error);
            return {
                success: false,
                message: error.message || 'Ошибка загрузки типа аккумулятора',
                error: {
                    message: error.message || 'Not found',
                    code: 'BATTERY_TYPE_NOT_FOUND'
                }
            };
        }
    },

    async setDeviceType(deviceId, batteryTypeId, settings = {}) {
        logger.debug('BatteryTypeApi.setDeviceType called', { deviceId, batteryTypeId, settings });
        try {
            await ApiUtils.delay(150);

            const batteryType = BATTERY_TYPES.find(type => type.id === batteryTypeId);

            if (!batteryType) {
                return {
                    success: false,
                    message: 'Тип аккумулятора не найден',
                    error: {
                        message: 'Invalid battery type',
                        code: 'INVALID_BATTERY_TYPE'
                    }
                };
            }

            return {
                success: true,
                message: 'Тип аккумулятора установлен',
                data: {
                    battery_type_id: batteryTypeId,
                    settings: {
                        voltage: batteryType.nominalVoltage,
                        critical_voltage: batteryType.criticalVoltage,
                        capacity: batteryType.nominalCapacity,
                        ...settings
                    }
                }
            };
        } catch (error) {
            logger.error('BatteryTypeApi.setDeviceType error', error);
            return {
                success: false,
                message: 'Не удалось установить тип аккумулятора',
                error: {
                    message: error.message || 'Network error',
                    code: 'SET_DEVICE_TYPE_ERROR'
                }
            };
        }
    },

    async getBatteryTypeStatus(deviceId) {
        logger.debug('BatteryTypeApi.getBatteryTypeStatus called', { deviceId });
        try {
            await ApiUtils.delay(100);

            return {
                success: true,
                message: 'Статус типа аккумулятора получен',
                data: {
                    status: 'ON',
                    voltage: 3.7,
                    critical_voltage: 3.2
                }
            };
        } catch (error) {
            logger.error('BatteryTypeApi.getBatteryTypeStatus error', error);
            return {
                success: false,
                message: 'Не удалось получить статус типа аккумулятора',
                error: {
                    message: error.message || 'Network error',
                    code: 'GET_STATUS_ERROR'
                }
            };
        }
    },

    async simulateVoltageChange(deviceId, targetVoltage, duration = 2000) {
        logger.debug('BatteryTypeApi.simulateVoltageChange called', { deviceId, targetVoltage, duration });
        try {
            await ApiUtils.delay(duration / 2);

            return {
                success: true,
                message: 'Изменение напряжения симулировано',
                data: {
                    voltage: targetVoltage,
                    duration
                }
            };
        } catch (error) {
            logger.error('BatteryTypeApi.simulateVoltageChange error', error);
            return {
                success: false,
                message: 'Ошибка симуляции изменения напряжения',
                error: {
                    message: error.message || 'Network error',
                    code: 'SIMULATE_VOLTAGE_ERROR'
                }
            };
        }
    },

    async simulateDegradation(deviceId, cycles) {
        logger.debug('BatteryTypeApi.simulateDegradation called', { deviceId, cycles });
        try {
            await ApiUtils.delay(200);

            return {
                success: true,
                message: 'Деградация симулирована',
                data: {
                    cycles,
                    degradation: {
                        capacity: cycles * 0.0005,
                        voltage: cycles * 0.0001,
                        criticalVoltage: cycles * 0.00005
                    }
                }
            };
        } catch (error) {
            logger.error('BatteryTypeApi.simulateDegradation error', error);
            return {
                success: false,
                message: 'Ошибка симуляции деградации',
                error: {
                    message: error.message || 'Network error',
                    code: 'SIMULATE_DEGRADATION_ERROR'
                }
            };
        }
    },

    async simulateSelfDischarge(deviceId, duration = 2000) {
        logger.debug('BatteryTypeApi.simulateSelfDischarge called', { deviceId, duration });
        try {
            await ApiUtils.delay(duration);

            return {
                success: true,
                message: 'Саморазряд симулирован',
                data: {
                    voltageDrop: 0.1,
                    duration
                }
            };
        } catch (error) {
            logger.error('BatteryTypeApi.simulateSelfDischarge error', error);
            return {
                success: false,
                message: 'Ошибка симуляции саморазряда',
                error: {
                    message: error.message || 'Network error',
                    code: 'SIMULATE_SELF_DISCHARGE_ERROR'
                }
            };
        }
    },

    async simulateCriticalVoltage(deviceId) {
        logger.debug('BatteryTypeApi.simulateCriticalVoltage called', { deviceId });
        try {
            await ApiUtils.delay(250);

            return {
                success: true,
                message: 'Критическое напряжение симулировано',
                data: {
                    voltage: 2.8,
                    status: 'SLEEPING'
                }
            };
        } catch (error) {
            logger.error('BatteryTypeApi.simulateCriticalVoltage error', error);
            return {
                success: false,
                message: 'Ошибка симуляции критического напряжения',
                error: {
                    message: error.message || 'Network error',
                    code: 'SIMULATE_CRITICAL_VOLTAGE_ERROR'
                }
            };
        }
    },

    async simulateEmergencySleep(deviceId) {
        logger.debug('BatteryTypeApi.simulateEmergencySleep called', { deviceId });
        try {
            await ApiUtils.delay(300);

            return {
                success: true,
                message: 'Аварийный сон симулирован',
                data: {
                    status: 'SLEEPING',
                    voltage: 2.6
                }
            };
        } catch (error) {
            logger.error('BatteryTypeApi.simulateEmergencySleep error', error);
            return {
                success: false,
                message: 'Ошибка симуляции аварийного сна',
                error: {
                    message: error.message || 'Network error',
                    code: 'SIMULATE_EMERGENCY_SLEEP_ERROR'
                }
            };
        }
    },

    async getBatteryGroupStatus(deviceId) {
        logger.debug('BatteryTypeApi.getBatteryGroupStatus called', { deviceId });
        try {
            await ApiUtils.delay(150);

            return {
                success: true,
                message: 'Групповой статус получен',
                data: {
                    enabled: false,
                    type: 'series',
                    count: 1,
                    connections: []
                }
            };
        } catch (error) {
            logger.error('BatteryTypeApi.getBatteryGroupStatus error', error);
            return {
                success: false,
                message: 'Ошибка получения группового статуса',
                error: {
                    message: error.message || 'Network error',
                    code: 'GET_GROUP_STATUS_ERROR'
                }
            };
        }
    },

    async setBatteryGroup(deviceId, groupConfig) {
        logger.debug('BatteryTypeApi.setBatteryGroup called', { deviceId, groupConfig });
        try {
            await ApiUtils.delay(200);

            return {
                success: true,
                message: 'Групповая конфигурация установлена',
                data: groupConfig
            };
        } catch (error) {
            logger.error('BatteryTypeApi.setBatteryGroup error', error);
            return {
                success: false,
                message: 'Ошибка установки групповой конфигурации',
                error: {
                    message: error.message || 'Network error',
                    code: 'SET_GROUP_ERROR'
                }
            };
        }
    }
};
