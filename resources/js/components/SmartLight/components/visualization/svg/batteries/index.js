/**
 * ============================================================================
 * SVG BATTERIES — LAZY LOADED EXPORT MAP
 * ============================================================================
 * 📁 Путь: components/visualization/svg/batteries/index.js
 * ✅ Назначение: Карта всех компонентов батарей для динамического импорта
 * ============================================================================
 */

export default {
    // === БАЗОВЫЕ КОМПОНЕНТЫ ===
    BatteryBaseSvg: () => import('./BatteryBaseSvg.vue'),
    BatteryCylindricalSvg: () => import('./BatteryCylindricalSvg.vue'),
    BatteryPrismaticSvg: () => import('./BatteryPrismaticSvg.vue'),

    // === Li-Ion Цилиндрические (Все размеры) ===
    Battery10440Svg: () => import('./Battery10440Svg.vue'),
    Battery14500Svg: () => import('./Battery14500Svg.vue'),
    Battery14650Svg: () => import('./Battery14650Svg.vue'),
    Battery16340Svg: () => import('./Battery16340Svg.vue'),
    Battery18350Svg: () => import('./Battery18350Svg.vue'),
    Battery18650Svg: () => import('./Battery18650Svg.vue'),
    Battery21700Svg: () => import('./Battery21700Svg.vue'),
    Battery26650Svg: () => import('./Battery26650Svg.vue'),

    // === Алкалиновые ===
    BatteryAlkalineAaSvg: () => import('./BatteryAlkalineAaSvg.vue'),
    BatteryAlkalineAaaSvg: () => import('./BatteryAlkalineAaaSvg.vue'),

    // === Ni-MH ===
    BatteryNiMhAaSvg: () => import('./BatteryNiMhAaSvg.vue'),
    BatteryNiMhAaaSvg: () => import('./BatteryNiMhAaaSvg.vue'),

    // === Другие типы (Призматические / Блоки) ===
    BatteryLiPoSvg: () => import('./BatteryLiPoSvg.vue'),
    BatteryLeadAcidSvg: () => import('./BatteryLeadAcidSvg.vue'),
    BatteryLiFePo4Svg: () => import('./BatteryLiFePo4Svg.vue'),

    // === Устаревшие алиасы (для совместимости) ===
    BatteryAaSvg: () => import('./BatteryAlkalineAaSvg.vue'),
    BatteryAaaSvg: () => import('./BatteryAlkalineAaaSvg.vue')
};
