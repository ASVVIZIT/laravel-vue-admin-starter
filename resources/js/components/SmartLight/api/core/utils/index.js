/**
 * ============================================================================
 * CORE UTILS INDEX — ГЛАВНЫЙ ЭКСПОРТ УТИЛИТ
 * ============================================================================
 * 📁 Путь: api/core/utils/index.js
 * ============================================================================
 */

export { coreApiContextUtils, CoreApiContextUtils } from './coreApiContextUtils.js';
export * from './coreApiLoggerUtils.js';
export * from './coreApiUtils.js';
export * from './coreApiWebglSupportUtils.js';

export default {
    coreApiContextUtils: () => import('./coreApiContextUtils.js'),
    coreApiLoggerUtils: () => import('./coreApiLoggerUtils.js'),
    coreApiUtils: () => import('./coreApiUtils.js'),
    coreApiWebglSupportUtils: () => import('./coreApiWebglSupportUtils.js')
};
