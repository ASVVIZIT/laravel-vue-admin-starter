import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useDeviceStore } from '@/components/SmartLight/stores';
import {
    getDevice,
    calculateMinVoltage,
    calculateMaxVoltage,
    calculateCriticalVoltage,
    calculateCriticalThresholdPosition,
    calculateBatteryNormalProgress,
    calculateBatteryCriticalProgress,
    calculateCurrentLevelPosition,
    calculateBatteryColor,
    calculateCriticalColor,
    calculateDeviceRuntime,
    calculateSafeIntensityRange
} from '@/components/SmartLight/utils/deviceUtils';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';

/**
 * Композабл для панели отладки
 * @param {string} deviceId - ID устройства
 */
export const useDebugPanel = (deviceId) => {
    const deviceStore = useDeviceStore();
    const loading = ref(false);
    const error = ref(null);
    const deviceStatus = ref('OFF');
    const deviceVoltage = ref(3.7);
    const deviceIntensity = ref(100);
    const criticalVoltage = ref(3.0);
    const show3D = ref(false);

    // Получаем устройство
    const device = computed(() => {
        return deviceStore.computed.selectedDevice || deviceStore.actions.getDevice(deviceId);
    });

    // Вычисляемые свойства
    const minVoltage = computed(() => {
        return calculateMinVoltage(deviceId);
    });

    const maxVoltage = computed(() => {
        return calculateMaxVoltage(deviceId);
    });

    const batteryTypeName = computed(() => {
        if (!device.value) return 'Нормальный режим';
        const batteryType = getBatteryType(device.value.battery_type_id);
        return batteryType.name;
    });

    const formattedMinVoltage = computed(() => {
        return minVoltage.value.toFixed(1);
    });

    const formattedMaxVoltage = computed(() => {
        return maxVoltage.value.toFixed(1);
    });

    const formattedCriticalThreshold = computed(() => {
        return calculateCriticalVoltage(deviceId).toFixed(2);
    });

    const formattedVoltage = computed(() => {
        return device.value ? `${device.value.voltage.toFixed(2)} В` : 'N/A';
    });

    // Вычисляем тип статуса для тега
    const statusType = computed(() => {
        switch (deviceStatus.value) {
            case 'ON': return 'success';
            case 'OFF': return 'info';
            case 'SLEEPING': return 'warning';
            default: return 'info';
        }
    });

    const batteryNormalProgress = computed(() => {
        return device.value ? calculateBatteryNormalProgress(device.value) : 0;
    });

    const batteryCriticalProgress = computed(() => {
        return device.value ? calculateBatteryCriticalProgress(device.value) : 0;
    });

    const criticalThresholdPosition = computed(() => {
        return device.value ? calculateCriticalThresholdPosition(device.value) : 0;
    });

    const currentLevelPosition = computed(() => {
        return device.value ? calculateCurrentLevelPosition(device.value) : 0;
    });

    const batteryColor = computed(() => {
        return device.value ? calculateBatteryColor(device.value) : '#67c23a';
    });

    const criticalColor = computed(() => {
        return device.value ? calculateCriticalColor(device.value) : '#ffcccb';
    });

    const deviceRuntime = computed(() => {
        return device.value ? calculateDeviceRuntime(device.value) : 'N/A';
    });

    const safeIntensityRange = computed(() => {
        return device.value ? calculateSafeIntensityRange(device.value) : { min: 0, max: 100 };
    });

    /**
     * Форматирование тултипа напряжения
     */
    const formatVoltageTooltip = (value) => {
        return `${value.toFixed(2)} В`;
    };

    /**
     * Обновление статуса
     */
    const updateStatus = async (value) => {
        logDebug('DebugPanel', 'Обновление статуса', { deviceId, value });

        try {
            loading.value = true;
            error.value = null;

            const result = await deviceStore.actions.updateDeviceStatus(deviceId, value);

            if (result.success) {
                deviceStatus.value = value;
                return {
                    success: true,
                    message: 'Статус изменен'
                };
            } else {
                throw new Error(result.message || 'Ошибка обновления статуса');
            }
        } catch (err) {
            error.value = 'Не удалось обновить статус';
            logError('DebugPanel', 'Ошибка обновления статуса', err);
            console.error('Ошибка обновления статуса:', err);

            return {
                success: false,
                message: 'Ошибка обновления статуса',
                error: err.message
            };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Перевод в спящий режим
     */
    const sendEmergencySleep = async () => {
        logDebug('DebugPanel', 'Перевод в спящий режим', { deviceId });

        try {
            loading.value = true;
            error.value = null;

            const result = await deviceStore.actions.forceSleep(deviceId);

            if (result.success) {
                deviceStatus.value = 'SLEEPING';
                return {
                    success: true,
                    message: 'Устройство переведено в спящий режим'
                };
            } else {
                throw new Error(result.message || 'Ошибка перевода в сон');
            }
        } catch (err) {
            error.value = 'Не удалось перевести устройство в сон';
            logError('DebugPanel', 'Ошибка перевода в сон', err);
            console.error('Ошибка перевода в сон:', err);

            return {
                success: false,
                message: 'Ошибка перевода в сон',
                error: err.message
            };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Пробуждение устройства
     */
    const wakeDevice = async () => {
        logDebug('DebugPanel', 'Пробуждение устройства', { deviceId });

        try {
            loading.value = true;
            error.value = null;

            const result = await deviceStore.actions.wakeDevice(deviceId);

            if (result.success) {
                deviceStatus.value = 'ON';
                deviceVoltage.value = 3.7;
                deviceIntensity.value = 100;
                return {
                    success: true,
                    message: 'Устройство пробуждено'
                };
            } else {
                throw new Error(result.message || 'Ошибка пробуждения');
            }
        } catch (err) {
            error.value = 'Не удалось пробудить устройство';
            logError('DebugPanel', 'Ошибка пробуждения', err);
            console.error('Ошибка пробуждения:', err);

            return {
                success: false,
                message: 'Ошибка пробуждения',
                error: err.message
            };
        } finally {
            loading.value = false;
        }
    };

    /**
     * Эмуляция низкого напряжения
     */
    const simulateLowVoltage = () => {
        logDebug('DebugPanel', 'Эмуляция низкого напряжения', { deviceId });

        if (!device.value?.is_fake) return;

        deviceVoltage.value = Math.max(minVoltage.value, deviceVoltage.value - 0.2);
        criticalVoltage.value = Math.min(deviceVoltage.value + 0.2, criticalVoltage.value);

        if (deviceVoltage.value <= criticalVoltage.value) {
            sendEmergencySleep();
        }
    };

    /**
     * Эмуляция аварийного события
     */
    const simulateEmergency = () => {
        logDebug('DebugPanel', 'Эмуляция аварийного события', { deviceId });

        if (!device.value?.is_fake) return;

        deviceVoltage.value = minVoltage.value + 0.1;
        criticalVoltage.value = deviceVoltage.value + 0.1;
        sendEmergencySleep();
    };

    /**
     * Эмуляция отправки команды
     */
    const simulateCommand = () => {
        logDebug('DebugPanel', 'Эмуляция отправки команды', { deviceId });

        if (!device.value?.is_fake) return;

        const newStatus = deviceStatus.value === 'ON' ? 'OFF' : 'ON';
        const newVoltage = newStatus === 'ON'
            ? Math.min(maxVoltage.value, deviceVoltage.value + 0.05)
            : Math.max(minVoltage.value, deviceVoltage.value - 0.05);

        deviceStatus.value = newStatus;
        deviceVoltage.value = newVoltage;
        deviceIntensity.value = newStatus === 'ON' ? 100 : 0;
    };

    /**
     * Открытие настроек
     */
    const openDeviceSettings = () => {
        logDebug('DebugPanel', 'Открытие настроек', { deviceId });
        // Здесь будет логика открытия настроек
    };

    /**
     * Принудительная инициализация 3D
     */
    const forceInit3D = () => {
        logDebug('DebugPanel', 'Принудительная инициализация 3D', { deviceId });

        // Ищем контейнер
        const deviceCard = document.querySelector(`[data-device-id="${deviceId}"]`);
        if (deviceCard && typeof deviceCard.forceInit === 'function') {
            deviceCard.forceInit();
        }
    };

    /**
     * Проверка видимости контейнера
     */
    const checkVisibility = () => {
        const container = document.querySelector(`[data-device-id="${deviceId}"]`);
        if (!container) return false;

        const rect = container.getBoundingClientRect();
        const style = getComputedStyle(container);

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.bottom > 0 &&
            rect.top < window.innerHeight &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0'
        );
    };

    /**
     * Проверка активности вкладки
     */
    const isActiveTab = () => {
        const container = document.querySelector(`[data-device-id="${deviceId}"]`);
        if (!container) return true;

        const tabPane = container.closest('.el-tab-pane');
        if (tabPane) {
            return tabPane.classList.contains('is-active');
        }

        return true;
    };

    // Инициализация при монтировании
    onMounted(() => {
        logDebug('DebugPanel', 'Инициализация компонента', { deviceId });

        // Устанавливаем начальные значения
        if (device.value) {
            deviceStatus.value = device.value.status || 'OFF';
            deviceVoltage.value = device.value.voltage || 3.7;
            deviceIntensity.value = device.value.intensity || 100;
            criticalVoltage.value = device.value.critical_voltage || 3.0;
            show3D.value = deviceStore.actions.getDevice3DMode(deviceId);
        }
    });

    // Очистка при размонтировании
    onUnmounted(() => {
        logDebug('DebugPanel', 'Компонент размонтирован', { deviceId });
    });

    // Следим за изменением выбранного устройства
    watch(() => deviceStore.computed.selectedDevice, (newDevice, oldDevice) => {
        logDebug('DebugPanel', 'Выбранное устройство изменилось', {
            oldDeviceId: oldDevice ? oldDevice.device_id : null,
            newDeviceId: newDevice ? newDevice.device_id : null
        });

        if (newDevice && newDevice.device_id === deviceId) {
            deviceStatus.value = newDevice.status;
            deviceVoltage.value = newDevice.voltage;
            deviceIntensity.value = newDevice.intensity;
            criticalVoltage.value = newDevice.critical_voltage || 3.0;
            show3D.value = deviceStore.actions.getDevice3DMode(newDevice.device_id);
        }
    }, { immediate: true, deep: true });

    // Следим за изменением режима отображения
    watch(show3D, (newMode) => {
        logDebug('DebugPanel', 'Изменение режима отображения', {
            deviceId,
            newMode
        });

        deviceStore.actions.setDevice3DMode(deviceId, newMode);
    });

    // Следим за изменением напряжения
    watch(deviceVoltage, (newVoltage) => {
        if (!device.value?.is_fake) return;

        logDebug('DebugPanel', 'Изменение напряжения', {
            deviceId,
            voltage: newVoltage
        });

        deviceStore.actions.updateDeviceVoltage(deviceId, newVoltage);
    });

    // Следим за изменением критического напряжения
    watch(criticalVoltage, (newCriticalVoltage) => {
        if (!device.value?.is_fake) return;

        logDebug('DebugPanel', 'Изменение критического напряжения', {
            deviceId,
            criticalVoltage: newCriticalVoltage
        });

        deviceStore.actions.updateDeviceCriticalVoltage(deviceId, newCriticalVoltage);
    });

    // Следим за видимостью контейнера
    const visibilityCheckInterval = ref(null);
    const visibilityCheck = () => {
        if (checkVisibility() && isActiveTab()) {
            forceInit3D();
        }
    };

    onMounted(() => {
        visibilityCheckInterval.value = setInterval(visibilityCheck, 100);
    });

    onUnmounted(() => {
        if (visibilityCheckInterval.value) {
            clearInterval(visibilityCheckInterval.value);
            visibilityCheckInterval.value = null;
        }
    });

    return {
        // Состояние
        device,
        deviceStatus,
        deviceVoltage,
        deviceIntensity,
        criticalVoltage,
        show3D,

        // Вычисляемые свойства
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

        // Методы
        updateStatus,
        sendEmergencySleep,
        wakeDevice,
        simulateLowVoltage,
        simulateEmergency,
        simulateCommand,
        openDeviceSettings,
        forceInit3D,
        checkVisibility,
        formatVoltageTooltip
    };
};
