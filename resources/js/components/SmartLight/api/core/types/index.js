/**
 * ============================================================================
 * CORE TYPES INDEX — ГЛАВНЫЙ ЭКСПОРТ ТИПОВ
 * ============================================================================
 * 📁 Путь: api/core/types/index.js
 * ============================================================================
 */

export * from './batteryTypes/index.js';
export * from './bulbTypes/index.js';
export * from './powerSupplyTypes/index.js';

export default {
    batteryTypes: () => import('./batteryTypes/index.js'),
    bulbTypes: () => import('./bulbTypes/index.js'),
    powerSupplyTypes: () => import('./powerSupplyTypes/index.js')
};
