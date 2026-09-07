import { useI18n } from 'vue-i18n'

/**
 * Определяет тип действия/статуса для пользователя (таблица + кнопки).
 * P0-ФИКС: теперь учитывает 'unverified' — пользователи без email_verified_at
 * корректно классифицируются как 'unverified', а не 'active'.
 *
 * Иерархия (сверху вниз):
 *   1. trashed   — удалён (deleted_at не пуст или status_type === 'trashed')
 *   2. banned    — забанен админом (через LoginAttempt.is_banned)
 *   3. unverified — email не подтверждён (email_verified_at === null)
 *   4. active    — всё ок
 */
export const getUserActionType = (row) => {
    if (!row) return 'unknown'

    const hasDeletedAt = row.deleted_at && String(row.deleted_at).trim().length > 0
    const isTrashed = row.status_type === 'trashed'
    if (hasDeletedAt || isTrashed) return 'trashed'

    const isBanned = row.status_type === 'banned' || row.is_banned === true || row.is_banned === 'true'
    if (isBanned) return 'banned'

    // 🔥 P0-ФИКС: учитываем статус 'unverified'
    const isUnverified = row.status_type === 'unverified' || row.email_verified === false
    if (isUnverified) return 'unverified'

    return 'active'
}

/**
 * Цвет тега статуса Element Plus.
 */
export const getStatusTagType = (statusType) => {
    const types = {
        active: 'success',
        banned: 'danger',
        trashed: 'info',
        unverified: 'warning'
    }
    return types[statusType] || 'info'
}

/**
 * Человекочитаемое название статуса (через i18n).
 */
export const getStatusLabel = (statusType) => {
    const { t } = useI18n()
    return t(`users.status.${statusType}`)
}

/**
 * Проверка: пользователь — администратор (superadmin/admin).
 */
export const isAdmin = (userRoles) => {
    if (!Array.isArray(userRoles)) return false
    return ['superadmin', 'admin'].some(role => userRoles.includes(role))
}

/**
 * Цвет тега роли в таблице/карточке.
 */
export const getRoleColor = (role) => {
    const colors = {
        superadmin: 'danger',
        admin: 'danger',
        manager: 'warning',
        editor: 'primary',
        user: 'success',
        visitor: 'info'
    }
    return colors[role] || 'info'
}
