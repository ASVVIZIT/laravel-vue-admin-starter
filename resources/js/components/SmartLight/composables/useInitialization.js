/**
 * ============================================================================
 * USE INITIALIZATION — ИНИЦИАЛИЗАЦИЯ КОМПОНЕНТОВ
 * ============================================================================
 * 📁 Путь: composables/useInitialization.js
 * ✅ Используется: ThreeScene, BulbRenderer, BatteryRenderer
 * ✅ Интеграция: coreApiWebglSupportUtils, appLogger
 * ============================================================================
 */

import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { checkContainerReady } from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';
import { logDebugUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';

export function useInitialization(containerRef, deviceId) {
    const isInitialized = ref(false);
    const initAttempts = ref(0);
    const maxInitAttempts = ref(30);

    // checkContainerReady + nextTick вместо forceInit
    const forceInitWithRetry = (initCallback, options = { maxAttempts: 20, delay: 100 }) => {
        logDebugUtils('useInitialization', 'Принудительная инициализация', { deviceId, options });
        let attempts = 0;

        const tryInit = () => {
            attempts++;
            initAttempts.value = attempts;

            if (containerRef.value && isInitialized.value) {
                logDebugUtils('useInitialization', 'Компонент уже инициализирован', { deviceId });
                return true;
            }

            if (containerRef.value) {
                logDebugUtils('useInitialization', 'Попытка инициализации', {
                    deviceId,
                    attempt: attempts,
                    maxAttempts: options.maxAttempts
                });

                // ✅ ПРОВЕРЯЕМ ГОТОВНОСТЬ КОНТЕЙНЕРА
                if (checkContainerReady(containerRef.value)) {
                    nextTick(() => {
                        initCallback();
                        isInitialized.value = true;
                    });
                    return true;
                }
            }

            if (attempts < options.maxAttempts) {
                setTimeout(tryInit, options.delay);
                return false;
            }

            logDebugUtils('useInitialization', 'Превышено количество попыток', {
                deviceId,
                attempts,
                maxAttempts: options.maxAttempts
            });
            return false;
        };

        return tryInit();
    };

    const delayedInit = (initCallback, delay = 500) => {
        logDebugUtils('useInitialization', 'Отложенная инициализация', { deviceId, delay });
        setTimeout(() => {
            forceInitWithRetry(initCallback, { maxAttempts: 10, delay: 50 });
        }, delay);
    };

    const initOnMount = (initCallback) => {
        logDebugUtils('useInitialization', 'Инициализация при монтировании', { deviceId });
        onMounted(() => {
            setTimeout(() => {
                if (!forceInitWithRetry(initCallback, { maxAttempts: 5, delay: 50 })) {
                    delayedInit(initCallback, 1000);
                }
            }, 300);
        });
        onUnmounted(() => {
            isInitialized.value = false;
            initAttempts.value = 0;
        });
    };

    const initOnModeChange = (initCallback) => {
        logDebugUtils('useInitialization', 'Инициализация при изменении режима', { deviceId });
        watch(() => containerRef.value, (newContainer) => {
            if (newContainer) {
                forceInitWithRetry(initCallback, { maxAttempts: 15, delay: 100 });
            }
        });
    };

    return {
        isInitialized,
        initAttempts,
        maxInitAttempts,
        forceInitWithRetry,
        delayedInit,
        initOnMount,
        initOnModeChange
    };
}

export default useInitialization;
