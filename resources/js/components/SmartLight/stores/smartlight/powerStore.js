/**
 * Подстор для управления питанием
 *
 * Содержит state, getters и actions для подстора питания
 *
 * @file stores/smartlight/powerStore.js
 */

import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';
import { POWER_SUPPLY_TYPES } from './types/powerSupplyTypes';

export const powerStoreState = () => ({
    powerSupplies: POWER_SUPPLY_TYPES,
    activePowerSupply: 'standard',
    loading: false,
    error: null,
    powerStatus: {
        status: 'active',
        voltage: 3.7,
        current: 0,
        power: 0,
        lastUpdate: Date.now()
    }
});

export const powerStoreGetters = {
    getActivePowerSupply: (state) => {
        return state.powerSupplies[state.activePowerSupply];
    },

    getPowerStatus: (state) => {
        return state.powerStatus;
    },

    isPowerSourceActive: (state) => {
        return state.powerStatus.status === 'active';
    },

    getPowerSuppliesForDropdown: (state) => {
        return Object.entries(state.powerSupplies).map(([id, supply]) => ({
            id,
            label: supply.name,
            value: id
        }));
    }
};

// Этот файл будет заполнен в smartlightStore.js
export const powerStoreActions = {};
