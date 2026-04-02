/**
 * ============================================================================
 * TYPES STORE — ПОДСТОР ТИПОВ
 * ============================================================================
 * 📁 Путь: stores/smartlight/typesStore.js
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { BATTERY_TYPES, getBatteryTypeById as getBatteryTypeConst } from './types/batteryTypes.js';
import { BULB_TYPES, getBulbTypeById as getBulbTypeConst } from './types/bulbTypes.js';
import { POWER_SUPPLY_TYPES, getPowerSupplyById as getPowerSupplyConst } from './types/powerSupplyTypes.js';
import { CoreTypesResource } from '@/components/SmartLight/api/core/resource/coreTypesResource.js';

export const useTypesStore = defineStore('types', () => {
    const batteryTypes = ref({});
    const bulbTypes = ref({});
    const powerSupplyTypes = ref({});
    const typesLoaded = ref(false);
    const loading = ref(false);

    const batteryTypesForDropdown = computed(() => {
        if (typesLoaded.value && Object.keys(batteryTypes.value).length > 0) {
            return Object.entries(batteryTypes.value).map(([id, type]) => ({
                id,
                label: type.name || id,
                value: id
            }));
        }
        return Object.entries(BATTERY_TYPES).map(([id, type]) => ({
            id,
            label: type.name,
            value: id
        }));
    });

    const bulbTypesForDropdown = computed(() => {
        if (typesLoaded.value && Object.keys(bulbTypes.value).length > 0) {
            return Object.entries(bulbTypes.value).map(([id, type]) => ({
                id,
                label: type.name || id,
                value: id
            }));
        }
        return Object.entries(BULB_TYPES).map(([id, type]) => ({
            id,
            label: type.name,
            value: id
        }));
    });

    const powerSuppliesForDropdown = computed(() => {
        if (typesLoaded.value && Object.keys(powerSupplyTypes.value).length > 0) {
            return Object.entries(powerSupplyTypes.value).map(([id, type]) => ({
                id,
                label: type.name || id,
                value: id
            }));
        }
        return Object.entries(POWER_SUPPLY_TYPES).map(([id, type]) => ({
            id,
            label: type.name,
            value: id
        }));
    });

    const getBatteryTypeById = (id) => {
        return batteryTypes.value[id] || getBatteryTypeConst(id);
    };

    const getBulbTypeById = (id) => {
        return bulbTypes.value[id] || getBulbTypeConst(id);
    };

    const getPowerSupplyById = (id) => {
        return powerSupplyTypes.value[id] || getPowerSupplyConst(id);
    };

    const fetchTypes = async () => {
        loading.value = true;
        console.log('[TypesStore] Fetching types from API...');
        try {
            const resource = new CoreTypesResource();
            const [batteries, bulbs, powerSupplies] = await Promise.all([
                resource.getBatteryTypes(),
                resource.getBulbTypes(),
                resource.getPowerSupplies()
            ]);

            if (batteries.data) {
                if (Array.isArray(batteries.data)) {
                    batteryTypes.value = batteries.data.reduce((acc, type) => {
                        acc[type.id] = type;
                        return acc;
                    }, {});
                } else if (typeof batteries.data === 'object') {
                    batteryTypes.value = batteries.data;
                }
            }

            if (bulbs.data) {
                if (Array.isArray(bulbs.data)) {
                    bulbTypes.value = bulbs.data.reduce((acc, type) => {
                        acc[type.id] = type;
                        return acc;
                    }, {});
                } else if (typeof bulbs.data === 'object') {
                    bulbTypes.value = bulbs.data;
                }
            }

            if (powerSupplies.data) {
                if (Array.isArray(powerSupplies.data)) {
                    powerSupplyTypes.value = powerSupplies.data.reduce((acc, type) => {
                        acc[type.id] = type;
                        return acc;
                    }, {});
                } else if (typeof powerSupplies.data === 'object') {
                    powerSupplyTypes.value = powerSupplies.data;
                }
            }

            typesLoaded.value = true;
            console.log('[TypesStore] Types loaded:', {
                batteries: Object.keys(batteryTypes.value).length,
                bulbs: Object.keys(bulbTypes.value).length,
                powerSupplies: Object.keys(powerSupplyTypes.value).length
            });
            return { success: true };
        } catch (err) {
            console.warn('[TypesStore] API failed, using fallback constants');
            batteryTypes.value = BATTERY_TYPES;
            bulbTypes.value = BULB_TYPES;
            powerSupplyTypes.value = POWER_SUPPLY_TYPES;
            typesLoaded.value = true;
            return { success: false, message: err.message };
        } finally {
            loading.value = false;
        }
    };

    return {
        batteryTypes, bulbTypes, powerSupplyTypes, typesLoaded, loading,
        batteryTypesForDropdown, bulbTypesForDropdown, powerSuppliesForDropdown,
        getBatteryTypeById, getBulbTypeById, getPowerSupplyById,
        fetchTypes
    };
});

export default useTypesStore;
