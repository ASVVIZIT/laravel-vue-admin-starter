/**
 * ============================================================================
 * INTERFACE STORE — ПОДСТОР ИНТЕРФЕЙСА
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useInterfaceStore = defineStore('interface', () => {
    const debugPanelVisible = ref(false);
    const globalSettingsVisible = ref(false);
    const global3DMode = ref(false);
    const device3DSettings = ref({});
    const debugLogs = ref([]);

    const init = () => {
        console.log('[InterfaceStore] Initializing...');
        const saved = localStorage.getItem('smartlight_interface_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                debugPanelVisible.value = settings.debugPanelVisible ?? false;
                global3DMode.value = settings.global3DMode || false;
                device3DSettings.value = settings.device3DSettings || {};
                console.log('[InterfaceStore] Loaded from localStorage');
            } catch (e) {
                console.error('[InterfaceStore] Load error:', e);
            }
        }
        return true;
    };

    const saveSettings = () => {
        const settings = {
            debugPanelVisible: debugPanelVisible.value,
            global3DMode: global3DMode.value,
            device3DSettings: device3DSettings.value
        };
        localStorage.setItem('smartlight_interface_settings', JSON.stringify(settings));
    };

    // ✅ ACTION ДЛЯ ЗАКРЫТИЯ ПАНЕЛИ
    const closeDebugPanel = () => {
        debugPanelVisible.value = false;
        saveSettings();
        console.log('[InterfaceStore] Debug panel: closed');
    };

    // ✅ ACTION ДЛЯ ОТКРЫТИЯ ПАНЕЛИ
    const openDebugPanel = () => {
        debugPanelVisible.value = true;
        saveSettings();
        console.log('[InterfaceStore] Debug panel: opened');
    };

    // ✅ TOGGLE ДЛЯ SWITCH (без цикла!)
    const toggleDebugPanel = () => {
        debugPanelVisible.value = !debugPanelVisible.value;
        saveSettings();
        console.log('[InterfaceStore] Debug panel:', debugPanelVisible.value ? 'opened' : 'closed');
    };

    const setGlobalSettingsVisible = (visible) => {
        globalSettingsVisible.value = visible;
    };

    const getDevice3DMode = (deviceId) => {
        if (device3DSettings.value[deviceId] !== undefined) {
            return device3DSettings.value[deviceId];
        }
        return global3DMode.value;
    };

    const setDevice3DMode = (deviceId, mode) => {
        device3DSettings.value[deviceId] = mode;
        saveSettings();
        console.log('[InterfaceStore] 3D mode for', deviceId, ':', mode);
    };

    const toggleDevice3DMode = (deviceId) => {
        const current = getDevice3DMode(deviceId);
        const newMode = !current;
        device3DSettings.value[deviceId] = newMode;
        saveSettings();
        console.log('[InterfaceStore] 3D mode toggled for', deviceId, ':', newMode);
        return newMode;
    };

    const setGlobal3DMode = (mode) => {
        global3DMode.value = mode;
        device3DSettings.value = {};
        saveSettings();
        console.log('[InterfaceStore] Global 3D mode:', mode);
    };

    const toggleGlobal3DMode = () => {
        global3DMode.value = !global3DMode.value;
        device3DSettings.value = {};
        saveSettings();
        console.log('[InterfaceStore] Global 3D mode toggled:', global3DMode.value);
    };

    const addLog = (component, message, data = null) => {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const logEntry = {
            id: Date.now(),
            timestamp,
            component,
            message,
            data
        };
        debugLogs.value.unshift(logEntry);
        if (debugLogs.value.length > 100) debugLogs.value.pop();
    };

    const clearLogs = () => {
        debugLogs.value = [];
        console.log('[InterfaceStore] Logs cleared');
    };

    // ✅ WATCH ДЛЯ ОТЛАДКИ
    watch(() => debugPanelVisible.value, (newVal) => {
        console.log('[InterfaceStore] WATCH: debugPanelVisible =', newVal);
    });

    return {
        debugPanelVisible, globalSettingsVisible, global3DMode, device3DSettings, debugLogs,
        init, saveSettings,
        closeDebugPanel, openDebugPanel, toggleDebugPanel,
        setGlobalSettingsVisible,
        getDevice3DMode, setDevice3DMode, toggleDevice3DMode,
        setGlobal3DMode, toggleGlobal3DMode,
        addLog, clearLogs
    };
});

export default useInterfaceStore;
