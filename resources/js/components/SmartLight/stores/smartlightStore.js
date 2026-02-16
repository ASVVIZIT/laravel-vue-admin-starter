import { defineStore } from 'pinia';
import {
    deviceStoreState,
    settingsStoreState,
    interfaceStoreState,
    powerStoreState,
    typesStoreState
} from './states';
import {
    deviceStoreGetters,
    settingsStoreGetters,
    interfaceStoreGetters,
    powerStoreGetters,
    typesStoreGetters
} from './getters';
import {
    deviceStoreActions,
    settingsStoreActions,
    interfaceStoreActions,
    powerStoreActions,
    typesStoreActions
} from './actions';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';

/**
 * Единый стор Smartlight с разделенными подсторами
 *
 * Вместо жесткого кодирования типов в сторах, мы импортируем их из отдельных файлов
 * Это позволяет легко расширять функционал без изменения основного стора
 *
 * Структура стора:
 * - device: управление устройствами
 * - settings: глобальные настройки
 * - interface: настройки интерфейса
 * - power: управление питанием
 * - types: типы аккумуляторов и ламп
 */
export const useSmartlightStore = defineStore('smartlight', {
    state: () => ({
        // Состояние для управления устройствами
        device: deviceStoreState(),

        // Состояние для глобальных настроек
        settings: settingsStoreState(),

        // Состояние для настроек интерфейса
        interface: interfaceStoreState(),

        // Состояние для питания
        power: powerStoreState(),

        // Состояние для типов аккумуляторов и ламп
        types: typesStoreState()
    }),

    getters: {
        // Геттеры для подстора устройств
        deviceSelectedDevice: (state) => deviceStoreGetters.selectedDevice(state.device),
        deviceRealDevices: (state) => deviceStoreGetters.realDevices(state.device),
        deviceFakeDevices: (state) => deviceStoreGetters.fakeDevices(state.device),

        // Геттеры для подстора настроек
        settingsGlobalSettings: (state) => settingsStoreGetters.globalSettings(state.settings),

        // Геттеры для подстора интерфейса
        interfaceDebugPanelVisible: (state) => interfaceStoreGetters.debugPanelVisible(state.interface),
        interfaceDebugPanelTab: (state) => interfaceStoreGetters.debugPanelTab(state.interface),
        interfaceGlobalSettingsVisible: (state) => interfaceStoreGetters.globalSettingsVisible(state.interface),
        interfaceSettings: (state) => interfaceStoreGetters.interfaceSettings(state.interface),

        // Геттеры для подстора питания
        powerActivePowerSupply: (state) => powerStoreGetters.getActivePowerSupply(state.power),
        powerStatus: (state) => powerStoreGetters.getPowerStatus(state.power),
        powerIsPowerSourceActive: (state) => powerStoreGetters.isPowerSourceActive(state.power),
        powerSuppliesForDropdown: (state) => powerStoreGetters.getPowerSuppliesForDropdown(state.power),

        // Геттеры для подстора типов
        typesBatteryTypesForDropdown: (state) => typesStoreGetters.batteryTypesForDropdown(state.types),
        typesBulbTypesForDropdown: (state) => typesStoreGetters.bulbTypesForDropdown(state.types),
        typesPowerSuppliesForDropdown: (state) => powerStoreGetters.getPowerSuppliesForDropdown(state.power)
    },

    actions: {
        /* ===== Действия для управления устройствами ===== */

        deviceInit(...args) {
            return deviceStoreActions.init.apply(this.device, args);
        },

        deviceFetchDevices(...args) {
            return deviceStoreActions.fetchDevices.apply(this.device, args);
        },

        deviceSelectDevice(...args) {
            return deviceStoreActions.selectDevice.apply(this.device, args);
        },

        deviceUpdateDeviceStatus(...args) {
            return deviceStoreActions.updateDeviceStatus.apply(this.device, args);
        },

        deviceUpdateDeviceVoltage(...args) {
            return deviceStoreActions.updateDeviceVoltage.apply(this.device, args);
        },

        deviceUpdateDeviceIntensity(...args) {
            return deviceStoreActions.updateDeviceIntensity.apply(this.device, args);
        },

        deviceGetDevice(...args) {
            return deviceStoreActions.getDevice.apply(this.device, args);
        },

        deviceGetDevice3DMode(...args) {
            return deviceStoreActions.getDevice3DMode.apply(this.device, args);
        },

        deviceSetDevice3DMode(...args) {
            return deviceStoreActions.setDevice3DMode.apply(this.device, args);
        },

        deviceSetGlobal3DMode(...args) {
            return deviceStoreActions.setGlobal3DMode.apply(this.device, args);
        },

        deviceSaveInterfaceSettings(...args) {
            return deviceStoreActions.saveInterfaceSettings.apply(this.device, args);
        },

        deviceForceSleep(...args) {
            return deviceStoreActions.forceSleep.apply(this.device, args);
        },

        deviceWakeDevice(...args) {
            return deviceStoreActions.wakeDevice.apply(this.device, args);
        },

        deviceUpdateDeviceCriticalVoltage(...args) {
            return deviceStoreActions.updateDeviceCriticalVoltage.apply(this.device, args);
        },

        deviceUpdateDeviceSettings(...args) {
            return deviceStoreActions.updateDeviceSettings.apply(this.device, args);
        },

        deviceUpdateDevice(...args) {
            return deviceStoreActions.updateDevice.apply(this.device, args);
        },

        /* ===== Действия для управления настройками ===== */

        settingsInit(...args) {
            return settingsStoreActions.init.apply(this.settings, args);
        },

        settingsUpdateGlobalSettings(...args) {
            return settingsStoreActions.updateGlobalSettings.apply(this.settings, args);
        },

        settingsGetGlobalSettings(...args) {
            return settingsStoreActions.getGlobalSettings.apply(this.settings, args);
        },

        /* ===== Действия для управления интерфейсом ===== */

        interfaceInit(...args) {
            return interfaceStoreActions.init.apply(this.interface, args);
        },

        interfaceSetSize(...args) {
            return interfaceStoreActions.setSize.apply(this.interface, args);
        },

        interfaceToggleDebugPanel(...args) {
            return interfaceStoreActions.toggleDebugPanel.apply(this.interface, args);
        },

        interfaceSetDebugPanelTab(...args) {
            return interfaceStoreActions.setDebugPanelTab.apply(this.interface, args);
        },

        interfaceSetGlobalSettingsVisible(...args) {
            return interfaceStoreActions.setGlobalSettingsVisible.apply(this.interface, args);
        },

        interfaceSetGlobal3DMode(...args) {
            return interfaceStoreActions.setGlobal3DMode.apply(this.interface, args);
        },

        interfaceSetDevice3DMode(...args) {
            return interfaceStoreActions.setDevice3DMode.apply(this.interface, args);
        },

        /* ===== Действия для управления питанием ===== */

        powerInit(...args) {
            return powerStoreActions.init.apply(this.power, args);
        },

        powerSwitchPowerSupply(...args) {
            return powerStoreActions.switchPowerSupply.apply(this.power, args);
        },

        powerUpdateVoltage(...args) {
            return powerStoreActions.updateVoltage.apply(this.power, args);
        },

        powerUpdateCurrent(...args) {
            return powerStoreActions.updateCurrent.apply(this.power, args);
        },

        powerSimulatePowerFailure(...args) {
            return powerStoreActions.simulatePowerFailure.apply(this.power, args);
        },

        powerCheckCompatibility(...args) {
            return powerStoreActions.checkCompatibility.apply(this.power, args);
        },

        powerGetPowerSupplyById(...args) {
            return powerStoreActions.getPowerSupplyById.apply(this.power, args);
        },

        /* ===== Действия для управления типами ===== */

        typesInit(...args) {
            return typesStoreActions.init.apply(this.types, args);
        },

        typesGetBatteryTypeById(...args) {
            return typesStoreActions.getBatteryTypeById.apply(this.types, args);
        },

        typesGetBulbTypeById(...args) {
            return typesStoreActions.getBulbTypeById.apply(this.types, args);
        },

        typesGetPowerSupplyById(...args) {
            return powerStoreActions.getPowerSupplyById.apply(this.power, args);
        },

        typesGetDeviceTypeById(...args) {
            return typesStoreActions.getDeviceTypeById.apply(this.types, args);
        },

        typesGetDeviceStateById(...args) {
            return typesStoreActions.getDeviceStateById.apply(this.types, args);
        }
    }
});
