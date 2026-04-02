/**
 * ============================================================================
 * API WEBGL SUPPORT UTILS — УТИЛИТЫ WEBGL
 * ============================================================================
 * 📁 Путь: api/core/utils/coreApiWebglSupportUtils.js
 * ✅ Используется: 3D компоненты для проверки поддержки WebGL
 * ============================================================================
 */

/**
 * Проверка поддержки WebGL
 */
export const checkWebGLSupport = () => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            return {
                isSupported: false,
                reason: 'WebGL not supported in this browser',
                version: null
            };
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);

        return {
            isSupported: true,
            gl,
            vendor,
            renderer,
            version: gl.getParameter(gl.VERSION),
            shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            extensions: gl.getSupportedExtensions()
        };
    } catch (error) {
        return {
            isSupported: false,
            reason: error.message,
            version: null
        };
    }
};

/**
 * Проверка поддержки WebGL 2.0
 */
export const checkWebGL2Support = () => {
    try {
        const canvas = document.createElement('canvas');
        const gl2 = canvas.getContext('webgl2');

        if (!gl2) {
            return {
                isSupported: false,
                reason: 'WebGL 2.0 not supported in this browser'
            };
        }

        return {
            isSupported: true,
            gl2,
            version: gl2.getParameter(gl2.VERSION)
        };
    } catch (error) {
        return {
            isSupported: false,
            reason: error.message
        };
    }
};

/**
 * Создание контейнера для WebGL
 */
export const createWebGLContainer = (parentElement, width = '100%', height = '100%') => {
    if (!parentElement) {
        console.error('[WebGL] Parent element not found');
        return null;
    }

    const canvas = document.createElement('canvas');
    canvas.style.width = width;
    canvas.style.height = height;
    canvas.style.display = 'block';

    parentElement.appendChild(canvas);

    return canvas;
};

/**
 * Проверка готовности контейнера
 */
export const checkContainerReady = (container) => {
    if (!container) return false;
    const rect = container.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
};

/**
 * Проверка видимости элемента
 */
export const isElementVisible = (element) => {
    if (!element) return false;
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
};

/**
 * Проверка наличия Three.js
 */
export const checkThreeJSSupport = () => {
    if (typeof THREE === 'undefined') {
        return {
            isSupported: false,
            reason: 'Three.js not loaded'
        };
    }

    return {
        isSupported: true,
        version: THREE.REVISION
    };
};

/**
 * Инициализация когда готово
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
 */
export const getOptimalWebGLSettings = () => {
    const webglInfo = checkWebGLSupport();

    if (!webglInfo.isSupported) {
        return {
            useWebGL: false,
            use2DFallback: true
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
        pixelRatio: isHighEnd ? window.devicePixelRatio : 1
    };
};

/**
 * Очистка WebGL контекста
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
 * Проверка потери контекста WebGL
 */
export const handleWebGLContextLoss = (canvas, callback) => {
    canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        console.warn('[SmartLight:WebGL] Context lost');
        if (callback) callback('lost');
    }, false);

    canvas.addEventListener('webglcontextrestored', () => {
        console.log('[SmartLight:WebGL] Context restored');
        if (callback) callback('restored');
    }, false);
};

/**
 * Принудительная инициализация (для обратной совместимости)
 */
export const forceInit = (container, initCallback, options = { maxAttempts: 10, delay: 100 }) => {
    if (!container || !initCallback) return false;

    if (checkContainerReady(container)) {
        initCallback();
        return true;
    }

    return false;
};

export default {
    checkWebGLSupport,
    checkWebGL2Support,
    createWebGLContainer,
    checkContainerReady,
    isElementVisible,
    checkThreeJSSupport,
    initWhenReady,
    getOptimalWebGLSettings,
    cleanupWebGL,
    handleWebGLContextLoss,
    forceInit
};
