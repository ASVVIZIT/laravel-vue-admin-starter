/**
 * ============================================================================
 * LAYOUT PANELS — ЭКСПОРТ ПАНЕЛЕЙ
 * ============================================================================
 */

export { default as TrainingDebugPanel } from './TrainingDebugPanel.vue';
export { default as TrainingDebugStatePanel } from './TrainingDebugStatePanel.vue';
export { default as TrainingDebugLogsPanel } from './TrainingDebugLogsPanel.vue';
export { default as TrainingGlobalSettingsPanel } from './TrainingGlobalSettingsPanel.vue';

export default {
    TrainingDebugPanel: () => import('./TrainingDebugPanel.vue'),
    TrainingDebugStatePanel: () => import('./TrainingDebugStatePanel.vue'),
    TrainingDebugLogsPanel: () => import('./TrainingDebugLogsPanel.vue'),
    TrainingGlobalSettingsPanel: () => import('./TrainingGlobalSettingsPanel.vue')
};
