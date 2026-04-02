/**
 * ============================================================================
 * DEVICE STORE — ПОДСТОР УСТРОЙСТВ
 * ============================================================================
 * 📁 Путь: stores/smartlight/deviceStore.js
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { CoreSmartLightResource } from '@/components/SmartLight/api/core/resource/coreSmartLightResource.js';

export const useDeviceStore = defineStore('device', () => {
    const devices = ref([]);
    const devicesMap = ref(new Map());
    const selectedDeviceId = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const selectedDevice = computed(() => {
        if (!selectedDeviceId.value) return null;
        return devicesMap.value.get(selectedDeviceId.value) || null;
    });

    const realDevices = computed(() => devices.value.filter(d => !d.is_fake));
    const fakeDevices = computed(() => devices.value.filter(d => d.is_fake));

    const getDevice = (deviceId) => {
        if (!deviceId) return null;
        return devicesMap.value.get(deviceId) || null;
    };

    const updateDevice = (deviceData) => {
        let device = devicesMap.value.get(deviceData.device_id);
        if (!device) {
            device = {
                ...deviceData,
                intensity: deviceData.intensity || 100,
                voltage: deviceData.voltage || 3.7,
                status: deviceData.status || 'OFF'
            };
            devicesMap.value.set(deviceData.device_id, device);
            devices.value.push(device);
        } else {
            Object.assign(device, deviceData);
        }
        return device;
    };

    const updateDeviceStatus = (deviceId, status) => {
        const device = devicesMap.value.get(deviceId);
        if (device) device.status = status;
    };

    const updateDeviceIntensity = (deviceId, intensity) => {
        const device = devicesMap.value.get(deviceId);
        if (device) device.intensity = intensity;
    };

    const selectDevice = (deviceId) => {
        selectedDeviceId.value = deviceId;
    };

    const fetchDevices = async () => {
        loading.value = true;
        error.value = null;
        console.log('[DeviceStore] Fetching devices from API...');
        try {
            const resource = new CoreSmartLightResource();
            const response = await resource.getDevices();

            let devicesArray = [];
            if (response.data?.data && Array.isArray(response.data.data)) {
                devicesArray = response.data.data;
            } else if (Array.isArray(response.data)) {
                devicesArray = response.data;
            } else if (response.devices && Array.isArray(response.devices)) {
                devicesArray = response.devices;
            }

            console.log('[DeviceStore] Devices to load:', devicesArray.length);

            devices.value = [];
            devicesMap.value = new Map();
            devicesArray.forEach(device => {
                console.log('[DeviceStore] Adding device:', device.device_id, device.name);
                updateDevice(device);
            });

            console.log('[DeviceStore] Final devices count:', devices.value.length);
            return { success: true, devices: devices.value };
        } catch (err) {
            error.value = 'Не удалось загрузить устройства';
            console.error('[DeviceStore] Error:', err.message);
            return { success: false, message: err.message };
        } finally {
            loading.value = false;
        }
    };

    const wakeDevice = async (deviceId) => {
        loading.value = true;
        console.log('[DeviceStore] Waking device:', deviceId);
        try {
            const resource = new CoreSmartLightResource();
            const response = await resource.wakeDevice(deviceId);
            const device = devicesMap.value.get(deviceId);
            if (device) {
                device.status = 'ON';
                device.intensity = 100;
            }
            console.log('[DeviceStore] Device awakened:', deviceId);
            return { success: true, data: response.data };
        } catch (err) {
            console.error('[DeviceStore] Wake error:', err.message);
            return { success: false, message: err.message };
        } finally {
            loading.value = false;
        }
    };

    const forceSleep = async (deviceId) => {
        loading.value = true;
        console.log('[DeviceStore] Putting device to sleep:', deviceId);
        try {
            const resource = new CoreSmartLightResource();
            const response = await resource.forceSleep(deviceId);
            const device = devicesMap.value.get(deviceId);
            if (device) device.status = 'SLEEPING';
            console.log('[DeviceStore] Device sleeping:', deviceId);
            return { success: true, data: response.data };
        } catch (err) {
            console.error('[DeviceStore] Sleep error:', err.message);
            return { success: false, message: err.message };
        } finally {
            loading.value = false;
        }
    };

    const updateDeviceSettings = async (deviceId, settings) => {
        loading.value = true;
        console.log('[DeviceStore] Updating device settings:', deviceId, settings);
        try {
            const resource = new CoreSmartLightResource();
            const formattedSettings = {
                critical_voltage: Number(settings.critical_voltage) || 3.0,
                sleep_interval: Number(settings.sleep_interval) || 600,
                emergency_sleep_interval: Number(settings.emergency_sleep_interval) || 3600,
                battery_type_id: settings.battery_type_id || 'li-ion-18650',
                bulb_type_id: settings.bulb_type_id || 'classic',
                capacity: Number(settings.capacity) || 3500,
                power_config: settings.power_config || {},
                battery_group_config: {
                    enabled: !!settings.battery_group_config?.enabled,
                    type: settings.battery_group_config?.type || 'series',
                    count: Number(settings.battery_group_config?.count) || 1
                }
            };
            const response = await resource.updateDeviceSettings(deviceId, formattedSettings);
            if (response.success) {
                const device = devicesMap.value.get(deviceId);
                if (device) Object.assign(device, formattedSettings);
            }
            console.log('[DeviceStore] Settings saved:', deviceId);
            return response;
        } catch (err) {
            console.error('[DeviceStore] Settings error:', err.message);
            return { success: false, message: err.message };
        } finally {
            loading.value = false;
        }
    };

    return {
        devices, devicesMap, selectedDeviceId, loading, error,
        selectedDevice, realDevices, fakeDevices,
        getDevice, updateDevice, updateDeviceStatus, updateDeviceIntensity,
        selectDevice, fetchDevices, wakeDevice, forceSleep, updateDeviceSettings
    };
});

export default useDeviceStore;
