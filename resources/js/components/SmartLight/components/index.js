/**
 * ============================================================================
 * SMARTLIGHT COMPONENTS — ГЛАВНЫЙ ЭКСПОРТ
 * ============================================================================
 */

export * from './configs/index.js';
export * from './settings/index.js';
export * from './visualization/index.js';
export * from './devices/index.js';
export * from './monitoring/index.js';
export * from './controls/index.js';
export * from './layout/wrappers/index.js';

export default {
    configs: () => import('./configs/index.js'),
    settings: () => import('./settings/index.js'),
    visualization: () => import('./visualization/index.js'),
    devices: () => import('./devices/index.js'),
    monitoring: () => import('./monitoring/index.js'),
    controls: () => import('./controls/index.js'),
    layout: () => import('./layout/wrappers/index.js')
};
