/**
 * ============================================================================
 * INITIALIZATION CONTROLLER — КОНТРОЛЛЕР ИНИЦИАЛИЗАЦИИ
 * ============================================================================
 * 📁 Путь: controllers/InitializationController.js
 * ✅ Используется: UniversalThreeScene, BatteryRenderer, BulbRenderer
 * ✅ Рефакторинг: методы получили суффикс Controller(), импорты обновлены на *Utils
 * ============================================================================
 */

import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';
import { useDeviceStore } from '@/components/SmartLight/stores/smartlight/deviceStore.js';
import {
    checkContainerReady,
    isElementVisible,
    isContainerActive,
    initWhenReady,
    forceInit
} from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';

export class InitializationController {
    constructor() {
        this.deviceStore = useDeviceStore();
        this.initializedContainers = new WeakMap();
        this.initPromises = new WeakMap();
        this.cleanupCallbacks = new WeakMap();
    }

    /**
     * Инициализация контейнера (основной метод, суффикс Controller)
     */
    async initContainerController(container, deviceId, initCallback, options = {
        maxAttempts: 30,
        checkInterval: 100,
        maxCheckTime: 10000
    }) {
        logDebugUtils('InitializationController', 'Инициализация контейнера', {
            deviceId, container, options
        });

        if (this.initializedContainers.get(container)) {
            logDebugUtils('InitializationController', 'Контейнер уже инициализирован', { container });
            return { success: true, reason: 'Already initialized' };
        }

        this.cleanupCallbacks.set(container, () => {
            if (typeof initCallback.cleanup === 'function') {
                initCallback.cleanup();
            }
        });

        try {
            const result = await initWhenReady(container, () => {
                this.initializedContainers.set(container, true);
                initCallback();
                logDebugUtils('InitializationController', 'Контейнер инициализирован', { deviceId });
            }, options.maxAttempts);

            if (!result.success) {
                logErrorUtils('InitializationController', 'Инициализация не удалась', {
                    deviceId, reason: result.reason, attempts: result.attempts
                });
            }

            return result;
        } catch (error) {
            logErrorUtils('InitializationController', 'Ошибка инициализации', {
                deviceId, error: error.message
            });
            this.initializedContainers.set(container, false);
            throw error;
        }
    }

    /**
     * Проверка статуса инициализации (суффикс Controller)
     */
    isContainerInitializedController(container) {
        return this.initializedContainers.get(container) || false;
    }

    /**
     * Принудительная инициализация (суффикс Controller)
     */
    forceInitController(container, deviceId, initCallback, options = { maxAttempts: 10, delay: 100 }) {
        logDebugUtils('InitializationController', 'Принудительная инициализация', {
            deviceId, container, options
        });

        const result = forceInit(container, () => {
            this.initializedContainers.set(container, true);
            initCallback();
        }, options);

        if (!result) {
            logErrorUtils('InitializationController', 'Принудительная инициализация не удалась', {
                deviceId, container
            });
        }

        return result;
    }

    /**
     * Очистка ресурсов контейнера (суффикс Controller)
     */
    cleanupContainerController(container) {
        logDebugUtils('InitializationController', 'Очистка ресурсов контейнера', { container });

        const cleanup = this.cleanupCallbacks.get(container);
        if (cleanup) {
            cleanup();
            this.cleanupCallbacks.delete(container);
        }

        this.initializedContainers.set(container, false);
        this.initPromises.delete(container);
    }

    /**
     * Очистка всех ресурсов (суффикс Controller)
     */
    cleanupAllController() {
        logDebugUtils('InitializationController', 'Очистка всех ресурсов');

        for (const container of this.initializedContainers.keys()) {
            this.cleanupContainerController(container);
        }

        this.initializedContainers = new WeakMap();
        this.initPromises = new WeakMap();
        this.cleanupCallbacks = new WeakMap();
    }

    /**
     * Проверка видимости и активности контейнера (суффикс Controller)
     */
    checkContainerStatusController(container) {
        return {
            ready: checkContainerReady(container),
            visible: isElementVisible(container),
            active: isContainerActive(container),
            canInit: checkContainerReady(container) && isContainerActive(container)
        };
    }

    /**
     * Ожидание инициализации (суффикс Controller)
     */
    waitForInitController(container) {
        return new Promise((resolve) => {
            const check = () => {
                if (this.initializedContainers.get(container)) {
                    resolve({ success: true });
                } else {
                    setTimeout(check, 50);
                }
            };
            check();
        });
    }
}

export default InitializationController;
