/**
 * ============================================================================
 * USE DEBUG COMPOSABLE — УМНЫЙ ХУК ДЛЯ ОТЛАДКИ В КОМПОНЕНТАХ
 * ============================================================================
 * 📁 Путь: @/components/Training/composables/useDebug.js
 * ✅ Назначение: Упрощает логирование с автоматической привязкой к компоненту
 * ✅ Использование: const debug = useDebug('Dashboard')
 * ============================================================================
 */

import { logDebugAction, logDebugApi, logDebugStore, logDebugError } from '../utils/trainingDebugUtils.js'

/**
 * Умный хук для отладки внутри компонентов
 * @param {string} componentName - Имя компонента (например, 'Dashboard', 'TrainingFilterBar')
 * @returns {Object} Методы логирования с автоматической привязкой к компоненту
 */
export const useDebug = (componentName) => {
    return {
        /**
         * Логирование действия пользователя с богатым контекстом
         * @param {string} message - Что произошло
         * @param {Object} context - Объект с деталями (старое/новое значение, фильтры и т.д.)
         */
        action: (message, context = null) => logDebugAction(componentName, message, context),

        /**
         * Логирование API запроса/ответа
         * @param {string} message - Описание запроса
         * @param {Object} context - Данные запроса/ответа
         */
        api: (message, context = null) => logDebugApi(componentName, message, context),

        /**
         * Логирование событий стора
         * @param {string} message - Описание события
         * @param {Object} context - Данные состояния
         */
        store: (message, context = null) => logDebugStore(componentName, message, context),

        /**
         * Логирование ошибки
         * @param {string} message - Описание ошибки
         * @param {Error} error - Объект ошибки
         */
        error: (message, error = null) => logDebugError(componentName, message, error)
    }
}

export default useDebug
