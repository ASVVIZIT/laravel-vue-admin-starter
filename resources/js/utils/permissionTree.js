import { uppercaseFirst } from '@/utils'
import { useI18n } from 'vue-i18n'

/**
 * Классифицирует разрешения на меню и остальные
 */
export const classifyPermissions = (permissions) => {
    if (!Array.isArray(permissions)) {
        return { all: [], menu: [], other: [] }
    }

    const result = { all: [], menu: [], other: [] }

    permissions.forEach(permission => {
        const pName = permission.name || ''
        result.all.push(permission)

        if (pName.startsWith('view menu ')) {
            result.menu.push({
                id: permission.id,
                name: uppercaseFirst(pName.replace('view menu ', '')),
                disabled: !!permission.disabled
            })
        } else {
            result.other.push({
                id: permission.id,
                name: uppercaseFirst(pName),
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
    const rolePerms = currentUser?.permissions?.role || []
    const rolePermIds = rolePerms.map(p => p.id)

    // Вспомогательная функция для создания родительского узла-группы
    const createGroupNode = (title, children) => ({
        id: `group_${title}`, // Уникальный ID для группы, чтобы el-tree не конфликтовал
        name: title,
        disabled: true, // Родительский узел только для визуальной группировки
        children: children
    })

    // Фильтруем права пользователя, исключая те, что уже даны через роль
    const filterUserPerms = (perms) =>
        perms.filter(p => !rolePermIds.includes(p.id)).map(p => ({ ...p, disabled: false }))

    // Форматируем права роли (они всегда заблокированы для изменения здесь)
    const mapRolePerms = (perms) =>
        perms.map(p => ({ ...p, disabled: true }))

    // Формируем ветку Меню
    const menuChildren = [
        ...(rolePerms.length > 0 ? [
            createGroupNode(
                t('permission.table.rolePermissions.name'),
                mapRolePerms(classifyPermissions(rolePerms).menu)
            )
        ] : []),
        createGroupNode(
            t('permission.table.userPermissions.name.menu'),
            filterUserPerms(allMenuPermissions)
        )
    ]

    // Формируем ветку Остальные разрешения
    const otherChildren = [
        ...(rolePerms.length > 0 ? [
            createGroupNode(
                t('permission.table.rolePermissions.name'),
                mapRolePerms(classifyPermissions(rolePerms).other)
            )
        ] : []),
        createGroupNode(
            t('permission.table.userPermissions.name.permissions'),
            filterUserPerms(allOtherPermissions)
        )
    ]

    return { menu: menuChildren, other: otherChildren }
}
