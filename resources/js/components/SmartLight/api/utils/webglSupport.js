/**
 * Утилиты для работы с WebGL и проверки видимости контейнеров
 *
 * Этот файл содержит все необходимые функции для:
 * - Проверки поддержки WebGL
 * - Проверки видимости и активности контейнеров
 * - Инициализации 3D-рендеринга
 * - Отладочного логирования
 *
 * Все функции экспортируются как именованные экспорты
 */

/**
 * Проверяет поддержку WebGL в браузере
 * @returns {Object} Объект с информацией о поддержке WebGL
 */
export const checkWebGLSupport = () => {
    console.debug('[WebGL] Проверка поддержки WebGL');

    // Проверяем базовую поддержку WebGL
    if (!window.WebGLRenderingContext) {
        console.warn('[WebGL] WebGLRenderingContext не поддерживается');
        return {
            isSupported: false,
            reason: 'WebGL не поддерживается вашим браузером'
        };
    }

    // Проверяем доступность контекста WebGL
    try {
        console.debug('[WebGL] Проверка контекста');
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        // Проверяем минимальные требования
        if (!gl) {
            console.warn('[WebGL] Контекст WebGL недоступен');
            return {
                isSupported: false,
                reason: 'WebGL недоступен'
            };
        }

        // Проверка поддержки текстур
        const textureSupport = gl.getExtension('OES_texture_float');
        if (!textureSupport) {
            console.warn('[WebGL] Нет поддержки текстур');
            return {
                isSupported: false,
                reason: 'Отсутствует поддержка текстур'
            };
        }

        console.log('[WebGL] Поддержка WebGL подтверждена');
        return {
            isSupported: true,
            reason: null,
            version: 'WebGL 1'
        };
    } catch (e) {
        console.error('[WebGL] Ошибка инициализации WebGL', e);
        return {
            isSupported: false,
            reason: 'Ошибка инициализации WebGL',
            error: e
        };
    }
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
        console.log('[WebGL] Обнаружено мобильное устройство');
    } else {
        console.log('[WebGL] Обнаружено десктопное устройство');
    }

    return isMobile;
};

/**
 * Проверяет, виден ли контейнер в окне браузера
 * @param {HTMLElement} container - Контейнер для рендеринга
 * @returns {boolean} true если контейнер виден в окне
 */
export const isContainerVisible = (container) => {
    if (!container) {
        console.warn('[WebGL] Контейнер не определен');
        return false;
    }

    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Проверяем, что контейнер в пределах видимости
    const isVisible = (
        rect.top < windowHeight &&
        rect.bottom > 0 &&
        rect.width > 0 &&
        rect.height > 0
    );

    console.debug('[WebGL] Проверка видимости контейнера', {
        container,
        rect: {
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
        },
        window: {
            height: windowHeight
        },
        visible: isVisible
    });

    return isVisible;
};

/**
 * Проверяет, активна ли вкладка
 * @param {HTMLElement} container - Контейнер для рендеринга
 * @returns {boolean} true если контейнер в активной вкладке
 */
export const isTabPaneActive = (container) => {
    if (!container) {
        console.warn('[WebGL] Контейнер не определен для проверки вкладки');
        return false;
    }

    // Ищем ближайшую вкладку
    const tabPane = container.closest('.el-tab-pane');
    if (!tabPane) {
        console.debug('[WebGL] Не найден элемент вкладки для контейнера', { container });
        return true; // Если нет вкладок, считаем, что активна
    }

    // Проверяем, активна ли вкладка
    const isActive = tabPane.classList.contains('is-active');

    console.debug('[WebGL] Проверка активности вкладки', {
        container,
        tabPane,
        isActive,
        classList: Array.from(tabPane.classList)
    });

    return isActive;
};

/**
 * Проверяет, скрыт ли контейнер через CSS
 * @param {HTMLElement} container - Контейнер для рендеринга
 * @returns {boolean} true если контейнер не скрыт через CSS
 */
export const isContainerHiddenByCSS = (container) => {
    if (!container) {
        console.warn('[WebGL] Контейнер не определен');
        return false;
    }

    const style = getComputedStyle(container);
    const isHidden = style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';

    console.debug('[WebGL] Проверка скрытия через CSS', {
        container,
        style: {
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity
        },
        isHidden
    });

    return isHidden;
};

/**
 * Проверяет, готов ли контейнер для рендеринга
 * @param {HTMLElement} container - Контейнер для рендеринга
 * @param {Object} options - Опции проверки
 * @param {number} options.minSize - Минимальный размер контейнера
 * @returns {boolean} true если контейнер имеет ненулевые размеры
 */
