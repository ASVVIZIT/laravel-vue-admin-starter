/**
 * Действия (actions) для Pinia сторов
 *
 * Экспортирует действия для каждого подстора
 *
 * @file stores/actions.js
 */

import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';
import { SmartLightResource } from '@/components/SmartLight/api/core/SmartLightResource';
import { SettingsApi } from '@/components/SmartLight/api/smartLight/SettingsApi';
import { TypesApi } from '@/components/SmartLight/api/smartLight/TypesApi';
import { PowerSupplyApi } from '@/components/SmartLight/api/powerSupplies/PowerSupplyApi';

/**
 * Действия для подстора устройств
 */
export const deviceStoreActions = {
    /**
     * Инициализация подстора устройств
     *
     * @returns {boolean} успешность инициализации
     */
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

    /**
     * Загрузка устройств из API
     *
     * @returns {Object} результат загрузки
     */
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

    /**
     * Выбор устройства
     *
     * @param {string} deviceId - ID устройства
     */
    selectDevice(deviceId) {
        logDebug('DeviceStore', 'Выбор устройства', { deviceId });
        this.selectedDeviceId = deviceId;

        // Сохраняем в localStorage
        localStorage.setItem('smartlight_selected_device', deviceId);
    },

    /**
     * Обновление статуса устройства
     *
     * @param {string} deviceId - ID устройства
     * @param {string} status - новый статус
     */
    updateDeviceStatus(deviceId, status) {
        logDebug('DeviceStore', 'Обновление статуса', { deviceId, status });

        const device = this.devicesMap.get(deviceId);
        if (device) {
            device.status = status;
        }
    },

    /**
     * Обновление напряжения устройства
     *
     * @param {string} deviceId - ID устройства
     * @param {number} voltage - новое напряжение
     */
    updateDeviceVoltage(deviceId, voltage) {
        logDebug('DeviceStore', 'Обновление напряжения', { deviceId, voltage });

        const device = this.devicesMap.get(deviceId);
        if (device) {
            device.voltage = Number(voltage);
        }
    },

    /**
     * Обновление интенсивности устройства
     *
     * @param {string} deviceId - ID устройства
     * @param {number} intensity - новая интенсивность
     */
    updateDeviceIntensity(deviceId, intensity) {
        logDebug('DeviceStore', 'Обновление интенсивности', { deviceId, intensity });

        const device = this.devicesMap.get(deviceId);
        if (device) {
            device.intensity = Number(intensity);
        }
    },

    /**
     * Получение устройства по ID
     *
     * @param {string} deviceId - ID устройства
     * @returns {Object|null} устройство или null
     */
    getDevice(deviceId) {
        logDebug('DeviceStore', 'Получение устройства', { deviceId });
        return this.devicesMap.get(deviceId) || null;
    },

    /**
     * Получение режима 3D для устройства
     *
     * @param {string} deviceId - ID устройства
     * @returns {boolean} режим 3D
     */
    getDevice3DMode(deviceId) {
        const mode = this.interfaceSettings.device3DSettings[deviceId];
        logDebug('DeviceStore', 'Получение режима отображения', {
            deviceId,
            mode: mode !== undefined ? mode : this.interfaceSettings.global3DMode
        });

        return mode !== undefined ? mode : this.interfaceSettings.global3DMode;
    },

    /**
     * Установка режима 3D для устройства
     *
     * @param {string} deviceId - ID устройства
     * @param {boolean} mode - режим 3D
     */
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

    /**
     * Установка глобального режима 3D
     *
     * @param {boolean} mode - глобальный режим 3D
     */
    setGlobal3DMode(mode) {
        logDebug('DeviceStore', 'Установка глобального режима отображения', { mode });

        this.interfaceSettings.global3DMode = mode;
        this.interfaceSettings.device3DSettings = {};
        this.saveInterfaceSettings();
    },

    /**
     * Сохранение настроек интерфейса
     */
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

    /**
     * Перевод в спящий режим
     *
     * @param {string} deviceId - ID устройства
     */
    forceSleep(deviceId) {
        logDebug('DeviceStore', 'Перевод в спящий режим', { deviceId });
        this.updateDeviceStatus(deviceId, 'SLEEPING');
    },

    /**
     * Пробуждение устройства
     *
     * @param {string} deviceId - ID устройства
     */
    wakeDevice(deviceId) {
        logDebug('DeviceStore', 'Пробуждение устройства', { deviceId });
        this.updateDeviceStatus(deviceId, 'ON');
    },

    /**
     * Обновление критического напряжения
     *
     * @param {string} deviceId - ID устройства
     * @param {number} criticalVoltage - критическое напряжение
     */
    updateDeviceCriticalVoltage(deviceId, criticalVoltage) {
        logDebug('DeviceStore', 'Обновление критического напряжения', { deviceId, criticalVoltage });

        const device = this.devicesMap.get(deviceId);
        if (device) {
            device.critical_voltage = criticalVoltage;
        }
    },

    /**
     * Обновление настроек устройства
     *
     * @param {string} deviceId - ID устройства
     * @param {Object} settings - настройки
     * @returns {Object} результат обновления
     */
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

    /**
     * Обновление устройства
     *
     * @param {Object} deviceData - данные устройства
     * @returns {Object} обновленное устройство
     */
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
};

