export { default as DeviceSettingsModal } from './DeviceSettingsModal.vue';
export { default as GlobalSettingsModal } from './GlobalSettingsModal.vue';

export default {
    DeviceSettingsModal: () => import('./DeviceSettingsModal.vue'),
    GlobalSettingsModal: () => import('./GlobalSettingsModal.vue')
};
