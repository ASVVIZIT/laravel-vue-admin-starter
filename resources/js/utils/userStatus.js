import { useI18n } from 'vue-i18n'

export const getUserActionType = (row) => {
    if (!row) return 'unknown'

    const hasDeletedAt = row.deleted_at && String(row.deleted_at).trim().length > 0
    const isTrashed = row.status_type === 'trashed'

    if (hasDeletedAt || isTrashed) return 'trashed'

    const isBanned = row.status_type === 'banned' || row.is_banned === true || row.is_banned === 'true'
    if (isBanned) return 'banned'

    return 'active'
}

export const getStatusTagType = (statusType) => {
    const types = { active: 'success', banned: 'danger', trashed: 'info', unverified: 'warning' }
    return types[statusType] || 'info'
}

export const getStatusLabel = (statusType) => {
    const { t } = useI18n()
    return t(`users.status.${statusType}`)
}

export const isAdmin = (userRoles) => {
    if (!Array.isArray(userRoles)) return false
    return ['superadmin', 'admin'].some(role => userRoles.includes(role))
}

export const getRoleColor = (role) => {
    const colors = {
        superadmin: 'danger', admin: 'danger', manager: 'warning',
        editor: 'primary', user: 'success', visitor: 'info'
    }
    return colors[role] || 'info'
}
