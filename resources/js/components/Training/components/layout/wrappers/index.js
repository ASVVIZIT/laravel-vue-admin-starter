/**
 * ============================================================================
 * LAYOUT WRAPPERS — ЭКСПОРТ ОБЁРТОК
 * ============================================================================
 */

export { default as TrainingLayoutSidebarWrapper } from './TrainingLayoutSidebarWrapper.vue';
export { default as TrainingLayoutPanelWrapper } from './TrainingLayoutPanelWrapper.vue';
export { default as TrainingLayoutCardWrapper } from './TrainingLayoutCardWrapper.vue';
export { default as TrainingLayoutIconWrapper } from './TrainingLayoutIconWrapper.vue';
export { default as TrainingLayoutDebugWrapper } from './TrainingLayoutDebugWrapper.vue';

export default {
    TrainingLayoutSidebarWrapper: () => import('./TrainingLayoutSidebarWrapper.vue'),
    TrainingLayoutPanelWrapper: () => import('./TrainingLayoutPanelWrapper.vue'),
    TrainingLayoutCardWrapper: () => import('./TrainingLayoutCardWrapper.vue'),
    TrainingLayoutIconWrapper: () => import('./TrainingLayoutIconWrapper.vue'),
    TrainingLayoutDebugWrapper: () => import('./TrainingLayoutDebugWrapper.vue')
};
