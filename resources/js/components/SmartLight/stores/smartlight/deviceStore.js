/**
 * ============================================================================
 * DEVICE STORE — ГРАНУЛЯРНЫЙ ПУЛЛИНГ + ФИЛЬТРЫ + ИНДИКАТОРЫ ОБНОВЛЕНИЯ
 * ============================================================================
 * 📁 Путь: @/components/SmartLight/stores/smartlight/deviceStore.js
 * ✅ Гранулярный пуллинг: обновляет только изменённые устройства
 * ✅ Фильтры: all / real / fake / personal (без дублирования с бэкендом)
 * ✅ Индикаторы: updatingDevices для анимации в карточках
 * ✅ Вкладки: динамические из API (meta.tabs)
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';
import CoreDeviceResource from '@/components/SmartLight/api/core/resource/coreDeviceResource.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

export const useDeviceStore = defineStore('smartlight-device', () => {
    // ========================================================================
    // === STATE ===
    // ========================================================================

    const devices = ref([]);                    // Все загруженные устройства
    const devicesMap = ref({});                 // Мапа для быстрого доступа по device_id
    const selectedDeviceId = ref(null);         // ID выбранного устройства
    const loading = ref(false);                 // ❌ Только для ПЕРВОЙ загрузки (не для пуллинга!)
    const error = ref(null);                    // Ошибка последнего запроса
    const lastUpdated = ref(null);              // Время последнего успешного обновления

    // === ФИЛЬТРЫ ===
    const deviceFilter = ref('all');            // 'all' | 'real' | 'fake' | 'personal'
    const availableTabs = ref([]);              // Динамические вкладки из API (meta.tabs)

    // === ГРАНУЛЯРНЫЙ ПУЛЛИНГ ===
    const updatingDevices = reactive({});       // { [deviceId]: boolean } — индикаторы обновления
    const lastSyncedAt = ref({});               // { [deviceId]: timestamp } — время последней синхронизации

    // === POLLING CONFIG ===
    const pollingInterval = ref(null);          // ID интервала для clearInterval
    const pollingEnabled = ref(false);          // Флаг: запущен ли пуллинг
    const pollingDelay = ref(10000);            // Задержка между запросами (мс)
    const pollingAttempts = ref(0);             // Счётчик ошибок подряд
    const maxPollingAttempts = ref(5);          // Макс. ошибок перед остановкой пуллинга

    // ========================================================================
    // === GETTERS ===
    // ========================================================================

    /**
     * Выбранное устройство (полный объект из devicesMap)
     */
    const selectedDevice = computed(() => {
        if (!selectedDeviceId.value) return null;
        return devicesMap.value[selectedDeviceId.value] || null;
    });

    /**
     * Только реальные устройства (is_fake = false)
     */
    const realDevices = computed(() => devices.value.filter(d => !d.is_fake));

    /**
     * Только фейковые/демо устройства (is_fake = true)
     */
    const fakeDevices = computed(() => devices.value.filter(d => d.is_fake));

    /**
     * Устройства текущего пользователя (для совместимости, но не используется в filteredDevices)
     * ⚠️ Бэкенд уже фильтрует по user_id для таба "personal"
     */
    const personalDevices = computed(() => {
        const currentUserId = window.__CURRENT_USER_ID__ || null;
        return devices.value.filter(d => d.user_id === currentUserId);
    });

    /**
     * ✅ ОТФИЛЬТРОВАННЫЙ СПИСОК ДЛЯ ОТОБРАЖЕНИЯ
     *
     * Важно: для таба "personal" НЕ фильтруем повторно — бэкенд уже применил where('user_id', Auth::id())
     * Дублирующая фильтрация на фронтенде приводит к пустому списку, если window.__CURRENT_USER_ID__ не установлен
     */
    const filteredDevices = computed(() => {
        const list = devices.value || [];

        switch (deviceFilter.value) {
            case 'real':
                // Только реальные устройства
                return list.filter(d => !d.is_fake);

            case 'fake':
                // Только фейковые/демо устройства
                return list.filter(d => d.is_fake);

            case 'personal':
                // ✅ Бэкенд уже отфильтровал по user_id — просто возвращаем список как есть
                // Если оставить фильтрацию здесь, нужен window.__CURRENT_USER_ID__, иначе будет []
                return list;

            case 'all':
            default:
                // Все устройства (с учётом прав, применённых на бэкенде)
                return list;
        }
    });

    /**
     * Получить устройство по device_id из мапы
     */
    const getDeviceStore = (deviceId) => devicesMap.value[deviceId] || null;

    /**
     * Получить текущий активный фильтр
     */
    const getDeviceFilterStore = () => deviceFilter.value;

    /**
     * Проверить, обновляется ли конкретное устройство (для индикатора в карточке)
     */
    const isDeviceUpdatingStore = (deviceId) => !!updatingDevices[deviceId];

    /**
     * Получить время последней синхронизации устройства
     */
    const getDeviceLastSyncedStore = (deviceId) => lastSyncedAt.value[deviceId] || null;

    // ========================================================================
    // === HELPERS — ВНУТРЕННИЕ ФУНКЦИИ ===
    // ========================================================================

    /**
     * Сортировка устройств: сначала реальные, потом фейковые, потом по device_id
     */
    const sortDevices = (devicesList) => {
        return [...devicesList].sort((a, b) => {
            if (a.is_fake && !b.is_fake) return 1;
            if (!a.is_fake && b.is_fake) return -1;
            return a.device_id.localeCompare(b.device_id);
        });
    };

    /**
     * 🔄 ГРАНУЛЯРНОЕ ОБНОВЛЕНИЕ: только изменённые устройства
     *
     * Вместо полной замены массива (которая вызывает перерисовку всей страницы),
     * обновляем только те устройства, у которых изменились данные.
     *
     * @param {Array} newDevicesList — список устройств с бэкенда
     */
    const updateDevicesGranular = (newDevicesList) => {
        const now = new Date().toISOString();

        newDevicesList.forEach(newDevice => {
            const id = newDevice?.device_id;
            if (!id) return;

            // Помечаем устройство как обновляемое (для анимации в карточке)
            updatingDevices[id] = true;

            const existingIdx = devices.value.findIndex(d => d.device_id === id);

            if (existingIdx !== -1) {
                // ✅ Устройство уже есть — обновляем только если есть изменения
                const oldDevice = devices.value[existingIdx];
                const hasChanges = Object.keys(newDevice).some(key =>
                    key !== 'updated_at' && JSON.stringify(oldDevice[key]) !== JSON.stringify(newDevice[key])
                );

                if (hasChanges) {
                    const updatedDevice = {
                        ...oldDevice,
                        ...newDevice,
                        _last_updated: now,  // метка для анимации
                        updated_at: now
                    };
                    const newDevices = [...devices.value];
                    newDevices[existingIdx] = updatedDevice;
                    devices.value = newDevices;
                    devicesMap.value[id] = updatedDevice;
                    lastSyncedAt.value[id] = now;
                }
            } else {
                // ✅ Новое устройство — добавляем в отсортированный список
                const deviceWithMeta = {
                    ...newDevice,
                    _last_updated: now,
                    created_at: newDevice.created_at || now,
                    updated_at: now
                };
                addDeviceSorted(deviceWithMeta);
                lastSyncedAt.value[id] = now;
            }

            // Снимаем флаг обновления с задержкой для плавной анимации
            setTimeout(() => { updatingDevices[id] = false; }, 300);
        });

        // ✅ Удаляем устройства, которых больше нет в ответе бэкенда
        const newIds = new Set(newDevicesList.map(d => d?.device_id).filter(Boolean));
        devices.value = devices.value.filter(d => newIds.has(d.device_id));
    };

    /**
     * Полная замена списка устройств (для первой загрузки)
     */
    const replaceDevicesList = (newList) => {
        const freshList = newList.map(d => ({ ...d })); // новые ссылки для реактивности
        devices.value = sortDevices(freshList);
        devicesMap.value = freshList.reduce((acc, d) => {
            if (d?.device_id) acc[d.device_id] = d;
            return acc;
        }, {});
    };

    /**
     * Обновить одно устройство в списке (после редактирования)
     */
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

    /**
     * Добавить новое устройство в отсортированный список
     */
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
    // === ACTIONS ===
    // ========================================================================

    /**
     * Загрузить устройства с бэкенда (с гранулярным обновлением)
     *
     * @param {Object} params — параметры запроса: { tab, page, per_page, search, status, ... }
     * @returns {Promise<{success: boolean, count?: number, error?: string}>}
     */
    const fetchDevicesStore = async (params = {}) => {
        // ❌ НЕ ставим loading.value = true — это вызывает спиннер на всей странице
        // Пуллинг должен быть незаметным для пользователя
        error.value = null;
        logDebugUtils('DeviceStore', 'Polling devices...', params);

        try {
            const resource = new CoreDeviceResource();
            const response = await resource.getAllResource(params);

            // === Парсинг ответа (поддержка разных форматов) ===
            let devicesList = [];
            let isSuccess = false;

            if (Array.isArray(response)) {
                // Прямой массив
                devicesList = response;
                isSuccess = true;
            } else if (response?.success !== false && Array.isArray(response.data)) {
                // { success: true, data: [...] }
                devicesList = response.data;
                isSuccess = true;
            } else if (response?.data?.data && Array.isArray(response.data.data)) {
                // { success: true, data: { data: [...] } } — вложенная пагинация
                devicesList = response.data.data;
                isSuccess = true;
            } else if (Array.isArray(response.data) && !('success' in response)) {
                // { data: [...] } без success
                devicesList = response.data;
                isSuccess = true;
            }

            if (isSuccess) {
                // ✅ ГРАНУЛЯРНОЕ ОБНОВЛЕНИЕ вместо полной замены
                updateDevicesGranular(devicesList);

                // ✅ Обновляем динамические вкладки из meta.tabs
                if (response?.meta?.tabs) {
                    availableTabs.value = response.meta.tabs;
                }

                lastUpdated.value = new Date();
                pollingAttempts.value = 0;
                logDebugUtils('DeviceStore', `Polled ${devicesList.length} devices (granular)`);
                return { success: true, count: devicesList.length };
            } else {
                logErrorUtils('DeviceStore', 'Не распознан формат ответа', { response });
                throw new Error(`Неизвестный формат ответа от сервера`);
            }
        } catch (err) {
            logErrorUtils('DeviceStore', 'Polling error', err);
            error.value = err.message || 'Не удалось опросить устройства';
            pollingAttempts.value++;

            // Останавливаем пуллинг после нескольких ошибок подряд
            if (pollingAttempts.value >= maxPollingAttempts.value) {
                logErrorUtils('DeviceStore', 'Polling limit reached');
                stopPollingStore();
            }
            return { success: false, error: err.message };
        }
    };

    /**
     * Запустить периодический опрос бэкенда (пуллинг)
     */
    const startPollingStore = () => {
        if (pollingInterval.value) return;
        logDebugUtils('DeviceStore', `Polling запущен: ${pollingDelay.value}ms`);

        pollingInterval.value = setInterval(async () => {
            try {
                // Передаём текущий фильтр и вкладку в запрос
                await fetchDevicesStore({ tab: deviceFilter.value });
            } catch (e) {
                logErrorUtils('DeviceStore', 'Polling error', e);
            }
        }, pollingDelay.value);

        pollingEnabled.value = true;
    };

    /**
     * Остановить пуллинг
     */
    const stopPollingStore = () => {
        if (pollingInterval.value) {
            clearInterval(pollingInterval.value);
            pollingInterval.value = null;
        }
        pollingEnabled.value = false;
    };

    /**
     * Изменить задержку пуллинга (с перезапуском)
     */
    const setPollingDelayStore = (ms) => {
        pollingDelay.value = ms;
        if (pollingEnabled.value) {
            stopPollingStore();
            startPollingStore();
        }
    };

    /**
     * Изменить фильтр и перезагрузить список (сброс на первую страницу)
     */
    const setDeviceFilterStore = async (filter) => {
        if (['all', 'real', 'fake', 'personal'].includes(filter)) {
            deviceFilter.value = filter;
            // Сброс на первую страницу при смене фильтра
            await fetchDevicesStore({ tab: filter, page: 1 });
            logDebugUtils('DeviceStore', `Filter changed: ${filter}`);
        }
    };

    /**
     * Обновить данные устройства в списке (после редактирования)
     */
    const updateDeviceStore = (deviceData) => {
        if (deviceData?.device_id) updateDeviceInList(deviceData);
    };

    /**
     * Обновить телеметрию устройства
     */
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

    /**
     * Выбрать устройство (для отображения в панели настроек)
     */
    const selectDeviceStore = (id) => {
        selectedDeviceId.value = id;
    };

    /**
     * Обновить статус устройства (через API)
     */
    const updateDeviceStatusStore = async (id, status) => {
        try {
            const resource = new CoreDeviceResource();
            const res = await resource.updateStatusResource(id, status);
            if (res?.success) {
                updateDeviceInList({
                    device_id: id,
                    status,
                    updated_at: new Date().toISOString()
                });
            }
            return res;
        } catch (e) {
            logErrorUtils('DeviceStore', 'Status error', e);
            throw e;
        }
    };

    /**
     * Обновить интенсивность устройства (через API)
     */
    const updateDeviceIntensityStore = async (id, intensity) => {
        try {
            const resource = new CoreDeviceResource();
            const res = await resource.updateIntensityResource(id, intensity);
            if (res?.success) {
                updateDeviceInList({
                    device_id: id,
                    intensity,
                    updated_at: new Date().toISOString()
                });
            }
            return res;
        } catch (e) {
            logErrorUtils('DeviceStore', 'Intensity error', e);
            throw e;
        }
    };

    /**
     * Обновить настройки устройства (через API)
     */
    const updateDeviceSettingsStore = async (deviceId, settings) => {
        try {
            logDebugUtils('DeviceStore', `Updating settings for ${deviceId}`, settings);
            const resource = new CoreDeviceResource();
            const response = await resource.updateSettingsResource(deviceId, settings);
            if (response?.success) {
                updateDeviceInList({
                    device_id: deviceId,
                    ...settings,
                    updated_at: new Date().toISOString()
                });
            }
            return response;
        } catch (err) {
            logErrorUtils('DeviceStore', `Error updating ${deviceId}`, err);
            throw err;
        }
    };

    /**
     * Пробудить устройство (через API)
     */
    const wakeDeviceStore = async (id) => {
        try {
            const resource = new CoreDeviceResource();
            const res = await resource.wakeResource(id);
            if (res?.success) {
                updateDeviceInList({
                    device_id: id,
                    status: 'ON',
                    updated_at: new Date().toISOString()
                });
            }
            return res;
        } catch (e) {
            logErrorUtils('DeviceStore', 'Wake error', e);
            throw e;
        }
    };

    /**
     * Перевести устройство в сон (через API)
     */
    const forceSleepStore = async (id) => {
        try {
            const resource = new CoreDeviceResource();
            const res = await resource.sleepResource(id);
            if (res?.success) {
                updateDeviceInList({
                    device_id: id,
                    status: 'SLEEPING',
                    updated_at: new Date().toISOString()
                });
            }
            return res;
        } catch (e) {
            logErrorUtils('DeviceStore', 'Sleep error', e);
            throw e;
        }
    };

    /**
     * Очистить ресурсы стора (при размонтировании)
     */
    const cleanupStore = () => {
        stopPollingStore();
        logDebugUtils('DeviceStore', 'Cleanup');
    };

    /**
     * Инициализация стора (первая загрузка + запуск пуллинга)
     */
    const initStore = async () => {
        logDebugUtils('DeviceStore', 'Init');
        loading.value = true; // ✅ Только при первой загрузке
        await fetchDevicesStore();
        loading.value = false;
        if (!pollingEnabled.value) startPollingStore();
    };

    // ========================================================================
    // === EXPOSE ===
    // ========================================================================
    return {
        // === State ===
        devices,
        devicesMap,
        selectedDeviceId,
        selectedDevice,
        loading,
        error,
        lastUpdated,
        deviceFilter,
        availableTabs,
        realDevices,
        fakeDevices,
        personalDevices,
        filteredDevices,
        updatingDevices,
        lastSyncedAt,
        pollingEnabled,
        pollingDelay,
        pollingAttempts,

        // === Getters ===
        getDeviceStore,
        getDeviceFilterStore,
        isDeviceUpdatingStore,
        getDeviceLastSyncedStore,

        // === Actions ===
        fetchDevicesStore,
        startPollingStore,
        stopPollingStore,
        setPollingDelayStore,
        updateDeviceTelemetryStore,
        updateDeviceStore,
        selectDeviceStore,
        setDeviceFilterStore,
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
