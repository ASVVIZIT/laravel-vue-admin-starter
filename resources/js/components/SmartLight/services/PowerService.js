/**
 * ============================================================================
 * POWER SERVICE — СЕРВИС РАСЧЁТА ПОТРЕБЛЕНИЯ И ВРЕМЕНИ РАБОТЫ
 * ============================================================================
 * 📁 Путь: services/PowerService.js
 * ✅ Использует: ленивую инициализацию сторов (без циклических зависимостей)
 * ✅ Рефакторинг: методы получили суффикс Service(), импорты обновлены на *Utils
 * ============================================================================
 */

import {
    calculateBatteryColor,
    calculateBatteryCriticalProgress,
    calculateBatteryNormalProgress,
    calculateDeviceRuntime as calculateRuntimeUtil
} from '@/components/SmartLight/utils/appDeviceUtils.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/api/core/utils/coreApiLoggerUtils.js';

export class PowerService {
    constructor() {
        // ❗ Сторы не инициализируем здесь — только лениво в методах
    }

    /**
     * Ленивая инициализация сторов (предотвращает циклические зависимости)
     */
    async _getStoresService() {
        const { useDeviceStore, useTypesStore } = await import('@/components/SmartLight/stores/index.js');
        return {
            deviceStore: useDeviceStore(),
            typesStore: useTypesStore()
        };
    }

    async calculateRuntimeService(deviceId) {
        try {
            const { deviceStore, typesStore } = await this._getStoresService();

            logDebugUtils('PowerService', `Запрос времени работы для ${deviceId}`);

            const device = deviceStore.getDeviceStore(deviceId);
            if (!device) {
                logDebugUtils('PowerService', `Device ${deviceId} not found`);
                return { runtimeText: 'N/A', error: 'Device not found' };
            }

            const batteryType = typesStore.getBatteryTypeByIdStore(device.battery_type_id);
            if (!batteryType) {
                logDebugUtils('PowerService', `Battery type not found for device ${deviceId}`);
                return { runtimeText: 'N/A', error: 'Battery type not found' };
            }

            const baseConsumption = device.power_config?.base_consumption_mA || 50;
            const customConsumption = device.power_config?.custom_consumption_mA || 0;
            const intensityConsumption = Math.round((device.intensity || 0) * 2.5);

            let totalConsumption = baseConsumption;
            if (device.status === 'ON') {
                totalConsumption += intensityConsumption + customConsumption;
            } else if (device.status === 'SLEEPING') {
                totalConsumption = Math.round(baseConsumption * 0.3);
            }

            const minVoltage = batteryType.specs?.minVoltage || 2.5;
            const maxVoltage = batteryType.specs?.maxVoltage || 4.2;
            const voltageRatio = Math.min(1, Math.max(0, (device.voltage - minVoltage) / (maxVoltage - minVoltage)));
            const effectiveCapacity = (device.capacity || batteryType.specs?.capacity || 3500) * voltageRatio;

            let runtimeHours = 0;
            let runtimeText = '∞';

            if (totalConsumption > 0) {
                runtimeHours = effectiveCapacity / totalConsumption;
                if (runtimeHours >= 24) {
                    const days = Math.floor(runtimeHours / 24);
                    const hours = Math.round(runtimeHours % 24);
                    runtimeText = `${days}д ${hours}ч`;
                } else if (runtimeHours >= 1) {
                    runtimeText = `${Math.floor(runtimeHours)}ч ${Math.round((runtimeHours % 1) * 60)}м`;
                } else {
                    runtimeText = `${Math.round(runtimeHours * 60)}м`;
                }
            }

            logDebugUtils('PowerService', `Runtime calculated for ${deviceId}: ${runtimeText}`);

            return {
                runtimeText,
                runtimeHours: Math.round(runtimeHours * 10) / 10,
                effectiveCapacity: Math.round(effectiveCapacity),
                totalConsumption: Math.round(totalConsumption),
                voltageRatio: Math.round(voltageRatio * 100)
            };

        } catch (error) {
            logErrorUtils('PowerService', 'Ошибка расчета времени работы', error);
            return { runtimeText: 'N/A', error: error.message };
        }
    }

    getBatteryColorService(device) {
        if (!device || device.voltage === undefined) return '#909399';
        return calculateBatteryColor(device);
    }

    getBatteryProgressService(device) {
        if (!device || device.voltage === undefined) return 0;
        const normal = calculateBatteryNormalProgress(device) || 0;
        const critical = calculateBatteryCriticalProgress(device) || 0;
        return Math.min(100, normal + critical);
    }

    getDeviceStatusService(device) {
        if (!device) return { text: 'N/A', class: 'status--unknown', type: 'info' };

        const statusMap = {
            'ON': { text: 'Вкл', class: 'status--on', type: 'success' },
            'OFF': { text: 'Выкл', class: 'status--off', type: 'info' },
            'SLEEPING': { text: 'Сон', class: 'status--sleeping', type: 'warning' },
            'ERROR': { text: 'Ошб', class: 'status--error', type: 'danger' }
        };

        return statusMap[device.status] || { text: device.status || 'N/A', class: 'status--unknown', type: 'info' };
    }
}

export default PowerService;
