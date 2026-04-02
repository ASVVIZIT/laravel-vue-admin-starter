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
// ✅ ИСПРАВЛЕНО — используем checkContainerReady вместо forceInit
import { checkContainerReady } from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';
import { logDebug } from '@/components/SmartLight/utils/appLogger.js';

export function useInitialization(containerRef, deviceId) {
    const isInitialized = ref(false);
    const initAttempts = ref(0);
    const maxInitAttempts = ref(30);

    // ✅ ИСПРАВЛЕНО — используем checkContainerReady + nextTick вместо forceInit
    const forceInitWithRetry = (initCallback, options = { maxAttempts: 20, delay: 100 }) => {
        logDebug('useInitialization', 'Принудительная инициализация', { deviceId, options });
        let attempts = 0;

        const tryInit = () => {
            attempts++;
            initAttempts.value = attempts;

            if (containerRef.value && isInitialized.value) {
                logDebug('useInitialization', 'Компонент уже инициализирован', { deviceId });
                return true;
            }

            if (containerRef.value) {
                logDebug('useInitialization', 'Попытка инициализации', {
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

            logDebug('useInitialization', 'Превышено количество попыток', {
                deviceId,
                attempts,
                maxAttempts: options.maxAttempts
            });
            return false;
        };

        return tryInit();
    };

    const delayedInit = (initCallback, delay = 500) => {
        logDebug('useInitialization', 'Отложенная инициализация', { deviceId, delay });
        setTimeout(() => {
            forceInitWithRetry(initCallback, { maxAttempts: 10, delay: 50 });
        }, delay);
    };

    const initOnMount = (initCallback) => {
        logDebug('useInitialization', 'Инициализация при монтировании', { deviceId });
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
        logDebug('useInitialization', 'Инициализация при изменении режима', { deviceId });
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
