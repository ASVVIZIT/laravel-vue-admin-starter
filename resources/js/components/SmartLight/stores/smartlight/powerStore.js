/**
 * ============================================================================
 * POWER STORE — ПОДСТОР ПИТАНИЯ
 * ============================================================================
 * 📁 Путь: stores/smartlight/powerStore.js
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDeviceStore } from './deviceStore.js';
import { useTypesStore } from './typesStore.js';
import { calculateDeviceRuntime } from '@/components/SmartLight/utils/appPowerUtils.js';

export const usePowerStore = defineStore('power', () => {
    const powerSupplies = ref({});
    const activePowerSupply = ref('standard');
    const loading = ref(false);
    const error = ref(null);
    const powerStatus = ref({
        status: 'active',
        voltage: 3.7,
        current: 0,
        power: 0,
        lastUpdate: Date.now()
    });

    // ✅ НУЖЕН ДОСТУП К DEVICE STORE ДЛЯ РАСЧЁТА
    const deviceStore = useDeviceStore();
    const typesStore = useTypesStore();

    const init = async () => {
        console.log('[PowerStore] Initializing...');
        const saved = localStorage.getItem('smartlight_power_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                activePowerSupply.value = settings.activePowerSupply || 'standard';
                console.log('[PowerStore] Loaded from localStorage');
            } catch (e) {
                console.error('[PowerStore] Load error:', e);
            }
        }
        return { success: true };
    };

    // ✅ РЕАЛЬНЫЙ РАСЧЁТ ВРЕМЕНИ РАБОТЫ
    const calculateRuntime = (deviceId) => {
        console.log('[PowerStore] Calculating runtime for:', deviceId);

        const device = deviceStore.getDevice(deviceId);
        if (!device) {
            console.warn('[PowerStore] Device not found:', deviceId);
            return 'N/A';
        }

        const batteryType = typesStore.getBatteryTypeById(device.battery_type_id);
        if (!batteryType) {
            console.warn('[PowerStore] Battery type not found:', device.battery_type_id);
            return 'N/A';
        }

        // ✅ ВЫЗЫВАЕМ UTIL ФУНКЦИЮ
        const runtime = calculateDeviceRuntime(device, batteryType);
        console.log('[PowerStore] Runtime calculated:', runtime);
        return runtime;
    };

    const setActiveSupply = (supplyId) => {
        activePowerSupply.value = supplyId;
        localStorage.setItem('smartlight_power_settings', JSON.stringify({
            activePowerSupply: supplyId
        }));
        console.log('[PowerStore] Active supply set to:', supplyId);
    };

    return {
        powerSupplies, activePowerSupply, loading, error, powerStatus,
        init, calculateRuntime, setActiveSupply
    };
});

export default usePowerStore;
