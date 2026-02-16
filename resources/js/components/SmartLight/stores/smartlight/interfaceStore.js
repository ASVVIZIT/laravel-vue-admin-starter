/**
 * Подстор для управления интерфейсом
 *
 * Содержит state, getters и actions для подстора интерфейса
 *
 * @file stores/smartlight/interfaceStore.js
 */

import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';

export const interfaceStoreState = () => ({
    size: 'small',
    debugPanelVisible: true,
    debugPanelTab: 'debug',
    globalSettingsVisible: false,
    loading: false,
    error: null,
    interfaceSettings: {
        global3DMode: false,
        device3DSettings: {}
    }
});

export const interfaceStoreGetters = {
    /**
     * Получение видимости панели отладки
     *
     * @param {Object} state - состояние подстора
     * @returns {boolean} видимость панели отладки
     */
    debugPanelVisible: (state) => {
        return state.debugPanelVisible;
    },

    /**
     * Получение текущей вкладки панели отладки
     *
     * @param {Object} state - состояние подстора
     * @returns {string} название текущей вкладки
     */
    debugPanelTab: (state) => {
        return state.debugPanelTab;
    },

    /**
     * Получение видимости глобальных настроек
     *
     * @param {Object} state - состояние подстора
     * @returns {boolean} видимость глобальных настроек
     */
    globalSettingsVisible: (state) => {
        return state.globalSettingsVisible;
    },

    /**
     * Получение настроек интерфейса
     *
     * @param {Object} state - состояние подстора
     * @returns {Object} настройки интерфейса
     */
    interfaceSettings: (state) => {
        return state.interfaceSettings;
    }
};

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
        logDebug('InterfaceStore', 'Изменение размера', { size });
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
        logDebug('InterfaceStore', 'Изменение вкладки панели отладки', { tab });
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
     * Установка режима отображения
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
