/**
 * ============================================================================
 * SETTINGS FORMS — ЭКСПОРТ ФОРМ
 * ============================================================================
 */

export { default as DeviceSettingsForm } from './DeviceSettingsForm.vue';
export { default as GlobalSettingsForm } from './GlobalSettingsForm.vue';

export default {
    DeviceSettingsForm: () => import('./DeviceSettingsForm.vue'),
    GlobalSettingsForm: () => import('./GlobalSettingsForm.vue')
};
