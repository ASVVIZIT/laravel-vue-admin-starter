/**
 * Модуль загрузки конфига авторизации с бэкенда
 *
 * ВАЖНО: Вызывается ПОСЛЕ bootstrap.js (window.axios уже настроен)
 */

import { setStorageMethod } from '@/utils/auth'

/**
 * Загрузить настройки авторизации с бэкенда
 */
export async function initAuthConfig() {
    try {
        // Проверяем что window.axios доступен
        if (!window.axios) {
            console.error('[AuthConfig]  window.axios не доступен! bootstrap.js не загружен?')
            return
        }

        console.log('[AuthConfig] 🔄 Загрузка конфига авторизации...')

        const response = await window.axios.get('/api/auth/config', {
            withCredentials: true,
            timeout: 3000
        })

        const config = response.data || response

        if (config.token_storage_mode) {
            setStorageMethod(config.token_storage_mode)
            console.log(`[AuthConfig] ✅ Режим хранения: ${config.token_storage_mode}`)
        } else {
            console.warn('[AuthConfig] ️ token_storage_mode не получен, используем cookie')
        }
    } catch (error) {
        console.warn('[AuthConfig] ⚠️ Не удалось загрузить конфиг:', error.message)
        console.warn('[AuthConfig] Используем cookie по умолчанию')
    }
}
