/**
 * API для работы с типами SmartLight
 *
 * @file resources/js/components/SmartLight/api/core/smartLight/coreTypesApi.js
 */

import { CoreBatteryTypeApi } from '@components/SmartLight/api/core/types/batteryTypes/coreBatteryTypeApi.js';
import { CoreBulbTypeApi } from '@components/SmartLight/api/core/types/bulbTypes/coreBulbTypeApi.js';
import { corePowerSupplyTypeApi } from '@components/SmartLight/api/core/types/powerSupplyTypes/corePowerSupplyTypeApi.js';

import { BATTERY_TYPES } from '@components/SmartLight/stores/smartlight/types/batteryTypes.js';
import { BULB_TYPES } from '@components/SmartLight/stores/smartlight/types/bulbTypes.js';

export const CoreTypesApi = {
    // Работа с типами батарей
    getBatteryTypes: async () => {
        const response = await CoreBatteryTypeApi.getAllBatteryTypes();
        return {
            success: response.success,
            message: response.message,
            data: response.data || response || [] || BATTERY_TYPES,
            error: response.error
        };
    },

    getBatteryType: async (id) => {
        const response = await CoreBatteryTypeApi.getBatteryTypeById(id);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    // ... (остальные методы battery)

    // Работа с типами лампочек
    getBulbTypes: async () => {
        const response = await CoreBulbTypeApi.getAllBulbTypes();
        return {
            success: response.success,
            message: response.message,
            data: response.data || response || [] || BULB_TYPES,
            error: response.error
        };
    },

    getBulbType: async (id) => {
        const response = await CoreBulbTypeApi.getBulbTypeById(id);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    // ... (остальные методы bulb)

    // Работа с типами источников питания
    getPowerSupplyTypes: async () => {
        const response = await corePowerSupplyTypeApi.getAllPowerSupplyTypes();
        return {
            success: response.success,
            message: response.message,
            data: response.data || response || [],
            error: response.error
        };
    },

    getPowerSupplyType: async (id) => {
        const response = await corePowerSupplyTypeApi.getPowerSupplyTypeById(id);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    checkPowerSupplyTypeCompatibility: async (supplyTypeId, deviceId) => {
        const response = await corePowerSupplyTypeApi.checkPowerSupplyTypeCompatibility(supplyTypeId, deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    }
};
