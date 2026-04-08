/**
 * ============================================================================
 * CORE WEBGL CONTEXT MANAGER UTILS — ГЛОБАЛЬНЫЙ МЕНЕДЖЕР КОНТЕКСТОВ
 * ============================================================================
 * 📁 Путь: api/core/utils/coreWebglContextManagerUtils.js
 * ✅ Назначение: Координация всех Three.js рендереров на странице
 * ✅ Решает: каскадную потерю контекста при множественных сценах
 * ✅ Лимит: макс. 16 активных контекстов, авто-очистка неактивных
 * ============================================================================
 */

// === КОНФИГУРАЦИЯ ===
const MAX_CONTEXTS = 16; // 🛡️ Лимит активных контекстов
const CONTEXT_TTL = 30000; // 30 сек неактивности → авто-очистка

// === ГЛОБАЛЬНОЕ СОСТОЯНИЕ ===
const state = {
    renderers: new Map(), // renderer → { id, lastUsed, cleanup, canvas }
    isRecovering: false,
    recoveryQueue: [],
    contextLostHandlers: new Set(),
    contextRestoredHandlers: new Set(),
    cleanupInterval: null
};

/**
 * Регистрация рендерера в менеджере
 * @param {WebGLRenderer} renderer
 * @param {string} id - Уникальный ID (deviceId + type)
 * @param {Object} callbacks
 * @returns {Function} cleanup
 */
export const registerRenderer = (renderer, id, callbacks = {}) => {
    if (!renderer?.domElement) return () => {};

    const canvas = renderer.domElement;

    // Если уже зарегистрирован — обновляем timestamp
    if (state.renderers.has(renderer)) {
        const entry = state.renderers.get(renderer);
        entry.lastUsed = Date.now();
        if (callbacks.onContextLost) state.contextLostHandlers.add(callbacks.onContextLost);
        if (callbacks.onContextRestored) state.contextRestoredHandlers.add(callbacks.onContextRestored);
        return () => unregisterRenderer(renderer, callbacks);
    }

    // Если лимит превышен — очищаем самый старый неактивный
    if (state.renderers.size >= MAX_CONTEXTS) {
        console.warn(`[WebGL] Limit ${MAX_CONTEXTS} reached, evicting oldest`);
        const oldest = Array.from(state.renderers.entries())
            .sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
        if (oldest) {
            oldest[1].cleanup?.();
            state.renderers.delete(oldest[0]);
        }
    }

    // Регистрируем новый
    state.renderers.set(renderer, {
        id,
        lastUsed: Date.now(),
        cleanup: callbacks.onCleanup,
        canvas
    });

    // Подписываемся на события canvas
    const onLost = (event) => {
        event.preventDefault();
        console.warn(`[WebGL] Context lost: ${id}`);
        handleGlobalContextLost(renderer, id);
    };
    const onRestored = () => {
        console.log(`[WebGL] Context restored: ${id}`);
        handleGlobalContextRestored(renderer, id);
    };

    canvas.addEventListener('webglcontextlost', onLost, false);
    canvas.addEventListener('webglcontextrestored', onRestored, false);

    // Запускаем фоновую очистку если нужно
    startBackgroundCleanup();

    // Возвращаем функцию отписки
    return () => {
        canvas.removeEventListener('webglcontextlost', onLost);
        canvas.removeEventListener('webglcontextrestored', onRestored);
        unregisterRenderer(renderer, callbacks);
    };
};

/**
 * Отписка рендерера от менеджера
 */
const unregisterRenderer = (renderer, callbacks = {}) => {
    const entry = state.renderers.get(renderer);
    if (entry) {
        if (callbacks.onContextLost) state.contextLostHandlers.delete(callbacks.onContextLost);
        if (callbacks.onContextRestored) state.contextRestoredHandlers.delete(callbacks.onContextRestored);
        entry.cleanup?.();
        state.renderers.delete(renderer);
    }
};

/**
 * Глобальный обработчик потери контекста
 */
const handleGlobalContextLost = (renderer, id) => {
    if (state.isRecovering) return;

    console.warn('[WebGLContextManager] Context lost - pausing all renderers');
    state.isRecovering = true;

    // Останавливаем анимации у всех рендереров
    state.renderers.forEach((entry, r) => {
        if (r._animationFrame) {
            cancelAnimationFrame(r._animationFrame);
            r._animationFrame = null;
        }
    });

    // Уведомляем подписчиков
    state.contextLostHandlers.forEach((cb) => {
        try { cb(renderer, id); } catch (e) { console.error('Context lost handler error', e); }
    });
};

/**
 * Глобальный обработчик восстановления контекста
 */
const handleGlobalContextRestored = (renderer, id) => {
    if (!state.isRecovering) return;

    console.log('[WebGLContextManager] Context restored - reinitializing renderers');

    // Уведомляем подписчиков
    state.contextRestoredHandlers.forEach((cb) => {
        try { cb(renderer, id); } catch (e) { console.error('Context restored handler error', e); }
    });

    // Сбрасываем флаг с задержкой для стабильности
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
 * Проверка: можно ли создавать новый контекст?
 * @returns {boolean}
 */
export const canCreateContext = () => state.renderers.size < MAX_CONTEXTS;

/**
 * Пометить контекст как активный (обновить timestamp)
 * @param {WebGLRenderer} renderer
 */
export const markContextActive = (renderer) => {
    const entry = state.renderers.get(renderer);
    if (entry) entry.lastUsed = Date.now();
};

/**
 * Принудительная очистка всех рендереров
 */
export const cleanupAll = () => {
    console.log('[WebGL] Cleaning up all contexts');
    state.renderers.forEach((entry) => {
        try {
            entry.cleanup?.();
            // Агрессивное удаление canvas из DOM
            if (entry.canvas?.parentNode) {
                entry.canvas.parentNode.removeChild(entry.canvas);
            }
        } catch (e) {
            console.warn('Renderer cleanup error', e);
        }
    });
    state.renderers.clear();
    state.contextLostHandlers.clear();
    state.contextRestoredHandlers.clear();
    state.isRecovering = false;
    state.recoveryQueue = [];
    stopBackgroundCleanup();
};

/**
 * Фоновая задача: очищать неактивные контексты
 */
const startBackgroundCleanup = () => {
    if (state.cleanupInterval) return;
    state.cleanupInterval = setInterval(() => {
        const now = Date.now();
        state.renderers.forEach((entry, renderer) => {
            if (now - entry.lastUsed > CONTEXT_TTL) {
                console.log(`[WebGL] Auto-cleanup idle: ${entry.id}`);
                try {
                    entry.cleanup?.();
                    if (entry.canvas?.parentNode) {
                        entry.canvas.parentNode.removeChild(entry.canvas);
                    }
                } catch (e) {
                    console.warn('Auto-cleanup error', e);
                }
                state.renderers.delete(renderer);
            }
        });
    }, 10000);
};

const stopBackgroundCleanup = () => {
    if (state.cleanupInterval) {
        clearInterval(state.cleanupInterval);
        state.cleanupInterval = null;
    }
};

/**
 * Экспорт по умолчанию
 */
export default {
    registerRenderer,
    isRecovering,
    canCreateContext,
    markContextActive,
    cleanupAll,
    startBackgroundCleanup,
    stopBackgroundCleanup
};
