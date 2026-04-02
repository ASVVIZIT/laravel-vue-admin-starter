/**
 * ============================================================================
 * INITIALIZATION CONTROLLER — КОНТРОЛЛЕР ИНИЦИАЛИЗАЦИИ
 * ============================================================================
 * 📁 Путь: controllers/InitializationController.js
 * ✅ Используется: ThreeScene.vue, BulbRenderer.vue, BatteryRenderer.vue
 * ✅ Безопасно менять — влияет только на инициализацию компонентов
 * ============================================================================
 */

import { logDebug, logError } from '@/components/SmartLight/utils/appLogger.js';
import { useDeviceStore } from '@/components/SmartLight/stores/smartlight/deviceStore.js';
import {
    isContainerActive,
    isContainerVisible,
    checkContainerReady,
    forceInit
} from '@/components/SmartLight/api/core/utils/coreApiWebglSupportUtils.js';

export class InitializationController {
    constructor() {
        this.deviceStore = useDeviceStore();
        this.initializedContainers = new WeakMap();
        this.initAttempts = new WeakMap();
        this.maxInitAttempts = new WeakMap();
        this.initCallbacks = new WeakMap();
        this.mutationObservers = new WeakMap();
        this.resizeObservers = new WeakMap();
        this.tabObservers = new WeakMap();
        this.initTimeouts = new WeakMap();
    }

    /**
     * Инициализация контейнера
     * @param {HTMLElement} container - Контейнер
     * @param {string} deviceId - ID устройства
     * @param {Function} initCallback - Callback инициализации
     * @param {Object} options - Опции
     */
    initContainer(container, deviceId, initCallback, options = {
        maxAttempts: 20,
        minSize: 50,
        checkInterval: 100,
        maxCheckTime: 10000
    }) {
        logDebug('InitializationController', 'Инициализация контейнера', {
            deviceId, container, options
        });
        this.initAttempts.set(container, 0);
        this.maxInitAttempts.set(container, options.maxAttempts);
        this.initCallbacks.set(container, initCallback);
        if (this.initializedContainers.get(container)) {
            logDebug('InitializationController', 'Контейнер уже инициализирован', { container });
            return;
        }
        this.initializedContainers.set(container, false);
        this.initTimeouts.set(container, setTimeout(() => {
            const attempts = this.initAttempts.get(container);
            logDebug('InitializationController', 'Таймаут инициализации', {
                deviceId, attempts, maxAttempts: options.maxAttempts
            });
            if (!this.initializedContainers.get(container)) {
                this.initializedContainers.set(container, false);
            }
        }, options.maxCheckTime));
        this.startChecking(container, deviceId, options);
    }

