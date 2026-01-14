import { defineStore } from 'pinia';
import { TypesApi } from '@/components/SmartLight/api/smartLight/TypesApi.js';

export const useBatteryTypeStore = defineStore('batteryType', {
    state: () => ({
        batteryTypes: [],
        loading: false,
        error: null,
        initialized: true,
        selectedType: 'li-ion-18650'
    }),

    getters: {
        getDeviceBatteryParams: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return null;

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            if (!batteryType) return null;

            return {
                ...batteryType,
                voltage: device.voltage,
                criticalVoltage: device.critical_voltage,
                capacity: device.capacity
            };
        },

        getBatteryStatus: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            return device?.status || 'OFF';
        },

        calculateGroupMinVoltage: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return 2.5;

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            if (!batteryType) return 2.5;

            const minVoltage = batteryType.minVoltage;

            if (device.battery_group_config?.enabled) {
                const { type, count } = device.battery_group_config;

                switch (type) {
                    case 'series':
                        return minVoltage * count;
                    case 'parallel':
                        return minVoltage;
                    case 'series_parallel':
                        return minVoltage * Math.ceil(count / 2);
                    default:
                        return minVoltage;
                }
            }

            return minVoltage;
        },

        calculateGroupMaxVoltage: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return 4.3;

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            if (!batteryType) return 4.3;

            const maxVoltage = batteryType.maxVoltage;

            if (device.battery_group_config?.enabled) {
                const { type, count } = device.battery_group_config;

                switch (type) {
                    case 'series':
                        return maxVoltage * count;
                    case 'parallel':
                        return maxVoltage;
                    case 'series_parallel':
                        return maxVoltage * Math.ceil(count / 2);
                    default:
                        return maxVoltage;
                }
            }

            return maxVoltage;
        },

        calculateGroupCriticalVoltage: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return 3.2;

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            if (!batteryType) return 3.2;

            const criticalVoltage = batteryType.criticalVoltage;

            if (device.battery_group_config?.enabled) {
                const { type, count } = device.battery_group_config;

                switch (type) {
                    case 'series':
                        return criticalVoltage * count;
                    case 'parallel':
                        return criticalVoltage;
                    case 'series_parallel':
                        return criticalVoltage * Math.ceil(count / 2);
                    default:
                        return criticalVoltage;
                }
            }

            return criticalVoltage;
        },

        getBatteryProgress: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return 0;

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            if (!batteryType) return 0;

            const minVoltage = state.calculateGroupMinVoltage(deviceId);
            const maxVoltage = state.calculateGroupMaxVoltage(deviceId);

            return Math.min(100, Math.max(0,
                ((device.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100
            ));
        },

        getCriticalProgress: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return 0;

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            if (!batteryType) return 0;

            const minVoltage = state.calculateGroupMinVoltage(deviceId);
            const criticalVoltage = state.calculateGroupCriticalVoltage(deviceId);

            if (device.voltage >= criticalVoltage) {
                return 0;
            }

            const criticalVoltageValue = criticalVoltage - device.voltage;
            const criticalVoltageRange = criticalVoltage - minVoltage;

            return Math.min(100, Math.max(0, (criticalVoltageValue / criticalVoltageRange) * 100));
        },

        getNormalProgress: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return 0;

            const criticalVoltage = state.calculateGroupCriticalVoltage(deviceId);
            const maxVoltage = state.calculateGroupMaxVoltage(deviceId);

            if (device.voltage <= criticalVoltage) {
                return 0;
            }

            const normalVoltage = device.voltage - criticalVoltage;
            const maxNormalVoltage = maxVoltage - criticalVoltage;

            return Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));
        },

        getBatteryColor: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return '#67c23a';

            const voltage = device.voltage;
            if (voltage < 2.7) return '#f56c6c';
            if (voltage < 3.0) return '#e6a23c';
            return '#67c23a';
        },

        getBatteryCriticalColor: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return '#ffcccb';

            const voltage = device.voltage;
            if (voltage < 2.7) return '#f56c6c';
            if (voltage < 3.0) return '#faa7a7';
            return '#ffcccb';
        },

        getBatteryFluidPattern: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255, 255, 255, 0.3) 3px, rgba(255, 255, 255, 0.3) 6px)';

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            return batteryType?.visualFeatures.liquidPattern ||
                'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255, 255, 255, 0.3) 3px, rgba(255, 255, 255, 0.3) 6px)';
        },

        getCriticalThresholdStyle: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return 'dashed';

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            return batteryType?.visualFeatures.criticalThresholdStyle || 'dashed';
        },

        getCurrentLevelStyle: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return 'solid';

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            return batteryType?.visualFeatures.currentLevelStyle || 'solid';
        },

        getBatteryGlowEffect: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return false;

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            return batteryType?.visualFeatures.glowEffect || false;
        },

        getBatteryGlowColor: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return '#ffd54f';

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            return batteryType?.visualFeatures.glowColor || '#ffd54f';
        },

        getBatteryGlowIntensity: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return 0.5;

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            return batteryType?.visualFeatures.glowIntensity || 0.5;
        },

        getBatteryGroupConfig: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            return device?.battery_group_config || {
                enabled: false,
                type: 'series',
                count: 1,
                connections: []
            };
        },

        calculateBatteryDegradation: state => (deviceId, cycles) => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return {
                capacity: 100,
                voltage: 100,
                criticalVoltage: 100
            };

            const batteryType = state.batteryTypes.find(type => type.id === device.battery_type_id);
            if (!batteryType) return {
                capacity: 100,
                voltage: 100,
                criticalVoltage: 100
            };

            const degradation = batteryType.degradation;
            const capacityLoss = degradation.capacityLossPerCycle * cycles;
            const voltageLoss = degradation.voltageLossPerCycle * cycles;
            const criticalVoltageDrift = degradation.criticalVoltageDrift * cycles;

            return {
                capacity: Math.max(0, 100 - capacityLoss),
                voltage: Math.max(0, 100 - voltageLoss),
                criticalVoltage: Math.max(0, 100 - criticalVoltageDrift)
            };
        },

        calculateSelfDischarge: state => (deviceId, hours, temperature) => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            const batteryType = state.batteryTypes.find(type => type.id === device?.battery_type_id);

            if (!device || !batteryType) return 0;

            const selfDischarge = batteryType.selfDischarge;
            const monthlyDischarge = selfDischarge.rate;
            const temperatureDelta = Math.max(0, temperature - 25);
            const temperatureDischarge = temperatureDelta * selfDischarge.temperatureFactor;
            const totalDischarge = monthlyDischarge + temperatureDischarge;

            // Рассчитываем разряд за заданное время (часы)
            const dischargeRate = totalDischarge / (30 * 24);
            return device.voltage * (1 - (dischargeRate * hours) / 100);
        }
    },

    actions: {
        async initialize() {
            this.loading = true;
            this.error = null;

            try {
                this.initialized = true;
                return {
                    success: true,
                    message: 'Типы аккумуляторов загружены'
                };
            } catch (err) {
                this.error = err.message || 'Ошибка инициализации типов аккумуляторов';
                return {
                    success: false,
                    message: 'Ошибка инициализации типов аккумуляторов',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async fetchBatteryTypes() {
            this.loading = true;
            this.error = null;

            try {
                const response = await TypesApi.getBatteryTypes();

                if (response.success && Array.isArray(response.data)) {
                    this.batteryTypes = response.data;
                    this.initialized = true;
                    return {
                        success: true,
                        message: 'Типы аккумуляторов загружены',
                        batteryTypes: this.batteryTypes
                    };
                } else {
                    throw new Error(response.message || 'Некорректный ответ от сервера');
                }
            } catch (err) {
                this.error = err.message || 'Ошибка загрузки типов аккумуляторов';
                return {
                    success: false,
                    message: 'Ошибка загрузки типов аккумуляторов',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async getBatteryType(id) {
            if (this.batteryTypes.length === 0) {
                await this.fetchBatteryTypes();
            }

            return this.batteryTypes.find(type => type.id === id);
        },

        updateBatteryVisualization(deviceId) {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            const minVoltage = this.calculateGroupMinVoltage(deviceId);
            const maxVoltage = this.calculateGroupMaxVoltage(deviceId);
            const criticalVoltage = this.calculateGroupCriticalVoltage(deviceId);

            device.voltage = Math.min(maxVoltage, Math.max(minVoltage, device.voltage));

            if (device.voltage <= criticalVoltage && device.status !== 'SLEEPING') {
                smartLightStore.updateDeviceStatus(deviceId, 'SLEEPING');
            } else if (device.voltage > criticalVoltage && device.status === 'SLEEPING') {
                smartLightStore.updateDeviceStatus(deviceId, 'ON');
            }
        },

        updateDeviceBatteryAfterDegradation(deviceId, cycles) {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            const batteryType = this.batteryTypes.find(type => type.id === device.battery_type_id);
            if (!batteryType) return;

            const degradation = this.calculateBatteryDegradation(deviceId, cycles);

            // Обновляем характеристики устройства
            device.capacity = device.capacity * (degradation.capacity / 100);
            device.critical_voltage = device.critical_voltage * (degradation.criticalVoltage / 100);

            // Обновляем напряжение
            if (degradation.voltage < 100) {
                device.voltage = Math.max(
                    batteryType.minVoltage,
                    device.voltage * (degradation.voltage / 100)
                );
            }
        }
    }
});
