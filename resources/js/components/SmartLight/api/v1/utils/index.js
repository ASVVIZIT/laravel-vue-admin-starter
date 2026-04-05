/**
 * ============================================================================
 * V1 UTILS INDEX — УТИЛИТЫ V1
 * ============================================================================
 * 📁 Путь: api/v1/utils/index.js
 * ✅ Наследует: Core utils
 * ============================================================================
 */

export * from '@/components/SmartLight/api/core/utils/index.js';

export const V1_API_VERSION = 'v1';

export const isV0 = () => false;
export const isV1 = () => true;
export const isV2 = () => false;

// ✅ V1 специфичные утилиты
export const logV1 = (component, message, metrics = null) => {
    const { logDebugUtils } = await import('@/components/SmartLight/api/core/utils/coreApiLoggerUtils.js');

    const extendedData = {
        version: 'v1',
        timestamp: Date.now(),
        ...metrics
    };

    logDebugUtils(`V1:${component}`, message, extendedData);
};

export const tracePerformance = async (component, operation, fn) => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    logV1(component, `${operation} completed`, { duration: `${duration.toFixed(2)}ms` });

    return result;
};

export default {
    // Core utils
    ...await import('@/components/SmartLight/api/core/utils/index.js'),

    // V1 specific
    V1_API_VERSION,
    isV0,
    isV1,
    isV2,
    logV1,
    tracePerformance
};
