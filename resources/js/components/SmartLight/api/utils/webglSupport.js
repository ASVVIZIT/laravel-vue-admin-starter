import { logDebug, logError } from '@/components/SmartLight/api/utils/logger';

/**
 * Проверяет поддержку WebGL в браузере
 * @returns {Object} Объект с информацией о поддержке
 */
export const checkWebGLSupport = () => {
    logDebug('WebGLSupport', 'Проверка поддержки WebGL');

    // Проверяем базовую поддержку WebGL
    if (!window.WebGLRenderingContext) {
        logDebug('WebGLSupport', 'WebGLRenderingContext не поддерживается');
        return {
            isSupported: false,
            reason: 'WebGL не поддерживается вашим браузером'
        };
    }

    // Проверяем доступность контекста WebGL
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            logDebug('WebGLSupport', 'Контекст WebGL недоступен');
            return {
                isSupported: false,
                reason: 'WebGL недоступен'
            };
        }

        // Проверка поддержки текстур
        const textureSupport = gl.getExtension('OES_texture_float');
        if (!textureSupport) {
            logDebug('WebGLSupport', 'Нет поддержки текстур');
            return {
                isSupported: false,
                reason: 'Отсутствует поддержка текстур'
            };
        }

        logDebug('WebGLSupport', 'Поддержка WebGL подтверждена', {
            version: 'WebGL 1'
        });

        return {
            isSupported: true,
            reason: null,
            version: 'WebGL 1'
        };
    } catch (e) {
        logError('WebGLSupport', 'Ошибка инициализации WebGL', e);
        return {
            isSupported: false,
            reason: 'Ошибка инициализации WebGL',
            error: e
        };
    }
};

/**
 * Проверяет, активен ли контейнер
 * @param {HTMLElement} container - DOM-элемент контейнера
 * @returns {boolean} true если контейнер активен
 */
export const isContainerActive = (container) => {
    if (!container) {
        logDebug('WebGLSupport', 'Контейнер не определен для проверки активности');
        return false;
    }

    // Проверяем, что контейнер находится в активной вкладке
    const tabPane = container.closest('.el-tab-pane');
    if (tabPane) {
        const isActive = tabPane.classList.contains('is-active');

        logDebug('WebGLSupport', 'Проверка активности вкладки', {
            container,
            tabPane,
            isActive,
            classList: Array.from(tabPane.classList)
        });

        return isActive;
    }

    // Если нет вкладок, считаем контейнер активным
    return true;
};

/**
 * Проверяет, виден ли контейнер в окне браузера
 * @param {HTMLElement} container - DOM-элемент контейнера
 * @returns {boolean} true если контейнер виден
 */
export const isContainerVisible = (container) => {
    if (!container) {
        logDebug('WebGLSupport', 'Контейнер не определен');
        return false;
    }

    const rect = container.getBoundingClientRect();
    const style = getComputedStyle(container);

    // Проверяем, что контейнер в пределах видимости
    const isVisible = (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden'
    );

    logDebug('WebGLSupport', 'Проверка видимости контейнера', {
        container,
        rect: {
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
        },
        window: {
            height: window.innerHeight
        },
        visible: isVisible
    });

    return isVisible;
};

/**
 * Проверяет, готов ли контейнер для рендеринга
 * @param {HTMLElement} container - DOM-элемент контейнера
 * @param {Object} options - Опции проверки
 * @param {number} options.minSize - Минимальный размер контейнера
 * @returns {boolean} true если контейнер имеет ненулевые размеры
 */
export const checkContainerReady = (container, options = { minSize: 50 }) => {
    logDebug('WebGLSupport', 'Проверка готовности контейнера', { container });

    if (!container) {
        logDebug('WebGLSupport', 'Контейнер не определен', { container });
        return false;
    }

    // Проверяем, что контейнер и его родители видимы
    const style = getComputedStyle(container);
    if (style.display === 'none' || style.visibility === 'hidden') {
        logDebug('WebGLSupport', 'Контейнер невидим', {
            display: style.display,
            visibility: style.visibility
        });
        return false;
    }

    // Проверяем активность вкладки
    const tabPane = container.closest('.el-tab-pane');
    if (tabPane && !tabPane.classList.contains('is-active')) {
        logDebug('WebGLSupport', 'Контейнер в неактивной вкладке', {
            tabPane,
            classList: Array.from(tabPane.classList)
        });
        return false;
    }

    // Проверяем размеры
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Проверяем минимальные размеры
    const minSize = options.minSize || 50;
    const hasMinSize = width >= minSize && height >= minSize;

    logDebug('WebGLSupport', 'Проверка размеров контейнера', {
        width,
        height,
        minSize,
        ready: hasMinSize
    });

    return hasMinSize;
};

