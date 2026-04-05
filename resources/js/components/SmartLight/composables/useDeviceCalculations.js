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
import { useDeviceStore, useTypesStore } from '@/components/SmartLight/stores/index.js';
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
import { calculateDeviceRuntime } from '@/components/SmartLight/utils/appPowerUtils.js';
import { logDebugUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

export function useDeviceCalculations(deviceId) {
    const deviceStore = useDeviceStore();
    const typesStore = useTypesStore();

    const device = ref(null);
    const batteryType = ref(null);

    const loadDevice = () => {
        if (!deviceId) return;
        const deviceData = deviceStore.getDeviceStore(deviceId);
        if (!deviceData) return;

        device.value = deviceData;
        batteryType.value = typesStore.getBatteryTypeByIdStore(deviceData.battery_type_id);

        logDebugUtils('DeviceCalculations', 'Device loaded for calculations', {
            deviceId,
            voltage: deviceData.voltage,
            batteryType: batteryType.value?.name
        });
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

    const deviceRuntime = computed(() => {
        if (!device.value || !batteryType.value) return 'N/A';
        return calculateDeviceRuntime(device.value, batteryType.value);
    });

    const formattedVoltage = computed(() =>
        device.value ? `${device.value.voltage.toFixed(2)} В` : 'N/A'
    );

    // ✅ РЕАКТИВНОСТЬ — ОБНОВЛЕНИЕ ПРИ ИЗМЕНЕНИИ STORE
    watch(() => deviceStore.getDeviceStore(deviceId), (newDevice) => {
        if (newDevice) {
            device.value = newDevice;
            batteryType.value = typesStore.getBatteryTypeByIdStore(newDevice.battery_type_id);
            logDebugUtils('DeviceCalculations', 'Device data updated', {
                deviceId,
                voltage: newDevice.voltage
            });
        }
    }, { deep: true, immediate: true });

    // Загрузка при инициализации
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
