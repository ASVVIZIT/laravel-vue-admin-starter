/**
 * ============================================================================
 * SMARTLIGHT API INDEX — ГЛАВНЫЙ ЭКСПОРТ
 * ============================================================================
 * 📁 Путь: api/index.js
 * ✅ Используется: Все компоненты SmartLight, точка входа модуля
 * ============================================================================
 */

export * from './core/index.js';
export * from './v0/index.js';
export * from './v1/index.js';
export * from './v2/index.js';

export const getApiVersion = () => {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('smartlight_api_version') || 'v0';
    }
    return 'v0';
};

export const setApiVersion = (version) => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('smartlight_api_version', version);
    }
    console.log(`[SmartLight] API version set to: ${version}`);
};

export default {
    core: () => import('./core/index.js'),
    v0: () => import('./v0/index.js'),
    v1: () => import('./v1/index.js'),
    v2: () => import('./v2/index.js'),
    getApiVersion,
    setApiVersion
};
