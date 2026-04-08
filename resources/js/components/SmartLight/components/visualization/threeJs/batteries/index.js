/**
 * ============================================================================
 * THREE.JS BATTERIES — FULL EXPORT MAP
 * ============================================================================
 * 📁 Путь: components/visualization/threeJs/batteries/index.js
 * ✅ Назначение: Карта всех 3D-компонентов батарей для lazy loading
 * ============================================================================
 */

export default {
    // === БАЗОВЫЕ КОМПОНЕНТЫ ===
    BatteryBaseThree: () => import('./BatteryBaseThree.vue'),
    BatteryCylindricalThree: () => import('./BatteryCylindricalThree.vue'),
    BatteryPrismaticThree: () => import('./BatteryPrismaticThree.vue'),

    // === Li-Ion Цилиндрические (Все размеры) ===
    Battery10440Three: () => import('./Battery10440Three.vue'),
    Battery14500Three: () => import('./Battery14500Three.vue'),
    Battery14650Three: () => import('./Battery14650Three.vue'),
    Battery16340Three: () => import('./Battery16340Three.vue'),
    Battery18350Three: () => import('./Battery18350Three.vue'),
    Battery18650Three: () => import('./Battery18650Three.vue'),
    Battery21700Three: () => import('./Battery21700Three.vue'),
    Battery26650Three: () => import('./Battery26650Three.vue'),

    // === Алкалиновые ===
    BatteryAlkalineAaThree: () => import('./BatteryAlkalineAaThree.vue'),
    BatteryAlkalineAaaThree: () => import('./BatteryAlkalineAaaThree.vue'),

    // === Ni-MH ===
    BatteryNiMhAaThree: () => import('./BatteryNiMhAaThree.vue'),
    BatteryNiMhAaaThree: () => import('./BatteryNiMhAaaThree.vue'),

    // === Другие типы (LiPo, LiFePO4, Lead-Acid) ===
    BatteryLiPoThree: () => import('./BatteryLiPoThree.vue'),
    BatteryLeadAcidThree: () => import('./BatteryLeadAcidThree.vue'),
    BatteryLiFePo4Three: () => import('./BatteryLiFePo4Three.vue'),

    // === Устаревшие алиасы (для совместимости) ===
    BatteryAaThree: () => import('./BatteryAlkalineAaThree.vue'),
    BatteryAaaThree: () => import('./BatteryAlkalineAaaThree.vue')
};
