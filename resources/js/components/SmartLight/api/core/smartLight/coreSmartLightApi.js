/**
 * ============================================================================
 * CORE SMARTLIGHT API — ОБЪЕДИНЁННЫЙ ИНТЕРФЕЙС
 * ============================================================================
 * 📁 Путь: api/core/smartLight/coreSmartLightApi.js
 * ✅ Используется: Stores, Components
 * ✅ Рефакторинг: методы с суффиксом Api(), добавлены методы питания
 * ============================================================================
 */

import * as CoreSettingsApi from './coreSettingsApi.js';
import * as CoreDevicesApi from './coreDevicesApi.js';
import * as CoreCommandsApi from './coreCommandsApi.js';
import * as CoreTypesApi from './coreTypesApi.js';
import { corePowerSupplyApi } from './corePowerSupplyApi.js';

// ✅ Агрегированный объект API (суффикс Api)
export const CoreSmartLightApi = {
    // ===== Глобальные настройки =====
    getGlobalSettingsApi: () => CoreSettingsApi.getGlobalSettingsApi(),
    updateGlobalSettingsApi: (settings) => CoreSettingsApi.updateGlobalSettingsApi(settings),
    resetGlobalSettingsApi: () => CoreSettingsApi.resetGlobalSettingsApi(),

    // ===== Устройства =====
    getDevicesApi: () => CoreDevicesApi.getDevicesApi(),
    getDeviceApi: (deviceId) => CoreDevicesApi.getDeviceApi(deviceId),
    getDeviceSettingsApi: (deviceId) => CoreDevicesApi.getDeviceSettingsApi(deviceId),
    checkOwnershipApi: (deviceId) => CoreDevicesApi.checkOwnershipApi(deviceId),
    updateDeviceSettingsApi: (deviceId, settings) => CoreDevicesApi.updateDeviceSettingsApi(deviceId, settings),

    // ===== Команды =====
    sendCommandApi: (deviceId, command, intensity) => CoreCommandsApi.sendCommandApi(deviceId, command, intensity),
    forceSleepApi: (deviceId) => CoreCommandsApi.forceSleepApi(deviceId),
    wakeDeviceApi: (deviceId) => CoreCommandsApi.wakeDeviceApi(deviceId),
    getCommandApi: (deviceId) => CoreCommandsApi.getCommandApi(deviceId),

    // ===== Типы устройств (справочники) =====
    getBatteryTypesApi: () => CoreTypesApi.getBatteryTypesApi(),
    getBulbTypesApi: () => CoreTypesApi.getBulbTypesApi(),
    getPowerSupplyTypesApi: () => CoreTypesApi.getPowerSupplyTypesApi(),

    // ===== Операции с питанием устройств =====
    getAllPowerSuppliesApi: () => corePowerSupplyApi.getAllPowerSuppliesApi(),
    getPowerSupplyByIdApi: (id) => corePowerSupplyApi.getPowerSupplyByIdApi(id),
    activatePowerSupplyApi: (deviceId, supplyId) => corePowerSupplyApi.activatePowerSupplyApi(deviceId, supplyId),
    deactivatePowerSupplyApi: (deviceId) => corePowerSupplyApi.deactivatePowerSupplyApi(deviceId),
    getPowerSupplyStatusApi: (deviceId) => corePowerSupplyApi.getPowerSupplyStatusApi(deviceId),
    simulateEmergencyApi: (deviceId) => corePowerSupplyApi.simulateEmergencyApi(deviceId)
};

// ✅ Экспорт по умолчанию
export default CoreSmartLightApi;
