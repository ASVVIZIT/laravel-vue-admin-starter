/**
 * ============================================================================
 * USE DEVICE CALCULATIONS — РАСЧЕТ ПАРАМЕТРОВ УСТРОЙСТВА
 * ============================================================================
 * 📁 Путь: composables/useDeviceCalculations.js
 * ✅ Реактивные вычисления для компонентов
 * ✅ Отвечает за: реактивные расчёты напряжения, прогресса, времени
 * ============================================================================
 */

import { computed, ref, watch } from 'vue';
import { useSmartlightStore } from '@/components/SmartLight/stores/index.js';
// ✅ ИСПРАВЛЕНО — appDeviceUtils (без calculateDeviceRuntime)
import {
    calculateMinVoltage,
    calculateMaxVoltage,
    calculateCriticalVoltage,
    calculateCriticalThresholdPosition,
    calculateBatteryNormalProgress,
    calculateBatteryCriticalProgress,
    calculateCurrentLevelPosition,
    calculateBatteryColor
} from '@/components/SmartLight/utils/appDeviceUtils.js';
// ✅ ИСПРАВЛЕНО — calculateDeviceRuntime из appPowerUtils
import { calculateDeviceRuntime } from '@/components/SmartLight/utils/appPowerUtils.js';
import { getBatteryTypeById } from '@/components/SmartLight/stores/smartlight/types/batteryTypes.js';
import { logDebug } from '@/components/SmartLight/utils/appLogger.js';

export function useDeviceCalculations(deviceId) {
    const store = useSmartlightStore();
    const device = ref(null);
    const batteryType = ref(null);

    const loadDevice = () => {
        if (!deviceId) return;
        const deviceData = store.deviceGetDevice(deviceId);
        if (!deviceData) return;
        device.value = deviceData;
        batteryType.value = getBatteryTypeById(deviceData.battery_type_id);
    };

    const minVoltage = computed(() =>
        device.value ? calculateMinVoltage(device.value) : 2.5
    );

    const maxVoltage = computed(() =>
        device.value ? calculateMaxVoltage(device.value) : 4.3
    );

    const criticalVoltage = computed(() =>
        device.value ? calculateCriticalVoltage(device.value) : 3.0
    );

    const criticalThresholdPosition = computed(() =>
        device.value ? calculateCriticalThresholdPosition(device.value) : 0
    );

    const batteryNormalProgress = computed(() =>
        device.value ? calculateBatteryNormalProgress(device.value) : 0
    );

    const batteryCriticalProgress = computed(() =>
        device.value ? calculateBatteryCriticalProgress(device.value) : 0
    );

    const currentLevelPosition = computed(() =>
        device.value ? calculateCurrentLevelPosition(device.value) : 0
    );

    const batteryColor = computed(() =>
        device.value ? calculateBatteryColor(device.value) : '#67c23a'
    );

    // ✅ ИСПРАВЛЕНО — передаём batteryType
    const deviceRuntime = computed(() => {
        if (!device.value || !batteryType.value) return 'N/A';
        return calculateDeviceRuntime(device.value, batteryType.value);
    });

    const formattedVoltage = computed(() =>
        device.value ? `${device.value.voltage.toFixed(2)} В` : 'N/A'
    );

    // ✅ РЕАКТИВНОСТЬ — ОБНОВЛЕНИЕ ПРИ ИЗМЕНЕНИИ STORE
    watch(() => store.deviceGetDevice(deviceId), (newDevice) => {
        if (newDevice) {
            device.value = newDevice;
            batteryType.value = getBatteryTypeById(newDevice.battery_type_id);
            logDebug('DeviceCalculations', 'Устройство обновлено', {
                deviceId,
                voltage: newDevice.voltage
            });
        }
    }, { deep: true, immediate: true });

    loadDevice();

    return {
        device,
        batteryType,
        minVoltage,
        maxVoltage,
        criticalVoltage,
        criticalThresholdPosition,
        batteryNormalProgress,
        batteryCriticalProgress,
        currentLevelPosition,
        batteryColor,
        deviceRuntime,
        formattedVoltage,
        loadDevice
    };
}

export default useDeviceCalculations;
