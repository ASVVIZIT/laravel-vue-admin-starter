/**
 * ============================================================================
 * CONTROLS COMPONENTS — ЭКСПОРТ УПРАВЛЕНИЯ
 * ============================================================================
 */

export { default as BatteryControlsSlider } from './BatteryControlsSlider.vue';
export { default as IntensityControlsSlider } from './IntensityControlsSlider.vue';
export { default as ToggleControlsSwitch } from './ToggleControlsSwitch.vue';

export default {
    BatteryControlsSlider: () => import('./BatteryControlsSlider.vue'),
    IntensityControlsSlider: () => import('./IntensityControlsSlider.vue'),
    ToggleControlsSwitch: () => import('./ToggleControlsSwitch.vue')
};
