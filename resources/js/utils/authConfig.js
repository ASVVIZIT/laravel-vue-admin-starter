import { setStorageMethod, VALID_LOGIN_TYPES } from '@/utils/auth'

const DEFAULT_LOGIN_TYPE_KEY = 'fenix-default-login-type'

/**
 * Получить дефолтный тип входа (из localStorage)
 */
export function getDefaultLoginType() {
    const saved = localStorage.getItem(DEFAULT_LOGIN_TYPE_KEY)
    return VALID_LOGIN_TYPES.includes(saved) ? saved : 'admin'
}

/**
 * Загрузить настройки авторизации с бэкенда
 */
export async function initAuthConfig() {
    try {
        // P2: Проверка что window.axios доступен
        if (!window.axios) {
            console.error('[AuthConfig] ❌ window.axios не доступен!')
            return
        }

        console.log('[AuthConfig] 🔄 Загрузка конфига...')

        const response = await window.axios.get('/api/auth/config', {
            withCredentials: true,
            timeout: 3000
        })

        // P0: Защита от невалидного ответа
        const config = response?.data || response

        // Сохраняем token_storage_mode
        if (config?.token_storage_mode) {
            setStorageMethod(config.token_storage_mode)
            console.log(`[AuthConfig] ✅ Режим хранения: ${config.token_storage_mode}`)
        }

        // 🔥 Сохраняем default_login_type
        if (config?.default_login_type && VALID_LOGIN_TYPES.includes(config.default_login_type)) {
            localStorage.setItem(DEFAULT_LOGIN_TYPE_KEY, config.default_login_type)
            console.log(`[AuthConfig] ✅ Дефолтный тип: ${config.default_login_type}`)
        }
    } catch (error) {
        console.warn('[AuthConfig] ⚠️ Не удалось загрузить конфиг:', error?.message || error)
        console.warn('[AuthConfig] Используем cookie по умолчанию')
    }
}
