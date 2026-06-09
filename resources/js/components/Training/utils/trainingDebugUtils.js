/**
 * ============================================================================
 * APP DEBUG UTILS — УТИЛИТА ОТЛАДКИ МОДУЛЯ TRAINING
 * ============================================================================
 * 📁 Путь: @/components/Training/utils/appDebugUtils.js
 * ✅ Назначение: Централизованное логирование действий, API и ошибок
 * ✅ Интеграция: trainingDebugStore + console
 * ============================================================================
 */

import { useTrainingDebugStore } from '../stores/trainingDebugStore.js'

const pushToStore = (type, component, message, data = null) => {
    try {
        const debugStore = useTrainingDebugStore()
        debugStore.addLog({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toLocaleTimeString('ru-RU', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }),
            type,
            component,
            message,
            data
        })
    } catch (e) {
        // Игнорируем, если стор ещё не инициализирован
    }
}

export const logDebugAction = (component, message, data = null) => {
    console.log(`[Training:ACTION] ${component}: ${message}`, data || '')
    pushToStore('action', component, message, data)
}

export const logDebugApi = (component, message, data = null) => {
    console.info(`[Training:API] ${component}: ${message}`, data || '')
    pushToStore('api', component, message, data)
}

export const logDebugStore = (component, message, data = null) => {
    console.log(`[Training:STORE] ${component}: ${message}`, data || '')
    pushToStore('store', component, message, data)
}

export const logDebugError = (component, message, error = null) => {
    console.error(`[Training:ERROR] ${component}: ${message}`, error || '')
    pushToStore('error', component, message, error ? { message: error.message, stack: error.stack } : null)
}

export default {
    logDebugAction,
    logDebugApi,
    logDebugStore,
    logDebugError
}