/**
 * Действия для подстора настроек
 */
export const settingsStoreActions = {
    /**
     * Инициализация глобальных настроек
     *
     * @returns {Object} результат инициализации
     */
    async init() {
        logDebug('SettingsStore', 'Инициализация SettingsStore');

        this.loading = true;
        this.error = null;

        try {
            // Загружаем настройки из localStorage
            const settingsJson = localStorage.getItem('smartlight_global_settings');
            if (settingsJson) {
                const settings = JSON.parse(settingsJson);
                this.globalSettings = {
                    ...this.globalSettings,
                    ...settings
                };
            }

            // Загружаем настройки из API
            const response = await SettingsApi.getGlobalSettings();

            if (response.success) {
                this.globalSettings = {
                    ...this.globalSettings,
                    ...response.data
                };
            }

            return {
                success: true,
                message: 'Глобальные настройки загружены',
                ...this.globalSettings
            };
        } catch (err) {
            this.error = 'Не удалось загрузить настройки';
            logError('SettingsStore', 'Ошибка загрузки настроек', err);

            return {
                success: false,
                message: 'Ошибка загрузки настроек',
                error: err.message
            };
        } finally {
            this.loading = false;
        }
    },

    /**
     * Обновление глобальных настроек
     *
     * @param {Object} settings - новые настройки
     * @returns {Object} результат обновления
     */
    async updateGlobalSettings(settings) {
        logDebug('SettingsStore', 'Обновление глобальных настроек', { settings });

        this.loading = true;
        this.error = null;

        try {
            const response = await SettingsApi.updateGlobalSettings(settings);

            if (response.success) {
                // Обновляем локальные настройки
                this.globalSettings = {
                    ...this.globalSettings,
                    ...settings
                };

                // Сохраняем в localStorage
                localStorage.setItem('smartlight_global_settings', JSON.stringify(this.globalSettings));

                return {
                    success: true,
                    message: 'Глобальные настройки обновлены',
                    ...response.data
                };
            } else {
                throw new Error(response.message || 'Ошибка сохранения настроек');
            }
        } catch (err) {
            this.error = 'Не удалось сохранить глобальные настройки';
            logError('SettingsStore', 'Ошибка сохранения настроек', err);

            return {
                success: false,
                message: 'Ошибка сохранения настроек',
                error: err.message
            };
        } finally {
            this.loading = false;
        }
    },

    /**
     * Получение глобальных настроек
     *
     * @returns {Object} глобальные настройки
     */
    async getGlobalSettings() {
        logDebug('SettingsStore', 'Получение глобальных настроек');

        this.loading = true;
        this.error = null;

        try {
            const response = await SettingsApi.getGlobalSettings();

            if (response.success) {
                return {
                    success: true,
                    message: 'Глобальные настройки получены',
                    ...response.data
                };
            } else {
                throw new Error(response.message || 'Ошибка получения настроек');
            }
        } catch (err) {
            this.error = 'Не удалось получить настройки';
            logError('SettingsStore', 'Ошибка получения настроек', err);

            return {
                success: false,
                message: 'Ошибка получения настроек',
                error: err.message
            };
        } finally {
            this.loading = false;
        }
    }
};

