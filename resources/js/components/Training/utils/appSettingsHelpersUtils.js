/**
 * ============================================================================
 * APP SETTINGS HELPERS UTILS — УТИЛИТЫ ДЛЯ РАБОТЫ С НАСТРОЙКАМИ
 * ============================================================================
 * 📁 Путь: @/components/Training/utils/appSettingsHelpersUtils.js
 * ✅ Отвечает исключительно за глубокое клонирование и слияние объектов.
 * ============================================================================
 */

import { SETTINGS_DEFAULTS_CONFIG } from '@/components/Training/config/settingsDefaultsConfig.js'

export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj
    try {
        return JSON.parse(JSON.stringify(obj))
    } catch (e) {
        console.error('[appSettingsHelpersUtils] deepClone failed:', e)
        return obj
    }
}

export const deepMerge = (target, source) => {
    if (!source) return deepClone(target)
    if (!target) return deepClone(source)

    const output = { ...target }

    Object.keys(source).forEach(key => {
        const sourceVal = source[key]
        const targetVal = target[key]

        if (
            sourceVal && typeof sourceVal === 'object' && !Array.isArray(sourceVal) &&
            targetVal && typeof targetVal === 'object' && !Array.isArray(targetVal)
        ) {
            output[key] = deepMerge(targetVal, sourceVal)
        } else {
            output[key] = deepClone(sourceVal)
        }
    })

    return output
}

export const getAppDefaults = (section) => {
    if (!SETTINGS_DEFAULTS_CONFIG[section]) {
        console.warn(`[appSettingsHelpersUtils] Unknown section: ${section}`)
        return {}
    }
    return deepClone(SETTINGS_DEFAULTS_CONFIG[section])
}

export const getFullAppDefaults = () => deepClone(SETTINGS_DEFAULTS_CONFIG)

export const mergeWithAppDefaults = (section, data) => {
    return deepMerge(getAppDefaults(section), data || {})
}
