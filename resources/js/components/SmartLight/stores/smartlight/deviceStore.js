/**
 * Подстор для управления устройствами
 *
 * Содержит state, getters и actions для подстора устройств
 *
 * @file stores/deviceStore.js
 */

import { defineStore } from 'pinia';
import { SmartLightResource } from '@/components/SmartLight/api/core/SmartLightResource';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';
import { DEVICE_TYPES, DEVICE_STATE } from './types/deviceTypes';

export const useDeviceStore = defineStore('smartlight/device', {
    state: () => ({
        devices: [],
        devicesMap: new Map(),
        selectedDeviceId: null,
        loading: false,
        error: null,
        lastCommandTimestamp: 0,
        COMMAND_DEBOUNCE: 1000,
        interfaceSettings: {
            global3DMode: false,
            device3DSettings: {}
        }
    }),

    getters: {
        selectedDevice: (state) => {
            if (!state.selectedDeviceId) return null;
            return state.devicesMap.get(state.selectedDeviceId) || null;
        },

        realDevices: (state) => {
            return state.devices.filter(device => !device.is_fake);
        },

        fakeDevices: (state) => {
            return state.devices.filter(device => device.is_fake);
        }
    },

    actions: {
        init() {
            logDebug('DeviceStore', 'Инициализация DeviceStore');

            // Загружаем настройки из localStorage
            try {
                const settingsJson = localStorage.getItem('smartlight_interface_settings');
                if (settingsJson) {
                    const settings = JSON.parse(settingsJson);
                    this.interfaceSettings.global3DMode = settings.global3DMode || false;
                    this.interfaceSettings.device3DSettings = settings.device3DSettings || {};
                }
            } catch (e) {
                logDebug('DeviceStore', 'Ошибка загрузки настроек', { error: e.message });
            }

            return true;
        },

        async fetchDevices() {
            logDebug('DeviceStore', 'Загрузка устройств');

            // Проверка на частые запросы
            const now = Date.now();
            if (now - this.lastCommandTimestamp < this.COMMAND_DEBOUNCE) {
                return {
                    success: false,
                    message: 'Частые запросы',
                    error: 'Слишком частые запросы'
                };
            }

            this.lastCommandTimestamp = now;
            this.loading = true;
            this.error = null;

            const resource = new SmartLightResource();

            try {
                const response = await resource.getDevices();

                if (!response || !response.data) {
                    throw new Error('Invalid devices response structure');
                }

                // Очищаем текущие устройства
                this.devices = [];
                this.devicesMap = new Map();

                // Преобразуем устройства из ответа
                response.data.forEach(deviceData => {
                    this.updateDevice(deviceData);
                });

                logDebug('DeviceStore', 'Устройства загружены', {
                    count: this.devices.length,
                    devices: this.devices
                });

                // Если есть выбранное устройство, обновляем его
                if (this.selectedDeviceId) {
                    const updatedDevice = this.devicesMap.get(this.selectedDeviceId);
                    if (updatedDevice) {
                        this.selectedDeviceId = updatedDevice.device_id;
                    }
                }

                return {
                    success: true,
                    message: 'Устройства загружены',
                    devices: this.devices
                };
            } catch (err) {
                this.error = 'Не удалось загрузить устройства';
                logError('DeviceStore', 'Ошибка загрузки устройств', err);

                return {
                    success: false,
                    message: 'Ошибка загрузки устройств',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        selectDevice(deviceId) {
            logDebug('DeviceStore', 'Выбор устройства', { deviceId });
            this.selectedDeviceId = deviceId;

            // Сохраняем в localStorage
            localStorage.setItem('smartlight_selected_device', deviceId);
        },

        updateDeviceStatus(deviceId, status) {
            logDebug('DeviceStore', 'Обновление статуса', { deviceId, status });

            const device = this.devicesMap.get(deviceId);
            if (device) {
                device.status = status;
            }
        },

        updateDeviceVoltage(deviceId, voltage) {
            logDebug('DeviceStore', 'Обновление напряжения', { deviceId, voltage });

            const device = this.devicesMap.get(deviceId);
            if (device) {
                device.voltage = Number(voltage);
            }
        },

        updateDeviceIntensity(deviceId, intensity) {
            logDebug('DeviceStore', 'Обновление интенсивности', { deviceId, intensity });

            const device = this.devicesMap.get(deviceId);
            if (device) {
                device.intensity = Number(intensity);
            }
        },

        getDevice(deviceId) {
            logDebug('DeviceStore', 'Получение устройства', { deviceId });
            return this.devicesMap.get(deviceId) || null;
        },

        getDevice3DMode(deviceId) {
            const mode = this.interfaceSettings.device3DSettings[deviceId];
            logDebug('DeviceStore', 'Получение режима отображения', {
                deviceId,
                mode: mode !== undefined ? mode : this.interfaceSettings.global3DMode
            });

            return mode !== undefined ? mode : this.interfaceSettings.global3DMode;
        },

        setDevice3DMode(deviceId, mode) {
            logDebug('DeviceStore', 'Установка режима отображения', {
                deviceId,
                mode
            });

            this.interfaceSettings.device3DSettings = {
                ...this.interfaceSettings.device3DSettings,
                [deviceId]: mode
            };
            this.saveInterfaceSettings();
        },

        setGlobal3DMode(mode) {
            logDebug('DeviceStore', 'Установка глобального режима отображения', { mode });

            this.interfaceSettings.global3DMode = mode;
            this.interfaceSettings.device3DSettings = {};
            this.saveInterfaceSettings();
        },

        saveInterfaceSettings() {
            logDebug('DeviceStore', 'Сохранение настроек интерфейса');

            try {
                localStorage.setItem('smartlight_interface_settings', JSON.stringify({
                    global3DMode: this.interfaceSettings.global3DMode,
                    device3DSettings: this.interfaceSettings.device3DSettings
                }));
            } catch (e) {
                logDebug('DeviceStore', 'Ошибка сохранения настроек', { error: e.message });
            }
        },

        forceSleep(deviceId) {
            logDebug('DeviceStore', 'Перевод в спящий режим', { deviceId });
            this.updateDeviceStatus(deviceId, 'SLEEPING');
        },

        wakeDevice(deviceId) {
            logDebug('DeviceStore', 'Пробуждение устройства', { deviceId });
            this.updateDeviceStatus(deviceId, 'ON');
        },

        updateDeviceCriticalVoltage(deviceId, criticalVoltage) {
            logDebug('DeviceStore', 'Обновление критического напряжения', { deviceId, criticalVoltage });

            const device = this.devicesMap.get(deviceId);
            if (device) {
                device.critical_voltage = criticalVoltage;
            }
        },

        async updateDeviceSettings(deviceId, settings) {
            logDebug('DeviceStore', 'Обновление настроек устройства', { deviceId, settings });

            this.loading = true;
            this.error = null;

            try {
                const resource = new SmartLightResource();
                const response = await resource.updateDeviceSettings(deviceId, settings);

                if (response.success) {
                    // Обновляем локальные настройки
                    const device = this.devicesMap.get(deviceId);
                    if (device) {
                        Object.assign(device, {
                            critical_voltage: settings.critical_voltage,
                            sleep_interval: settings.sleep_interval,
                            emergency_sleep_interval: settings.emergency_sleep_interval,
                            battery_type_id: settings.battery_type_id,
                            bulb_type_id: settings.bulb_type_id,
                            battery_group_config: settings.battery_group_config,
                            power_config: settings.power_config
                        });
                    }

                    logDebug('DeviceStore', 'Настройки устройства обновлены', {
                        deviceId,
                        settings
                    });

                    return {
                        success: true,
                        message: 'Настройки устройства сохранены',
                        ...response.data
                    };
                } else {
                    throw new Error(response.message || 'Ошибка сохранения настроек');
                }
            } catch (err) {
                this.error = 'Не удалось сохранить настройки';
                logError('DeviceStore', 'Ошибка сохранения настроек', err);

                return {
                    success: false,
                    message: 'Ошибка сохранения настроек',
                    error: err.message
                };
            } finally {
                this.loading = false;
            }
        },

        updateDevice(deviceData) {
            logDebug('DeviceStore', 'Обновление устройства в сторе', { deviceData });

            // Создаем или обновляем устройство
            let device = this.devicesMap.get(deviceData.device_id);

            if (!device) {
                // Создаем новое устройство
                device = {
                    ...deviceData,
                    intensity: deviceData.intensity || 100,
                    voltage: deviceData.voltage || 3.7,
                    status: deviceData.status || 'OFF',
                    battery_type_id: deviceData.battery_type_id || 'li-ion-18650',
                    bulb_type_id: deviceData.bulb_type_id || 'classic',
                    min_intensity: deviceData.min_intensity || 0,
                    max_intensity: deviceData.max_intensity || 100,
                    capacity: deviceData.capacity || 3500,
                    chargeCycles: deviceData.chargeCycles || 0,
                    battery_group_config: deviceData.battery_group_config || {
                        enabled: false,
                        type: 'series',
                        count: 1,
                        connections: []
                    }
                };

                this.devicesMap.set(deviceData.device_id, device);
                this.devices.push(device);
            } else {
                // Обновляем существующее устройство
                Object.assign(device, {
                    ...deviceData,
                    intensity: deviceData.intensity || device.intensity,
                    voltage: deviceData.voltage || device.voltage,
                    status: deviceData.status || device.status
                });
            }

            return device;
        }
    }
});
