/**
 * ============================================================================
 * CORE UTILS INDEX — ГЛАВНЫЙ ЭКСПОРТ УТИЛИТ
 * ============================================================================
 * 📁 Путь: api/core/utils/index.js
 * ============================================================================
 */

export { coreApiContext, CoreApiContext } from './coreApiContext.js';
export * from './coreApiLogger.js';
export * from './coreApiUtils.js';
export * from './coreApiWebglSupportUtils.js';

export default {
    coreApiContext: () => import('./coreApiContext.js'),
    coreApiLogger: () => import('./coreApiLogger.js'),
    coreApiUtils: () => import('./coreApiUtils.js'),
    coreApiWebglSupportUtils: () => import('./coreApiWebglSupportUtils.js')
};
