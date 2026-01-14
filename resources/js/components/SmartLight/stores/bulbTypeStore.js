import { defineStore } from 'pinia';
import { TypesApi } from '@/components/SmartLight/api/smartLight/TypesApi.js';

export const useBulbTypeStore = defineStore('bulbType', {
    state: () => ({
        bulbTypes: [],
        loading: false,
        error: null,
        initialized: true,
        selectedType: 'classic'
    }),

    getters: {
        getDeviceBulbParams: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return null;

            const bulbType = state.bulbTypes.find(type => type.id === device.bulb_type_id);
            if (!bulbType) return null;

            return {
                ...bulbType,
                status: device.status,
                intensity: device.intensity,
                colorTemperature: device.color_temperature || bulbType.colorTemperature,
                voltage: device.voltage
            };
        },

        getBulbStatus: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            return device?.status || 'OFF';
        },

        getBulbIntensity: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            return device?.intensity || 100;
        },

        getBulbColorTemperature: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            const bulbType = state.bulbTypes.find(type => type.id === device?.bulb_type_id);

            return device?.color_temperature || bulbType?.colorTemperature || 2700;
        },

        getBulbType: state => deviceId => {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            return device?.bulb_type_id || 'classic';
        },

        getSafeIntensityRange: state => deviceId => {
            const bulbType = state.bulbTypes.find(type => type.id === state.getDeviceBulbParams(deviceId)?.id);

            if (!bulbType) {
                return { min: 0, max: 100 };
            }

            return {
                min: bulbType.minIntensity,
                max: bulbType.maxIntensity
            };
        },

        getLightColor: state => deviceId => {
            const params = state.getDeviceBulbParams(deviceId);
            if (!params) return '#ffffcc';

            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return '#ffffcc';

            // Рассчитываем цвет в зависимости от цветовой температуры
            if (device.status === 'OFF') {
                return '#cccccc';
            } else if (device.status === 'SLEEPING') {
                return '#ff9800';
            } else {
                return state.kelvinToRGB(device.color_temperature || params.colorTemperature);
            }
        },

        kelvinToRGB: state => kelvin => {
            // Конвертация цветовой температуры Кельвина в RGB
            const temp = kelvin / 100;
            let r, g, b;

            // Красный
            if (temp <= 66) {
                r = 255;
            } else {
                r = temp - 60;
                r = 329.698727446 * Math.pow(r, -0.1332047592);
                r = Math.min(255, Math.max(0, r));
            }

            // Зеленый
            if (temp <= 66) {
                g = temp * 99.4708025861 / Math.log(temp) - 161.1195681664;
            } else {
                g = temp - 60;
                g = 288.1221695283 * Math.pow(g, -0.0755148492);
            }
            g = Math.min(255, Math.max(0, g));

            // Синий
            if (temp >= 66) {
                b = 255;
            } else if (temp <= 19) {
                b = 0;
            } else {
                b = temp - 10;
                b = 138.5177312231 * Math.log(b) - 305.0447927307;
                b = Math.min(255, Math.max(0, b));
            }

            // Конвертируем в шестнадцатеричный цвет
            const toHex = (value) => {
                const hex = Math.round(value).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };

            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        },

        getLightIntensity: state => deviceId => {
            const params = state.getDeviceBulbParams(deviceId);
            if (!params) return 1;

            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device || device.status === 'OFF') return 0;

            const intensity = device.status === 'SLEEPING' ?
                params.visualFeatures.light.intensity * 0.5 :
                params.visualFeatures.light.intensity;

            return intensity * (device.intensity / 100);
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
                    message: 'Типы лампочек загружены'
                };
            } catch (err) {
                this.error = err.message || 'Ошибка инициализации типов лампочек';
                return {
                    success: false,
                    message: 'Ошибка инициализации типов лампочек',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async fetchBulbTypes() {
            this.loading = true;
            this.error = null;

            try {
                const response = await TypesApi.getBulbTypes();

                if (response.success && Array.isArray(response.data)) {
                    this.bulbTypes = response.data;
                    this.initialized = true;
                    return {
                        success: true,
                        message: 'Типы лампочек загружены',
                        bulbTypes: this.bulbTypes
                    };
                } else {
                    throw new Error(response.message || 'Некорректный ответ от сервера');
                }
            } catch (err) {
                this.error = err.message || 'Ошибка загрузки типов лампочек';
                return {
                    success: false,
                    message: 'Ошибка загрузки типов лампочек',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async getBulbType(id) {
            if (this.bulbTypes.length === 0) {
                await this.fetchBulbTypes();
            }

            return this.bulbTypes.find(type => type.id === id);
        },

        async setDeviceBulbType(deviceId, bulbTypeId) {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);

            if (!device) {
                return {
                    success: false,
                    message: 'Устройство не найдено'
                };
            }

            const bulbType = this.bulbTypes.find(type => type.id === bulbTypeId);
            if (!bulbType) {
                return {
                    success: false,
                    message: 'Тип лампочки не найден'
                };
            }

            // Обновляем тип в устройстве
            device.bulb_type_id = bulbTypeId;

            // Обновляем параметры в соответствии с типом
            device.min_intensity = bulbType.minIntensity;
            device.max_intensity = bulbType.maxIntensity;
            device.color_temperature = bulbType.colorTemperature;

            return {
                success: true,
                message: `Тип лампочки изменен на ${bulbType.name}`,
                bulbType
            };
        },

        updateBulbVisualization(deviceId) {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            // Обновляем визуальные параметры
            const bulbType = this.bulbTypes.find(type => type.id === device.bulb_type_id);
            if (!bulbType) return;

            // Проверяем, не вышло ли устройство за пределы допустимых значений
            if (device.voltage < bulbType.minVoltage) {
                device.voltage = bulbType.minVoltage;
            } else if (device.voltage > bulbType.maxVoltage) {
                device.voltage = bulbType.maxVoltage;
            }

            // Обновляем статус, если напряжение критическое
            if (device.voltage <= device.critical_voltage && device.status !== 'SLEEPING') {
                smartLightStore.updateDeviceStatus(deviceId, 'SLEEPING');
            } else if (device.voltage > device.critical_voltage && device.status === 'SLEEPING') {
                smartLightStore.updateDeviceStatus(deviceId, 'ON');
            }

            // Ограничиваем интенсивность
            device.intensity = Math.min(
                Math.max(device.intensity, device.min_intensity || 0),
                device.max_intensity || 100
            );
        },

        applyColorTemperature(deviceId, kelvin) {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            const bulbType = this.bulbTypes.find(type => type.id === device.bulb_type_id);
            if (!bulbType) return;

            // Проверяем диапазон цветовой температуры
            const minTemp = bulbType.colorRange?.min || bulbType.colorTemperature;
            const maxTemp = bulbType.colorRange?.max || bulbType.colorTemperature;

            device.color_temperature = Math.min(
                maxTemp,
                Math.max(minTemp, kelvin)
            );
        },

        calculateLightParameters(deviceId) {
            const smartLightStore = useSmartLightStore();
            const device = smartLightStore.devices.find(d => d.device_id === deviceId);
            const bulbType = this.bulbTypes.find(type => type.id === device.bulb_type_id);

            if (!device || !bulbType) return null;

            return {
                color: this.getLightColor(deviceId),
                intensity: this.getLightIntensity(deviceId),
                temperature: device.color_temperature || bulbType.colorTemperature,
                efficiency: bulbType.lightEfficiency,
                distance: bulbType.visualFeatures.light.distance,
                decay: bulbType.visualFeatures.light.decay
            };
        }
    }
});
