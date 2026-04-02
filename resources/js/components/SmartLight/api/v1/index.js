/**
 * ============================================================================
 * V1 INDEX — ЭКСПОРТЫ ВЕРСИИ V1
 * ============================================================================
 * 📁 Путь: api/v1/index.js
 * ============================================================================
 */

export * from './resource/index.js';
export * from './utils/index.js';

export const V1_API_VERSION = 'v1';

export default {
    resource: () => import('./resource/index.js'),
    utils: () => import('./utils/index.js'),
    V1_API_VERSION
};
