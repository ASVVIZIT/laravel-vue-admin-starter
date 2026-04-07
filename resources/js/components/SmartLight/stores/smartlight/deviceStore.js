/**
 * ============================================================================
 * DEVICE STORE — УПРАВЛЕНИЕ УСТРОЙСТВАМИ (БЕЗОПАСНЫЙ ПАРСИНГ + СТАБИЛЬНЫЙ ПОРЯДОК)
 * ============================================================================
 * 📁 Путь: stores/smartlight/deviceStore.js
 * ✅ Использует: CoreDeviceResource из core/api
 * ✅ Режим: Polling (WebSocket отключён временно)
 * ✅ Рефакторинг: методы получили суффикс Store(), импорты обновлены на *Utils
 * ✅ ИСПРАВЛЕНО: Стабильный порядок устройств, реактивность Vue 3, сортировка
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import CoreDeviceResource from '@/components/SmartLight/api/core/resource/coreDeviceResource.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

export const useDeviceStore = defineStore('smartlight-device', () => {
    // ========================================================================
    // STATE
    // ========================================================================
    const devices = ref([]);
    const devicesMap = ref({});
    const selectedDeviceId = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const lastUpdated = ref(null);

    // ========================================================================
    // POLLING CONFIG
    // ========================================================================
    const pollingInterval = ref(null);
    const pollingEnabled = ref(false);
    const pollingDelay = ref(10000);
    const pollingAttempts = ref(0);
    const maxPollingAttempts = ref(5);

    // ========================================================================
    // GETTERS
    // ========================================================================

    const selectedDevice = computed(() => {
        if (!selectedDeviceId.value) return null;
        return devicesMap.value[selectedDeviceId.value] || null;
    });

    const realDevices = computed(() => devices.value.filter(d => !d.is_fake));
    const fakeDevices = computed(() => devices.value.filter(d => d.is_fake));

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

    // ========================================================================
    // HELPERS — ВНУТРЕННИЕ ФУНКЦИИ
    // ========================================================================

    const sortDevices = (devicesList) => {
        return [...devicesList].sort((a, b) => {
            if (a.is_fake && !b.is_fake) return 1;
            if (!a.is_fake && b.is_fake) return -1;
            return a.device_id.localeCompare(b.device_id);
        });
    };

    const replaceDevicesList = (newList) => {
        const freshList = newList.map(d => ({ ...d })); // ← Новые ссылки чтобы пуллинг обновлял новые данные при перерисовке.
        devices.value = sortDevices(freshList);
        devicesMap.value = freshList.reduce((acc, d) => {
            if (d?.device_id) acc[d.device_id] = d;
            return acc;
        }, {});
    };

    const updateDeviceInList = (deviceData) => {
        if (!deviceData?.device_id) return;

        const idx = devices.value.findIndex(d => d.device_id === deviceData.device_id);
        if (idx !== -1) {
            const updatedDevice = {
                ...devices.value[idx],
                ...deviceData,
                updated_at: new Date().toISOString()
            };
            const newDevices = [...devices.value];
            newDevices[idx] = updatedDevice;
            devices.value = newDevices;
            devicesMap.value[deviceData.device_id] = updatedDevice;
        }
    };

    const addDeviceSorted = (newDevice) => {
        if (!newDevice?.device_id) return;

        const insertIdx = devices.value.findIndex(d =>
            d.device_id.localeCompare(newDevice.device_id) > 0
        );

        const newDevices = [...devices.value];
        if (insertIdx === -1) {
            newDevices.push(newDevice);
        } else {
            newDevices.splice(insertIdx, 0, newDevice);
        }
        devices.value = newDevices;
        devicesMap.value[newDevice.device_id] = newDevice;
    };

    // ========================================================================
    // ACTIONS
    // ========================================================================

    const fetchDevicesStore = async () => {
        loading.value = true;
        error.value = null;
        logDebugUtils('DeviceStore', 'Запрос устройств');

        try {
            const resource = new CoreDeviceResource();
            const response = await resource.getAllResource();

            if (typeof response === 'string') {
                throw new Error(`API вернул строку. Проверьте маршрут: /api/smart-light/devices`);
            }
            if (!response || typeof response !== 'object') {
                throw new Error(`Неверный тип ответа: ${typeof response}`);
            }

            logDebugUtils('DeviceStore', 'Response received', { status: response.success });

            let devicesList = [];
            let isSuccess = false;

            if (Array.isArray(response)) {
                devicesList = response;
                isSuccess = true;
            } else if (response.success !== false && Array.isArray(response.data)) {
                devicesList = response.data;
                isSuccess = true;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                devicesList = response.data.data;
                isSuccess = true;
            } else if (Array.isArray(response.data) && !('success' in response)) {
                devicesList = response.data;
                isSuccess = true;
            }

            if (isSuccess) {
                replaceDevicesList(devicesList);
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
            try {
                await fetchDevicesStore();
            } catch (e) {
                logErrorUtils('DeviceStore', 'Polling error', e);
            }
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

    const updateDeviceStore = (deviceData) => {
        if (!deviceData?.device_id) return;
        updateDeviceInList(deviceData);
        logDebugUtils('DeviceStore', `Device fully updated: ${deviceData.device_id}`);
    };

    const updateDeviceTelemetryStore = (id, telemetry) => {
        const device = devicesMap.value[id];
        if (device) {
            devicesMap.value[id] = {
                ...device,
                ...telemetry,
                updated_at: new Date().toISOString()
            };
            const idx = devices.value.findIndex(d => d.device_id === id);
            if (idx !== -1) {
                const newDevices = [...devices.value];
                newDevices[idx] = devicesMap.value[id];
                devices.value = newDevices;
            }
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
                updateDeviceInList({ device_id: id, status, updated_at: new Date().toISOString() });
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
                updateDeviceInList({ device_id: id, intensity, updated_at: new Date().toISOString() });
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
                updateDeviceInList({
                    device_id: deviceId,
                    ...settings,
                    updated_at: new Date().toISOString()
                });
                logDebugUtils('DeviceStore', `Device ${deviceId} settings updated`);
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
                updateDeviceInList({ device_id: id, status: 'ON', updated_at: new Date().toISOString() });
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
                updateDeviceInList({ device_id: id, status: 'SLEEPING', updated_at: new Date().toISOString() });
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

    // ========================================================================
    // EXPOSE
    // ========================================================================
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