/**
 * Действия для подстора интерфейса
 */
export const interfaceStoreActions = {
    /**
     * Инициализация настроек интерфейса
     */
    init() {
        logDebug('InterfaceStore', 'Инициализация InterfaceStore');

        // Загружаем настройки из localStorage
        try {
            const settingsJson = localStorage.getItem('smartlight_interface_settings');
            if (settingsJson) {
                const settings = JSON.parse(settingsJson);
                this.size = settings.size || 'small';
                this.debugPanelVisible = settings.debugPanelVisible ?? true;
                this.debugPanelTab = settings.debugPanelTab || 'debug';

                // Также загружаем настройки из deviceStore
                const deviceSettingsJson = localStorage.getItem('smartlight_interface_settings');
                if (deviceSettingsJson) {
                    const deviceSettings = JSON.parse(deviceSettingsJson);
                    this.interfaceSettings.global3DMode = deviceSettings.global3DMode || false;
                    this.interfaceSettings.device3DSettings = deviceSettings.device3DSettings || {};
                }
            }
        } catch (e) {
            logDebug('InterfaceStore', 'Ошибка загрузки настроек', { error: e.message });
        }
    },

    /**
     * Установка размера интерфейса
     *
     * @param {string} size - размер интерфейса
     */
    setSize(size) {
        logDebug('InterfaceStore', 'Установка размера интерфейса', { size });
        this.size = size;

        // Сохраняем в localStorage
        localStorage.setItem('smartlight_interface_settings', JSON.stringify({
            debugPanelVisible: this.debugPanelVisible,
            debugPanelTab: this.debugPanelTab,
            size
        }));
    },

    /**
     * Переключение видимости DebugPanel
     */
    toggleDebugPanel() {
        logDebug('InterfaceStore', 'Переключение панели отладки', {
            visible: !this.debugPanelVisible
        });

        this.debugPanelVisible = !this.debugPanelVisible;

        // Сохраняем в localStorage
        localStorage.setItem('smartlight_interface_settings', JSON.stringify({
            debugPanelVisible: this.debugPanelVisible,
            debugPanelTab: this.debugPanelTab,
            size: this.size
        }));
    },

    /**
     * Установка текущей вкладки DebugPanel
     *
     * @param {string} tab - название вкладки
     */
    setDebugPanelTab(tab) {
        logDebug('InterfaceStore', 'Установка вкладки панели отладки', { tab });
        this.debugPanelTab = tab;

        // Сохраняем в localStorage
        localStorage.setItem('smartlight_interface_settings', JSON.stringify({
            debugPanelVisible: this.debugPanelVisible,
            debugPanelTab: this.debugPanelTab,
            size: this.size
        }));
    },

    /**
     * Установка видимости глобальных настроек
     *
     * @param {boolean} visible - видимость настроек
     */
    setGlobalSettingsVisible(visible) {
        logDebug('InterfaceStore', 'Установка видимости глобальных настроек', { visible });
        this.globalSettingsVisible = visible;
    },

    /**
     * Установка глобального режима 3D
     *
     * @param {boolean} mode - режим 3D
     */
    setGlobal3DMode(mode) {
        logDebug('InterfaceStore', 'Установка глобального режима отображения', { mode });

        this.interfaceSettings.global3DMode = mode;
        this.interfaceSettings.device3DSettings = {};

        // Сохраняем в localStorage
        localStorage.setItem('smartlight_interface_settings', JSON.stringify({
            global3DMode: this.interfaceSettings.global3DMode,
            device3DSettings: this.interfaceSettings.device3DSettings
        }));
    },

    /**
     * Установка режима 3D для конкретного устройства
     *
     * @param {string} deviceId - ID устройства
     * @param {boolean} mode - режим 3D
     */
    setDevice3DMode(deviceId, mode) {
        logDebug('InterfaceStore', 'Установка режима отображения', {
            deviceId,
            mode
        });

        this.interfaceSettings.device3DSettings = {
            ...this.interfaceSettings.device3DSettings,
            [deviceId]: mode
        };

        // Сохраняем в localStorage
        localStorage.setItem('smartlight_interface_settings', JSON.stringify({
            global3DMode: this.interfaceSettings.global3DMode,
            device3DSettings: this.interfaceSettings.device3DSettings
        }));
    }
};

