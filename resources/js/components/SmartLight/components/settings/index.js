/**
 * ============================================================================
 * SETTINGS COMPONENTS — ГЛАВНЫЙ ЭКСПОРТ НАСТРОЕК
 * ============================================================================
 */

export * from './forms/index.js';
export * from './modals/index.js';

export default {
    forms: () => import('./forms/index.js'),
    modals: () => import('./modals/index.js')
};
