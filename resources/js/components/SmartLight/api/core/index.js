/**
 * ============================================================================
 * API CORE INDEX — ГЛАВНЫЙ ЭКСПОРТ ЯДРА
 * ============================================================================
 * 📁 Путь: api/core/index.js
 * ✅ Используется: V0, V1, V2 ресурсы, глобальная инициализация приложения
 * ✅ Рефакторинг: пути приведены к единому виду, удалены дублирующие экспорты
 * ============================================================================
 */

// Resources (базовые классы с методами *Resource())
export * from './resource/index.js';

// Utils (контекст, логгер, утилиты)
export * from './utils/index.js';
export { coreApiContextUtils, CoreApiContextUtils } from './utils/coreApiContextUtils.js';
export {
    logDebugUtils, logInfoUtils, logWarnUtils, logErrorUtils, logRequestUtils, logResponseUtils,
    setLogLevel, getLogLevel
} from './utils/coreApiLoggerUtils.js';

// SmartLight API (слой бизнес-логики с методами *Api())
export * from './smartLight/index.js';

// Types API (справочники с методами *TypeApi())
export * from './types/index.js';

export default {
    resource: () => import('./resource/index.js'),
    utils: () => import('./utils/index.js'),
    smartLight: () => import('./smartLight/index.js'),
    types: () => import('./types/index.js')
};
