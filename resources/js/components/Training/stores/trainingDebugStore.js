/**
 * ============================================================================
 * TRAINING DEBUG STORE — СОСТОЯНИЕ ОТЛАДКИ
 * ============================================================================
 * 📁 Путь: @/components/Training/stores/trainingDebugStore.js
 * ✅ Назначение: Логи, видимость, размер шрифта и высота панели
 * ============================================================================
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY_FONT_SIZE = 'training_debug_font_size'
const STORAGE_KEY_HEIGHT = 'training_debug_height'

const DEFAULT_FONT_SIZE = 9
const MIN_FONT_SIZE = 8
const MAX_FONT_SIZE = 14

const DEFAULT_HEIGHT = 40   // vh
const MIN_HEIGHT = 20       // vh
const MAX_HEIGHT = 90       // vh
const HEIGHT_STEP = 5       // vh

export const useTrainingDebugStore = defineStore('training-debug', () => {
    const isVisible = ref(false)
    const logs = ref([])
    const MAX_LOGS = 200

    const fontSize = ref(loadFromStorage(STORAGE_KEY_FONT_SIZE, DEFAULT_FONT_SIZE, MIN_FONT_SIZE, MAX_FONT_SIZE))
    const panelHeight = ref(loadFromStorage(STORAGE_KEY_HEIGHT, DEFAULT_HEIGHT, MIN_HEIGHT, MAX_HEIGHT))

    const toggleVisibility = () => {
        isVisible.value = !isVisible.value
    }

    const addLog = (logEntry) => {
        logs.value.unshift(logEntry)
        if (logs.value.length > MAX_LOGS) {
            logs.value.pop()
        }
    }

    const clearLogs = () => {
        logs.value = []
    }

    // 🔥 Размер шрифта
    const increaseFontSize = () => {
        if (fontSize.value < MAX_FONT_SIZE) fontSize.value++
    }
    const decreaseFontSize = () => {
        if (fontSize.value > MIN_FONT_SIZE) fontSize.value--
    }
    const resetFontSize = () => {
        fontSize.value = DEFAULT_FONT_SIZE
    }

    // 🔥 Высота панели
    const increaseHeight = () => {
        if (panelHeight.value < MAX_HEIGHT) panelHeight.value += HEIGHT_STEP
    }
    const decreaseHeight = () => {
        if (panelHeight.value > MIN_HEIGHT) panelHeight.value -= HEIGHT_STEP
    }
    const resetHeight = () => {
        panelHeight.value = DEFAULT_HEIGHT
    }

    // 🔥 Автосохранение
    watch(fontSize, (v) => saveToStorage(STORAGE_KEY_FONT_SIZE, v))
    watch(panelHeight, (v) => saveToStorage(STORAGE_KEY_HEIGHT, v))

    return {
        isVisible,
        logs,
        fontSize,
        panelHeight,
        MIN_FONT_SIZE, MAX_FONT_SIZE, DEFAULT_FONT_SIZE,
        MIN_HEIGHT, MAX_HEIGHT, DEFAULT_HEIGHT, HEIGHT_STEP,
        toggleVisibility,
        addLog,
        clearLogs,
        increaseFontSize, decreaseFontSize, resetFontSize,
        increaseHeight, decreaseHeight, resetHeight
    }
})

// Универсальные утилиты для localStorage
function loadFromStorage(key, defaultValue, min, max) {
    try {
        const saved = localStorage.getItem(key)
        if (saved) {
            const val = parseInt(saved, 10)
            if (!isNaN(val) && val >= min && val <= max) return val
        }
    } catch (e) {
        console.warn(`[DebugStore] Failed to load ${key}:`, e)
    }
    return defaultValue
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, String(value))
    } catch (e) {
        console.warn(`[DebugStore] Failed to save ${key}:`, e)
    }
}

export default useTrainingDebugStore
