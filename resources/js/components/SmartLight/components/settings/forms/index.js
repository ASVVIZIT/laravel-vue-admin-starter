/**
 * ============================================================================
 * LAYOUT COMPONENTS — ЭКСПОРТ LAYOUT
 * ============================================================================
 */

export { default as DeviceSettingsForm } from './DeviceSettingsForm.vue';
export { default as DebugLayoutPanel } from '../panels/DebugPanel.vue';
export { default as CardLayoutWrapper } from './CardLayoutWrapper.vue';
export { default as LayoutSidebarWrapper } from './LayoutSidebarWrapper.vue';

export default {
    IconLayoutWrapper: () => import('./IconLayoutWrapper.vue'),
    DebugLayoutPanel: () => import('../panels/DebugPanel.vue'),
    CardLayoutWrapper: () => import('./CardLayoutWrapper.vue'),
    LayoutSidebarWrapper: () => import('./LayoutSidebarWrapper.vue')
};
