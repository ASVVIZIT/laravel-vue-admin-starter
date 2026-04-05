/**
 * ============================================================================
 * LAYOUT WRAPPERS — ЭКСПОРТ ОБЁРТОК
 * ============================================================================
 */

export { default as LayoutSidebarWrapper } from './LayoutSidebarWrapper.vue';
export { default as LayoutPanelWrapper } from './LayoutPanelWrapper.vue';
export { default as LayoutCardWrapper } from './LayoutCardWrapper.vue';
export { default as LayoutIconWrapper } from './LayoutIconWrapper.vue';
export { default as LayoutDebugWrapper } from './LayoutDebugWrapper.vue';

export default {
    LayoutSidebarWrapper: () => import('./LayoutSidebarWrapper.vue'),
    LayoutPanelWrapper: () => import('./LayoutPanelWrapper.vue'),
    LayoutCardWrapper: () => import('./LayoutCardWrapper.vue'),
    LayoutIconWrapper: () => import('./LayoutIconWrapper.vue'),
    LayoutDebugWrapper: () => import('./LayoutDebugWrapper.vue')
};
