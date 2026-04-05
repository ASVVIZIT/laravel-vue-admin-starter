/**
 * ============================================================================
 * LAYOUT COMPONENTS — ГЛАВНЫЙ ЭКСПОРТ LAYOUT
 * ============================================================================
 */

export * from './wrappers/index.js';
export * from './panels/index.js';

export default {
    wrappers: () => import('./wrappers/index.js'),
    panels: () => import('./panels/index.js')
};
