/**
 * ============================================================================
 * API WEBGL SUPPORT UTILS — УТИЛИТЫ WEBGL (ОБНОВЛЁННАЯ ВЕРСИЯ)
 * ============================================================================
 * 📁 Путь: api/core/utils/coreApiWebglSupportUtils.js
 * ✅ Используется: UniversalThreeScene, BatteryRenderer, BulbRenderer, InitializationController
 * ✅ Назначение: Проверка WebGL, определение качества GPU, обработка контекста
 * ============================================================================
 */

/**
 * Проверка поддержки WebGL
 * @returns {Object} Результат проверки
 */
export const checkWebGLSupport = () => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            return {
                isSupported: false,
                reason: 'WebGL not supported in this browser',
                version: null,
                vendor: null,
                renderer: null,
                maxTextureSize: 0,
                quality: 'none'
            };
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = debugInfo
            ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
            : gl.getParameter(gl.VENDOR);
        const renderer = debugInfo
            ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            : gl.getParameter(gl.RENDERER);
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

        // Определяем качество GPU
        let quality = 'low';
        if (maxTextureSize >= 16384) quality = 'high';
        else if (maxTextureSize >= 8192) quality = 'medium';

        return {
            isSupported: true,
            gl,
            vendor,
            renderer,
            version: gl.getParameter(gl.VERSION),
            shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
            maxTextureSize,
            maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            extensions: gl.getSupportedExtensions(),
            quality
        };
    } catch (error) {
        return {
            isSupported: false,
            reason: error.message,
            version: null,
            vendor: null,
            renderer: null,
            maxTextureSize: 0,
            quality: 'none'
        };
    }
};

/**
 * Проверка поддержки Three.js через импорт
 * @returns {Object} Результат проверки
 */
export const checkThreeJSSupport = () => {
    try {
        return {
            isSupported: true,
            reason: null,
            version: 'module-import'
        };
    } catch (error) {
        return {
            isSupported: false,
            reason: `Three.js import error: ${error.message}`,
            version: null
        };
    }
};

/**
 * Проверка готовности контейнера
 * @param {HTMLElement} container - Контейнер для проверки
 * @returns {boolean} Готов ли контейнер
 */
export const checkContainerReady = (container) => {
    if (!container) return false;
    const rect = container.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
};

/**
 * Проверка видимости элемента
 * @param {HTMLElement} element - Элемент для проверки
 * @returns {boolean} Видим ли элемент
 */
export const isElementVisible = (element) => {
    if (!element) return false;
    const style = getComputedStyle(element);
    return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0';
};

/**
 * Проверка активности контейнера (видим + в активной вкладке)
 * @param {HTMLElement} element - Элемент для проверки
 * @returns {boolean} Активен ли элемент
 */
export const isContainerActive = (element) => {
    if (!isElementVisible(element)) return false;

    // Проверка что элемент в активной вкладке (для Element-UI tabs)
    const tabPane = element.closest('.el-tab-pane');
    if (tabPane && tabPane.classList.contains('is-active')) {
        return true;
    }

    // Если не в tabs — считаем активным если видим
    return !tabPane || isElementVisible(element);
};

/**
 * Инициализация когда контейнер готов
 * @param {HTMLElement} container - Контейнер
 * @param {Function} initFn - Функция инициализации
 * @param {number} maxAttempts - Максимальное количество попыток
 * @returns {Promise} Результат инициализации
 */
export const initWhenReady = (container, initFn, maxAttempts = 30) => {
    return new Promise((resolve) => {
        let attempts = 0;

        const check = () => {
            attempts++;

            if (checkContainerReady(container) && isElementVisible(container)) {
                initFn();
                resolve({ success: true, attempts });
            } else if (attempts >= maxAttempts) {
                resolve({ success: false, attempts, reason: 'Max attempts reached' });
            } else {
                setTimeout(check, 100);
            }
        };

        check();
    });
};

/**
 * Получить оптимальные настройки для WebGL
 * @param {Object} webglInfo - Информация о WebGL от checkWebGLSupport
 * @returns {Object} Настройки рендерера
 */
export const getOptimalWebGLSettings = (webglInfo) => {
    if (!webglInfo.isSupported) {
        return {
            useWebGL: false,
            use2DFallback: true,
            quality: 'low',
            antialias: false,
            shadowMap: false,
            pixelRatio: 1,
            canRender3D: false
        };
    }

    const maxTextureSize = webglInfo.maxTextureSize || 0;
    const isHighEnd = maxTextureSize >= 16384;
    const isMidRange = maxTextureSize >= 8192;

    return {
        useWebGL: true,
        use2DFallback: false,
        quality: isHighEnd ? 'high' : isMidRange ? 'medium' : 'low',
        maxTextureSize,
        antialias: isHighEnd,
        shadowMap: isHighEnd,
        pixelRatio: isHighEnd ? window.devicePixelRatio : 1,
        canRender3D: true
    };
};

/**
 * Проверка возможности 3D рендеринга (градации)
 * @param {Object} webglInfo - Информация о WebGL
 * @param {Object} threeInfo - Информация о ThreeJS
 * @returns {Object} Результат проверки
 */
export const check3DCapability = (webglInfo, threeInfo) => {
    const result = {
        canRender3D: false,
        quality: 'none',
        fallbackTo2D: true,
        warnings: []
    };

    if (!webglInfo.isSupported) {
        result.warnings.push('WebGL not supported');
        return result;
    }

    if (!threeInfo.isSupported) {
        result.warnings.push('ThreeJS not available');
        return result;
    }

    result.canRender3D = true;
    result.fallbackTo2D = false;
    result.quality = webglInfo.quality;

    if (webglInfo.maxTextureSize < 4096) {
        result.warnings.push('Low texture size, reduced quality');
    }

    return result;
};

/**
 * Очистка WebGL контекста
 * @param {WebGLRenderingContext} gl - WebGL контекст
 */
export const cleanupWebGL = (gl) => {
    if (!gl) return;

    const numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    for (let unit = 0; unit < numTextureUnits; ++unit) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

/**
 * Обработка потери контекста WebGL
 * @param {HTMLCanvasElement} canvas - Canvas элемент
 * @param {Function} callback - Callback при событии
 */
export const handleWebGLContextLoss = (canvas, callback) => {
    if (!canvas) return;

    canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        console.warn('[WebGL] Context lost');
        if (callback) callback('lost');
    }, false);

    canvas.addEventListener('webglcontextrestored', () => {
        console.log('[WebGL] Context restored');
        if (callback) callback('restored');
    }, false);
};

/**
 * Принудительная инициализация (для обратной совместимости)
 * @param {HTMLElement} container - Контейнер
 * @param {Function} initCallback - Callback инициализации
 * @param {Object} options - Опции
 * @returns {boolean} Успех инициализации
 */
export const forceInit = (container, initCallback, options = { maxAttempts: 10, delay: 100 }) => {
    if (!container || !initCallback) return false;

    if (checkContainerReady(container) && isElementVisible(container)) {
        initCallback();
        return true;
    }

    return false;
};

export default {
    checkWebGLSupport,
    checkThreeJSSupport,
    checkContainerReady,
    isElementVisible,
    isContainerActive,
    initWhenReady,
    getOptimalWebGLSettings,
    check3DCapability,
    cleanupWebGL,
    handleWebGLContextLoss,
    forceInit
};
