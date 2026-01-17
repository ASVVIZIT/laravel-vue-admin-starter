import { defineStore } from 'pinia';
import { SmartLightResource } from '@/components/SmartLight/api/core/SmartLightResource.js';
import { BATTERY_TYPES } from '@/components/SmartLight/stores/batteryTypes.js';
import { BULB_TYPES } from '@/components/SmartLight/stores/bulbTypes.js';

export const useSmartLightStore = defineStore('smartLight', {
    state: () => ({
        devices: [],
        selectedDevice: null,
        types: {
            batteryTypes: BATTERY_TYPES,
            bulbTypes: BULB_TYPES
        },
        globalSettings: {
            global_server_url: '',
            default_critical_voltage: 3.2,
            default_sleep_interval: 600,
            default_emergency_sleep_interval: 3600,
            default_wifi_ssid: '',
            default_wifi_password: '',
            timezone: 'Europe/Moscow',
            log_level: 'info',
            telemetry_retention_days: 30
        },
        interfaceSettings: {
            global3DMode: false,
            device3DSettings: {}
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
        selectedDeviceId: state => state.selectedDevice ? state.selectedDevice : null,

        getDevice: state => deviceId => {
            return state.devices.find(d => d.device_id === deviceId);
        },

        getSelectedDevice: state => {
            if (!state.selectedDevice) return null;
            return state.getDevice(state.selectedDevice);
        },

        getBatteryType: state => batteryTypeId => {
            return state.types.batteryTypes.find(type => type.id === batteryTypeId) || state.types.batteryTypes[0];
        },

        getBulbType: state => bulbTypeId => {
            return state.types.bulbTypes.find(type => type.id === bulbTypeId) || state.types.bulbTypes[0];
        },

        deviceBatteryProgress: state => deviceId => {
            const device = state.getDevice(deviceId);
            if (!device) return 0;

            const minVoltage = state.calculateGroupMinVoltage(deviceId);
            const maxVoltage = state.calculateGroupMaxVoltage(deviceId);

            return Math.min(100, Math.max(0,
                ((device.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100
            ));
        },

        deviceCriticalProgress: state => deviceId => {
            const device = state.getDevice(deviceId);
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
            const device = state.getDevice(deviceId);
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
            const device = state.getDevice(deviceId);
            if (!device) return 0;

            const minVoltage = state.calculateGroupMinVoltage(deviceId);
            const maxVoltage = state.calculateGroupMaxVoltage(deviceId);

            return ((device.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
        },

        deviceCriticalThresholdPosition: state => deviceId => {
            const device = state.getDevice(deviceId);
            if (!device) return 0;

            const minVoltage = state.calculateGroupMinVoltage(deviceId);
            const maxVoltage = state.calculateGroupMaxVoltage(deviceId);
            const criticalVoltage = state.calculateGroupCriticalVoltage(deviceId);

            return ((criticalVoltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
        },

        deviceBatteryColor: state => deviceId => {
            const device = state.getDevice(deviceId);
            if (!device) return '#67c23a';

            const voltage = device.voltage;
            if (voltage < 2.7) return '#f56c6c';
            if (voltage < 3.0) return '#e6a23c';
            return '#67c23a';
        },

        deviceCriticalColor: state => deviceId => {
            const device = state.getDevice(deviceId);
            if (!device) return '#ffcccb';

            const voltage = device.voltage;
            if (voltage < 2.7) return '#f56c6c';
            if (voltage < 3.0) return '#faa7a7';
            return '#ffcccb';
        },

        deviceRuntime: state => deviceId => {
            const device = state.getDevice(deviceId);
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

        deviceSafeIntensityRange: state => deviceId => {
            const device = state.getDevice(deviceId);
            if (!device) return { min: 0, max: 100 };

            const bulbType = state.getBulbType(device.bulb_type_id);

            return {
                min: bulbType.minIntensity,
                max: bulbType.maxIntensity
            };
        }
    },
    actions: {
        initInterfaceSettings() {
            try {
                const settingsJson = localStorage.getItem('smartlight_interface_settings');
                if (settingsJson) {
                    const settings = JSON.parse(settingsJson);
                    this.interfaceSettings.global3DMode = settings.global3DMode || false;
                    this.interfaceSettings.device3DSettings = settings.device3DSettings || {};
                } else {
                    this.interfaceSettings.global3DMode = false;
                    this.interfaceSettings.device3DSettings = {};
                    this.saveInterfaceSettings();
                }
            } catch (e) {
                console.error('Ошибка загрузки настроек интерфейса:', e);
                this.interfaceSettings.global3DMode = false;
                this.interfaceSettings.device3DSettings = {};
            }
        },

        saveInterfaceSettings() {
            const settings = {
                global3DMode: this.interfaceSettings.global3DMode,
                device3DSettings: this.interfaceSettings.device3DSettings
            };
            localStorage.setItem('smartlight_interface_settings', JSON.stringify(settings));
        },

        setGlobal3DMode(value) {
            this.interfaceSettings.global3DMode = value;
            this.saveInterfaceSettings();
        },

        getDevice3DMode(deviceId) {
            if (deviceId && this.interfaceSettings.device3DSettings[deviceId] !== undefined) {
                return this.interfaceSettings.device3DSettings[deviceId];
            }
            return this.interfaceSettings.global3DMode;
        },

        setDevice3DMode(deviceId, value) {
            this.interfaceSettings.device3DSettings = {
                ...this.interfaceSettings.device3DSettings,
                [deviceId]: value
            };
            this.saveInterfaceSettings();
        },

        selectDevice(deviceId) {
            this.selectedDevice = deviceId;
        },

        updateDeviceVoltage(deviceId, voltage) {
            const device = this.getDevice(deviceId);
            if (!device) return;

            const minVoltage = this.calculateGroupMinVoltage(deviceId);
            const maxVoltage = this.calculateGroupMaxVoltage(deviceId);

            const clampedVoltage = Math.min(maxVoltage, Math.max(minVoltage, voltage));
            device.voltage = clampedVoltage;

            const criticalVoltage = this.calculateGroupCriticalVoltage(deviceId);
            if (clampedVoltage <= criticalVoltage && device.status !== 'SLEEPING') {
                device.status = 'SLEEPING';
            } else if (clampedVoltage > criticalVoltage && device.status === 'SLEEPING') {
                device.status = 'ON';
            }
        },

        updateDeviceCriticalVoltage(deviceId, criticalVoltage) {
            const device = this.getDevice(deviceId);
            if (!device) return;

            const minVoltage = this.calculateGroupMinVoltage(deviceId);
            const maxVoltage = this.calculateGroupMaxVoltage(deviceId);

            device.critical_voltage = Math.min(
                maxVoltage * 0.95,
                Math.max(minVoltage * 1.1, criticalVoltage)
            );
        },

        updateDeviceIntensity(deviceId, intensity) {
            const device = this.getDevice(deviceId);
            if (!device) return;

            const safeIntensity = this.deviceSafeIntensityRange(deviceId);
            device.intensity = Math.min(
                safeIntensity.max,
                Math.max(safeIntensity.min, intensity)
            );
        },

        updateDeviceStatus(deviceId, status) {
            const device = this.getDevice(deviceId);
            if (!device || device.status === status) return;

            device.status = status;

            if (device.is_fake) {
                if (status === 'SLEEPING' && device.status !== 'SLEEPING') {
                    device.voltage = 2.9;
                } else if (status === 'ON' && device.status === 'SLEEPING') {
                    device.voltage = 3.7;
                    device.intensity = 100;
                }
            }
        },

        updateDeviceBatteryType(deviceId, batteryTypeId) {
            const device = this.getDevice(deviceId);
            if (!device) return;

            device.battery_type_id = batteryTypeId;

            // Обновляем параметры в соответствии с новым типом
            const batteryType = this.getBatteryType(batteryTypeId);
            device.min_voltage = batteryType.minVoltage;
            device.max_voltage = batteryType.maxVoltage;
            device.critical_voltage = batteryType.criticalVoltage;
            device.capacity = batteryType.nominalCapacity;

            // Пересчитываем текущее напряжение
            device.voltage = batteryType.nominalVoltage;
        },

        updateDeviceBulbType(deviceId, bulbTypeId) {
            const device = this.getDevice(deviceId);
            if (!device) return;

            device.bulb_type_id = bulbTypeId;

            // Обновляем параметры в соответствии с новым типом
            const bulbType = this.getBulbType(bulbTypeId);
            device.min_intensity = bulbType.minIntensity;
            device.max_intensity = bulbType.maxIntensity;

            // Пересчитываем текущую интенсивность
            device.intensity = Math.min(
                bulbType.maxIntensity,
                Math.max(bulbType.minIntensity, device.intensity)
            );
        },

        updateDeviceBatteryGroup(deviceId, groupConfig) {
            const device = this.getDevice(deviceId);
            if (!device) return {
                success: false,
                message: 'Устройство не найдено'
            };

            // Проверка типа аккумулятора
            const batteryType = this.getBatteryType(device.battery_type_id);
            if (!batteryType.groupSupport[groupConfig.type]) {
                console.error(`Конфигурация ${groupConfig.type} не поддерживается для типа ${device.battery_type_id}`);
                return {
                    success: false,
                    message: `Конфигурация ${groupConfig.type} не поддерживается`
                };
            }

            // Проверка максимального количества
            if (groupConfig.count > batteryType.groupSupport.maxInGroup) {
                console.error(`Максимальное количество: ${batteryType.groupSupport.maxInGroup}`);
                return {
                    success: false,
                    message: `Максимальное количество: ${batteryType.groupSupport.maxInGroup}`
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

            return {
                success: true,
                message: 'Конфигурация батареи обновлена'
            };
        },

        calculateGroupMinVoltage(deviceId) {
            const device = this.getDevice(deviceId);
            if (!device) return 2.5;

            const batteryType = this.getBatteryType(device.battery_type_id);
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

        calculateGroupMaxVoltage(deviceId) {
            const device = this.getDevice(deviceId);
            if (!device) return 4.3;

            const batteryType = this.getBatteryType(device.battery_type_id);
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

        calculateGroupCriticalVoltage(deviceId) {
            const device = this.getDevice(deviceId);
            if (!device) return 3.2;

            const batteryType = this.getBatteryType(device.battery_type_id);
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

                this.devices = response.data.map(device => ({
                    ...device,
                    intensity: device.intensity || 100,
                    voltage: device.voltage || 3.7,
                    status: device.status || 'OFF',
                    battery_type_id: device.battery_type_id || this.types.batteryTypes[0].id,
                    bulb_type_id: device.bulb_type_id || this.types.bulbTypes[0].id,
                    min_intensity: device.min_intensity || 0,
                    max_intensity: device.max_intensity || 100,
                    capacity: device.capacity || this.getBatteryType(device.battery_type_id).nominalCapacity,
                    chargeCycles: device.chargeCycles || 0,
                    battery_group_config: device.battery_group_config || {
                        enabled: false,
                        type: 'series',
                        count: 1,
                        connections: []
                    }
                }));

                if (this.selectedDevice) {
                    const updatedDevice = this.devices.find(
                        d => d.device_id === this.selectedDevice
                    );
                    if (updatedDevice) {
                        this.selectedDevice = updatedDevice.device_id;
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

        async fetchGlobalSettings() {
            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                const response = await resource.getGlobalSettings();

                if (response.success) {
                    this.globalSettings = {
                        ...this.globalSettings,
                        ...response.data
                    };

                    return {
                        success: true,
                        message: 'Глобальные настройки загружены',
                        data: this.globalSettings
                    };
                } else {
                    throw new Error(response.message || 'Некорректный ответ от сервера');
                }
            } catch (err) {
                this.error = 'Не удалось загрузить глобальные настройки';
                return {
                    success: false,
                    message: 'Ошибка загрузки глобальных настроек',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async updateGlobalSettings(settings) {
            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                if (typeof settings !== 'object' || Array.isArray(settings)) {
                    throw new Error('Неверный формат настроек');
                }

                const response = await resource.updateGlobalSettings({ settings });

                if (response.success) {
                    this.globalSettings = {
                        ...this.globalSettings,
                        ...response.data
                    };

                    return {
                        success: true,
                        message: 'Глобальные настройки сохранены',
                        data: this.globalSettings
                    };
                } else {
                    throw new Error(response.message || 'Ошибка сохранения глобальных настроек');
                }
            } catch (err) {
                this.error = 'Не удалось сохранить глобальные настройки';
                return {
                    success: false,
                    message: 'Ошибка сохранения глобальных настроек',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        async resetGlobalSettings() {
            this.loading = true;
            this.error = null;
            const resource = new SmartLightResource();

            try {
                const response = await resource.resetGlobalSettings();

                if (response.success) {
                    this.globalSettings = {
                        ...this.globalSettings,
                        ...response.data
                    };

                    return {
                        success: true,
                        message: 'Глобальные настройки сброшены',
                        data: this.globalSettings
                    };
                } else {
                    throw new Error(response.message || 'Ошибка сброса глобальных настроек');
                }
            } catch (err) {
                this.error = 'Не удалось сбросить глобальные настройки';
                return {
                    success: false,
                    message: 'Ошибка сброса глобальных настроек',
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
                if (this.getDevice(deviceId)?.is_fake) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    this.updateDeviceStatus(deviceId, status);
                    this.updateDeviceIntensity(deviceId, status === 'ON' ? 100 : 0);

                    if (status === 'ON') {
                        this.updateDeviceVoltage(
                            deviceId,
                            Math.min(4.3, this.getDevice(deviceId)?.voltage + 0.05)
                        );
                    } else {
                        this.updateDeviceVoltage(
                            deviceId,
                            Math.max(2.5, this.getDevice(deviceId)?.voltage - 0.05)
                        );
                    }

                    this.lastCommandTimestamp = now;
                    return {
                        success: true,
                        message: `Команда "${status}" отправлена`,
                        data: {
                            status,
                            intensity: status === 'ON' ? 100 : 0,
                            voltage: this.getDevice(deviceId)?.voltage
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
                if (this.getDevice(deviceId)?.is_fake) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    this.updateDeviceStatus(deviceId, 'SLEEPING');
                    const device = this.getDevice(deviceId);
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
                    const device = this.getDevice(deviceId);
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
                if (this.getDevice(deviceId)?.is_fake) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                    this.updateDeviceVoltage(deviceId, 3.7);
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
                    const device = this.getDevice(deviceId);
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
        }
    }
});
