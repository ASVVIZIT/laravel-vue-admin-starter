/**
 * ============================================================================
 * POWER STORE — ПОДСТОР ПИТАНИЯ
 * ============================================================================
 * 📁 Путь: stores/smartlight/powerStore.js
 * ✅ Ленивая инициализация сторов внутри методов
 * ✅ Рефакторинг: методы получили суффикс Store(), импорты обновлены на *Utils
 * ============================================================================
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { calculateDeviceRuntime } from '@/components/SmartLight/utils/appPowerUtils.js';
import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

export const usePowerStore = defineStore('smartlight-power', () => {
    const powerSupplies = ref({});
    const activePowerSupply = ref('standard');
    const loading = ref(false);
    const error = ref(null);
    const powerStatus = ref({
        status: 'active', voltage: 3.7, current: 0, power: 0, lastUpdate: Date.now()
    });

    const initPowerStore = async () => {
        logDebugUtils('PowerStore', 'Initializing...');
        const saved = localStorage.getItem('smartlight_power_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                activePowerSupply.value = settings.activePowerSupply || 'standard';
                logDebugUtils('PowerStore', 'Loaded from localStorage');
            } catch (e) {
                logErrorUtils('PowerStore', 'Load error', e);
            }
        }
        return { success: true };
    };

    // ✅ ЛЕНИВАЯ ИНИЦИАЛИЗАЦИЯ (без циклических зависимостей)
    const calculateRuntimeStore = async (deviceId) => {
        try {
            const { useDeviceStore, useTypesStore } = await import('@/components/SmartLight/stores/index.js');
            const deviceStore = useDeviceStore();
            const typesStore = useTypesStore();

            logDebugUtils('PowerStore', `Calculating runtime for ${deviceId}`);

            const device = deviceStore.getDeviceStore(deviceId);
            if (!device) return 'N/A';

            const batteryType = typesStore.getBatteryTypeByIdStore(device.battery_type_id);
            if (!batteryType) return 'N/A';

            const runtime = calculateDeviceRuntime(device, batteryType);
            logDebugUtils('PowerStore', `Runtime calculated: ${runtime}`);
            return runtime;
        } catch (err) {
            logErrorUtils('PowerStore', 'Error calculating runtime', err);
            return 'N/A';
        }
    };

    const setActiveSupplyStore = (supplyId) => {
        activePowerSupply.value = supplyId;
        localStorage.setItem('smartlight_power_settings', JSON.stringify({ activePowerSupply: supplyId }));
        logDebugUtils('PowerStore', 'Active supply set to:', supplyId);
    };

    return {
        powerSupplies, activePowerSupply, loading, error, powerStatus,
        initPowerStore, calculateRuntimeStore, setActiveSupplyStore
    };
});

export default usePowerStore;
