/**
 * ============================================================================
 * SVG VISUALIZATION — ГЛАВНЫЙ ЭКСПОРТ 2D ГРАФИКИ
 * ============================================================================
 */

export * from './batteries/index.js';
export * from './bulbs/index.js';
export * from './power/index.js';
export * from './icons/index.js';

export default {
    batteries: () => import('./batteries/index.js'),
    bulbs: () => import('./bulbs/index.js'),
    power: () => import('./power/index.js'),
    icons: () => import('./icons/index.js')
};
