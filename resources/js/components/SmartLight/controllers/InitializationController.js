/**
 * ============================================================================
 * INITIALIZATION CONTROLLER — КОНТРОЛЛЕР ИНИЦИАЛИЗАЦИИ 3D-КОНТЕЙНЕРОВ
 * ============================================================================
 * 📁 Путь: controllers/InitializationController.js
 * ✅ Используется: UniversalThreeScene.vue, BatteryRenderer, BulbRenderer
 * ✅ Рефакторинг: все методы получили суффикс Controller(), импорты обновлены
 * ✅ Проверка: сигнатуры утилит, очистка ресурсов, обработка ошибок
 * ============================================================================
 */

import { logDebugUtils, logErrorUtils } from '@/components/SmartLight/utils/appLoggerUtils.js';
import { useDeviceStore } from '@/components/SmartLight/stores/smartlight/deviceStore.js';
import {
    checkContainerReady,
    isElementVisible,
    isContainerActive,
    initWhenReady,
    forceInit as forceInitUtil
} from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';

export class InitializationController {
    constructor() {
        this.deviceStore = useDeviceStore();
        // ✅ WeakMap для отслеживания инициализированных контейнеров (авт. сборка мусора)
        this.initializedContainers = new WeakMap();
        this.initPromises = new WeakMap();
        this.cleanupCallbacks = new WeakMap();
    }

    /**
     * Инициализация контейнера (основной метод)
     * @param {HTMLElement} container - DOM-элемент для инициализации
     * @param {string} deviceId - ID устройства для логирования
     * @param {Function} initCallback - Callback для выполнения инициализации
     * @param {Object} options - Опции: maxAttempts, checkInterval, maxCheckTime
     * @returns {Promise<{success: boolean, reason?: string, attempts?: number}>}
     */
    async initContainerController(container, deviceId, initCallback, options = {
        maxAttempts: 30,
        checkInterval: 100,
        maxCheckTime: 10000
    }) {
        logDebugUtils('InitializationController', 'Инициализация контейнера', {
            deviceId,
            container: container?.tagName,
            options
        });

        // ✅ Проверка: уже инициализирован?
        if (this.initializedContainers.get(container)) {
            logDebugUtils('InitializationController', 'Контейнер уже инициализирован', { container });
            return { success: true, reason: 'Already initialized' };
        }

        // ✅ Регистрация колбэка очистки
        this.cleanupCallbacks.set(container, () => {
            if (typeof initCallback?.cleanup === 'function') {
                initCallback.cleanup();
            }
        });

        try {
            // ✅ Используем утилиту initWhenReady с правильными параметрами
            const result = await initWhenReady(container, () => {
                this.initializedContainers.set(container, true);
                if (typeof initCallback === 'function') {
                    initCallback();
                }
                logDebugUtils('InitializationController', 'Контейнер инициализирован', { deviceId });
            }, options);

            if (!result?.success) {
                logErrorUtils('InitializationController', 'Инициализация не удалась', {
                    deviceId,
                    reason: result?.reason,
                    attempts: result?.attempts
                });
            }

            return result;
        } catch (error) {
            logErrorUtils('InitializationController', 'Ошибка инициализации', {
                deviceId,
                error: error?.message || String(error)
            });
            this.initializedContainers.set(container, false);
            throw error;
        }
    }

    /**
     * Проверка статуса инициализации контейнера
     * @param {HTMLElement} container
     * @returns {boolean}
     */
    isContainerInitializedController(container) {
        return this.initializedContainers.get(container) || false;
    }

    /**
     * Принудительная инициализация (без ожидания видимости)
     * @param {HTMLElement} container
     * @param {string} deviceId
     * @param {Function} initCallback
     * @param {Object} options
     * @returns {boolean}
     */
    forceInitController(container, deviceId, initCallback, options = { maxAttempts: 10, delay: 100 }) {
        logDebugUtils('InitializationController', 'Принудительная инициализация', {
            deviceId,
            container: container?.tagName,
            options
        });

        const result = forceInitUtil(container, () => {
            this.initializedContainers.set(container, true);
            if (typeof initCallback === 'function') {
                initCallback();
            }
        }, options);

        if (!result) {
            logErrorUtils('InitializationController', 'Принудительная инициализация не удалась', {
                deviceId,
                container: container?.tagName
            });
        }

        return result;
    }

    /**
     * Очистка ресурсов конкретного контейнера
     * @param {HTMLElement} container
     */
    cleanupContainerController(container) {
        logDebugUtils('InitializationController', 'Очистка ресурсов контейнера', {
            container: container?.tagName
        });

        // ✅ Выполняем зарегистрированный колбэк очистки
        const cleanup = this.cleanupCallbacks.get(container);
        if (typeof cleanup === 'function') {
            cleanup();
            this.cleanupCallbacks.delete(container);
        }

        // ✅ Сбрасываем статус инициализации
        this.initializedContainers.set(container, false);
        this.initPromises.delete(container);
    }

    /**
     * Очистка всех ресурсов (глобальная)
     */
    cleanupAllController() {
        logDebugUtils('InitializationController', 'Очистка всех ресурсов');

        // ✅ Очищаем все зарегистрированные контейнеры
        for (const container of this.initializedContainers.keys()) {
            this.cleanupContainerController(container);
        }

        // ✅ Пересоздаём карты для полной очистки
        this.initializedContainers = new WeakMap();
        this.initPromises = new WeakMap();
        this.cleanupCallbacks = new WeakMap();
    }

    /**
     * Проверка видимости и активности контейнера
     * @param {HTMLElement} container
     * @returns {{ready: boolean, visible: boolean, active: boolean, canInit: boolean}}
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
     * Ожидание завершения инициализации (polling)
     * @param {HTMLElement} container
     * @returns {Promise<{success: boolean}>}
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
            // ✅ Запускаем первую проверку немедленно
            check();
        });
    }
}

export default InitializationController;
