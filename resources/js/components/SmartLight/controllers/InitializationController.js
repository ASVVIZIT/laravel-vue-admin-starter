import { logDebug } from '@/components/SmartLight/api/utils/logger';
import { useDeviceStore } from '@/components/SmartLight/stores';
import {
    isContainerActive,
    isContainerVisible,
    checkContainerReady,
    forceInit
} from '@/components/SmartLight/api/utils/webglSupport';

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
     */
    initContainer(container, deviceId, initCallback, options = {
        maxAttempts: 20,
        minSize: 50,
        checkInterval: 100,
        maxCheckTime: 10000
    }) {
        logDebug('InitializationController', 'Инициализация контейнера', {
            deviceId,
            container,
            options
        });

        // Сохраняем попытки инициализации
        this.initAttempts.set(container, 0);
        this.maxInitAttempts.set(container, options.maxAttempts);

        // Сохраняем callback для инициализации
        this.initCallbacks.set(container, initCallback);

        // Проверяем, не инициализирован ли уже контейнер
        if (this.initializedContainers.get(container)) {
            logDebug('InitializationController', 'Контейнер уже инициализирован', { container });
            return;
        }

        // Устанавливаем начальное состояние
        this.initializedContainers.set(container, false);

        // Создаем таймаут для предотвращения бесконечной попытки инициализации
        this.initTimeouts.set(container, setTimeout(() => {
            const attempts = this.initAttempts.get(container);
            logDebug('InitializationController', 'Таймаут инициализации', {
                deviceId,
                attempts,
                maxAttempts: options.maxAttempts
            });

            if (!this.initializedContainers.get(container)) {
                this.initializedContainers.set(container, false);
            }
        }, options.maxCheckTime));

        // Начинаем проверку готовности контейнера
        this.startChecking(container, deviceId, options);
    }

    /**
     * Начинает проверку готовности контейнера
     */
    startChecking(container, deviceId, options) {
        logDebug('InitializationController', 'Начало проверки готовности контейнера', {
            deviceId,
            container
        });

        // Устанавливаем интервал проверки
        const interval = setInterval(() => {
            this.checkContainer(container, deviceId, interval, options);
        }, options.checkInterval);

        // Сохраняем интервал для последующей очистки
        this.mutationObservers.set(container, interval);

        // Наблюдаем за изменениями в DOM
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

        // Наблюдаем за размерами контейнера
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                this.checkContainer(container, deviceId, interval, options);
            });

            resizeObserver.observe(container);
            this.resizeObservers.set(container, resizeObserver);
        }

        // Наблюдаем за активностью вкладки
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
     */
    checkContainer(container, deviceId, interval, options) {
        if (this.initializedContainers.get(container)) {
            logDebug('InitializationController', 'Контейнер уже инициализирован', { container });
            return;
        }

        const attempts = this.initAttempts.get(container) || 0;
        const maxAttempts = this.maxInitAttempts.get(container) || options.maxAttempts;

        logDebug('InitializationController', 'Проверка контейнера', {
            deviceId,
            container,
            attempt: attempts,
            maxAttempts
        });

        this.initAttempts.set(container, attempts + 1);

        // Проверяем, что контейнер виден и активен
        if (checkContainerReady(container, options) && isContainerActive(container)) {
            logDebug('InitializationController', 'Контейнер готов к инициализации', {
                deviceId,
                container
            });

            this.cleanupContainer(container);
            this.initializedContainers.set(container, true);

            // Выполняем инициализацию
            const initCallback = this.initCallbacks.get(container);
            if (initCallback) {
                initCallback();
            }

            return true;
        } else if (attempts >= maxAttempts) {
            logDebug('InitializationController', 'Превышено максимальное количество попыток', {
                deviceId,
                container,
                attempts,
                maxAttempts
            });

            this.cleanupContainer(container);
            this.initializedContainers.set(container, false);

            return false;
        }

        return false;
    }

    /**
     * Очистка ресурсов
     */
    cleanupContainer(container) {
        logDebug('InitializationController', 'Очистка ресурсов контейнера', { container });

        // Очищаем интервал
        const interval = this.mutationObservers.get(container);
        if (interval && typeof interval === 'number') {
            clearInterval(interval);
        }

        // Отключаем observers
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

        // Очищаем таймаут
        const timeout = this.initTimeouts.get(container);
        if (timeout) {
            clearTimeout(timeout);
            this.initTimeouts.delete(container);
        }

        // Удаляем счетчики
        this.initAttempts.delete(container);
        this.maxInitAttempts.delete(container);
        this.initCallbacks.delete(container);
    }

    /**
     * Принудительная инициализация
     */
    forceInit(container, deviceId, initCallback, options = { maxAttempts: 10, delay: 100 }) {
        logDebug('InitializationController', 'Принудительная инициализация', {
            deviceId,
            container,
            options
        });

        // Даем время для полного отображения
        setTimeout(() => {
            forceInit(container, initCallback, options);
        }, options.delay);
    }

    /**
     * Проверка инициализации контейнера
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

        // Очищаем все контейнеры
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
