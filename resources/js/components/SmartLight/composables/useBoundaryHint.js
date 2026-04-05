/**
 * ============================================================================
 * USE BOUNDARY HINT — КОМПОЗИБЛ ДЛЯ ПОДСКАЗОК ГРАНИЧНЫХ ЗНАЧЕНИЙ (ИСПРАВЛЕН)
 * ============================================================================
 * 📁 Путь: composables/useBoundaryHint.js
 * ✅ ИСПРАВЛЕНО: добавлен геттер $el для работы с Vue-компонентами Element Plus
 * ✅ Безопасное извлечение DOM из refs: ref.value.$el
 * ============================================================================
 */

import { ref } from 'vue';
import { showBoundaryHintUtils } from '@/components/SmartLight/utils/appFormattersUtils.js';

export function useBoundaryHint() {
    const inputRefs = ref({});

    /**
     * Безопасно извлекает DOM-элемент из Vue-компонента или возвращает как есть
     * @param {Object|Element} componentOrEl - Vue-компонент или DOM-элемент
     * @returns {Element|null} DOM-элемент
     */
    const getDomElement = (componentOrEl) => {
        if (!componentOrEl) return null;
        // Если это уже DOM-элемент
        if (componentOrEl instanceof Element) return componentOrEl;
        // Если это Vue-компонент (Element Plus) — берем корневой элемент
        return componentOrEl.$el || null;
    };

    /**
     * Регистрация input-элемента для отслеживания
     */
    const registerInput = (fieldName, el) => {
        if (el) {
            // Сохраняем исходный ref (компонент или элемент)
            inputRefs.value[fieldName] = el;
        }
    };

    /**
     * Обработчик изменения значения с проверкой границ
     */
    const handleInputChange = (fieldName, newValue, min, max) => {
        const domEl = getDomElement(inputRefs.value[fieldName]);
        if (!domEl) return;

        if (newValue <= min) {
            showBoundaryHintUtils(domEl, 'min', fieldName, min);
        } else if (newValue >= max) {
            showBoundaryHintUtils(domEl, 'max', fieldName, max);
        }
    };

    /**
     * Прямой вызов подсказки (для кнопок +/-)
     */
    const triggerBoundaryHint = (fieldName, boundary, limit) => {
        const domEl = getDomElement(inputRefs.value[fieldName]);
        if (domEl) {
            showBoundaryHintUtils(domEl, boundary, fieldName, limit);
        }
    };

    /**
     * Очистка всех подсказок для поля (ИСПРАВЛЕНО: теперь работает с компонентами)
     */
    const clearHints = (fieldName) => {
        const domEl = getDomElement(inputRefs.value[fieldName]);
        if (domEl) {
            const hint = domEl.querySelector('.boundary-hint');
            if (hint) hint.remove();
        }
    };

    return {
        registerInput,
        handleInputChange,
        triggerBoundaryHint,
        clearHints
    };
}

export default useBoundaryHint;
