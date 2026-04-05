/**
 * ============================================================================
 * DEVICE STORE — УПРАВЛЕНИЕ УСТРОЙСТВАМИ (БЕЗОПАСНЫЙ ПАРСИНГ)
 * ============================================================================
 * 📁 Путь: stores/smartlight/deviceStore.js
 * ✅ Использует: CoreDeviceResource из core/api
 * ✅ Режим: Polling (WebSocket отключён временно)
 * ✅ Рефакторинг: методы получили суффикс Store(), импорты обновлены на *Utils
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import CoreDeviceResource from '@/components/SmartLight/api/core/resource/coreDeviceResource.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

export const useDeviceStore = defineStore('smartlight-device', () => {
    // === STATE ===
    const devices = ref([]);
    const devicesMap = ref({});
    const selectedDeviceId = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const lastUpdated = ref(null);

    // === POLLING CONFIG ===
    const pollingInterval = ref(null);
    const pollingEnabled = ref(false);
    const pollingDelay = ref(10000);
    const pollingAttempts = ref(0);
    const maxPollingAttempts = ref(5);

    // === GETTERS ===
    const selectedDevice = computed(() => {
        if (!selectedDeviceId.value) return null;
        return devicesMap.value[selectedDeviceId.value] || null;
    });

    const realDevices = computed(() => devices.value.filter(d => !d.is_fake));
    const fakeDevices = computed(() => devices.value.filter(d => d.is_fake));

    // ✅ Геттер с суффиксом Store()
    const getDeviceStore = (deviceId) => {
        return devicesMap.value[deviceId] || null;
    };

    const getDeviceByTypeStore = (typeId, elementType) => {
        return devices.value.find(d => {
            if (elementType === 'battery') return d.battery_type_id === typeId;
            if (elementType === 'bulb') return d.bulb_type_id === typeId;
            if (elementType === 'power') return d.power_supply_id === typeId;
            return false;
        });
    };

    // === ACTIONS ===

    // ✅ Действие с суффиксом Store()
    const fetchDevicesStore = async () => {
        loading.value = true;
        error.value = null;
        logDebugUtils('DeviceStore', 'Запрос устройств');

        try {
            const resource = new CoreDeviceResource();
            const response = await resource.getAllResource();

            // ✅ БЕЗОПАСНАЯ ПРОВЕРКА ТИПА ОТВЕТА
            if (typeof response === 'string') {
                throw new Error(`API вернул строку. Проверьте маршрут: /api/smart-light/devices`);
            }
            if (!response || typeof response !== 'object') {
                throw new Error(`Неверный тип ответа: ${typeof response}`);
            }

            logDebugUtils('DeviceStore', 'Response received', { status: response.success });

            let devicesList = [];
            let isSuccess = false;

            // Формат 1: Прямой массив [...]
            if (Array.isArray(response)) {
                devicesList = response;
                isSuccess = true;
            }
            // Формат 2: { success: true, data: [...] }
            else if (response.success !== false && Array.isArray(response.data)) {
                devicesList = response.data;
                isSuccess = true;
            }
            // Формат 3: { data: { data: [...] } } (Laravel API Resource)
            else if (response.data?.data && Array.isArray(response.data.data)) {
                devicesList = response.data.data;
                isSuccess = true;
            }
            // Формат 4: { data: [...] } (простая обёртка)
            else if (Array.isArray(response.data) && !('success' in response)) {
                devicesList = response.data;
                isSuccess = true;
            }

            if (isSuccess) {
                devices.value = devicesList;
                devicesMap.value = devicesList.reduce((acc, d) => {
                    if (d?.device_id) acc[d.device_id] = d;
                    return acc;
                }, {});
                lastUpdated.value = new Date();
                pollingAttempts.value = 0;
                logDebugUtils('DeviceStore', `Загружено устройств: ${devicesList.length}`);
                return { success: true, count: devicesList.length };
            } else {
                logErrorUtils('DeviceStore', 'Не распознан формат ответа', { response });
                throw new Error(`Неизвестный формат ответа от сервера`);
            }
        } catch (err) {
            logErrorUtils('DeviceStore', 'Ошибка загрузки', err);
            error.value = err.message || 'Не удалось загрузить устройства';
            pollingAttempts.value++;
            if (pollingAttempts.value >= maxPollingAttempts.value) {
                logErrorUtils('DeviceStore', 'Лимит попыток исчерпан');
                stopPollingStore();
            }
            return { success: false, error: err.message };
        } finally {
            loading.value = false;
        }
    };

    const startPollingStore = () => {
        if (pollingInterval.value) return;
        logDebugUtils('DeviceStore', `Polling запущен: ${pollingDelay.value}ms`);
        pollingInterval.value = setInterval(async () => {
            try { await fetchDevicesStore(); } catch (e) { logErrorUtils('DeviceStore', 'Polling error', e); }
        }, pollingDelay.value);
        pollingEnabled.value = true;
    };

    const stopPollingStore = () => {
        if (pollingInterval.value) {
            clearInterval(pollingInterval.value);
            pollingInterval.value = null;
        }
        pollingEnabled.value = false;
    };

    const setPollingDelayStore = (ms) => {
        pollingDelay.value = ms;
        if (pollingEnabled.value) {
            stopPollingStore();
            startPollingStore();
        }
    };

    /**
     * Полное обновление объекта устройства (для настроек, смены типа и т.д.)
     */
    const updateDeviceStore = (deviceData) => {
        if (!deviceData?.device_id) return;

        const existing = devicesMap.value[deviceData.device_id];
        if (existing) {
            // ✅ Полное слияние: сохраняем старые данные + накладываем новые
            devicesMap.value[deviceData.device_id] = {
                ...existing,
                ...deviceData,
                updated_at: new Date().toISOString()
            };
            // ✅ Обновляем и в массиве для реактивности
            const idx = devices.value.findIndex(d => d.device_id === deviceData.device_id);
            if (idx !== -1) {
                devices.value[idx] = devicesMap.value[deviceData.device_id];
            }
            logDebugUtils('DeviceStore', `Device fully updated: ${deviceData.device_id}`);
        }
    };

    const updateDeviceTelemetryStore = (id, telemetry) => {
        const device = devicesMap.value[id];
        if (device) {
            Object.assign(device, telemetry, { updated_at: new Date().toISOString() });
        }
    };

    const selectDeviceStore = (id) => {
        selectedDeviceId.value = id;
    };

    const updateDeviceStatusStore = async (id, status) => {
        try {
            const resource = new CoreDeviceResource();
            const res = await resource.updateStatusResource(id, status);
            if (res?.success) {
                const d = devicesMap.value[id];
                if (d) {
                    d.status = status;
                    d.updated_at = new Date().toISOString();
                }
            }
            return res;
        } catch (e) {
            logErrorUtils('DeviceStore', 'Status error', e);
            throw e;
        }
    };

    const updateDeviceIntensityStore = async (id, intensity) => {
        try {
            const resource = new CoreDeviceResource();
            const res = await resource.updateIntensityResource(id, intensity);
            if (res?.success) {
                const d = devicesMap.value[id];
                if (d) {
                    d.intensity = intensity;
                    d.updated_at = new Date().toISOString();
                }
            }
            return res;
        } catch (e) {
            logErrorUtils('DeviceStore', 'Intensity error', e);
            throw e;
        }
    };

    const updateDeviceSettingsStore = async (deviceId, settings) => {
        try {
            logDebugUtils('DeviceStore', `Updating settings for device ${deviceId}`, settings);
            const resource = new CoreDeviceResource();
            const response = await resource.updateSettingsResource(deviceId, settings);

            if (response?.success) {
                const device = devicesMap.value[deviceId];
                if (device) {
                    Object.assign(device, settings, { updated_at: new Date().toISOString() });
                    logDebugUtils('DeviceStore', `Device ${deviceId} settings updated`);
                }
            }
            return response;
        } catch (err) {
            logErrorUtils('DeviceStore', `Error updating device ${deviceId} settings`, err);
            throw err;
        }
    };

    const wakeDeviceStore = async (id) => {
        try {
            const resource = new CoreDeviceResource();
            const res = await resource.wakeResource(id);
            if (res?.success) {
                const d = devicesMap.value[id];
                if (d) {
                    d.status = 'ON';
                    d.updated_at = new Date().toISOString();
                }
            }
            return res;
        } catch (e) {
            logErrorUtils('DeviceStore', 'Wake error', e);
            throw e;
        }
    };

    const forceSleepStore = async (id) => {
        try {
            const resource = new CoreDeviceResource();
            const res = await resource.sleepResource(id);
            if (res?.success) {
                const d = devicesMap.value[id];
                if (d) {
                    d.status = 'SLEEPING';
                    d.updated_at = new Date().toISOString();
                }
            }
            return res;
        } catch (e) {
            logErrorUtils('DeviceStore', 'Sleep error', e);
            throw e;
        }
    };

    const cleanupStore = () => {
        stopPollingStore();
        logDebugUtils('DeviceStore', 'Cleanup');
    };

    const initStore = async () => {
        logDebugUtils('DeviceStore', 'Init');
        await fetchDevicesStore();
        if (!pollingEnabled.value) {
            startPollingStore();
        }
    };

    // === EXPOSE ===
    return {
        // State
        devices,
        devicesMap,
        selectedDeviceId,
        selectedDevice,
        loading,
        error,
        lastUpdated,
        realDevices,
        fakeDevices,
        pollingEnabled,
        pollingDelay,
        pollingAttempts,
        // Getters
        getDeviceStore,
        getDeviceByTypeStore,
        // Actions
        fetchDevicesStore,
        startPollingStore,
        stopPollingStore,
        setPollingDelayStore,
        updateDeviceTelemetryStore,
        updateDeviceStore,
        selectDeviceStore,
        updateDeviceStatusStore,
        updateDeviceIntensityStore,
        updateDeviceSettingsStore,
        wakeDeviceStore,
        forceSleepStore,
        cleanupStore,
        initStore
    };
});

export default useDeviceStore;
