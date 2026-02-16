import { computed, ref, watch } from 'vue';
import { useDeviceStore } from '@/components/SmartLight/stores';
import {
    calculateMinVoltage,
    calculateMaxVoltage,
    calculateCriticalVoltage,
    calculateCriticalThresholdPosition,
    calculateBatteryNormalProgress,
    calculateBatteryCriticalProgress,
    calculateCurrentLevelPosition,
    calculateBatteryColor,
    calculateCriticalColor
} from '@/components/SmartLight/utils/deviceUtils';
import { getBatteryTypeById } from '@/components/SmartLight/stores/smartlight/types/batteryTypes';
import { getBulbTypeById } from '@/components/SmartLight/stores/smartlight/types/bulbTypes';
import { calculateDeviceRuntime } from '@/components/SmartLight/utils/powerUtils';
import { logDebug } from '@/components/SmartLight/utils/appLogger';

/**
 * Композабл для расчета параметров устройства
 * @param {string} deviceId - ID устройства
 */
export function useDeviceCalculations(deviceId) {
    const deviceStore = useDeviceStore();
    const device = ref(null);
    const batteryType = ref(null);
    const bulbType = ref(null);
    const minVoltage = ref(2.5);
    const maxVoltage = ref(4.3);
    const criticalVoltage = ref(3.0);
    const batteryGroupInfo = ref({
        enabled: false,
        type: 'series',
        count: 1,
        totalCapacity: 3500
    });

    // Загрузка устройства
    const loadDevice = () => {
        if (!deviceId) {
            logDebug('DeviceCalculations', 'deviceId не указан', { deviceId });
            return;
        }

        const deviceData = deviceStore.actions.getDevice(deviceId);

        if (!deviceData) {
            logDebug('DeviceCalculations', 'Устройство не найдено', { deviceId });
            return;
        }

        // Сохраняем устройство и его типы
        device.value = deviceData;
        batteryType.value = getBatteryTypeById(deviceData.battery_type_id);
        bulbType.value = getBulbTypeById(deviceData.bulb_type_id);

        // Обновляем расчетные параметры
        updateCalculatedValues();

        logDebug('DeviceCalculations', 'Устройство загружено', {
            deviceId,
            device: deviceData,
            batteryType: batteryType.value,
            bulbType: bulbType.value
        });
    };

    // Обновление расчетных значений
    const updateCalculatedValues = () => {
        if (!device.value) return;

        minVoltage.value = calculateMinVoltage(deviceId);
        maxVoltage.value = calculateMaxVoltage(deviceId);
        criticalVoltage.value = calculateCriticalVoltage(deviceId);

        // Обновляем информацию о группировке
        if (device.value.battery_group_config?.enabled) {
            batteryGroupInfo.value = {
                enabled: true,
                type: device.value.battery_group_config.type,
                count: device.value.battery_group_config.count,
                connections: device.value.battery_group_config.connections,
                minVoltage: minVoltage.value,
                maxVoltage: maxVoltage.value,
                criticalVoltage: criticalVoltage.value,
                totalCapacity: device.value.capacity * device.value.battery_group_config.count
            };
        } else {
            batteryGroupInfo.value = {
                enabled: false,
                type: 'series',
                count: 1,
                connections: [],
                minVoltage: minVoltage.value,
                maxVoltage: maxVoltage.value,
                criticalVoltage: criticalVoltage.value,
                totalCapacity: device.value.capacity
            };
        }
    };

    // Вычисляемые свойства
    const criticalThresholdPosition = computed(() => {
        if (!device.value) return 0;

        return calculateCriticalThresholdPosition(device.value);
    });

    const batteryNormalProgress = computed(() => {
        if (!device.value) return 0;

        return calculateBatteryNormalProgress(device.value);
    });

    const batteryCriticalProgress = computed(() => {
        if (!device.value) return 0;

        return calculateBatteryCriticalProgress(device.value);
    });

    const currentLevelPosition = computed(() => {
        if (!device.value) return 0;

        return calculateCurrentLevelPosition(device.value);
    });

    const batteryColor = computed(() => {
        if (!device.value) return '#67c23a';

        return calculateBatteryColor(device.value);
    });

    const criticalColor = computed(() => {
        if (!device.value) return '#ffcccb';

        return calculateCriticalColor(device.value);
    });

    const deviceRuntime = computed(() => {
        if (!device.value) return 'N/A';

        return calculateDeviceRuntime(device.value);
    });

    const safeIntensityRange = computed(() => {
        if (!device.value) return { min: 0, max: 100 };

        return {
            min: bulbType.value?.minIntensity || 0,
            max: bulbType.value?.maxIntensity || 100
        };
    });

    const formattedMinVoltage = computed(() => {
        return Number(minVoltage.value).toFixed(2);
    });

    const formattedMaxVoltage = computed(() => {
        return Number(maxVoltage.value).toFixed(2);
    });

    const formattedCriticalThreshold = computed(() => {
        return Number(criticalVoltage.value).toFixed(2);
    });

    const formattedVoltage = computed(() => {
        return device.value ? `${device.value.voltage.toFixed(2)} В` : 'N/A';
    });

    const voltagePercentage = computed(() => {
        if (!device.value) return 0;

        return ((device.value.voltage - minVoltage.value) / (maxVoltage.value - minVoltage.value)) * 100;
    });

    const voltageStatus = computed(() => {
        if (!device.value) return 'normal';

        const voltage = device.value.voltage;
        const critical = criticalVoltage.value;

        if (voltage <= critical) {
            return 'critical';
        } else if (voltage <= critical + 0.2) {
            return 'warning';
        }

        return 'normal';
    });

    const voltageStatusColor = computed(() => {
        const status = voltageStatus.value;
        if (status === 'critical') return '#f56c6c';
        if (status === 'warning') return '#e6a23c';
        return '#67c23a';
    });

    const voltageStatusText = computed(() => {
        const status = voltageStatus.value;
        if (status === 'critical') return 'КРИТИЧЕСКИЙ УРОВЕНЬ';
        if (status === 'warning') return 'НИЗКИЙ ЗАРЯД';
        return 'НОРМАЛЬНЫЙ УРОВЕНЬ';
    });

    const chargeCyclesRemaining = computed(() => {
        if (!device.value || !batteryType.value) return 0;

        // Расчет оставшихся циклов с учетом износа
        const maxCycles = batteryType.value.chargeCycles;
        const usedCycles = device.value.chargeCycles;

        // Общий износ
        const totalDegradation = usedCycles * batteryType.value.degradation.capacityLossPerCycle;

        // Расчет оставшихся циклов до полного износа
        const cyclesUntilFailure = Math.max(0, maxCycles * (1 - totalDegradation));

        return Math.floor(cyclesUntilFailure);
    });

    const estimatedCapacity = computed(() => {
        if (!device.value || !batteryType.value) return 0;

        const currentVoltage = device.value.voltage;
        const minVoltage = batteryType.value.minVoltage;
        const maxVoltage = batteryType.value.maxVoltage;

        // Расчёт оставшейся ёмкости
        const remainingCapacity = device.value.capacity * ((currentVoltage - minVoltage) / (maxVoltage - minVoltage));
        return Math.max(0, Math.round(remainingCapacity));
    });

    const controllerRuntime = computed(() => {
        if (!device.value || !batteryType.value) return 0;

        const powerConfig = batteryType.value.powerManagement;
        const currentVoltage = device.value.voltage;
        const minControllerVoltage = powerConfig.minControllerVoltage;

        // Проверяем, может ли контроллер работать автономно
        if (currentVoltage <= minControllerVoltage) {
            return 0;
        }

        // Расчет времени автономной работы контроллера
        const voltageRange = powerConfig.minControllerVoltage * 1.1 - minControllerVoltage;
        const percentage = (currentVoltage - minControllerVoltage) / voltageRange;
        const hours = percentage * powerConfig.controllerRuntime / 3600;

        return hours;
    });

    const controllerRuntimeText = computed(() => {
        const hours = controllerRuntime.value;

        if (hours <= 0) return 'КРИТИЧЕСКИЙ РЕЖИМ';
        if (hours < 1) return `${Math.round(hours * 60)} мин`;
        if (hours < 24) return `${Math.round(hours)} ч`;

        const days = hours / 24;
        return `${days.toFixed(1)} дн`;
    });

    const controllerStatus = computed(() => {
        if (!device.value) return 'unknown';

        const hours = controllerRuntime.value;

        if (hours <= 0) return 'critical';
        if (hours < 1) return 'warning';
        if (hours < 4) return 'attention';

        return 'normal';
    });

    const controllerStatusColor = computed(() => {
        const status = controllerStatus.value;

        switch (status) {
            case 'critical': return '#f56c6c';
            case 'warning': return '#e6a23c';
            case 'attention': return '#e6a23c';
            default: return '#67c23a';
        }
    });

    const controllerStatusText = computed(() => {
        const status = controllerStatus.value;

        switch (status) {
            case 'critical': return 'КРИТИЧЕСКИЙ РЕЖИМ';
            case 'warning': return 'ОЧЕНЬ НИЗКИЙ ЗАРЯД';
            case 'attention': return 'НИЗКИЙ ЗАРЯД';
            default: return 'НОРМАЛЬНЫЙ РЕЖИМ';
        }
    });

    // Форматирование тултипа напряжения
    const formatVoltageTooltip = (value) => {
        return Number(value).toFixed(2) + ' В';
    };

    // Склонение слов
    const declineWord = (number, words) => {
        const num = Math.abs(number) % 100;
        const lastDigit = num % 10;

        if (num > 10 && num < 20) {
            return words[2];
        }

        if (lastDigit === 1) {
            return words[0];
        }

        if (lastDigit >= 2 && lastDigit <= 4) {
            return words[1];
        }

        return words[2];
    };

    // Инициализация при монтировании
    const init = () => {
        logDebug('DeviceCalculations', 'Инициализация расчетов', { deviceId });
        loadDevice();
    };

    // Обновление расчетов
    const updateCalculations = () => {
        logDebug('DeviceCalculations', 'Обновление расчетов', { deviceId });
        updateCalculatedValues();

        return {
            minVoltage: minVoltage.value,
            maxVoltage: maxVoltage.value,
            criticalVoltage: criticalVoltage.value,
            batteryNormalProgress: batteryNormalProgress.value,
            batteryCriticalProgress: batteryCriticalProgress.value,
            criticalThresholdPosition: criticalThresholdPosition.value,
            currentLevelPosition: currentLevelPosition.value,
            batteryColor: batteryColor.value,
            criticalColor: criticalColor.value,
            runtime: deviceRuntime.value,
            safeIntensityRange: safeIntensityRange.value,
            chargeCyclesRemaining: chargeCyclesRemaining.value,
            estimatedCapacity: estimatedCapacity.value,
            estimatedRuntime: deviceRuntime.value,
            controllerRuntime: controllerRuntime.value,
            batteryGroupInfo: batteryGroupInfo.value
        };
    };

    // Инициализация
    init();

    // Следим за изменениями в устройстве
    watch(() => device.value, (newDevice) => {
        if (newDevice) {
            updateCalculatedValues();
            logDebug('DeviceCalculations', 'Устройство обновлено', {
                deviceId,
                voltage: newDevice.voltage,
                status: newDevice.status
            });
        }
    }, { deep: true });

    return {
        // Устройство и его типы
        device,
        batteryType,
        bulbType,

        // Основные расчетные значения
        minVoltage,
        maxVoltage,
        criticalVoltage,
        criticalThresholdPosition,
        batteryNormalProgress,
        batteryCriticalProgress,
        currentLevelPosition,
        batteryColor,
        criticalColor,
        deviceRuntime,
        safeIntensityRange,

        // Дополнительные вычисления
        formattedMinVoltage,
        formattedMaxVoltage,
        formattedCriticalThreshold,
        formattedVoltage,
        voltagePercentage,
        voltageStatus,
        voltageStatusColor,
        voltageStatusText,
        chargeCyclesRemaining,
        estimatedCapacity,

        // Расчеты для контроллера
        controllerRuntime,
        controllerRuntimeText,
        controllerStatus,
        controllerStatusColor,
        controllerStatusText,

        // Расчеты для группировки аккумуляторов
        batteryGroupInfo,

        // Вспомогательные функции
        formatVoltageTooltip,
        declineWord,
        init,
        updateCalculations,
        loadDevice
    };
}
