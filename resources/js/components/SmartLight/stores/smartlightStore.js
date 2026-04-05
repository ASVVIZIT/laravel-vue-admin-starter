/**
 * ============================================================================
 * SMARTLIGHT STORE — ГЛАВНЫЙ ОБЪЕДИНЁННЫЙ STORE (ОБРАТНАЯ СОВМЕСТИМОСТЬ)
 * ============================================================================
 * 📁 Путь: stores/smartlightStore.js
 * ✅ Назначение: Единая точка доступа для legacy-компонентов
 * ✅ Рефакторинг: внутренние вызовы переведены на *Store() методы
 * ============================================================================
 */

import { useDeviceStore } from './smartlight/deviceStore.js';
import { useSettingsStore } from './smartlight/settingsStore.js';
import { useTypesStore } from './smartlight/typesStore.js';
import { useInterfaceStore } from './smartlight/interfaceStore.js';
import { usePowerStore } from './smartlight/powerStore.js';
import { useVisualizationConfigStore } from './smartlight/visualizationConfigStore.js';

export const useSmartlightStore = () => {
    const deviceStore = useDeviceStore();
    const settingsStore = useSettingsStore();
    const typesStore = useTypesStore();
    const interfaceStore = useInterfaceStore();
    const powerStore = usePowerStore();
    const visualizationConfigStore = useVisualizationConfigStore();

    return {
        // === Device Store ===
        devices: deviceStore.devices,
        devicesMap: deviceStore.devicesMap,
        selectedDeviceId: deviceStore.selectedDeviceId,
        selectedDevice: deviceStore.selectedDevice,
        realDevices: deviceStore.realDevices,
        fakeDevices: deviceStore.fakeDevices,
        deviceLoading: deviceStore.loading,
        deviceError: deviceStore.error,
        deviceGetDevice: deviceStore.getDeviceStore,
        deviceUpdateDevice: deviceStore.updateDeviceStore,
        deviceUpdateDeviceTelemetry: deviceStore.updateDeviceTelemetryStore,
        deviceUpdateDeviceStatus: deviceStore.updateDeviceStatusStore,
        deviceUpdateDeviceIntensity: deviceStore.updateDeviceIntensityStore,
        deviceUpdateDeviceSettings: deviceStore.updateDeviceSettingsStore,
        deviceSelectDevice: deviceStore.selectDeviceStore,
        deviceFetchDevices: deviceStore.fetchDevicesStore,
        deviceWakeDevice: deviceStore.wakeDeviceStore,
        deviceForceSleep: deviceStore.forceSleepStore,

        // === Settings Store ===
        globalSettings: settingsStore.globalSettings,
        settingsLoading: settingsStore.loading,
        settingsError: settingsStore.error,
        settingsGetGlobalSettings: settingsStore.getGlobalSettingsStore,
        settingsUpdateGlobalSettings: settingsStore.updateGlobalSettingsStore,
        settingsResetGlobalSettings: settingsStore.resetGlobalSettingsStore,

        // === Types Store ===
        batteryTypes: typesStore.batteryTypes,
        bulbTypes: typesStore.bulbTypes,
        powerSupplyTypes: typesStore.powerSupplyTypes,
        typesLoaded: typesStore.typesLoaded,
        typesLoading: typesStore.loading,
        batteryTypesForDropdown: typesStore.batteryTypesForDropdownStore,
        bulbTypesForDropdown: typesStore.bulbTypesForDropdownStore,
        powerSuppliesForDropdown: typesStore.powerSuppliesForDropdownStore,
        typesGetBatteryTypeById: typesStore.getBatteryTypeByIdStore,
        typesGetBulbTypeById: typesStore.getBulbTypeByIdStore,
        typesGetPowerSupplyById: typesStore.getPowerSupplyByIdStore,
        typesFetchTypes: typesStore.fetchTypesStore,

        // === Interface Store ===
        debugPanelVisible: interfaceStore.debugPanelVisible,
        globalSettingsVisible: interfaceStore.globalSettingsVisible,
        global3DMode: interfaceStore.global3DMode,
        device3DSettings: interfaceStore.device3DSettings,
        debugLogs: interfaceStore.debugLogs,
        sidebarCollapsed: interfaceStore.sidebarCollapsed,
        theme: interfaceStore.theme,
        rightPanelVisible: interfaceStore.rightPanelVisible,
        rightPanelTab: interfaceStore.rightPanelTab,
        interfaceToggleDebugPanel: interfaceStore.toggleDebugPanelStore,
        interfaceSetGlobalSettingsVisible: interfaceStore.setGlobalSettingsVisibleStore,
        interfaceToggleGlobalSettingsVisible: interfaceStore.toggleGlobalSettingsVisibleStore,
        getDevice3DMode: interfaceStore.getDevice3DModeStore,
        setDevice3DMode: interfaceStore.setDevice3DModeStore,
        toggleDevice3DMode: interfaceStore.toggleDevice3DModeStore,
        setGlobal3DMode: interfaceStore.setGlobal3DModeStore,
        toggleGlobal3DMode: interfaceStore.toggleGlobal3DModeStore,
        addLog: interfaceStore.addLogStore,
        clearLogs: interfaceStore.clearLogsStore,
        setRightPanelVisible: interfaceStore.setRightPanelVisibleStore,
        toggleRightPanel: interfaceStore.toggleRightPanelStore,
        setRightPanelTab: interfaceStore.setRightPanelTabStore,

        // === Power Store ===
        activePowerSupply: powerStore.activePowerSupply,
        powerStatus: powerStore.powerStatus,
        powerCalculateRuntime: powerStore.calculateRuntimeStore,
        powerSetActiveSupply: powerStore.setActiveSupplyStore,

        // === Visualization Config Store ===
        visualizationBatteryTypes: visualizationConfigStore.batteryTypes,
        visualizationBulbTypes: visualizationConfigStore.bulbTypes,
        visualizationPowerTypes: visualizationConfigStore.powerTypes,
        getBatteryConfig: visualizationConfigStore.getBatteryConfigStore,
        getBulbConfig: visualizationConfigStore.getBulbConfigStore,
        getPowerConfig: visualizationConfigStore.getPowerConfigStore,
        getVisualConfig: visualizationConfigStore.getVisualConfigStore,
        getVueComponent: visualizationConfigStore.getVueComponentStore,

        // === Init ===
        init: async () => {
            console.log('[SmartlightStore] Initializing all stores...');
            await settingsStore.initSettingsStore?.();
            interfaceStore.initInterfaceStore?.();
            await powerStore.initPowerStore?.();
            await typesStore.fetchTypesStore?.();
            await deviceStore.fetchDevicesStore?.();
            console.log('[SmartlightStore] Initialization complete');
        }
    };
};

export default useSmartlightStore;
