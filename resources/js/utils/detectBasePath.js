import { VALID_LOGIN_TYPES } from '@/utils/auth'
import { getDefaultLoginType } from '@/utils/authConfig'

// Маппинг типов на base paths
export const TYPE_TO_BASE = {
    user: '/user/',
    admin: '/admin/',
    tester: '/tester/'
}

export const BASE_TO_TYPE = {
    '/user': 'user',
    '/admin': 'admin',
    '/tester': 'tester'
}

const BASE_PATH_KEY = 'fenix-base-path'

/**
 * Определить base path из текущего URL
 */

let cachedBasePath = null

export function detectBasePath() {
    // Возвращаем кеш если есть
    if (cachedBasePath) return cachedBasePath

    const path = window.location.pathname

    for (const [base, type] of Object.entries(BASE_TO_TYPE)) {
        if (path.startsWith(base + '/') || path === base) {
            cachedBasePath = base + '/'
            localStorage.setItem(BASE_PATH_KEY, cachedBasePath)
            return cachedBasePath
        }
    }

    const defaultType = getDefaultLoginType()
    cachedBasePath = TYPE_TO_BASE[defaultType] || '/admin/'
    localStorage.setItem(BASE_PATH_KEY, cachedBasePath)
    return cachedBasePath
}

// Сброс кеша (при logout)
export function resetBasePathCache() {
    cachedBasePath = null
}

/**
 * Получить сохранённый base path
 */
export function getSavedBasePath() {
    const saved = localStorage.getItem(BASE_PATH_KEY)
    // P0: Проверка что сохранённый путь валидный
    if (saved && Object.values(TYPE_TO_BASE).includes(saved)) {
        return saved
    }
    return TYPE_TO_BASE[getDefaultLoginType()] || '/admin/'
}

/**
 * Получить тип из base path
 */
export function getTypeFromBase(base) {
    if (!base || typeof base !== 'string') {
        return getDefaultLoginType()
    }
    const cleanBase = base.replace(/^\/|\/$/g, '')
    return VALID_LOGIN_TYPES.includes(cleanBase) ? cleanBase : getDefaultLoginType()
}

/**
 * Получить base path для типа
 */
export function getBaseForType(type) {
    if (!VALID_LOGIN_TYPES.includes(type)) {
        return TYPE_TO_BASE[getDefaultLoginType()] || '/admin/'
    }
    return TYPE_TO_BASE[type] || '/admin/'
}

/**
 * Получить полный URL для типа и пути
 */
export function getFullUrl(type, path) {
    const base = getBaseForType(type)
    const cleanPath = (path || '').replace(/^\//, '')
    return base + cleanPath
}
