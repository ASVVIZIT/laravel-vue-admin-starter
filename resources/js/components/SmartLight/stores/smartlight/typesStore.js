/**
 * ============================================================================
 * TYPES STORE — УПРАВЛЕНИЕ СПРАВОЧНИКАМИ (ПРЯМОЙ ИМПОРТ, БЕЗ КОСТЫЛЕЙ)
 * ============================================================================
 * 📁 Путь: stores/smartlight/typesStore.js
 * ✅ Исправлено: прямой импорт низкоуровневых API, обход агрегатора
 * ✅ Рефакторинг: методы получили суффикс Store(), импорты обновлены на *Utils
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

// ✅ ПРЯМОЙ ИМПОРТ НИЗКОУРОВНЕВЫХ API
import { coreBatteryTypeApi } from '@components/SmartLight/api/core/types/coreBatteryTypeApi.js';
import { coreBulbTypeApi } from '@components/SmartLight/api/core/types/coreBulbTypeApi.js';
import { corePowerSupplyTypeApi } from '@components/SmartLight/api/core/types/corePowerSupplyTypeApi.js';

// Фолбэк-константы если API не отвечает
import { BATTERY_TYPES } from '@/components/SmartLight/stores/smartlight/types/batteryTypes.js';
import { BULB_TYPES } from '@/components/SmartLight/stores/smartlight/types/bulbTypes.js';
import { POWER_SUPPLY_TYPES } from '@/components/SmartLight/stores/smartlight/types/powerSupplyTypes.js';

export const useTypesStore = defineStore('smartlight-types', () => {
    // === STATE ===
    const batteryTypes = ref({});
    const bulbTypes = ref({});
    const powerSupplyTypes = ref({});
    const typesLoaded = ref(false);
    const loading = ref(false);
    const error = ref(null);

    // === GETTERS: Для <el-select> ===
    const batteryTypesForDropdownStore = computed(() =>
        Object.values(batteryTypes.value).map(t => ({
            value: t.id,
            label: t.name || t.short_name || t.id
        }))
    );

    const bulbTypesForDropdownStore = computed(() =>
        Object.values(bulbTypes.value).map(t => ({
            value: t.id,
            label: t.name || t.short_name || t.id
        }))
    );

    const powerSuppliesForDropdownStore = computed(() =>
        Object.values(powerSupplyTypes.value).map(t => ({
            value: t.id,
            label: t.name || t.short_name || t.id
        }))
    );

    // === GETTERS: Поиск по ID ===
    const getBatteryTypeByIdStore = (id) => batteryTypes.value[id] || null;
    const getBulbTypeByIdStore = (id) => bulbTypes.value[id] || null;
    const getPowerSupplyByIdStore = (id) => powerSupplyTypes.value[id] || null;

    // === ACTIONS ===

    const fetchTypesStore = async () => {
        if (typesLoaded.value && !loading.value) {
            return { success: true, cached: true };
        }

        loading.value = true;
        error.value = null;
        logDebugUtils('TypesStore', 'Fetching types from API (direct import)...');

        try {
            const [batteryRes, bulbRes, powerRes] = await Promise.all([
                coreBatteryTypeApi.getAllBatteryTypesTypeApi(),
                coreBulbTypeApi.getAllBulbTypesTypeApi(),
                corePowerSupplyTypeApi.getAllPowerSupplyTypesTypeApi()
            ]);

            const parseTypes = (response, fallback) => {
                if (!response?.success) return fallback || {};
                const data = response.data;
                if (!data || typeof data !== 'object') return fallback || {};
                if (!Array.isArray(data)) return data;
                return data.reduce((acc, item) => {
                    if (item?.id) acc[item.id] = item;
                    return acc;
                }, {});
            };

            batteryTypes.value = parseTypes(batteryRes, BATTERY_TYPES);
            bulbTypes.value = parseTypes(bulbRes, BULB_TYPES);
            powerSupplyTypes.value = parseTypes(powerRes, POWER_SUPPLY_TYPES);

            typesLoaded.value = true;

            logDebugUtils('TypesStore', 'Types loaded', {
                batteries: Object.keys(batteryTypes.value).length,
                bulbs: Object.keys(bulbTypes.value).length,
                powerSupplies: Object.keys(powerSupplyTypes.value).length
            });

            return { success: true };

        } catch (err) {
            logErrorUtils('TypesStore', 'Failed to fetch types', err);
            error.value = err.message || 'Не удалось загрузить справочники';
            typesLoaded.value = false;

            // Фолбэк на константы при ошибке
            batteryTypes.value = BATTERY_TYPES;
            bulbTypes.value = BULB_TYPES;
            powerSupplyTypes.value = POWER_SUPPLY_TYPES;

            return { success: false, error: err.message };
        } finally {
            loading.value = false;
        }
    };

    const refreshTypesStore = async () => {
        typesLoaded.value = false;
        return await fetchTypesStore();
    };

    const clearTypesStore = () => {
        batteryTypes.value = {};
        bulbTypes.value = {};
        powerSupplyTypes.value = {};
        typesLoaded.value = false;
        logDebugUtils('TypesStore', 'Types cache cleared');
    };

    const initTypesStore = async () => {
        if (!typesLoaded.value) {
            await fetchTypesStore();
        }
    };

    // === EXPOSE ===
    return {
        // State
        batteryTypes,
        bulbTypes,
        powerSupplyTypes,
        typesLoaded,
        loading,
        error,
        // Getters
        batteryTypesForDropdownStore,
        bulbTypesForDropdownStore,
        powerSuppliesForDropdownStore,
        getBatteryTypeByIdStore,
        getBulbTypeByIdStore,
        getPowerSupplyByIdStore,
        // Actions
        fetchTypesStore,
        refreshTypesStore,
        clearTypesStore,
        initTypesStore
    };
});

export default useTypesStore;