/**
 * Инициализирует компонент, когда контейнер готов
 * @param {HTMLElement} container - DOM-элемент контейнера
 * @param {Function} initCallback - Функция инициализации
 * @param {Object} options - Опции инициализации
 * @param {number} options.maxAttempts - Максимальное количество попыток
 * @param {number} options.minSize - Минимальный размер контейнера
 * @param {number} options.checkInterval - Интервал проверки в миллисекундах
 * @returns {Object} Объект с методами управления инициализацией
 */
export const initWhenReady = (container, initCallback, options = { maxAttempts: 30, minSize: 50, checkInterval: 100 }) => {
    logDebug('WebGLSupport', 'Инициализация при готовности контейнера', {
        container,
        maxAttempts: options.maxAttempts,
        minSize: options.minSize,
        checkInterval: options.checkInterval
    });

    let attempts = 0;
    let interval = null;
    let timeout = null;
    let isInitialized = false;
    let resolveReady = null;
    let resizeObserver = null;
    let tabObserver = null;
    let lastSizeCheck = { width: 0, height: 0 };
    let sizeChecks = 0;
    const minSize = options.minSize || 50;

    const readyPromise = new Promise(resolve => {
        resolveReady = resolve;
        logDebug('WebGLSupport', 'Создано промис-обещание', { container });
    });

    const checkReady = () => {
        if (isInitialized) {
            logDebug('WebGLSupport', 'Уже инициализировано, пропускаем', { container });
            return;
        }

        attempts++;
        logDebug('WebGLSupport', 'Попытка инициализации', {
            attempt: attempts,
            maxAttempts: options.maxAttempts,
            container
        });

        // Проверяем, что контейнер виден и имеет достаточные размеры
        if (checkContainerReady(container, { minSize })) {
            const rect = container.getBoundingClientRect();

            // Проверяем, что размеры контейнера стабильны
            if (lastSizeCheck.width === rect.width && lastSizeCheck.height === rect.height) {
                sizeChecks++;
            } else {
                sizeChecks = 0;
                lastSizeCheck = { width: rect.width, height: rect.height };
            }

            // Требуем, чтобы размеры контейнера были стабильны
            if (sizeChecks >= 2) {
                clearInterval(interval);
                clearTimeout(timeout);
                if (resizeObserver) {
                    resizeObserver.disconnect();
                    resizeObserver = null;
                }
                if (tabObserver) {
                    tabObserver.disconnect();
                    tabObserver = null;
                }

                isInitialized = true;
                logDebug('WebGLSupport', 'Контейнер готов, вызываем инициализацию', { container });
                initCallback();
                resolveReady(true);
            }
        } else if (attempts >= options.maxAttempts) {
            clearInterval(interval);
            clearTimeout(timeout);
            if (resizeObserver) {
                resizeObserver.disconnect();
                resizeObserver = null;
            }
            if (tabObserver) {
                tabObserver.disconnect();
                tabObserver = null;
            }

            logDebug('WebGLSupport', 'Превышено максимальное количество попыток', {
                attempts,
                container
            });
            isInitialized = true;
            resolveReady(false);
        }
    };

    // Запускаем проверку готовности
    interval = setInterval(checkReady, options.checkInterval);
    logDebug('WebGLSupport', 'Запущен интервал проверки готовности', {
        interval,
        checkInterval: options.checkInterval
    });

    // Наблюдаем за изменениями размеров контейнера
    if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(checkReady);
        resizeObserver.observe(container);
    } else {
        logDebug('WebGLSupport', 'ResizeObserver не поддерживается, используем альтернативный метод');
    }

    // Наблюдаем за вкладками
    const tabPane = container.closest('.el-tab-pane');
    if (tabPane) {
        tabObserver = new MutationObserver(checkReady);
        tabObserver.observe(tabPane, {
            attributes: true,
            attributeFilter: ['class', 'style', 'hidden'],
            subtree: false
        });
    }

    // Таймаут на случай, если контейнер никогда не будет готов
    timeout = setTimeout(() => {
        clearInterval(interval);
        clearTimeout(timeout);
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
        if (tabObserver) {
            tabObserver.disconnect();
            tabObserver = null;
        }

        logDebug('WebGLSupport', 'Таймаут инициализации', { timeout });
        isInitialized = true;
        resolveReady(false);
    }, 10000);

    return {
        ready: readyPromise,
        checkReady,
        cleanup: () => {
            clearInterval(interval);
            clearTimeout(timeout);
            if (resizeObserver) {
                resizeObserver.disconnect();
                resizeObserver = null;
            }
            if (tabObserver) {
                tabObserver.disconnect();
                tabObserver = null;
            }
            logDebug('WebGLSupport', 'Ресурсы инициализации очищены', {
                interval,
                timeout
            });
        }
    };
};

/**
 * Проверяет, является ли устройство мобильным
 * @returns {boolean} true если это мобильное устройство
 */
export const isMobileDevice = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    ) || window.innerWidth <= 768;

    if (isMobile) {
        logDebug('WebGLSupport', 'Обнаружено мобильное устройство');
    } else {
        logDebug('WebGLSupport', 'Обнаружено десктопное устройство');
    }

    return isMobile;
};
