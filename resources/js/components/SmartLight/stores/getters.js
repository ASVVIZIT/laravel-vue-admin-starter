/**
 * Геттеры для Pinia сторов
 *
 * Экспортирует геттеры для каждого подстора
 *
 * @file stores/getters.js
 */

/**
 * Геттеры для подстора устройств
 */
export const deviceStoreGetters = {
    /**
     * Получение выбранного устройства
     *
     * @param {Object} state - состояние подстора
     * @returns {Object|null} выбранное устройство или null
     */
    selectedDevice: (state) => {
        if (!state.selectedDeviceId) return null;
        return state.devicesMap.get(state.selectedDeviceId) || null;
    },

    /**
     * Получение списка реальных устройств
     *
     * @param {Object} state - состояние подстора
     * @returns {Array} список реальных устройств
     */
    realDevices: (state) => {
        return state.devices.filter(device => !device.is_fake);
    },

    /**
     * Получение списка фейковых устройств
     *
     * @param {Object} state - состояние подстора
     * @returns {Array} список фейковых устройств
     */
    fakeDevices: (state) => {
        return state.devices.filter(device => device.is_fake);
    }
};

/**
 * Геттеры для подстора настроек
 */
export const settingsStoreGetters = {
    /**
     * Получение глобальных настроек
     *
     * @param {Object} state - состояние подстора
     * @returns {Object} глобальные настройки
     */
    globalSettings: (state) => {
        return state.globalSettings;
    }
};

/**
 * Геттеры для подстора интерфейса
 */
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

/**
 * Геттеры для подстора питания
 */
export const powerStoreGetters = {
    /**
     * Получение активного источника питания
     *
     * @param {Object} state - состояние подстора
     * @returns {Object} активный источник питания
     */
    getActivePowerSupply: (state) => {
        return state.powerSupplies[state.activePowerSupply];
    },

    /**
     * Получение статуса питания
     *
     * @param {Object} state - состояние подстора
     * @returns {Object} статус питания
     */
    getPowerStatus: (state) => {
        return state.powerStatus;
    },

    /**
     * Проверка активности источника питания
     *
     * @param {Object} state - состояние подстора
     * @returns {boolean} активен ли источник питания
     */
    isPowerSourceActive: (state) => {
        return state.powerStatus.status === 'active';
    },

    /**
     * Подготовка источников питания для выпадающих списков
     *
     * @param {Object} state - состояние подстора
     * @returns {Array} массив объектов для выпадающего списка
     */
    getPowerSuppliesForDropdown: (state) => {
        return Object.entries(state.powerSupplies).map(([id, supply]) => ({
            id,
            label: supply.name,
            value: id
        }));
    }
};

/**
 * Геттеры для подстора типов
 */
export const typesStoreGetters = {
    /**
     * Подготовка типов аккумуляторов для выпадающих списков
     *
     * @param {Object} state - состояние подстора
     * @returns {Array} массив объектов для выпадающего списка
     */
    batteryTypesForDropdown: (state) => {
        return Object.entries(state.batteryTypes).map(([id, type]) => ({
            id,
            label: type.name,
            value: id
        }));
    },

    /**
     * Подготовка типов ламп для выпадающих списков
     *
     * @param {Object} state - состояние подстора
     * @returns {Array} массив объектов для выпадающего списка
     */
    bulbTypesForDropdown: (state) => {
        return Object.entries(state.bulbTypes).map(([id, type]) => ({
            id,
            label: type.name,
            value: id
        }));
    },

    /**
     * Подготовка типов устройств для выпадающих списков
     *
     * @param {Object} state - состояние подстора
     * @returns {Array} массив объектов для выпадающего списка
     */
    deviceTypesForDropdown: (state) => {
        return Object.entries(state.deviceTypes).map(([id, type]) => ({
            id,
            label: type.name,
            value: id
        }));
    },

    /**
     * Подготовка состояний устройств для выпадающих списков
     *
     * @param {Object} state - состояние подстора
     * @returns {Array} массив объектов для выпадающего списка
     */
    deviceStatesForDropdown: (state) => {
        return Object.entries(state.deviceStates).map(([id, state]) => ({
            id,
            label: state,
            value: id
        }));
    }
};
