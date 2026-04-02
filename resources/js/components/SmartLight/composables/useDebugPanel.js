/**
 * ============================================================================
 * USE DEBUG PANEL — ПАНЕЛЬ ОТЛАДКИ
 * ============================================================================
 * 📁 Путь: composables/useDebugPanel.js
 * ✅ Используется: DebugPanel.vue, DeviceCard.vue
 * ✅ Интеграция: stores, deviceUtils, useContainer
 * ============================================================================
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useSmartlightStore } from '@/components/SmartLight/stores/index.js';
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
import { getBatteryTypeById } from '@/components/SmartLight/stores/smartlight/types/batteryTypes.js';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger.js';
import { useContainer } from './useContainer.js';

export const useDebugPanel = (deviceId, containerRef = null) => {
    const store = useSmartlightStore();
    const loading = ref(false);
    const error = ref(null);
    const deviceStatus = ref('OFF');
    const deviceVoltage = ref(3.7);
    const deviceIntensity = ref(100);
    const criticalVoltage = ref(3.0);
    const show3D = ref(false);
    const { isVisible, isActiveTab } = containerRef
        ? useContainer(containerRef)
        : { isVisible: ref(true), isActiveTab: ref(true) };

    const device = computed(() => store.deviceSelectedDevice || store.deviceGetDevice(deviceId));

    const batteryType = computed(() => {
        if (!device.value) return null;
        return getBatteryTypeById(device.value.battery_type_id);
    });

    const minVoltage = computed(() => {
        if (!device.value) return 2.5;
        return batteryType.value?.minVoltage || 2.5;
    });

    const maxVoltage = computed(() => {
        if (!device.value) return 4.3;
        return batteryType.value?.maxVoltage || 4.3;
    });

    const batteryTypeName = computed(() => {
        if (!device.value) return 'Нормальный режим';
        const batteryType = getBatteryTypeById(device.value.battery_type_id);
        return batteryType?.name || 'Неизвестно';
    });

    const formattedMinVoltage = computed(() => minVoltage.value.toFixed(1));
    const formattedMaxVoltage = computed(() => maxVoltage.value.toFixed(1));
    const formattedCriticalThreshold = computed(() => {
        if (!device.value) return '3.00';
        return calculateCriticalVoltage(device.value).toFixed(2);
    });

    const formattedVoltage = computed(() => device.value ? `${device.value.voltage.toFixed(2)} В` : 'N/A');

    const statusType = computed(() => {
        switch (deviceStatus.value) {
            case 'ON': return 'success';
            case 'OFF': return 'info';
            case 'SLEEPING': return 'warning';
            default: return 'info';
        }
    });

    const batteryNormalProgress = computed(() =>
        device.value ? calculateBatteryNormalProgress(device.value) : 0
    );

    const batteryCriticalProgress = computed(() =>
        device.value ? calculateBatteryCriticalProgress(device.value) : 0
    );

    const criticalThresholdPosition = computed(() =>
        device.value ? calculateCriticalThresholdPosition(device.value) : 0
    );

    const currentLevelPosition = computed(() =>
        device.value ? calculateCurrentLevelPosition(device.value) : 0
    );

    const batteryColor = computed(() =>
        device.value ? calculateBatteryColor(device.value) : '#67c23a'
    );

    // ✅ УДАЛЕНО: calculateCriticalColor не существует
    const criticalColor = computed(() => '#ffcccb');

    // ✅ ИСПРАВЛЕНО: передаём batteryType
    const deviceRuntime = computed(() => {
        if (!device.value || !batteryType.value) return 'N/A';
        return calculateDeviceRuntime(device.value, batteryType.value);
    });

    // ✅ УДАЛЕНО: calculateSafeIntensityRange не существует
    const safeIntensityRange = computed(() => ({ min: 0, max: 100 }));

    const formatVoltageTooltip = (value) => `${value.toFixed(2)} В`;

    // ✅ ИСПРАВЛЕНО: используем deviceUpdateDevice вместо deviceUpdateDeviceStatus
    const updateStatus = async (value) => {
        try {
            loading.value = true;
            error.value = null;

            const result = await store.deviceUpdateDevice(deviceId, {
                status: value
            });

            if (result) {
                deviceStatus.value = value;
                return { success: true, message: 'Статус изменен' };
            }

            throw new Error('Ошибка обновления статуса');
        } catch (err) {
            error.value = 'Не удалось обновить статус';
            logError('useDebugPanel', 'Ошибка обновления статуса', err);
            return {
                success: false,
                message: 'Ошибка обновления статуса',
                error: err.message
            };
        } finally {
            loading.value = false;
        }
    };

    const sendEmergencySleep = async () => {
        try {
            loading.value = true;
            error.value = null;
            const result = await store.deviceForceSleep(deviceId);
            if (result?.success) {
                deviceStatus.value = 'SLEEPING';
                return { success: true, message: 'Устройство переведено в спящий режим' };
            }
            throw new Error(result?.message || 'Ошибка перевода в сон');
        } catch (err) {
            error.value = 'Не удалось перевести устройство в сон';
            logError('useDebugPanel', 'Ошибка перевода в сон', err);
            return {
                success: false,
                message: 'Ошибка перевода в сон',
                error: err.message
            };
        } finally {
            loading.value = false;
        }
    };

    const wakeDevice = async () => {
        try {
            loading.value = true;
            error.value = null;
            const result = await store.deviceWakeDevice(deviceId);
            if (result?.success) {
                deviceStatus.value = 'ON';
                deviceVoltage.value = 3.7;
                deviceIntensity.value = 100;
                return { success: true, message: 'Устройство пробуждено' };
            }
            throw new Error(result?.message || 'Ошибка пробуждения');
        } catch (err) {
            error.value = 'Не удалось пробудить устройство';
            logError('useDebugPanel', 'Ошибка пробуждения', err);
            return {
                success: false,
                message: 'Ошибка пробуждения',
                error: err.message
            };
        } finally {
            loading.value = false;
        }
    };

    const simulateLowVoltage = () => {
        if (!device.value?.is_fake) return;
        deviceVoltage.value = Math.max(minVoltage.value, deviceVoltage.value - 0.2);
        criticalVoltage.value = Math.min(deviceVoltage.value + 0.2, criticalVoltage.value);
        if (deviceVoltage.value <= criticalVoltage.value) {
            sendEmergencySleep();
        }
    };

    const simulateEmergency = () => {
        if (!device.value?.is_fake) return;
        deviceVoltage.value = minVoltage.value + 0.1;
        criticalVoltage.value = deviceVoltage.value + 0.1;
        sendEmergencySleep();
    };

    const simulateCommand = () => {
        if (!device.value?.is_fake) return;
        const newStatus = deviceStatus.value === 'ON' ? 'OFF' : 'ON';
        const newVoltage = newStatus === 'ON'
            ? Math.min(maxVoltage.value, deviceVoltage.value + 0.05)
            : Math.max(minVoltage.value, deviceVoltage.value - 0.05);
        deviceStatus.value = newStatus;
        deviceVoltage.value = newVoltage;
        deviceIntensity.value = newStatus === 'ON' ? 100 : 0;
    };

    const forceInit3D = () => {
        const deviceCard = document.querySelector(`[data-device-id="${deviceId}"]`);
        if (deviceCard && typeof deviceCard.forceInit === 'function') {
            deviceCard.forceInit();
        }
    };

    onMounted(() => {
        if (device.value) {
            deviceStatus.value = device.value.status || 'OFF';
            deviceVoltage.value = device.value.voltage || 3.7;
            deviceIntensity.value = device.value.intensity || 100;
            criticalVoltage.value = device.value.critical_voltage || 3.0;
            show3D.value = store.deviceGetDevice3DMode(deviceId);
        }
    });

    onUnmounted(() => {
        logDebug('useDebugPanel', 'Компонент размонтирован', { deviceId });
    });

    watch(() => store.deviceSelectedDevice, (newDevice, oldDevice) => {
        if (newDevice && newDevice.device_id === deviceId) {
            deviceStatus.value = newDevice.status;
            deviceVoltage.value = newDevice.voltage;
            deviceIntensity.value = newDevice.intensity;
            criticalVoltage.value = newDevice.critical_voltage || 3.0;
            show3D.value = store.deviceGetDevice3DMode(newDevice.device_id);
        }
    }, { immediate: true, deep: true });

    watch(show3D, (newMode) => {
        store.deviceSetDevice3DMode(deviceId, newMode);
    });

    // ✅ ИСПРАВЛЕНО: используем deviceUpdateDevice вместо deviceUpdateDeviceVoltage
    watch(deviceVoltage, (newVoltage) => {
        if (!device.value?.is_fake) return;
        store.deviceUpdateDevice({
            ...device.value,
            voltage: newVoltage
        });
    });

    // ✅ ИСПРАВЛЕНО: используем deviceUpdateDevice вместо deviceUpdateDeviceCriticalVoltage
    watch(criticalVoltage, (newCriticalVoltage) => {
        if (!device.value?.is_fake) return;
        store.deviceUpdateDevice({
            ...device.value,
            critical_voltage: newCriticalVoltage
        });
    });

    return {
        device,
        deviceStatus,
        deviceVoltage,
        deviceIntensity,
        criticalVoltage,
        show3D,
        isVisible,
        isActiveTab,
        loading,
        error,
        minVoltage,
        maxVoltage,
        batteryNormalProgress,
        batteryCriticalProgress,
        criticalThresholdPosition,
        currentLevelPosition,
        batteryColor,
        criticalColor,
        deviceRuntime,
        batteryTypeName,
        formattedMinVoltage,
        formattedMaxVoltage,
        formattedCriticalThreshold,
        formattedVoltage,
        safeIntensityRange,
        statusType,
        updateStatus,
        sendEmergencySleep,
        wakeDevice,
        simulateLowVoltage,
        simulateEmergency,
        simulateCommand,
        forceInit3D,
        formatVoltageTooltip
    };
};

export default useDebugPanel;
