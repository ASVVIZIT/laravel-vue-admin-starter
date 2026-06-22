/**
 * ============================================================================
 * I18N SETTINGS HELPERS UTILS — УТИЛИТЫ ДЛЯ РАБОТЫ С НАСТРОЙКАМИ
 * ============================================================================
 */

import { I18N_SETTINGS_DEFAULTS_CONFIG } from '@components/I18nChecker/config/i18nSettingsDefaultsConfig.js'

export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj
    try {
        return JSON.parse(JSON.stringify(obj))
    } catch (e) {
        console.error('[i18nSettingsHelpersUtils] deepClone failed:', e)
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

export const getI18nDefaults = (section) => {
    if (!I18N_SETTINGS_DEFAULTS_CONFIG[section]) {
        console.warn(`[i18nSettingsHelpersUtils] Unknown section: ${section}`)
        return {}
    }
    return deepClone(I18N_SETTINGS_DEFAULTS_CONFIG[section])
}

export const getFullI18nDefaults = () => deepClone(I18N_SETTINGS_DEFAULTS_CONFIG)

export const mergeWithI18nDefaults = (section, data) => {
    return deepMerge(getI18nDefaults(section), data || {})
}
