import { ref, onMounted, onUnmounted } from 'vue';
import {
    initWhenReady,
    forceInit,
} from '@/components/SmartLight/api/utils/webglSupport';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';

export function useInitialization(containerRef, deviceId) {
    const isInitialized = ref(false);
    const initAttempts = ref(0);
    const maxInitAttempts = 30;

    /**
     * Принудительная инициализация с поддержкой повторных попыток
     */
    const forceInitWithRetry = (initCallback, options = { maxAttempts: 20, delay: 100 }) => {
        logDebug('useInitialization', 'Принудительная инициализация с повторными попытками', {
            deviceId,
            options
        });

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

                if (forceInit(containerRef.value, initCallback, options)) {
                    isInitialized.value = true;
                    return true;
                }
            }

            if (attempts < options.maxAttempts) {
                setTimeout(tryInit, options.delay);
                return false;
            }

            logDebug('useInitialization', 'Превышено максимальное количество попыток', {
                deviceId,
                attempts,
                maxAttempts: options.maxAttempts
            });
            return false;
        };

        return tryInit();
    };

    /**
     * Отложенная инициализация после полной загрузки
     */
    const delayedInit = (initCallback, delay = 500) => {
        logDebug('useInitialization', 'Отложенная инициализация', {
            deviceId,
            delay
        });

        setTimeout(() => {
            forceInitWithRetry(initCallback, { maxAttempts: 10, delay: 50 });
        }, delay);
    };

    /**
     * Инициализация при монтировании
     */
    const initOnMount = (initCallback) => {
        logDebug('useInitialization', 'Инициализация при монтировании', { deviceId });

        onMounted(() => {
            // Даем время для полной загрузки DOM
            setTimeout(() => {
                // Сначала пытаемся инициализировать сразу
                if (!forceInitWithRetry(initCallback, { maxAttempts: 5, delay: 50 })) {
                    // Если не удалось, используем отложенную инициализацию
                    delayedInit(initCallback, 1000);
                }
            }, 300);
        });

        onUnmounted(() => {
            isInitialized.value = false;
            initAttempts.value = 0;
        });
    };

    /**
     * Инициализация при изменении режима
     */
    const initOnModeChange = (initCallback) => {
        logDebug('useInitialization', 'Инициализация при изменении режима', { deviceId });

        watch(() => containerRef.value, (newContainer) => {
            if (newContainer) {
                // При изменении контейнера перезапускаем инициализацию
                forceInitWithRetry(initCallback, { maxAttempts: 15, delay: 100 });
            }
        });
    };

    return {
        isInitialized,
        initAttempts,
        forceInitWithRetry,
        delayedInit,
        initOnMount,
        initOnModeChange
    };
}
