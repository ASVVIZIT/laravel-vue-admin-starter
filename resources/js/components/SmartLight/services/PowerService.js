import {
    calculateMinVoltage,
    calculateMaxVoltage,
    calculateCriticalVoltage,
    calculateCriticalThresholdPosition,
    calculateBatteryNormalProgress,
    calculateBatteryCriticalProgress,
    calculateCurrentLevelPosition,
    calculateBatteryColor,
    calculateCriticalColor,
    calculateDeviceRuntime
} from '@/components/SmartLight/utils/deviceUtils';
import { logDebug } from '@/components/SmartLight/api/utils/logger';
import { useSmartlightStore } from '@/components/SmartLight/stores';

export class PowerService {
    constructor() {
        this.deviceStore = useSmartlightStore();
    }

    /**
     * Рассчитывает время работы устройства
     */
    calculateRuntime(deviceId) {
        const device = this.deviceStore.actions.getDevice(deviceId);
        logDebug('PowerService', 'Расчет времени работы', {
            deviceId,
            device,
            runtime: calculateDeviceRuntime(device)
        });

        return calculateDeviceRuntime(device);
    }

    /**
     * Рассчитывает минимальное напряжение для устройства
     */
    calculateMinVoltage(deviceId) {
        logDebug('PowerService', 'Расчет минимального напряжения', {
            deviceId,
            minVoltage: calculateMinVoltage(deviceId)
        });

        return calculateMinVoltage(deviceId);
    }

    /**
     * Рассчитывает максимальное напряжение для устройства
     */
    calculateMaxVoltage(deviceId) {
        logDebug('PowerService', 'Расчет максимального напряжения', {
            deviceId,
            maxVoltage: calculateMaxVoltage(deviceId)
        });

        return calculateMaxVoltage(deviceId);
    }

    /**
     * Рассчитывает критическое напряжение для устройства
     */
    calculateCriticalVoltage(deviceId) {
        logDebug('PowerService', 'Расчет критического напряжения', {
            deviceId,
            criticalVoltage: calculateCriticalVoltage(deviceId)
        });

        return calculateCriticalVoltage(deviceId);
    }

    /**
     * Рассчитывает позицию критического порога в процентах
     */
    calculateCriticalThresholdPosition(device) {
        logDebug('PowerService', 'Расчет позиции критического порога', {
            deviceId: device?.device_id,
            position: calculateCriticalThresholdPosition(device)
        });

        return calculateCriticalThresholdPosition(device);
    }

    /**
     * Рассчитывает нормальный прогресс
     */
    calculateBatteryNormalProgress(device) {
        logDebug('PowerService', 'Расчет нормального прогресса', {
            deviceId: device?.device_id,
            progress: calculateBatteryNormalProgress(device)
        });

        return calculateBatteryNormalProgress(device);
    }

    /**
     * Рассчитывает критический прогресс
     */
    calculateBatteryCriticalProgress(device) {
        logDebug('PowerService', 'Расчет критического прогресса', {
            deviceId: device?.device_id,
            progress: calculateBatteryCriticalProgress(device)
        });

        return calculateBatteryCriticalProgress(device);
    }

    /**
     * Рассчитывает позицию текущего уровня
     */
    calculateCurrentLevelPosition(device) {
        logDebug('PowerService', 'Расчет позиции текущего уровня', {
            deviceId: device?.device_id,
            position: calculateCurrentLevelPosition(device)
        });

        return calculateCurrentLevelPosition(device);
    }

    /**
     * Рассчитывает цвет нормального уровня
     */
    getBatteryColor(deviceId) {
        const device = this.deviceStore.actions.getDevice(deviceId);
        logDebug('PowerService', 'Получение цвета нормального уровня', {
            deviceId,
            color: calculateBatteryColor(device)
        });

        return calculateBatteryColor(device);
    }

    /**
     * Рассчитывает цвет критического уровня
     */
    getCriticalColor(deviceId) {
        const device = this.deviceStore.actions.getDevice(deviceId);
        logDebug('PowerService', 'Получение цвета критического уровня', {
            deviceId,
            color: calculateCriticalColor(device)
        });

        return calculateCriticalColor(device);
    }

    /**
     * Рассчитывает безопасный диапазон интенсивности
     */
    calculateSafeIntensityRange(deviceId) {
        logDebug('PowerService', 'Расчет безопасного диапазона интенсивности', { deviceId });

        return {
            min: 0,
            max: 100
        };
    }

    /**
     * Рассчитывает параметры питания с учетом группировки
     */
    calculatePowerParameters(device) {
        if (!device) {
            logDebug('PowerService', 'Устройство не найдено для расчета параметров питания');
            return null;
        }

        const minVoltage = calculateMinVoltage(device.device_id);
        const maxVoltage = calculateMaxVoltage(device.device_id);
        const criticalVoltage = calculateCriticalVoltage(device.device_id);

        logDebug('PowerService', 'Расчет параметров питания', {
            deviceId: device.device_id,
            minVoltage,
            maxVoltage,
            criticalVoltage,
            voltage: device.voltage,
            batteryGroupConfig: device.battery_group_config
        });

        return {
            minVoltage,
            maxVoltage,
            criticalVoltage,
            voltage: device.voltage,
            batteryGroupConfig: device.battery_group_config
        };
    }
}
