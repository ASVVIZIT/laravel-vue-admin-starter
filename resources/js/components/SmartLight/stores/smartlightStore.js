/**
 * ============================================================================
 * SMARTLIGHT STORE — ГЛАВНЫЙ ОБЪЕДИНЁННЫЙ STORE
 * ============================================================================
 * 📁 Путь: stores/smartlightStore.js
 * ✅ Опциональный слой для компонентов которые хотят единый интерфейс
 * ============================================================================
 */

import { useDeviceStore } from './smartlight/deviceStore.js';
import { useSettingsStore } from './smartlight/settingsStore.js';
import { useTypesStore } from './smartlight/typesStore.js';
import { useInterfaceStore } from './smartlight/interfaceStore.js';
import { usePowerStore } from './smartlight/powerStore.js';

export const useSmartlightStore = () => {
    const deviceStore = useDeviceStore();
    const settingsStore = useSettingsStore();
    const typesStore = useTypesStore();
    const interfaceStore = useInterfaceStore();
    const powerStore = usePowerStore();

    return {
        // Device Store
        devices: deviceStore.devices,
        devicesMap: deviceStore.devicesMap,
        selectedDeviceId: deviceStore.selectedDeviceId,
        selectedDevice: deviceStore.selectedDevice,
        realDevices: deviceStore.realDevices,
        fakeDevices: deviceStore.fakeDevices,
        deviceLoading: deviceStore.loading,
        deviceError: deviceStore.error,
        deviceGetDevice: deviceStore.getDevice,
        deviceUpdateDevice: deviceStore.updateDevice,
        deviceUpdateDeviceStatus: deviceStore.updateDeviceStatus,
        deviceUpdateDeviceIntensity: deviceStore.updateDeviceIntensity,
        deviceSelectDevice: deviceStore.selectDevice,
        deviceFetchDevices: deviceStore.fetchDevices,
        deviceWakeDevice: deviceStore.wakeDevice,
        deviceForceSleep: deviceStore.forceSleep,
        deviceUpdateDeviceSettings: deviceStore.updateDeviceSettings,

        // Settings Store
        globalSettings: settingsStore.globalSettings,
        settingsLoading: settingsStore.loading,
        settingsError: settingsStore.error,
        settingsGetGlobalSettings: settingsStore.getGlobalSettings,
        settingsUpdateGlobalSettings: settingsStore.updateGlobalSettings,
        settingsResetGlobalSettings: settingsStore.resetGlobalSettings,

        // Types Store
        batteryTypes: typesStore.batteryTypes,
        bulbTypes: typesStore.bulbTypes,
        powerSupplyTypes: typesStore.powerSupplyTypes,
        typesLoaded: typesStore.typesLoaded,
        typesLoading: typesStore.loading,
        batteryTypesForDropdown: typesStore.batteryTypesForDropdown,
        bulbTypesForDropdown: typesStore.bulbTypesForDropdown,
        powerSuppliesForDropdown: typesStore.powerSuppliesForDropdown,
        typesGetBatteryTypeById: typesStore.getBatteryTypeById,
        typesGetBulbTypeById: typesStore.getBulbTypeById,
        typesGetPowerSupplyById: typesStore.getPowerSupplyById,
        typesFetchTypes: typesStore.fetchTypes,

        // Interface Store
        debugPanelVisible: interfaceStore.debugPanelVisible,
        globalSettingsVisible: interfaceStore.globalSettingsVisible,
        global3DMode: interfaceStore.global3DMode,
        device3DSettings: interfaceStore.device3DSettings,
        debugLogs: interfaceStore.debugLogs,
        interfaceToggleDebugPanel: interfaceStore.toggleDebugPanel,
        interfaceSetGlobalSettingsVisible: interfaceStore.setGlobalSettingsVisible,
        getDevice3DMode: interfaceStore.getDevice3DMode,
        setDevice3DMode: interfaceStore.setDevice3DMode,
        toggleDevice3DMode: interfaceStore.toggleDevice3DMode,
        setGlobal3DMode: interfaceStore.setGlobal3DMode,
        toggleGlobal3DMode: interfaceStore.toggleGlobal3DMode,
        addLog: interfaceStore.addLog,
        clearLogs: interfaceStore.clearLogs,

        // Power Store
        activePowerSupply: powerStore.activePowerSupply,
        powerStatus: powerStore.powerStatus,
        powerCalculateRuntime: powerStore.calculateRuntime,
        powerSetActiveSupply: powerStore.setActiveSupply,

        // Init
        init: async () => {
            console.log('[SmartlightStore] Initializing all stores...');
            await settingsStore.init();
            interfaceStore.init();
            await powerStore.init();
            await typesStore.fetchTypes();
            await deviceStore.fetchDevices();
            console.log('[SmartlightStore] Initialization complete');
        }
    };
};

export default useSmartlightStore;
