/**
 * ============================================================================
 * VISUALIZATION COMPONENTS — ГЛАВНЫЙ ЭКСПОРТ ВИЗУАЛИЗАЦИИ
 * ============================================================================
 */

export * from './svg/index.js';
export * from './threeJs/index.js';
export * from './renderers/index.js';

export default {
    svg: () => import('./svg/index.js'),
    threeJs: () => import('./threeJs/index.js'),
    renderers: () => import('./renderers/index.js')
};