    /**
     * Начинает проверку готовности контейнера
     * @param {HTMLElement} container - Контейнер
     * @param {string} deviceId - ID устройства
     * @param {Object} options - Опции
     */
    startChecking(container, deviceId, options) {
        logDebug('InitializationController', 'Начало проверки готовности контейнера', {
            deviceId, container
        });
        const interval = setInterval(() => {
            this.checkContainer(container, deviceId, interval, options);
        }, options.checkInterval);
        this.mutationObservers.set(container, interval);
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(() => {
                this.checkContainer(container, deviceId, interval, options);
            });
            observer.observe(container, {
                attributes: true,
                childList: true,
                subtree: true,
                characterData: true,
                attributeFilter: ['style', 'class', 'width', 'height']
            });
            this.mutationObservers.set(container, observer);
        }
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                this.checkContainer(container, deviceId, interval, options);
            });
            resizeObserver.observe(container);
            this.resizeObservers.set(container, resizeObserver);
        }
        const tabPane = container.closest('.el-tab-pane');
        if (tabPane) {
            const tabObserver = new MutationObserver(() => {
                this.checkContainer(container, deviceId, interval, options);
            });
            tabObserver.observe(tabPane, {
                attributes: true,
                attributeFilter: ['class']
            });
            this.tabObservers.set(container, tabObserver);
        }
    }

    /**
     * Проверка контейнера на готовность к инициализации
     * @param {HTMLElement} container - Контейнер
     * @param {string} deviceId - ID устройства
     * @param {number} interval - Интервал
     * @param {Object} options - Опции
     * @returns {boolean} Результат проверки
     */
    checkContainer(container, deviceId, interval, options) {
        if (this.initializedContainers.get(container)) {
            logDebug('InitializationController', 'Контейнер уже инициализирован', { container });
            return;
        }
        const attempts = this.initAttempts.get(container) || 0;
        const maxAttempts = this.maxInitAttempts.get(container) || options.maxAttempts;
        logDebug('InitializationController', 'Проверка контейнера', {
            deviceId, container, attempt: attempts, maxAttempts
        });
        this.initAttempts.set(container, attempts + 1);
        if (checkContainerReady(container, options) && isContainerActive(container)) {
            logDebug('InitializationController', 'Контейнер готов к инициализации', {
                deviceId, container
            });
            this.cleanupContainer(container);
            this.initializedContainers.set(container, true);
            const initCallback = this.initCallbacks.get(container);
            if (initCallback) {
                initCallback();
            }
            return true;
        } else if (attempts >= maxAttempts) {
            logDebug('InitializationController', 'Превышено максимальное количество попыток', {
                deviceId, container, attempts, maxAttempts
            });
            this.cleanupContainer(container);
            this.initializedContainers.set(container, false);
            return false;
        }
        return false;
    }

    /**
     * Очистка ресурсов
     * @param {HTMLElement} container - Контейнер
     */
    cleanupContainer(container) {
        logDebug('InitializationController', 'Очистка ресурсов контейнера', { container });
        const interval = this.mutationObservers.get(container);
        if (interval && typeof interval === 'number') {
            clearInterval(interval);
        }
        const mutationObserver = this.mutationObservers.get(container);
        if (mutationObserver && mutationObserver.disconnect) {
            mutationObserver.disconnect();
            this.mutationObservers.delete(container);
        }
        const resizeObserver = this.resizeObservers.get(container);
        if (resizeObserver && resizeObserver.disconnect) {
            resizeObserver.disconnect();
            this.resizeObservers.delete(container);
        }
        const tabObserver = this.tabObservers.get(container);
        if (tabObserver && tabObserver.disconnect) {
            tabObserver.disconnect();
            this.tabObservers.delete(container);
        }
        const timeout = this.initTimeouts.get(container);
        if (timeout) {
            clearTimeout(timeout);
            this.initTimeouts.delete(container);
        }
        this.initAttempts.delete(container);
        this.maxInitAttempts.delete(container);
        this.initCallbacks.delete(container);
    }

    /**
     * Принудительная инициализация
     * @param {HTMLElement} container - Контейнер
     * @param {string} deviceId - ID устройства
     * @param {Function} initCallback - Callback инициализации
     * @param {Object} options - Опции
     */
    forceInit(container, deviceId, initCallback, options = { maxAttempts: 10, delay: 100 }) {
        logDebug('InitializationController', 'Принудительная инициализация', {
            deviceId, container, options
        });
        setTimeout(() => {
            forceInit(container, initCallback, options);
        }, options.delay);
    }

    /**
     * Проверка инициализации контейнера
     * @param {HTMLElement} container - Контейнер
     * @returns {boolean} Статус инициализации
     */
    isContainerInitialized(container) {
        logDebug('InitializationController', 'Проверка инициализации контейнера', { container });
        return this.initializedContainers.get(container) || false;
    }

    /**
     * Очистка всех ресурсов
     */
    cleanupAll() {
        logDebug('InitializationController', 'Очистка всех ресурсов');
        for (const container of this.initializedContainers.keys()) {
            this.cleanupContainer(container);
        }
        this.initializedContainers = new WeakMap();
        this.initAttempts = new WeakMap();
        this.maxInitAttempts = new WeakMap();
        this.initCallbacks = new WeakMap();
        this.mutationObservers = new WeakMap();
        this.resizeObservers = new WeakMap();
        this.tabObservers = new WeakMap();
        this.initTimeouts = new WeakMap();
    }
}

export default InitializationController;
