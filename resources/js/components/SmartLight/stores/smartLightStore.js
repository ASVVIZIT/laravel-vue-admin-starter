import { defineStore } from 'pinia';
import { SmartLightResource } from '@/components/SmartLight/api/core/SmartLightResource.js';

export const useSmartLightStore = defineStore('smartLight', {
    state: () => ({
        devices: [],
        selectedDevice: null,
        globalSettings: {
            global_server_url: '',
            default_critical_voltage: 3.2,
            default_sleep_interval: 600,
            default_emergency_sleep_interval: 3600,
            default_wifi_ssid: '',
            default_wifi_password: '',
            timezone: 'Europe/Moscow',
            log_level: 'info',
            telemetry_retention_days: 30,
            voltageWarningThreshold: 0.15,
            voltageCriticalThreshold: 0.10
        },
        loading: false,
        error: null,
        lastCommandTimestamp: 0,
        COMMAND_DEBOUNCE: 1000
    }),

    getters: {
        realDevices: state => state.devices.filter(device => !device.is_fake),
        fakeDevices: state => state.devices.filter(device => device.is_fake),
        hasFakeDevices: state => state.fakeDevices.length > 0,
        selectedDeviceId: state => state.selectedDevice ? state.selectedDevice.device_id : null,

        // Геттеры для работы с аккумулятором
        deviceBatteryProgress: state => deviceId => {
            const device = state.devices.find(d => d.device_id === deviceId);
            if (!device) return 0;

            const minVoltage = state.calculateGroupMinVoltage(deviceId);
            const maxVoltage = state.calculateGroupMaxVoltage(deviceId);

            return Math.min(100, Math.max(0,
                ((device.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100
            ));
        },

        deviceCriticalProgress: state => deviceId => {
            const device = state.devices.find(d => d.device_id === deviceId);
            if (!device) return 0;

            const minVoltage = state.calculateGroupMinVoltage(deviceId);
            const criticalVoltage = state.calculateGroupCriticalVoltage(deviceId);

            if (device.voltage >= criticalVoltage) {
                return 0;
            }

            const criticalVoltageValue = criticalVoltage - device.voltage;
            const criticalVoltageRange = criticalVoltage - minVoltage;

            return Math.min(100, Math.max(0, (criticalVoltageValue / criticalVoltageRange) * 100));
        },

        deviceNormalProgress: state => deviceId => {
            const device = state.devices.find(d => d.device_id === deviceId);
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

        deviceCurrentLevelPosition: state => deviceId => {
            const device = state.devices.find(d => d.device_id === deviceId);
            if (!device) return 0;

            const minVoltage = state.calculateGroupMinVoltage(deviceId);
            const maxVoltage = state.calculateGroupMaxVoltage(deviceId);

            return ((device.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
        },

        deviceCriticalThresholdPosition: state => deviceId => {
            const device = state.devices.find(d => d.device_id === deviceId);
            if (!device) return 0;

            const minVoltage = state.calculateGroupMinVoltage(deviceId);
            const maxVoltage = state.calculateGroupMaxVoltage(deviceId);
            const criticalVoltage = state.calculateGroupCriticalVoltage(deviceId);

            return ((criticalVoltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
        },

        deviceBatteryColor: state => deviceId => {
            const device = state.devices.find(d => d.device_id === deviceId);
            if (!device) return '#67c23a';

            const voltage = device.voltage;
            if (voltage < 2.7) return '#f56c6c';
            if (voltage < 3.0) return '#e6a23c';
            return '#67c23a';
        },

        deviceCriticalColor: state => deviceId => {
            const device = state.devices.find(d => d.device_id === deviceId);
            if (!device) return '#ffcccb';

            const voltage = device.voltage;
            if (voltage < 2.7) return '#f56c6c';
            if (voltage < 3.0) return '#faa7a7';
            return '#ffcccb';
        },

        deviceRuntime: state => deviceId => {
            const device = state.devices.find(d => d.device_id === deviceId);
            if (!device) return 'N/A';

            const minVoltage = state.calculateGroupMinVoltage(deviceId);
            const maxVoltage = state.calculateGroupMaxVoltage(deviceId);
            const voltage = device.voltage;

            if (voltage <= minVoltage) return 'КРИТ';

            const percentage = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
            const hours = Math.round(percentage * 10);

            if (hours < 1) return `${hours * 60} мин`;
            if (hours < 24) return `${hours} ч`;
            return `${Math.floor(hours / 24)}дн`;
        },

        deviceVoltageWarning: state => deviceId => {
            const device = state.devices.find(d => d.device_id === deviceId);
            if (!device) return false;

            const minVoltage = state.calculateGroupMinVoltage(deviceId);
            const maxVoltage = state.calculateGroupMaxVoltage(deviceId);
            const criticalVoltage = state.calculateGroupCriticalVoltage(deviceId);

            const voltage = device.voltage;
            const voltageRange = maxVoltage - minVoltage;
            const criticalLevel = criticalVoltage;
            const warningLevel = criticalLevel + (voltageRange * state.globalSettings.voltageWarningThreshold);

            return voltage <= warningLevel && voltage > minVoltage;
        },

        deviceVoltageCritical: state => deviceId => {
            const device = state.devices.find(d => d.device_id === deviceId);
            if (!device) return false;

            const criticalVoltage = state.calculateGroupCriticalVoltage(deviceId);
            return device.voltage <= criticalVoltage;
        },

        deviceSafeIntensityRange: state => deviceId => {
            const device = state.devices.find(d => d.device_id === deviceId);
            if (!device) return { min: 0, max: 100 };

            // Типы лампочек и их параметры
            const bulbTypes = {
                classic: { min: 0, max: 100 },
                led: { min: 10, max: 100 },
                halogen: { min: 20, max: 100 },
                smart_led: { min: 1, max: 100 }
            };

            const bulbType = device.bulb_type_id || 'classic';
            const typeParams = bulbTypes[bulbType] || bulbTypes.classic;

            return {
                min: typeParams.min,
                max: typeParams.max
            };
        }
    },

    actions: {
        selectDevice(deviceId) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (device) {
                this.selectedDevice = { ...device };
            }
        },

        updateDeviceVoltage(deviceId, voltage) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            // Определение минимального и максимального напряжения
            const minVoltage = this.calculateGroupMinVoltage(deviceId);
            const maxVoltage = this.calculateGroupMaxVoltage(deviceId);

            // Ограничиваем напряжение допустимым диапазоном
            const clampedVoltage = Math.min(maxVoltage, Math.max(minVoltage, voltage));

            // Обновляем напряжение
            device.voltage = clampedVoltage;

            // Проверяем переход в спящий режим
            const criticalVoltage = this.calculateGroupCriticalVoltage(deviceId);
            if (clampedVoltage <= criticalVoltage && device.status !== 'SLEEPING') {
                device.status = 'SLEEPING';
            } else if (clampedVoltage > criticalVoltage && device.status === 'SLEEPING') {
                device.status = 'ON';
            }
        },

        updateDeviceIntensity(deviceId, intensity) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            // Получаем безопасный диапазон для типа лампочки
            const safeIntensity = this.deviceSafeIntensityRange(deviceId);

            // Ограничиваем интенсивность допустимым диапазоном
            device.intensity = Math.min(
                safeIntensity.max,
                Math.max(safeIntensity.min, intensity)
            );
        },

        updateDeviceStatus(deviceId, status) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device || device.status === status) return;

            // Обновляем статус
            device.status = status;

            // Для фейковых устройств обновляем напряжение
            if (device.is_fake) {
                if (status === 'SLEEPING' && device.status !== 'SLEEPING') {
                    device.voltage = 2.9;
                } else if (status === 'ON' && device.status === 'SLEEPING') {
                    device.voltage = 3.7;
                    device.intensity = 100;
                }
            }
        },

        updateDeviceCriticalVoltage(deviceId, criticalVoltage) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            // Определение минимального и максимального напряжения
            const minVoltage = this.calculateGroupMinVoltage(deviceId);
            const maxVoltage = this.calculateGroupMaxVoltage(deviceId);

            // Ограничиваем критическое напряжение
            device.critical_voltage = Math.min(
                maxVoltage,
                Math.max(minVoltage, criticalVoltage)
            );
        },

        updateDeviceBatteryGroup(deviceId, groupConfig) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            // Определение типа аккумулятора
            const batteryTypes = {
                'li-ion-18650': {
                    maxInGroup: 10,
                    series: true,
                    parallel: true,
                    series_parallel: true
                },
                'li-ion-21700': {
                    maxInGroup: 8,
                    series: true,
                    parallel: true,
                    series_parallel: true
                },
                'li-po': {
                    maxInGroup: 6,
                    series: true,
                    parallel: true,
                    series_parallel: false
                },
                'lead-acid': {
                    maxInGroup: 4,
                    series: true,
                    parallel: true,
                    series_parallel: true
                }
            };

            const batteryType = device.battery_type_id || 'li-ion-18650';
            const typeConfig = batteryTypes[batteryType];

            // Проверка поддержки конфигурации
            if (!typeConfig || !typeConfig[groupConfig.type]) {
                console.error(`Конфигурация ${groupConfig.type} не поддерживается для типа ${batteryType}`);
                return {
                    success: false,
                    message: `Конфигурация ${groupConfig.type} не поддерживается`
                };
            }

            // Проверка максимального количества
            if (groupConfig.count > typeConfig.maxInGroup) {
                console.error(`Максимальное количество: ${typeConfig.maxInGroup}`);
                return {
                    success: false,
                    message: `Максимальное количество: ${typeConfig.maxInGroup}`
                };
            }

            // Обновляем конфигурацию
            device.battery_group_config = {
                ...groupConfig,
                enabled: true
            };

            // Обновляем параметры в соответствии с группировкой
            device.min_voltage = this.calculateGroupMinVoltage(deviceId);
            device.max_voltage = this.calculateGroupMaxVoltage(deviceId);
            device.critical_voltage = this.calculateGroupCriticalVoltage(deviceId);

            // Проверяем текущее напряжение
            if (device.voltage < device.min_voltage) {
                device.voltage = device.min_voltage;
            } else if (device.voltage > device.max_voltage) {
                device.voltage = device.max_voltage;
            }
        },

        updateDeviceBulbType(deviceId, bulbTypeId) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            device.bulb_type_id = bulbTypeId;

            // Обновляем параметры
            const bulbTypes = {
                classic: { minIntensity: 0, maxIntensity: 100 },
                led: { minIntensity: 10, maxIntensity: 100 },
                halogen: { minIntensity: 20, maxIntensity: 100 },
                smart_led: { minIntensity: 1, maxIntensity: 100 }
            };

            const bulbType = bulbTypes[bulbTypeId] || bulbTypes.classic;
            device.min_intensity = bulbType.minIntensity;
            device.max_intensity = bulbType.maxIntensity;

            // Корректируем интенсивность
            device.intensity = Math.min(
                device.max_intensity,
                Math.max(device.min_intensity, device.intensity)
            );
        },

        updateDeviceBatteryType(deviceId, batteryTypeId) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            device.battery_type_id = batteryTypeId;

            // Параметры для разных типов аккумуляторов
            const batteryTypes = {
                'li-ion-18650': {
                    nominalVoltage: 3.7,
                    criticalVoltage: 3.0,
                    minVoltage: 2.5,
                    maxVoltage: 4.2,
                    capacity: 3500
                },
                'li-ion-21700': {
                    nominalVoltage: 3.7,
                    criticalVoltage: 3.0,
                    minVoltage: 2.5,
                    maxVoltage: 4.2,
                    capacity: 5000
                },
                'li-po': {
                    nominalVoltage: 3.7,
                    criticalVoltage: 3.2,
                    minVoltage: 2.8,
                    maxVoltage: 4.35,
                    capacity: 2500
                },
                'lead-acid': {
                    nominalVoltage: 12.0,
                    criticalVoltage: 11.0,
                    minVoltage: 10.5,
                    maxVoltage: 14.4,
                    capacity: 50000
                }
            };

            const batteryType = batteryTypes[batteryTypeId] || batteryTypes['li-ion-18650'];

            device.voltage = batteryType.nominalVoltage;
            device.critical_voltage = batteryType.criticalVoltage;
            device.capacity = batteryType.capacity;
            device.min_voltage = batteryType.minVoltage;
            device.max_voltage = batteryType.maxVoltage;
        },

        calculateGroupMinVoltage(deviceId) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return 2.5;

            const batteryTypes = {
                'li-ion-18650': { minVoltage: 2.5 },
                'li-ion-21700': { minVoltage: 2.5 },
                'li-po': { minVoltage: 2.8 },
                'lead-acid': { minVoltage: 10.5 }
            };

            const batteryType = device.battery_type_id || 'li-ion-18650';
            const minVoltage = batteryTypes[batteryType].minVoltage;

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

        calculateGroupMaxVoltage(deviceId) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return 4.3;

            const batteryTypes = {
                'li-ion-18650': { maxVoltage: 4.2 },
                'li-ion-21700': { maxVoltage: 4.2 },
                'li-po': { maxVoltage: 4.35 },
                'lead-acid': { maxVoltage: 14.4 }
            };

            const batteryType = device.battery_type_id || 'li-ion-18650';
            const maxVoltage = batteryTypes[batteryType].maxVoltage;

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

        calculateGroupCriticalVoltage(deviceId) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return 3.2;

            const batteryTypes = {
                'li-ion-18650': { criticalVoltage: 3.0 },
                'li-ion-21700': { criticalVoltage: 3.0 },
                'li-po': { criticalVoltage: 3.2 },
                'lead-acid': { criticalVoltage: 11.0 }
            };

            const batteryType = device.battery_type_id || 'li-ion-18650';
            const criticalVoltage = batteryTypes[batteryType].criticalVoltage;

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

        async fetchDevices() {
            const now = Date.now();
            if (now - this.lastCommandTimestamp < this.COMMAND_DEBOUNCE) {
                return {
                    success: false,
                    message: 'Частые запросы',
                    error: 'Слишком частые запросы'
                };
            }

            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                const response = await resource.getDevices();

                if (!response.data) {
                    throw new Error('Invalid devices response structure');
                }

                // Создаем полный объект устройства
                this.devices = response.data.map(device => ({
                    ...device,
                    intensity: device.intensity || 100,
                    voltage: device.voltage || 3.7,
                    status: device.status || 'OFF',
                    battery_type_id: device.battery_type_id || 'li-ion-18650',
                    bulb_type_id: device.bulb_type_id || 'classic',
                    min_intensity: device.min_intensity || 0,
                    max_intensity: device.max_intensity || 100,
                    capacity: device.capacity || 3500,
                    chargeCycles: device.chargeCycles || 0,
                    battery_group_config: device.battery_group_config || {
                        enabled: false,
                        type: 'series',
                        count: 1,
                        connections: []
                    }
                }));

                // Обновляем выбранное устройство
                if (this.selectedDevice) {
                    const updatedDevice = this.devices.find(
                        d => d.device_id === this.selectedDevice.device_id
                    );
                    if (updatedDevice) {
                        this.selectedDevice = { ...updatedDevice };
                    }
                }

                this.lastCommandTimestamp = now;
                return {
                    success: true,
                    message: 'Устройства загружены',
                    devices: this.devices
                };
            } catch (err) {
                this.error = 'Не удалось загрузить устройства';
                return {
                    success: false,
                    message: 'Ошибка загрузки устройств',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async sendCommand(deviceId, status, intensity) {
            const now = Date.now();
            if (now - this.lastCommandTimestamp < this.COMMAND_DEBOUNCE) {
                return {
                    success: false,
                    message: 'Частые запросы',
                    error: 'Слишком частые запросы'
                };
            }

            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                if (this.devices.find(d => d.device_id === deviceId)?.is_fake) {
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Обновляем состояние в сторе
                    this.updateDeviceStatus(deviceId, status);
                    this.updateDeviceIntensity(deviceId, status === 'ON' ? 100 : 0);

                    // Для фейковых устройств обновляем напряжение
                    if (status === 'ON') {
                        this.updateDeviceVoltage(
                            deviceId,
                            Math.min(4.3, this.devices.find(d => d.device_id === deviceId)?.voltage + 0.05)
                        );
                    } else {
                        this.updateDeviceVoltage(
                            deviceId,
                            Math.max(2.5, this.devices.find(d => d.device_id === deviceId)?.voltage - 0.05)
                        );
                    }

                    this.lastCommandTimestamp = now;
                    return {
                        success: true,
                        message: `Команда "${status}" отправлена`,
                        data: {
                            status,
                                intensity,
                                voltage: this.devices.find(d => d.device_id === deviceId)?.voltage
                        }
                    };
                }

                const response = await resource.sendCommand(deviceId, status, intensity);

                if (response.success) {
                    this.lastCommandTimestamp = now;
                    return {
                        success: true,
                        message: 'Команда отправлена',
                        data: response.data
                    };
                } else {
                    throw new Error(response.message || 'Ошибка отправки команды');
                }
            } catch (err) {
                this.error = 'Не удалось отправить команду';
                return {
                    success: false,
                    message: 'Ошибка отправки команды',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async forceSleep(deviceId) {
            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                if (this.devices.find(d => d.device_id === deviceId)?.is_fake) {
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Обновляем статус в сторе
                    this.updateDeviceStatus(deviceId, 'SLEEPING');

                    // Для фейковых устройств
                    const device = this.devices.find(d => d.device_id === deviceId);
                    if (device) {
                        device.voltage = 2.9;
                    }

                    return {
                        success: true,
                        message: 'Устройство переведено в спящий режим'
                    };
                }

                const response = await resource.forceSleep(deviceId);

                if (response.success) {
                    // Обновляем статус в сторе
                    const device = this.devices.find(d => d.device_id === deviceId);
                    if (device) {
                        device.status = 'SLEEPING';
                    }

                    return {
                        success: true,
                        message: 'Устройство переведено в спящий режим'
                    };
                } else {
                    throw new Error(response.message || 'Ошибка перевода в сон');
                }
            } catch (err) {
                this.error = 'Не удалось перевести устройство в сон';
                return {
                    success: false,
                    message: 'Ошибка перевода в сон',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async wakeDevice(deviceId) {
            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                if (this.devices.find(d => d.device_id === deviceId)?.is_fake) {
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Восстанавливаем емкость аккумулятора
                    this.updateDeviceVoltage(deviceId, 3.7);

                    // Переключаем в режим ON
                    this.updateDeviceStatus(deviceId, 'ON');
                    this.updateDeviceIntensity(deviceId, 100);

                    this.lastCommandTimestamp = Date.now();
                    return {
                        success: true,
                        message: 'Устройство пробуждено'
                    };
                }

                const response = await resource.wakeDevice(deviceId);

                if (response.success) {
                    // Восстанавливаем емкость аккумулятора
                    const device = this.devices.find(d => d.device_id === deviceId);
                    if (device) {
                        this.updateDeviceVoltage(deviceId, 3.7);
                        this.updateDeviceStatus(deviceId, 'ON');
                        this.updateDeviceIntensity(deviceId, 100);
                    }

                    this.lastCommandTimestamp = Date.now();
                    return {
                        success: true,
                        message: 'Устройство пробуждено'
                    };
                } else {
                    throw new Error(response.message || 'Ошибка пробуждения');
                }
            } catch (err) {
                this.error = 'Не удалось пробудить устройство';
                return {
                    success: false,
                    message: 'Ошибка пробуждения',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        calculateRealVoltage(deviceId, chargeCycles) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return 3.7;

            // Типы аккумуляторов и их деградация
            const degradation = {
                'li-ion-18650': {
                    capacityLossPerCycle: 0.0005,
                    voltageLossPerCycle: 0.0001
                },
                'li-ion-21700': {
                    capacityLossPerCycle: 0.0004,
                    voltageLossPerCycle: 0.00008
                },
                'li-po': {
                    capacityLossPerCycle: 0.0006,
                    voltageLossPerCycle: 0.00012
                },
                'lead-acid': {
                    capacityLossPerCycle: 0.001,
                    voltageLossPerCycle: 0.0002
                }
            };

            const batteryType = device.battery_type_id || 'li-ion-18650';
            const typeDegradation = degradation[batteryType] || degradation['li-ion-18650'];

            // Рассчитываем деградацию
            const voltageLoss = chargeCycles * typeDegradation.voltageLossPerCycle;
            const realMaxVoltage = 4.2 * (1 - voltageLoss);

            return Math.min(realMaxVoltage, device.voltage);
        },

        simulateBatteryDegradation(deviceId, cycles) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            device.chargeCycles = (device.chargeCycles || 0) + cycles;
            device.voltage = this.calculateRealVoltage(deviceId, device.chargeCycles);
        },

        simulateSelfDischarge(deviceId, hours, temperature = 25) {
            const device = this.devices.find(d => d.device_id === deviceId);
            if (!device) return;

            // Типы аккумуляторов и их саморазряд
            const selfDischarge = {
                'li-ion-18650': {
                    rate: 5,
                    temperatureFactor: 0.1
                },
                'li-ion-21700': {
                    rate: 4.5,
                    temperatureFactor: 0.08
                },
                'li-po': {
                    rate: 6,
                    temperatureFactor: 0.12
                },
                'lead-acid': {
                    rate: 15,
                    temperatureFactor: 0.05
                }
            };

            const batteryType = device.battery_type_id || 'li-ion-18650';
            const typeDischarge = selfDischarge[batteryType] || selfDischarge['li-ion-18650'];

            // Расчет разряда
            const monthlyDischarge = typeDischarge.rate;
            const temperatureDelta = Math.max(0, temperature - 25);
            const temperatureDischarge = temperatureDelta * typeDischarge.temperatureFactor;
            const totalDischarge = monthlyDischarge + temperatureDischarge;

            // % в час
            const dischargeRate = totalDischarge / (30 * 24);
            const voltageDrop = device.voltage * (dischargeRate * hours) / 100;

            this.updateDeviceVoltage(deviceId, device.voltage - voltageDrop);
        }
    }
});
