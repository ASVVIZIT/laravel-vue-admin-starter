/**
 * ============================================================================
 * LAYOUT COMPONENTS — ЭКСПОРТ LAYOUT
 * ============================================================================
 */

export { default as SidebarLayoutWrapper } from './LayoutSidebarWrapper.vue';
export { default as PanelLayoutWrapper } from './LayoutPanelWrapper.vue';
export { default as CardLayoutWrapper } from './LayoutCardWrapper.vue';
export { default as IconLayoutWrapper } from './LayoutIconWrapper.vue.vue';

export default {
    SidebarLayoutWrapper: () => import('./LayoutSidebarWrapper.vue'),
    PanelLayoutWrapper: () => import('./LayoutPanelWrapper.vue'),
    CardLayoutWrapper: () => import('./LayoutCardWrapper.vue'),
    IconLayoutWrapper: () => import('./LayoutIconWrapper.vue.vue'),
};
