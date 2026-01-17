/**
 * Проверяет поддержку WebGL в браузере
 * @returns {Object} Объект с информацией о поддержке
 */
export const checkWebGLSupport = () => {
    // Проверяем базовую поддержку WebGL
    if (!window.WebGLRenderingContext) {
        return {
            isSupported: false,
            reason: 'WebGL не поддерживается вашим браузером'
        };
    }

    // Проверяем доступность контекста WebGL
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        // Проверяем минимальные требования
        if (!gl) {
            return {
                isSupported: false,
                reason: 'WebGL недоступен'
            };
        }

        // Проверка поддержки текстур
        const textureSupport = gl.getExtension('OES_texture_float');
        if (!textureSupport) {
            return {
                isSupported: false,
                reason: 'Отсутствует поддержка текстур'
            };
        }

        return {
            isSupported: true,
            reason: null,
            version: 'WebGL 1'
        };
    } catch (e) {
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
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    ) || window.innerWidth <= 768;
};

/**
 * Проверяет, готов ли контейнер для рендеринга
 * @param {HTMLElement} container - Контейнер для рендеринга
 * @returns {boolean} true если контейнер имеет ненулевые размеры
 */
export const checkContainerReady = (container) => {
    if (!container) return false;

    // Проверяем, что контейнер и его родители видимы
    const style = getComputedStyle(container);
    if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
    }

    // Проверяем размеры
    const width = container.clientWidth;
    const height = container.clientHeight;

    return width > 0 && height > 0;
};

/**
 * Инициализирует компонент, когда контейнер готов
 * @param {HTMLElement} container - DOM-элемент контейнера
 * @param {Function} initCallback - Функция инициализации
 * @param {number} maxAttempts - Максимальное количество попыток
 * @returns {Object} Объект с методами управления инициализацией
 */
export const initWhenReady = (container, initCallback, maxAttempts = 10) => {
    let attempts = 0;
    let interval = null;
    let timeout = null;
    let isInitialized = false;
    let resolveReady = null;

    const readyPromise = new Promise(resolve => {
        resolveReady = resolve;
    });

    const checkReady = () => {
        if (isInitialized) return;

        attempts++;

        if (checkContainerReady(container)) {
            clearInterval(interval);
            clearTimeout(timeout);
            isInitialized = true;
            initCallback();
            resolveReady(true);
        } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            clearTimeout(timeout);
            resolveReady(false);
        }
    };

    // Запускаем проверку готовности
    interval = setInterval(checkReady, 50);

    // Таймаут на случай, если контейнер никогда не будет готов
    timeout = setTimeout(() => {
        clearInterval(interval);
        resolveReady(false);
    }, 2000);

    return {
        ready: readyPromise,
        checkReady,
        cleanup: () => {
            clearInterval(interval);
            clearTimeout(timeout);
        }
    };
};
