/**
 * ============================================================================
 * CORE WEBGL CONTEXT MANAGER UTILS — ГЛОБАЛЬНЫЙ МЕНЕДЖЕР КОНТЕКСТОВ
 * ============================================================================
 * 📁 Путь: api/core/utils/coreWebglContextManagerUtils.js
 * ✅ Назначение: Координация всех Three.js рендереров на странице
 * ✅ Решает: каскадную потерю контекста при множественных сценах
 * ============================================================================
 */

// === ГЛОБАЛЬНОЕ СОСТОЯНИЕ ===
const state = {
    renderers: new Set(),
    isRecovering: false,
    recoveryQueue: [],
    contextLostHandlers: new Set(),
    contextRestoredHandlers: new Set()
};

/**
 * Регистрация рендерера в менеджере
 * @param {WebGLRenderer} renderer
 * @param {Object} callbacks
 * @returns {Function} cleanup
 */
export const registerRenderer = (renderer, callbacks = {}) => {
    if (!renderer?.domElement) return () => {};

    state.renderers.add(renderer);

    if (callbacks.onContextLost) state.contextLostHandlers.add(callbacks.onContextLost);
    if (callbacks.onContextRestored) state.contextRestoredHandlers.add(callbacks.onContextRestored);

    const canvas = renderer.domElement;
    canvas.addEventListener('webglcontextlost', handleGlobalContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleGlobalContextRestored, false);

    return () => {
        state.renderers.delete(renderer);
        if (callbacks.onContextLost) state.contextLostHandlers.delete(callbacks.onContextLost);
        if (callbacks.onContextRestored) state.contextRestoredHandlers.delete(callbacks.onContextRestored);
        canvas.removeEventListener('webglcontextlost', handleGlobalContextLost);
        canvas.removeEventListener('webglcontextrestored', handleGlobalContextRestored);
    };
};

/**
 * Глобальный обработчик потери контекста
 */
const handleGlobalContextLost = (event) => {
    event.preventDefault();
    if (state.isRecovering) return;

    console.warn('[WebGLContextManager] Context lost - pausing all renderers');
    state.isRecovering = true;

    state.renderers.forEach((r) => {
        if (r._animationFrame) {
            cancelAnimationFrame(r._animationFrame);
            r._animationFrame = null;
        }
    });

    state.contextLostHandlers.forEach((cb) => {
        try {
            cb();
        } catch (e) {
            console.error('Context lost handler error', e);
        }
    });
};

/**
 * Глобальный обработчик восстановления контекста
 */
const handleGlobalContextRestored = () => {
    if (!state.isRecovering) return;

    console.log('[WebGLContextManager] Context restored - reinitializing renderers');

    state.contextRestoredHandlers.forEach((cb) => {
        try {
            cb();
        } catch (e) {
            console.error('Context restored handler error', e);
        }
    });

    setTimeout(() => {
        state.isRecovering = false;
        console.log('[WebGLContextManager] Recovery complete');
    }, 500);
};

/**
 * Проверка: идёт ли восстановление?
 * @returns {boolean}
 */
export const isRecovering = () => state.isRecovering;

/**
 * Принудительная очистка всех рендереров
 */
export const cleanupAll = () => {
    state.renderers.forEach((renderer) => {
        try {
            if (renderer._animationFrame) {
                cancelAnimationFrame(renderer._animationFrame);
                renderer._animationFrame = null;
            }
            renderer.dispose?.();
            renderer.forceContextLoss?.();
        } catch (e) {
            console.warn('Renderer cleanup error', e);
        }
    });
    state.renderers.clear();
    state.contextLostHandlers.clear();
    state.contextRestoredHandlers.clear();
    state.isRecovering = false;
    state.recoveryQueue = [];
};

export default {
    registerRenderer,
    isRecovering,
    cleanupAll
};
