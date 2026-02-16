/**
 * Подстор для управления типами
 *
 * Содержит state, getters и actions для подстора типов
 *
 * @file stores/typesStore.js
 */

import { defineStore } from 'pinia';
import { BATTERY_TYPES } from './types/batteryTypes';
import { BULB_TYPES } from './types/bulbTypes';
import { DEVICE_TYPES, DEVICE_STATE } from './types/deviceTypes';
import { POWER_SUPPLY_TYPES } from './types/powerSupplyTypes';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';
import { TypesApi } from '@/components/SmartLight/api/smartLight/TypesApi';
import { PowerSupplyApi } from '@/components/SmartLight/api/powerSupplies/PowerSupplyApi';

export const useTypesStore = defineStore('smartlight/types', {
    state: () => ({
        batteryTypes: BATTERY_TYPES,
        bulbTypes: BULB_TYPES,
        powerSupplies: POWER_SUPPLY_TYPES,
        deviceTypes: DEVICE_TYPES,
        deviceStates: DEVICE_STATE,
        loading: false,
        error: null,
        initialized: false
    }),

    getters: {
        batteryTypesForDropdown: (state) => {
            return Object.entries(state.batteryTypes).map(([id, type]) => ({
                id,
                label: type.name,
                value: id
            }));
        },

        bulbTypesForDropdown: (state) => {
            return Object.entries(state.bulbTypes).map(([id, type]) => ({
                id,
                label: type.name,
                value: id
            }));
        },

        powerSuppliesForDropdown: (state) => {
            return Object.entries(state.powerSupplies).map(([id, supply]) => ({
                id,
                label: supply.name,
                value: id
            }));
        },

        deviceTypesForDropdown: (state) => {
            return Object.entries(state.deviceTypes).map(([id, type]) => ({
                id,
                label: type.name,
                value: id
            }));
        },

        deviceStatesForDropdown: (state) => {
            return Object.entries(state.deviceStates).map(([id, state]) => ({
                id,
                label: state,
                value: id
            }));
        }
    },

    actions: {
        async init() {
            logDebug('TypesStore', 'Инициализация TypesStore');

            if (!this.initialized) {
                this.loading = true;
                this.error = null;

                try {
                    // Загружаем типы из API
                    const [batteryTypesResponse, bulbTypesResponse, powerSupplyResponse] = await Promise.all([
                        TypesApi.getBatteryTypes(),
                        TypesApi.getBulbTypes(),
                        PowerSupplyApi.getAllPowerSupplies()
                    ]);

                    // Обновляем типы
                    if (batteryTypesResponse.success && batteryTypesResponse.data) {
                        this.batteryTypes = {
                            ...this.batteryTypes,
                            ...batteryTypesResponse.data
                        };
                    }

                    if (bulbTypesResponse.success && bulbTypesResponse.data) {
                        this.bulbTypes = {
                            ...this.bulbTypes,
                            ...bulbTypesResponse.data
                        };
                    }

                    if (powerSupplyResponse.success && powerSupplyResponse.data) {
                        this.powerSupplies = {
                            ...this.powerSupplies,
                            ...powerSupplyResponse.data
                        };
                    }

                    this.initialized = true;
                    logDebug('TypesStore', 'Типы инициализированы', {
                        batteryTypesCount: Object.keys(this.batteryTypes).length,
                        bulbTypesCount: Object.keys(this.bulbTypes).length,
                        powerSuppliesCount: Object.keys(this.powerSupplies).length
                    });
                } catch (error) {
                    this.error = 'Не удалось загрузить типы';
                    logError('TypesStore', 'Ошибка инициализации типов', error);
                } finally {
                    this.loading = false;
                }
            }

            return {
                success: !this.error,
                error: this.error
            };
        },

        getBatteryTypeById(batteryTypeId) {
            const type = this.batteryTypes[batteryTypeId];
            if (!type) {
                logDebug('TypesStore', 'Тип аккумулятора не найден', { batteryTypeId });
                return this.batteryTypes['li-ion-18650'];
            }
            return type;
        },

        getBulbTypeById(bulbTypeId) {
            const type = this.bulbTypes[bulbTypeId];
            if (!type) {
                logDebug('TypesStore', 'Тип лампы не найден', { bulbTypeId });
                return this.bulbTypes.classic;
            }
            return type;
        },

        getPowerSupplyById(supplyId) {
            const supply = this.powerSupplies[supplyId];
            if (!supply) {
                logDebug('TypesStore', 'Источник питания не найден', { supplyId });
                return this.powerSupplies.standard;
            }
            return supply;
        },

        getDeviceTypeById(deviceTypeId) {
            return this.deviceTypes[deviceTypeId];
        },

        getDeviceStateById(deviceStateId) {
            return this.deviceStates[deviceStateId];
        }
    }
});
