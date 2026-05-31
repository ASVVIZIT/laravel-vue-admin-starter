/**
 * ============================================================================
 * TRAINING UTILS INDEX — БАРРЕЛ-ЭКСПОРТ
 * ============================================================================
 */
export * from './appFormattersUtils.js';
export * from './appValidatorsUtils.js';
export * from './appHelpersUtils.js';
export * from './appLoggerUtils.js';

export default {
    formatters: () => import('./appFormattersUtils.js'),
    validators: () => import('./appValidatorsUtils.js'),
    helpers: () => import('./appHelpersUtils.js'),
    logger: () => import('./appLoggerUtils.js')
};
