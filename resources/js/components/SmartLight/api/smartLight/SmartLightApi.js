// resources/js/components/SmartLight/api/smartLight/SmartLightApi.js
export * from './SettingsApi.js';
export * from './DevicesApi.js';
export * from './CommandsApi.js';

// Объединенный API через функции (без циклических зависимостей)
export const SmartLightApi = {
    getGlobalSettings: () => SettingsApi.getGlobalSettings(),
    updateGlobalSettings: (settings) => SettingsApi.updateGlobalSettings(settings),
    resetGlobalSettings: () => SettingsApi.resetGlobalSettings(),

    getDevices: () => DevicesApi.getDevices(),
    getDeviceSettings: (deviceId) => DevicesApi.getDeviceSettings(deviceId),
    checkOwnership: (deviceId) => DevicesApi.checkOwnership(deviceId),

    sendCommand: (deviceId, command, intensity) => CommandsApi.sendCommand(deviceId, command, intensity),
    forceSleep: (deviceId) => CommandsApi.forceSleep(deviceId),
    getCommand: (deviceId) => CommandsApi.getCommand(deviceId)
};
