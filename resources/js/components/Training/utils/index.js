/**
 * ============================================================================
 * TRAINING UTILS INDEX — БАРРЕЛ-ЭКСПОРТ
 * ============================================================================
 */
export * from './trainingDebugUtils.js';
export * from './trainingFormattersUtils.js';
export * from './trainingHelpersUtils.js';
export * from './trainingLoggerUtils.js';
export * from './trainingSettingsHelpersUtils.js';
export * from './trainingValidatorsUtils.js';

export default {
    debug: () => import('./trainingDebugUtils.js'),
    formatters: () => import('./trainingFormattersUtils.js'),
    helpers: () => import('./trainingHelpersUtils.js'),
    logger: () => import('./trainingLoggerUtils.js'),
    settings: () => import('./trainingSettingsHelpersUtils.js'),
    validators: () => import('./trainingValidatorsUtils.js'),
};
