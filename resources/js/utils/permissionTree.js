import { uppercaseFirst } from '@/utils'
import { useI18n } from 'vue-i18n'

/**
 * Классифицирует разрешения на меню и остальные,
 * НЕ мутируя оригинальные имена прав (критично для Spatie Permission)!
 */
export const classifyPermissions = (permissions) => {
    if (!Array.isArray(permissions)) {
        return { all: [], menu: [], other: [] }
    }

    const result = { all: [], menu: [], other: [] }

    permissions.forEach(permission => {
        const pName = permission.name || ''

        // 1. В 'all' кладем ОРИГИНАЛЬНЫЙ объект, чтобы не потерять никакие данные
        result.all.push(permission)

        if (pName.startsWith('view menu ')) {
            result.menu.push({
                ...permission, // Сохраняем все оригинальные поля (id, name и т.д.)
                displayName: uppercaseFirst(pName.replace('view menu ', '')), // Красивое имя для UI
                disabled: !!permission.disabled
            })
        } else {
            result.other.push({
                ...permission, // Сохраняем все оригинальные поля (id, name и т.д.)
                displayName: uppercaseFirst(pName), // Красивое имя для UI
                // Запрещаем редактировать разрешение на управление правами, если оно есть
                disabled: !!permission.disabled || pName === 'manage permission'
            })
        }
    })

    return result
}

/**
 * Формирует древовидную структуру для el-tree
 * @param {Object} currentUser - Данные текущего пользователя с его правами
 * @param {Array} allMenuPermissions - Все доступные разрешения типа "меню"
 * @param {Array} allOtherPermissions - Все остальные доступные разрешения
 */
export const normalizePermissions = (currentUser, allMenuPermissions, allOtherPermissions) => {
    const { t } = useI18n()

    // Безопасное извлечение ID прав роли
    const rolePerms = currentUser?.permissions?.role || []
    const rolePermIds = rolePerms.map(p => p.id)

    // Вспомогательная функция для создания родительского узла-группы
    const createGroupNode = (title, children) => ({
        id: `group_${title}`, // Уникальный ID для группы
        name: title,
        displayName: title,
        disabled: true, // Родительский узел только для визуальной группировки
        children: children
    })

    // Фильтруем права пользователя, исключая те, что уже даны через роль
    // ВАЖНО: мы не мутируем name, поэтому точное совпадение с бэкендом сохраняется!
    const filterUserPerms = (perms) =>
        perms.filter(p => !rolePermIds.includes(p.id)).map(p => ({ ...p, disabled: false }))

    // Форматируем права роли (они всегда заблокированы для изменения здесь)
    const mapRolePerms = (perms) =>
        perms.map(p => ({ ...p, disabled: true }))

    // Формируем ветку Меню
    const menuChildren = [
        ...(rolePerms.length > 0 ? [
            createGroupNode(
                t('permission.table.rolePermissions.name') || 'Права роли',
                mapRolePerms(classifyPermissions(rolePerms).menu)
            )
        ] : []),
        createGroupNode(
            t('permission.table.userPermissions.name.menu') || 'Доступ к меню',
            filterUserPerms(allMenuPermissions)
        )
    ]

    // Формируем ветку Остальные разрешения
    const otherChildren = [
        ...(rolePerms.length > 0 ? [
            createGroupNode(
                t('permission.table.rolePermissions.name') || 'Права роли',
                mapRolePerms(classifyPermissions(rolePerms).other)
            )
        ] : []),
        createGroupNode(
            t('permission.table.userPermissions.name.permissions') || 'Остальные права',
            filterUserPerms(allOtherPermissions)
        )
    ]

    return { menu: menuChildren, other: otherChildren }
}