export const checkContainerReady = (container, options = { minSize: 50 }) => {
    console.debug('[WebGL] Проверка готовности контейнера', { container });

    if (!container) {
        console.warn('[WebGL] Контейнер не определен');
        return false;
    }

    // Проверяем, что контейнер и его родители видимы
    const style = getComputedStyle(container);
    if (style.display === 'none' || style.visibility === 'hidden') {
        console.warn('[WebGL] Контейнер невидим', {
            display: style.display,
            visibility: style.visibility
        });
        return false;
    }

    // Проверяем размеры
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Проверяем минимальные размеры
    const minSize = options.minSize || 50;
    const hasMinSize = width >= minSize && height >= minSize;

    console.debug('[WebGL] Размеры контейнера', {
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
    console.log('[WebGL] Инициализация при готовности контейнера', {
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
        console.debug('[WebGL] Создано промис-обещание', { container });
    });

    const checkReady = () => {
        if (isInitialized) {
            console.log('[WebGL] Уже инициализировано, пропускаем', { container });
            return;
        }

        attempts++;
        console.log('[WebGL] Попытка инициализации', {
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
                console.log('[WebGL] Контейнер готов, вызываем инициализацию', { container });
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

            console.warn('[WebGL] Превышено максимальное количество попыток', {
                attempts,
                container
            });
            isInitialized = true;
            resolveReady(false);
        }
    };

    // Запускаем проверку готовности
    interval = setInterval(checkReady, options.checkInterval);
    console.log('[WebGL] Запущен интервал проверки готовности', {
        interval,
        checkInterval: options.checkInterval
    });

    // Наблюдаем за изменениями размеров контейнера
    if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(checkReady);
        resizeObserver.observe(container);
    } else {
        console.debug('[WebGL] ResizeObserver не поддерживается, используем альтернативный метод');
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

        console.warn('[WebGL] Таймаут инициализации', { timeout });
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
            console.debug('[WebGL] Ресурсы инициализации очищены', {
                interval,
                timeout
            });
        }
    };
};

/**
 * Логирование отладочной информации
 * @param {string} component - Название компонента
 * @param {string} message - Сообщение
 * @param {Object} data - Дополнительные данные
 */
export const logDebug = (component, message, data = {}) => {
    const logData = {
        timestamp: new Date().toISOString(),
        component,
        message,
        ...data
    };

    console.debug(`[DEBUG] ${component}: ${message}`, logData);
    return logData;
};

/**
 * Проверяет, поддерживает ли браузер необходимые материалы THREE.js
 * @param {string} materialType - Тип материала ('basic', 'physical', 'standard')
 * @returns {boolean} true если материал поддерживается
 */
export const checkMaterialSupport = (materialType = 'physical') => {
    if (!window.THREE) {
        console.warn('[WebGL] THREE.js не загружен');
        return false;
    }

    // Для MeshPhysicalMaterial
    if (materialType === 'physical' && typeof window.THREE.MeshPhysicalMaterial === 'function') {
        console.log('[WebGL] MeshPhysicalMaterial поддерживается');
        return true;
    }

    // Для MeshStandardMaterial
    if (materialType === 'standard' && typeof window.THREE.MeshStandardMaterial === 'function') {
        console.log('[WebGL] MeshStandardMaterial поддерживается');
        return true;
    }

    // Для MeshBasicMaterial
    if (materialType === 'basic' && typeof window.THREE.MeshBasicMaterial === 'function') {
        console.log('[WebGL] MeshBasicMaterial поддерживается');
        return true;
    }

    console.warn(`[WebGL] Материал ${materialType} не поддерживается`);
    return false;
};

/**
 * Проверяет, активен ли контейнер в текущем контексте
 * @param {HTMLElement} container - Контейнер для рендеринга
 * @returns {boolean} true если контейнер активен
 */
export const isContainerActive = (container) => {
    if (!container) {
        console.warn('[WebGL] Контейнер не определен для проверки активности');
        return false;
    }

    // Проверяем, что контейнер находится в активной вкладке
    const tabPane = container.closest('.el-tab-pane');
    if (tabPane) {
        const isActive = tabPane.classList.contains('is-active');

        console.debug('[WebGL] Проверка активности вкладки', {
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
 * Проверяет, виден ли контейнер в окне браузера с учетом всех родителей
 * @param {HTMLElement} container - Контейнер для рендеринга
 * @returns {boolean} true если контейнер полностью виден в окне
 */
export const isFullyVisible = (container) => {
    if (!container) {
        console.warn('[WebGL] Контейнер не определен для проверки видимости');
        return false;
    }

    // Проверяем, что контейнер и его родители не скрыты
    const style = getComputedStyle(container);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        console.debug('[WebGL] Контейнер скрыт через CSS', {
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity
        });
        return false;
    }

    // Проверяем, что все родители видны
    let parent = container.parentElement;
    while (parent && parent !== document.body) {
        const parentStyle = getComputedStyle(parent);
        if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden' || parentStyle.opacity === '0') {
            console.debug('[WebGL] Родительский контейнер скрыт через CSS', {
                parent,
                display: parentStyle.display,
                visibility: parentStyle.visibility,
                opacity: parentStyle.opacity
            });
            return false;
        }
        parent = parent.parentElement;
    }

    // Проверяем, что контейнер находится в активной вкладке
    const tabPane = container.closest('.el-tab-pane');
    if (tabPane && !tabPane.classList.contains('is-active')) {
        console.debug('[WebGL] Контейнер находится в неактивной вкладке', {
            tabPane,
            classList: Array.from(tabPane.classList)
        });
        return false;
    }

    // Проверяем геометрию контейнера
    const rect = container.getBoundingClientRect();
    const isVisible = (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0
    );

    console.debug('[WebGL] Проверка геометрии контейнера', {
        rect: {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            height: rect.height,
            width: rect.width
        },
        window: {
            height: window.innerHeight,
            width: window.innerWidth
        },
        visible: isVisible
    });

    return isVisible;
};

/**
 * Принудительная инициализация компонента
 * @param {HTMLElement} container - DOM-элемент контейнера
 * @param {Function} initCallback - Функция инициализации
 * @param {Object} options - Опции инициализации
 */
export const forceInit = (container, initCallback, options = { maxAttempts: 20, minSize: 50 }) => {
    console.log('[WebGL] Принудительная инициализация', {
        container,
        options
    });

    // Проверяем, не инициализирован ли уже компонент
    if (container.__initialized) {
        console.log('[WebGL] Компонент уже инициализирован', { container });
        return;
    }

    // Проверяем, виден ли контейнер
    if (!checkContainerReady(container, { minSize: options.minSize })) {
        console.log('[WebGL] Контейнер не готов к инициализации', { container });

        // Проверяем, активна ли вкладка
        const tabPane = container.closest('.el-tab-pane');
        if (tabPane && !tabPane.classList.contains('is-active')) {
            console.log('[WebGL] Контейнер в неактивной вкладке', { container });
            return;
        }

        // Даем время для полного отображения
        setTimeout(() => {
            if (checkContainerReady(container, { minSize: options.minSize })) {
                console.log('[WebGL] Контейнер стал видимым после задержки', { container });
                initCallback();
                container.__initialized = true;
            } else {
                console.log('[WebGL] Контейнер все еще не виден после задержки', { container });

                // Принудительно обновляем размеры
                const rect = container.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    container.style.width = `${rect.width}px`;
                    container.style.height = `${rect.height}px`;

                    if (checkContainerReady(container, { minSize: options.minSize })) {
                        console.log('[WebGL] Контейнер принудительно изменен и готов к инициализации', { container });
                        initCallback();
                        container.__initialized = true;
                    }
                }
            }
        }, 500);
    } else {
        console.log('[WebGL] Контейнер готов к инициализации', { container });
        initCallback();
        container.__initialized = true;
    }
};

/**
 * Проверка видимости контейнера с учетом всех условий
 * @param {HTMLElement} container - Контейнер для рендеринга
 * @param {Object} options - Опции проверки
 * @param {number} options.minSize - Минимальный размер контейнера
 * @returns {boolean} true если контейнер готов
 */
export const isContainerReady = (container, options = { minSize: 50 }) => {
    if (!container) {
        console.warn('[WebGL] Контейнер не определен');
        return false;
    }

    // Проверяем, что контейнер и его родители не скрыты
    const style = getComputedStyle(container);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        console.debug('[WebGL] Контейнер скрыт через CSS', {
            container,
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity
        });
        return false;
    }

    // Проверяем размеры
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Проверяем минимальные размеры
    const minSize = options.minSize || 50;
    const hasMinSize = width >= minSize && height >= minSize;

    console.debug('[WebGL] Размеры контейнера', {
        width,
        height,
        minSize,
        ready: hasMinSize
    });

    return hasMinSize;
};

/**
 * Принудительная инициализация 3D
 * @param {string} deviceId - ID устройства
 */
export const force3DInit = (deviceId) => {
    console.debug('[WebGL] Принудительная инициализация 3D', { deviceId });

    // Ищем контейнер
    const deviceCard = document.querySelector(`[data-device-id="${deviceId}"]`);

    if (deviceCard) {
        console.debug('[WebGL] Найден DeviceCard', { deviceId });

        // Вызываем метод forceInit, если он доступен
        if (deviceCard.forceInit) {
            deviceCard.forceInit();
        } else if (deviceCard.__vueParentComponent?.ctx?.forceInit) {
            deviceCard.__vueParentComponent.ctx.forceInit();
        }
    } else {
        console.debug('[WebGL] DeviceCard не найден', { deviceId });
    }
};

