/**
 * ============================================================================
 * VISUALIZATION CONFIG STORE — ГЛАВНЫЙ ФАЙЛ
 * ============================================================================
 * 📁 Путь: stores/smartlight/visualizationConfigStore.js
 * ✅ Назначение: Агрегирует конфиги всех типов, предоставляет единый API
 * ✅ Расширение: Добавить 4-й тип = создать новый файл + импортировать здесь
 * ============================================================================
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ✅ ИМПОРТ МОДУЛЕЙ (файлы лежат рядом)
import { bulbTypes } from './visualizationConfigBulbs.js'
import { batteryTypes } from './visualizationConfigBatteries.js'
import { powerSupplyTypes } from './visualizationConfigPower.js'

// 📦 ПРИМЕР: Как добавить 4-й тип (например, сенсоры):
// 1. Создать файл: visualizationConfigSensors.js
// 2. Импортировать здесь: import { sensorTypes } from './visualizationConfigSensors.js'
// 3. Добавить в return: getSensorConfigStore: (id) => sensorTypes.find(t => t.id === id)

export const useVisualizationConfigStore = defineStore('smartlight-visualization', () => {
    // === РЕФЫ ДЛЯ РЕАКТИВНОСТИ ===
    const bulbTypesRef = ref(bulbTypes)
    const batteryTypesRef = ref(batteryTypes)
    const powerSupplyTypesRef = ref(powerSupplyTypes)

    // === COMPUTED: Быстрый поиск по ID ===
    const getBulbConfigStore = computed(() => (id) =>
        bulbTypesRef.value.find((t) => t.id === id)
    )

    const getBatteryConfigStore = computed(() => (id) =>
        batteryTypesRef.value.find((t) => t.id === id)
    )

    const getPowerSupplyConfigStore = computed(() => (id) =>
        powerSupplyTypesRef.value.find((t) => t.id === id)
    )

    // === УНИВЕРСАЛЬНЫЙ GETTER: по типу и ID ===
    const getVisualConfigStore = (type, id) => {
        switch (type) {
            case 'bulb':
                return bulbTypesRef.value.find((t) => t.id === id)
            case 'battery':
                return batteryTypesRef.value.find((t) => t.id === id)
            case 'power':
                return powerSupplyTypesRef.value.find((t) => t.id === id)
            // 📦 ПРИМЕР: Добавить 4-й тип:
            // case 'sensor':
            //   return sensorTypesRef.value.find((t) => t.id === id)
            default:
                return null
        }
    }

    // === ВСЕ ТИПЫ: для итерации в UI ===
    const getAllBulbTypes = computed(() => bulbTypesRef.value)
    const getAllBatteryTypes = computed(() => batteryTypesRef.value)
    const getAllPowerSupplyTypes = computed(() => powerSupplyTypesRef.value)

    // === ЭКСПОРТ ===
    return {
        // Реактивные массивы
        bulbTypes: bulbTypesRef,
        batteryTypes: batteryTypesRef,
        powerSupplyTypes: powerSupplyTypesRef,

        // Геттеры по ID
        getBulbConfigStore,
        getBatteryConfigStore,
        getPowerSupplyConfigStore,

        // Универсальный геттер
        getVisualConfigStore,

        // Все типы для итерации
        getAllBulbTypes,
        getAllBatteryTypes,
        getAllPowerSupplyTypes
    }
})

export default useVisualizationConfigStore
