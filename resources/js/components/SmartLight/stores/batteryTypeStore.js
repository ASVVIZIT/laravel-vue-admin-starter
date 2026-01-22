import { reactive, computed } from 'vue';
import { BATTERY_TYPES } from '@/components/SmartLight/stores/batteryTypes.js';
import { logDebug } from '@/components/SmartLight/api/utils/webglSupport.js';

// Создаем Store для типов аккумуляторов
const createBatteryTypeStore = () => {
    const store = reactive({
        batteryTypes: BATTERY_TYPES,

        getBatteryType(typeId) {
            const batteryType = BATTERY_TYPES.find(type => type.id === typeId);
            if (!batteryType) {
                logDebug('BatteryTypeStore', 'Тип аккумулятора не найден', { typeId });
                return BATTERY_TYPES[0]; // Возвращаем первый тип как резервный
            }
            return batteryType;
        },

        calculateGroupMinVoltage(deviceId, groupConfig = null) {
            logDebug('BatteryTypeStore', 'Вычисление минимального напряжения для группы', {
                deviceId,
                groupConfig
            });

            const device = store.getDevice(deviceId);
            if (!device) {
                logDebug('BatteryTypeStore', 'Устройство не найдено', { deviceId });
                return 2.5;
            }

            const batteryType = store.getBatteryType(device.battery_type_id);
            const count = groupConfig?.count || 1;

            // Если группировка не включена, возвращаем минимальное напряжение для одного аккумулятора
            if (!groupConfig?.enabled) {
                return batteryType.minVoltage;
            }

            // Вычисляем в зависимости от типа группировки
            if (groupConfig.type === 'series') {
                return batteryType.minVoltage * count;
            } else if (groupConfig.type === 'parallel') {
                return batteryType.minVoltage;
            } else if (groupConfig.type === 'series_parallel') {
                // Для последовательно-параллельной группировки
                const seriesCount = Math.ceil(count / 2);
                return batteryType.minVoltage * seriesCount;
            }

            return batteryType.minVoltage;
        },

        calculateGroupMaxVoltage(deviceId, groupConfig = null) {
            logDebug('BatteryTypeStore', 'Вычисление максимального напряжения для группы', {
                deviceId,
                groupConfig
            });

            const device = store.getDevice(deviceId);
            if (!device) {
                logDebug('BatteryTypeStore', 'Устройство не найдено', { deviceId });
                return 4.3;
            }

            const batteryType = store.getBatteryType(device.battery_type_id);
            const count = groupConfig?.count || 1;

            // Если группировка не включена, возвращаем максимальное напряжение для одного аккумулятора
            if (!groupConfig?.enabled) {
                return batteryType.maxVoltage;
            }

            // Вычисляем в зависимости от типа группировки
            if (groupConfig.type === 'series') {
                return batteryType.maxVoltage * count;
            } else if (groupConfig.type === 'parallel') {
                return batteryType.maxVoltage;
            } else if (groupConfig.type === 'series_parallel') {
                const seriesCount = Math.ceil(count / 2);
                return batteryType.maxVoltage * seriesCount;
            }

            return batteryType.maxVoltage;
        },

        calculateGroupCriticalVoltage(deviceId, groupConfig = null) {
            logDebug('BatteryTypeStore', 'Вычисление критического напряжения для группы', {
                deviceId,
                groupConfig
            });

            const device = store.getDevice(deviceId);
            if (!device) {
                logDebug('BatteryTypeStore', 'Устройство не найдено', { deviceId });
                return 3.0;
            }

            const batteryType = store.getBatteryType(device.battery_type_id);
            const count = groupConfig?.count || 1;

            // Если группировка не включена, возвращаем критическое напряжение для одного аккумулятора
            if (!groupConfig?.enabled) {
                return batteryType.criticalVoltage;
            }

            // Вычисляем в зависимости от типа группировки
            if (groupConfig.type === 'series') {
                return batteryType.criticalVoltage * count;
            } else if (groupConfig.type === 'parallel') {
                return batteryType.criticalVoltage;
            } else if (groupConfig.type === 'series_parallel') {
                const seriesCount = Math.ceil(count / 2);
                return batteryType.criticalVoltage * seriesCount;
            }

            return batteryType.criticalVoltage;
        },

        getBatteryColor(deviceId) {
            const device = store.getDevice(deviceId);
            if (!device) {
                logDebug('BatteryTypeStore', 'Устройство не найдено', { deviceId });
                return '#67c23a';
            }

            const batteryType = store.getBatteryType(device.battery_type_id);
            if (!batteryType) {
                logDebug('BatteryTypeStore', 'Тип аккумулятора не найден', { deviceId });
                return '#67c23a';
            }

            // Возвращаем цвет в зависимости от текущего напряжения
            const voltage = device.voltage;
            if (voltage < batteryType.criticalVoltage) {
                return batteryType.visualFeatures.criticalColor;
            } else {
                return batteryType.visualFeatures.liquidColor;
            }
        },

        getBatteryCriticalColor(deviceId) {
            const device = store.getDevice(deviceId);
            if (!device) {
                logDebug('BatteryTypeStore', 'Устройство не найдено', { deviceId });
                return '#f56c6c';
            }

            return store.getBatteryType(device.battery_type_id).visualFeatures.criticalColor;
        },

        getBatteryTypeConfig(deviceId) {
            const device = store.getDevice(deviceId);
            if (!device) {
                logDebug('BatteryTypeStore', 'Устройство не найдено', { deviceId });
                return store.batteryTypes[0];
            }

            return store.getBatteryType(device.battery_type_id);
        },

        getBatteryTypeVisualConfig(deviceId) {
            const device = store.getDevice(deviceId);
            if (!device) {
                logDebug('BatteryTypeStore', 'Устройство не найдено', { deviceId });
                return store.batteryTypes[0].visualFeatures;
            }

            return store.getBatteryType(device.battery_type_id).visualFeatures;
        },

        getBatteryGroupConfig(deviceId) {
            const device = store.getDevice(deviceId);
            if (!device) {
                logDebug('BatteryTypeStore', 'Устройство не найдено', { deviceId });
                return store.batteryTypes[0].groupSupport;
            }

            return store.getBatteryType(device.battery_type_id).groupSupport;
        }
    });

    return store;
};

// Экспортируем Store
export const useBatteryTypeStore = createBatteryTypeStore();
