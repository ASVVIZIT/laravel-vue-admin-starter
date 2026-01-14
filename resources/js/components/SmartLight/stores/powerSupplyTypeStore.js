import { defineStore } from 'pinia';
import { TypesApi } from '@/components/SmartLight/api/smartLight/TypesApi.js';

export const usePowerSupplyTypeStore = defineStore('powerSupplyType', {
    state: () => ({
        powerSupplies: [],
        loading: false,
        error: null,
        initialized: true,
        selectedType: 'standard-5v'
    }),

    getters: {
        getPowerSupplyById: state => id => {
            return state.powerSupplies.find(supply => supply.id === id);
        },

        getPowerSupplyForDevice: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            return device ? state.powerSupplies.find(supply => supply.id === device.power_supply_id) : state.powerSupplies[0];
        },

        calculateEffectiveVoltage: state => (deviceId, batteryVoltage) => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            const supply = device ? state.powerSupplies.find(supply => supply.id === device.power_supply_id) : state.powerSupplies[0];

            if (!supply) return batteryVoltage;

            // Учитываем падение напряжения на соединениях
            const connectionLoss = 0.1;
            return Math.min(supply.maxVoltage, Math.max(supply.minVoltage, batteryVoltage - connectionLoss));
        },

        calculatePowerRipple: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            const supply = device ? state.powerSupplies.find(supply => supply.id === device.power_supply_id) : state.powerSupplies[0];
            return supply ? supply.ripple : 50;
        },

        getPowerSupplyGlowStyle: state => deviceId => {
            const supply = state.getPowerSupplyForDevice(deviceId);
            if (!supply) return {
                glowColor: '#409eff',
                glowIntensity: 0.6,
                connectionStyle: 'standard'
            };

            return {
                glowColor: supply.visualFeatures.glowColor,
                glowIntensity: supply.visualFeatures.glowIntensity,
                connectionStyle: supply.visualFeatures.connectionStyle
            };
        },

        getPowerSupplyConnectionStyle: state => deviceId => {
            const supply = state.getPowerSupplyForDevice(deviceId);
            if (!supply) return {
                color: '#409eff',
                thickness: 1.5
            };

            return {
                color: supply.visualFeatures.connectionColor,
                thickness: supply.visualFeatures.connectionThickness
            };
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
                    message: 'Источники питания инициализированы'
                };
            } catch (err) {
                this.error = err.message || 'Ошибка инициализации источников питания';
                return {
                    success: false,
                    message: 'Ошибка инициализации источников питания',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async fetchPowerSupplies() {
            this.loading = true;
            this.error = null;

            try {
                const response = await TypesApi.getPowerSupplies();

                if (response.success && Array.isArray(response.data)) {
                    this.powerSupplies = response.data;
                    this.initialized = true;
                    return {
                        success: true,
                        message: 'Источники питания загружены',
                        powerSupplies: this.powerSupplies
                    };
                } else {
                    throw new Error(response.message || 'Некорректный ответ от сервера');
                }
            } catch (err) {
                this.error = err.message || 'Ошибка загрузки источников питания';
                return {
                    success: false,
                    message: 'Ошибка загрузки источников питания',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        updatePowerSupplyForDevice(deviceId, supplyId) {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);

            if (device) {
                device.power_supply_id = supplyId;
            }
        },

        calculateVoltageWithRipple(deviceId, baseVoltage) {
            const supply = this.getPowerSupplyForDevice(deviceId);
            if (!supply) return baseVoltage;

            // Рассчитываем пульсации
            const ripple = supply.ripple * 0.001;
            const randomRipple = (Math.random() * 2 - 1) * ripple;

            return baseVoltage + randomRipple;
        },

        async simulatePowerFluctuation(deviceId, duration = 2000) {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            const supply = this.getPowerSupplyForDevice(deviceId);

            if (!device || !supply) return;

            const originalVoltage = device.voltage;
            const steps = 20;
            const stepDuration = duration / steps;
            const stepVoltage = (supply.maxVoltage - supply.minVoltage) / steps;

            for (let i = 0; i <= steps; i++) {
                const voltage = originalVoltage + (i * stepVoltage / steps);
                smartLightStore.updateDeviceVoltage(deviceId, voltage);
                await new Promise(resolve => setTimeout(resolve, stepDuration));
            }

            // Восстанавливаем номинальное напряжение
            smartLightStore.updateDeviceVoltage(deviceId, supply.nominalVoltage);
        },

        async simulatePowerFailure(deviceId, duration = 2000) {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            const supply = this.getPowerSupplyForDevice(deviceId);

            if (!device || !supply) return;

            const originalVoltage = device.voltage;
            const steps = 30;
            const stepDuration = duration / steps;

            // Симулируем плавное снижение напряжения
            for (let i = 0; i < steps; i++) {
                const voltage = originalVoltage * (1 - i / steps);
                smartLightStore.updateDeviceVoltage(deviceId, voltage);
                await new Promise(resolve => setTimeout(resolve, stepDuration));
            }

            // Переводим в спящий режим
            smartLightStore.updateDeviceStatus(deviceId, 'SLEEPING');
        }
    }
});
