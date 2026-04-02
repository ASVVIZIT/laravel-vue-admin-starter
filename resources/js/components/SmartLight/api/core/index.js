/**
 * ============================================================================
 * API CORE INDEX — ГЛАВНЫЙ ЭКСПОРТ ЯДРА
 * ============================================================================
 * 📁 Путь: api/core/index.js
 * ✅ Используется: V0, V1, V2 ресурсы
 * ============================================================================
 */

// Resources
export * from './resource/index.js';

// Utils
export * from './utils/index.js';

// Context export
export { coreApiContext, CoreApiContext } from './utils/coreApiContext.js';

// Logger exports
export {
    logDebug,
    logInfo,
    logWarn,
    logError,
    logRequest,
    logResponse,
    setLogLevel,
    getLogLevel
} from './utils/coreApiLogger.js';

// SmartLight API
export * from './smartLight/index.js';

// Types
export * from './types/index.js';

// PowerSupplies
export * from './powerSupplies/index.js';

export default {
    resource: () => import('./resource/index.js'),
    utils: () => import('./utils/index.js'),
    smartLight: () => import('./smartLight/index.js'),
    types: () => import('./types/index.js'),
    powerSupplies: () => import('./powerSupplies/index.js')
};
