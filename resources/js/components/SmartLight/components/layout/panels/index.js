/**
 * ============================================================================
 * LAYOUT PANELS — ЭКСПОРТ ПАНЕЛЕЙ
 * ============================================================================
 */

export { default as DebugPanel } from './DebugPanel.vue';
export { default as DeviceSettingsPanel } from './DeviceSettingsPanel.vue';
export { default as GlobalSettingsPanel } from './GlobalSettingsPanel.vue';

export default {
    DebugPanel: () => import('./DebugPanel.vue'),
    DeviceSettingsPanel: () => import('./DeviceSettingsPanel.vue'),
    GlobalSettingsPanel: () => import('./GlobalSettingsPanel.vue')
};