/**
 * Действия для подстора питания
 */
export const powerStoreActions = {
    /**
     * Инициализация питания
     *
     * @returns {Object} результат инициализации
     */
    async init() {
        logDebug('PowerStore', 'Инициализация PowerStore');

        this.loading = true;
        this.error = null;

        try {
            // Загружаем настройки из localStorage
            const settingsJson = localStorage.getItem('smartlight_power_settings');
            if (settingsJson) {
                const settings = JSON.parse(settingsJson);
                this.activePowerSupply = settings.activePowerSupply || 'standard';
            }

            // Инициализируем статус
            const supply = this.powerSupplies[this.activePowerSupply];
            this.powerStatus = {
                status: 'active',
                voltage: supply.voltageRange.min,
                current: 0,
                power: 0,
                lastUpdate: Date.now()
            };

            return {
                success: true,
                message: 'PowerStore инициализирован',
                ...this.powerStatus
            };
        } catch (err) {
            this.error = 'Не удалось инициализировать PowerStore';
            logError('PowerStore', 'Ошибка инициализации', err);

            return {
                success: false,
                message: 'Ошибка инициализации PowerStore',
                error: err.message
            };
        } finally {
            this.loading = false;
        }
    },

    /**
     * Переключение источника питания
     *
     * @param {string} supplyId - ID источника питания
     * @returns {Object} результат переключения
     */
    async switchPowerSupply(supplyId) {
        logDebug('PowerStore', 'Переключение источника питания', { supplyId });

        if (!this.powerSupplies[supplyId]) {
            logError('PowerStore', 'Источник питания не найден', { supplyId });
            return {
                success: false,
                message: 'Источник питания не найден',
                error: 'supply_not_found'
            };
        }

        this.loading = true;
        this.error = null;

        try {
            this.activePowerSupply = supplyId;

            // Сохраняем в localStorage
            localStorage.setItem('smartlight_power_settings', JSON.stringify({
                activePowerSupply: supplyId
            }));

            // Обновляем статус
            const supply = this.powerSupplies[supplyId];
            this.powerStatus = {
                status: 'active',
                voltage: supply.voltageRange.min,
                current: 0,
                power: 0,
                lastUpdate: Date.now()
            };

            logDebug('PowerStore', 'Источник питания переключен', {
                supplyId,
                status: this.powerStatus
            });

            return {
                success: true,
                message: 'Источник питания переключен',
                powerStatus: this.powerStatus
            };
        } catch (err) {
            this.error = 'Не удалось переключить источник питания';
            logError('PowerStore', 'Ошибка переключения', err);

            return {
                success: false,
                message: 'Ошибка переключения источника питания',
                error: err.message
            };
        } finally {
            this.loading = false;
        }
    },

    /**
     * Обновление напряжения
     *
     * @param {string} deviceId - ID устройства
     * @param {number} newVoltage - новое напряжение
     * @returns {Object} результат обновления
     */
    async updateVoltage(deviceId, newVoltage) {
        logDebug('PowerStore', 'Обновление напряжения', { deviceId, newVoltage });

        this.loading = true;
        this.error = null;

        try {
            const supply = this.powerSupplies[this.activePowerSupply];
            const voltageRange = supply.voltageRange;

            // Проверяем, входит ли новое напряжение в допустимый диапазон
            if (newVoltage < voltageRange.min || newVoltage > voltageRange.max) {
                throw new Error(`Напряжение вне диапазона: ${voltageRange.min} - ${voltageRange.max}`);
            }

            this.powerStatus.voltage = newVoltage;
            this.powerStatus.lastUpdate = Date.now();

            logDebug('PowerStore', 'Напряжение обновлено', {
                deviceId,
                newVoltage,
                status: this.powerStatus
            });

            return {
                success: true,
                message: 'Напряжение обновлено',
                powerStatus: this.powerStatus
            };
        } catch (err) {
            this.error = 'Не удалось обновить напряжение';
            logError('PowerStore', 'Ошибка обновления напряжения', err);

            return {
                success: false,
                message: 'Ошибка обновления напряжения',
                error: err.message
            };
        } finally {
            this.loading = false;
        }
    },

    /**
     * Обновление тока
     *
     * @param {string} deviceId - ID устройства
     * @param {number} newCurrent - новый ток
     * @returns {Object} результат обновления
     */
    async updateCurrent(deviceId, newCurrent) {
        logDebug('PowerStore', 'Обновление тока', { deviceId, newCurrent });

        this.loading = true;
        this.error = null;

        try {
            const supply = this.powerSupplies[this.activePowerSupply];
            const currentRange = supply.currentRange;

            // Проверяем, входит ли новый ток в допустимый диапазон
            if (newCurrent < currentRange.min || newCurrent > currentRange.max) {
                throw new Error(`Ток вне диапазона: ${currentRange.min} - ${currentRange.max}`);
            }

            this.powerStatus.current = newCurrent;
            this.powerStatus.power = this.powerStatus.voltage * newCurrent;
            this.powerStatus.lastUpdate = Date.now();

            logDebug('PowerStore', 'Ток обновлен', {
                deviceId,
                newCurrent,
                status: this.powerStatus
            });

            return {
                success: true,
                message: 'Ток обновлен',
                powerStatus: this.powerStatus
            };
        } catch (err) {
            this.error = 'Не удалось обновить ток';
            logError('PowerStore', 'Ошибка обновления тока', err);

            return {
                success: false,
                message: 'Ошибка обновления тока',
                error: err.message
            };
        } finally {
            this.loading = false;
        }
    },

    /**
     * Симуляция отключения питания
     *
     * @param {string} deviceId - ID устройства
     * @param {number} duration - продолжительность в мс
     * @returns {Object} результат симуляции
     */
    async simulatePowerFailure(deviceId, duration) {
        logDebug('PowerStore', 'Симуляция отключения питания', { deviceId, duration });

        this.loading = true;
        this.error = null;

        try {
            const previousStatus = { ...this.powerStatus };

            // Меняем статус на отключенный
            this.powerStatus.status = 'failure';

            logDebug('PowerStore', 'Питание отключено', {
                deviceId,
                duration
            });

            // После заданной продолжительности возвращаем питание
            if (duration) {
                setTimeout(() => {
                    this.powerStatus = previousStatus;
                    this.powerStatus.lastUpdate = Date.now();
                    logDebug('PowerStore', 'Питание восстановлено', { deviceId });
                }, duration);
            }

            return {
                success: true,
                message: 'Симуляция отключения питания запущена',
                powerStatus: this.powerStatus
            };
        } catch (err) {
            this.error = 'Не удалось симулировать отключение питания';
            logError('PowerStore', 'Ошибка симуляции отключения питания', err);

            return {
                success: false,
                message: 'Ошибка симуляции отключения питания',
                error: err.message
            };
        } finally {
            this.loading = false;
        }
    },

    /**
     * Проверка совместимости
     *
     * @param {string} deviceId - ID устройства
     * @param {string} supplyId - ID источника питания
     * @returns {Object} результат проверки
     */
    async checkCompatibility(deviceId, supplyId) {
        logDebug('PowerStore', 'Проверка совместимости', { deviceId, supplyId });

        this.loading = true;
        this.error = null;

        try {
            const device = this.deviceGetDevice(deviceId);
            const supply = this.powerSupplies[supplyId];

            if (!device || !supply) {
                throw new Error('Устройство или источник питания не найдены');
            }

            // Проверяем совместимость напряжения
            const deviceVoltage = device.voltage || 3.7;
            const supplyVoltageRange = supply.voltageRange;

            const isCompatible = deviceVoltage >= supplyVoltageRange.min &&
                deviceVoltage <= supplyVoltageRange.max;

            logDebug('PowerStore', 'Совместимость проверена', {
                deviceId,
                supplyId,
                isCompatible
            });

            return {
                success: true,
                message: 'Совместимость проверена',
                data: {
                    isCompatible,
                        details: {
                            deviceVoltage: deviceVoltage,
                            supplyVoltageRange: supplyVoltageRange
                }
            }
        };
        } catch (err) {
            this.error = 'Не удалось проверить совместимость';
            logError('PowerStore', 'Ошибка проверки совместимости', err);

            return {
                success: false,
                message: 'Ошибка проверки совместимости',
                error: err.message
            };
        } finally {
            this.loading = false;
        }
    },

    /**
     * Получение источника питания по ID
     *
     * @param {string} supplyId - ID источника питания
     * @returns {Object} источник питания
     */
    getPowerSupplyById(supplyId) {
        const supply = this.powerSupplies[supplyId];
        if (!supply) {
            logDebug('PowerStore', 'Источник питания не найден', { supplyId });
            return this.powerSupplies.standard;
        }
        return supply;
    },

    /**
     * Получение устройства по ID
     *
     * @param {string} deviceId - ID устройства
     * @returns {Object|null} устройство или null
     */
    deviceGetDevice(deviceId) {
        // Это временная заглушка, будет заменена на реальный метод в smartlightStore.js
        return null;
    }
};

