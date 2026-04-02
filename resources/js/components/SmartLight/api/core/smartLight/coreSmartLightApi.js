// resources/js/components/SmartLight/api/core/smartLight/coreSmartLightApi.js
export * from '@components/SmartLight/api/core/smartLight/coreSettingsApi.js';
export * from '@components/SmartLight/api/core/smartLight/coreDevicesApi.js';
export * from '@components/SmartLight/api/core/smartLight/coreCommandsApi.js';

// Объединенный API через функции (без циклических зависимостей)
export const CoreSmartLightApi = {
    getGlobalSettings: () => CoreSettingsApi.getGlobalSettings(),
    updateGlobalSettings: (settings) => CoreSettingsApi.updateGlobalSettings(settings),
    resetGlobalSettings: () => CoreSettingsApi.resetGlobalSettings(),

    getDevices: () => CoreDevicesApi.getDevices(),
    getDeviceSettings: (deviceId) => CoreDevicesApi.getDeviceSettings(deviceId),
    checkOwnership: (deviceId) => CoreDevicesApi.checkOwnership(deviceId),

    sendCommand: (deviceId, command, intensity) => CoreCommandsApi.sendCommand(deviceId, command, intensity),
    forceSleep: (deviceId) => CoreCommandsApi.forceSleep(deviceId),
    getCommand: (deviceId) => CoreCommandsApi.getCommand(deviceId)
};
