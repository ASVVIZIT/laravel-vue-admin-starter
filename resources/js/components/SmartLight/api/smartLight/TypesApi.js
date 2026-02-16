/**
 * API для работы с типами SmartLight
 *
 * Этот файл использует PowerSupplyApi для работы с источниками питания
 *
 * @file resources/js/components/SmartLight/api/smartLight/TypesApi.js
 */

import { BatteryTypeApi } from '../batteryTypes/BatteryTypeApi.js';
import { BulbTypeApi } from '../bulbTypes/BulbTypeApi.js';
import { PowerSupplyApi } from '../powerSupplies/PowerSupplyApi.js';

import { BATTERY_TYPES } from '../../stores/smartLight/types/batteryTypes';
import { BULB_TYPES } from '../../stores/smartLight/types/bulbTypes';

export const TypesApi = {
    // Работа с типами батарей
    getBatteryTypes: async () => {
        const response = await BatteryTypeApi.getAllBatteryTypes();
        return {
            success: response.success,
            message: response.message,
            data: response.data || response || [] || BATTERY_TYPES,
            error: response.error
        };
    },

    getBatteryType: async (id) => {
        const response = await BatteryTypeApi.getBatteryTypeById(id);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    setDeviceBatteryType: async (deviceId, batteryTypeId, settings) => {
        const response = await BatteryTypeApi.setDeviceType(deviceId, batteryTypeId, settings);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    getBatteryTypeStatus: async (deviceId) => {
        const response = await BatteryTypeApi.getBatteryTypeStatus(deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulateBatteryVoltageChange: async (deviceId, targetVoltage, duration) => {
        const response = await BatteryTypeApi.simulateVoltageChange(deviceId, targetVoltage, duration);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulateBatteryDegradation: async (deviceId, cycles) => {
        const response = await BatteryTypeApi.simulateDegradation(deviceId, cycles);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulateBatterySelfDischarge: async (deviceId, duration) => {
        const response = await BatteryTypeApi.simulateSelfDischarge(deviceId, duration);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulateBatteryCriticalVoltage: async (deviceId) => {
        const response = await BatteryTypeApi.simulateCriticalVoltage(deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulateBatteryEmergencySleep: async (deviceId) => {
        const response = await BatteryTypeApi.simulateEmergencySleep(deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    getBatteryGroupStatus: async (deviceId) => {
        const response = await BatteryTypeApi.getBatteryGroupStatus(deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    setBatteryGroup: async (deviceId, groupConfig) => {
        const response = await BatteryTypeApi.setBatteryGroup(deviceId, groupConfig);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    // Работа с типами лампочек
    getBulbTypes: async () => {
        const response = await BulbTypeApi.getAllBulbTypes();
        return {
            success: response.success,
            message: response.message,
            data: response.data || response || [] || BULB_TYPES,
            error: response.error
        };
    },

    getBulbType: async (id) => {
        const response = await BulbTypeApi.getBulbTypeById(id);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    setDeviceBulbType: async (deviceId, bulbTypeId, settings) => {
        const response = await BulbTypeApi.setDeviceType(deviceId, bulbTypeId, settings);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    getBulbTypeStatus: async (deviceId) => {
        const response = await BulbTypeApi.getBulbTypeStatus(deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulateLightEffect: async (deviceId, effectType, duration) => {
        const response = await BulbTypeApi.simulateLightEffect(deviceId, effectType, duration);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulateColorChange: async (deviceId, color, duration) => {
        const response = await BulbTypeApi.simulateColorChange(deviceId, color, duration);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    getBulbParameters: async (deviceId) => {
        const response = await BulbTypeApi.getBulbParameters(deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    setBulbParameters: async (deviceId, parameters) => {
        const response = await BulbTypeApi.setBulbParameters(deviceId, parameters);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    getBulbHistory: async (deviceId, options) => {
        const response = await BulbTypeApi.getBulbHistory(deviceId, options);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulateBulbGroupEffect: async (deviceId, effectType, configuration) => {
        const response = await BulbTypeApi.simulateGroupEffect(deviceId, effectType, configuration);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    getBulbTypeCompatibility: async (bulbTypeId, deviceId) => {
        const response = await BulbTypeApi.getBulbTypeCompatibility(bulbTypeId, deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    // Работа с источниками питания
    getPowerSupplies: async () => {
        const response = await PowerSupplyApi.getAllPowerSupplies();
        return {
            success: response.success,
            message: response.message,
            data: response.data || response || [],
            error: response.error
        };
    },

    getPowerSupply: async (id) => {
        const response = await PowerSupplyApi.getPowerSupplyById(id);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    setDevicePowerSupplyType: async (deviceId, supplyId, settings) => {
        const response = await PowerSupplyApi.setDeviceType(deviceId, supplyId, settings);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    activatePowerSupply: async (deviceId, supplyId) => {
        const response = await PowerSupplyApi.activatePowerSupply(deviceId, supplyId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    deactivatePowerSupply: async (deviceId) => {
        const response = await PowerSupplyApi.deactivatePowerSupply(deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulatePowerVoltageChange: async (deviceId, targetVoltage, duration) => {
        const response = await PowerSupplyApi.simulateVoltageChange(deviceId, targetVoltage, duration);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulatePowerFailure: async (deviceId, duration) => {
        const response = await PowerSupplyApi.simulatePowerFailure(deviceId, duration);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    getPowerSupplyStatus: async (deviceId) => {
        const response = await PowerSupplyApi.getPowerSupplyStatus(deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    checkPowerSupplyCompatibility: async (supplyId, deviceId) => {
        const response = await PowerSupplyApi.checkPowerSupplyCompatibility(supplyId, deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulateCharging: async (deviceId, targetVoltage, duration) => {
        const response = await PowerSupplyApi.simulateCharging(deviceId, targetVoltage, duration);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulateDischarging: async (deviceId, targetVoltage, duration) => {
        const response = await PowerSupplyApi.simulateDischarging(deviceId, targetVoltage, duration);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    getPowerParameters: async (deviceId) => {
        const response = await PowerSupplyApi.getPowerParameters(deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    },

    simulatePowerEmergency: async (deviceId) => {
        const response = await PowerSupplyApi.simulateEmergency(deviceId);
        return {
            success: response.success,
            message: response.message,
            data: response.data || response,
            error: response.error
        };
    }
};