/**
 * Действия для подстора типов
 */
export const typesStoreActions = {
    /**
     * Инициализация типов
     *
     * @returns {Object} результат инициализации
     */
    async init() {
        logDebug('TypesStore', 'Инициализация TypesStore');

        if (!this.initialized) {
            this.loading = true;
            this.error = null;

            try {
                // Загружаем типы из API
                const [batteryTypesResponse, bulbTypesResponse, powerSupplyResponse] = await Promise.all([
                    TypesApi.getBatteryTypes(),
                    TypesApi.getBulbTypes(),
                    PowerSupplyApi.getAllPowerSupplies()
                ]);

                // Обновляем типы
                if (batteryTypesResponse.success && batteryTypesResponse.data) {
                    this.batteryTypes = {
                        ...this.batteryTypes,
                        ...batteryTypesResponse.data
                    };
                }

                if (bulbTypesResponse.success && bulbTypesResponse.data) {
                    this.bulbTypes = {
                        ...this.bulbTypes,
                        ...bulbTypesResponse.data
                    };
                }

                if (powerSupplyResponse.success && powerSupplyResponse.data) {
                    this.powerSupplies = {
                        ...this.powerSupplies,
                        ...powerSupplyResponse.data
                    };
                }

                this.initialized = true;
                logDebug('TypesStore', 'Типы инициализированы', {
                    batteryTypesCount: Object.keys(this.batteryTypes).length,
                    bulbTypesCount: Object.keys(this.bulbTypes).length,
                    powerSuppliesCount: Object.keys(this.powerSupplies).length
                });
            } catch (error) {
                this.error = 'Не удалось загрузить типы';
                logError('TypesStore', 'Ошибка инициализации типов', error);
            } finally {
                this.loading = false;
            }
        }

        return {
            success: !this.error,
            error: this.error
        };
    },

    /**
     * Получение типа аккумулятора по ID
     *
     * @param {string} batteryTypeId - ID типа аккумулятора
     * @returns {Object} тип аккумулятора
     */
    getBatteryTypeById(batteryTypeId) {
        const type = this.batteryTypes[batteryTypeId];
        if (!type) {
            logDebug('TypesStore', 'Тип аккумулятора не найден', { batteryTypeId });
            return this.batteryTypes['li-ion-18650'];
        }
        return type;
    },

    /**
     * Получение типа лампы по ID
     *
     * @param {string} bulbTypeId - ID типа лампы
     * @returns {Object} тип лампы
     */
    getBulbTypeById(bulbTypeId) {
        const type = this.bulbTypes[bulbTypeId];
        if (!type) {
            logDebug('TypesStore', 'Тип лампы не найден', { bulbTypeId });
            return this.bulbTypes.classic;
        }
        return type;
    },

    /**
     * Получение типа устройства по ID
     *
     * @param {string} deviceTypeId - ID типа устройства
     * @returns {Object} тип устройства
     */
    getDeviceTypeById(deviceTypeId) {
        return this.deviceTypes[deviceTypeId];
    },

    /**
     * Получение состояния устройства по ID
     *
     * @param {string} deviceStateId - ID состояния устройства
     * @returns {Object} состояние устройства
     */
    getDeviceStateById(deviceStateId) {
        return this.deviceStates[deviceStateId];
    }
};
