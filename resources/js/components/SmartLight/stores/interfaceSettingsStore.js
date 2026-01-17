import { defineStore } from 'pinia';

export const useInterfaceSettingsStore = defineStore('smartLightInterfaceSettings', {
    state: () => ({
        // Глобальные настройки отображения
        global3DMode: false,

        // Индивидуальные настройки для устройств
        device3DSettings: {},

        // Системные настройки
        systemSettings: {
            batteryRenderer: {
                default3D: false,
                defaultBatteryType: 'li-ion'
            },
            bulbRenderer: {
                default3D: false,
                defaultBulbType: 'classic'
            }
        }
    }),

    getters: {
        // Получить режим отображения для конкретного устройства
        getDevice3DMode: state => deviceId => {
            return state.device3DSettings[deviceId] ?? state.global3DMode;
        },

        // Проверка, есть ли индивидуальные настройки для устройства
        hasDeviceSettings: state => deviceId => {
            return Object.prototype.hasOwnProperty.call(state.device3DSettings, deviceId);
        }
    },

    actions: {
        // Установить глобальный режим
        setGlobal3DMode(value) {
            this.global3DMode = value;
            localStorage.setItem('smartlight_global_3d_mode', value.toString());
        },

        // Установить режим для конкретного устройства
        setDevice3DMode(deviceId, value) {
            this.device3DSettings = { ...this.device3DSettings, [deviceId]: value };
            localStorage.setItem(`smartlight_device_3d_mode_${deviceId}`, value.toString());
        },

        // Сбросить режим для конкретного устройства
        resetDevice3DMode(deviceId) {
            delete this.device3DSettings[deviceId];
            localStorage.removeItem(`smartlight_device_3d_mode_${deviceId}`);
            this.device3DSettings = { ...this.device3DSettings };
        },

        // Загрузить настройки из localStorage
        loadSettings() {
            // Загружаем глобальные настройки
            const globalMode = localStorage.getItem('smartlight_global_3d_mode');
            if (globalMode !== null) {
                this.global3DMode = globalMode === 'true';
            }

            // Загружаем индивидуальные настройки
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('smartlight_device_3d_mode_')) {
                    const deviceId = key.replace('smartlight_device_3d_mode_', '');
                    this.device3DSettings[deviceId] = localStorage.getItem(key) === 'true';
                }
            });
        },

        // Инициализация
        init() {
            this.loadSettings();
        }
    }
});
