/**
 * ============================================================================
 * THREEJS VISUALIZATION — ГЛАВНЫЙ ЭКСПОРТ 3D
 * ============================================================================
 */

export * from './batteries/index.js';
export * from './bulbs/index.js';
export * from './power/index.js';

export default {
    batteries: () => import('./batteries/index.js'),
    bulbs: () => import('./bulbs/index.js'),
    power: () => import('./power/index.js')
};
