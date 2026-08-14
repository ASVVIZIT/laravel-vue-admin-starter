import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserActionType, getStatusTagType, getStatusLabel, getRoleColor, isAdmin } from '@/utils/userStatus'
import { classifyPermissions } from '@/utils/permissionTree'
import { calculateTableHeight } from '@/utils/tableHeight'
import { useTableFiltersPersistence } from '@/composables/useTableFiltersPersistence'
import UserResource from '@/api/user'
import Resource from '@/api/resource'
import { appStore } from '@/store/appStore'
import checkPermission from '@/utils/permission'

export function useUserList() {
    const { t } = useI18n({ useScope: 'global' })
    const router = useRouter()
    const userResource = new UserResource()
    const permissionResource = new Resource('permissions')
    const store = appStore()

    // 🔥 Persistence для фильтров и пагинации
    const { save: saveFilter, restore: restoreFilter, clear: clearFilters } = useTableFiltersPersistence('users')

    // --- STATE ---
    const loading = ref(true)
    const tableData = ref([])
    const permissions = ref([])
    const tableHeight = ref('calc(100vh - 300px)')

    const dialogFormVisible = ref(false)
    const dialogPermissionVisible = ref(false)
    const currentUser = ref({ id: 0, name: '', permissions: { role: [], user: [] } })

    const adminConfirmDialog = reactive({
        visible: false,
        loading: false,
        title: '',
        actionType: '',
        user: null,
        reason: ''
    })

    const defaultFilters = { search: '', roles: [], singleRole: '', status: 'all' }
    const defaultPagination = { current_page: 1, per_page: 20 }

    const filters = ref(restoreFilter('state', 'filters', defaultFilters))
    const pagination = reactive({
        current_page: restoreFilter('state', 'pagination', defaultPagination).current_page || 1,
        per_page: restoreFilter('state', 'pagination', defaultPagination).per_page || 20,
        total: 0,
        last_page: 1
    })

    const roles = ['superadmin', 'admin', 'manager', 'editor', 'user', 'visitor']
    const per_pages = [5, 10, 30, 50, 100, 150, 200]

    // --- WATCHERS (Автосохранение) ---
    watch(filters, (newVal) => saveFilter('state', 'filters', newVal), { deep: true })
    watch(
        () => ({ current_page: pagination.current_page, per_page: pagination.per_page }),
        (newVal) => saveFilter('state', 'pagination', newVal),
        { deep: true }
    )

    // --- COMPUTED ---
    const allSelectedRoles = computed(() => {
        const r = []
        if (filters.value.singleRole) r.push(filters.value.singleRole)
        r.push(...filters.value.roles)
        return [...new Set(r)]
    })

    const tableOption = computed(() => {
        if (!checkPermission(['manage user'])) return {}
        return {
            slot: false, width: '280', label: t('table.general.actions'), fixed: 'right',
            item_actions: [], item_actions_down: []
        }
    })

    const basicColumn = computed(() => [
        { prop: 'id', label: t('table.user.columns.id'), width: '65', resizable: false, sortable: true, fixed: true },
        { prop: 'name', label: t('table.user.columns.name'), width: '130', sortable: true, fixed: true },
        { prop: 'email', label: t('table.user.columns.email'), sortable: true },
        { prop: 'status_type', label: t('users.status.label'), width: '120', slot: true },
        {
            prop: 'roles', label: t('table.user.columns.role'), width: '110', slot: true, columnKey: 'roles',
            filters: roles.map(role => ({ text: role.toUpperCase(), value: role, style: { color: getRoleColor(role) } })),
            filterMethod: (value, row) => row.roles.includes(value),
            filterPlacement: 'bottom-end',
            filteredValue: allSelectedRoles.value
        },
    ])

    // --- METHODS ---
    const getList = async () => {
        loading.value = true
        try {
            const params = {
                search: filters.value.search || null,
                role: allSelectedRoles.value.length > 0 ? allSelectedRoles.value : null,
                status: filters.value.status || 'all',
                page: pagination.current_page,
                per_page: pagination.per_page
            }
            const response = await userResource.list(params)
            tableData.value = response.items || []
            pagination.total = response.meta.total
            pagination.current_page = response.meta.page || response.meta.current_page
            pagination.per_page = response.meta.per_page
            pagination.last_page = response.meta.last_page
        } catch (error) {
            ElMessage.error(error.response?.data?.message || 'Ошибка загрузки данных')
        } finally {
            loading.value = false
        }
    }

    const handleFilter = () => { pagination.current_page = 1; getList() }
    const handleStatusChange = () => { pagination.current_page = 1; getList() }
    const handleSingleRoleSelect = () => { pagination.current_page = 1; getList() }

    const resetFilters = () => {
        filters.value = { ...defaultFilters }
        pagination.current_page = 1
        pagination.per_page = defaultPagination.per_page
        clearFilters('state')
        getList()
    }

    const handleSizeChange = (size) => { pagination.per_page = size; pagination.current_page = 1; getList() }
    const handlePageChange = (page) => { pagination.current_page = page; getList() }

    const handleTableFilter = (columnFilters) => {
        if (columnFilters.roles) {
            filters.value.roles = columnFilters.roles
            filters.value.singleRole = columnFilters.roles.length === 1 ? columnFilters.roles[0] : ''
        }
        getList()
    }

    const handleCreate = () => { dialogFormVisible.value = true }

    const openFilter = (column) => {
        const header = document.querySelector(`.${column.id}`)
        const popper = header?.querySelector('.el-table-filter')
        if (popper) popper.style.display = popper.style.display === 'none' ? 'block' : 'none'
    }

    // --- ACTIONS ---
    const tableActions = async (action, row) => {
        switch (action) {
            case 'edit-item': router.push(`/administrator/users/edit/${row.id}`); break
            case 'view-item': router.push(`/administrator/users/view/${row.id}`); break
            case 'delete-item': await handleDeleteUser(row); break
            case 'ban-item': await handleBanUser(row); break
            case 'unban-item': await handleUnbanUser(row); break
            case 'restore-item': await handleRestoreUser(row); break
            case 'edit-permission-item': await handleEditPermissions(row); break
            case 'admin-confirm-old': openAdminConfirmDialog('admin-confirm-old', row, t('users.actions.adminConfirmOld')); break
            case 'admin-confirm-new': openAdminConfirmDialog('admin-confirm-new', row, t('users.actions.adminConfirmNew')); break
        }
    }

    const handleDeleteUser = async (user) => {
        try {
            await ElMessageBox.confirm(t('table.user.elMessageBox.confirm1.message@j', { name: user.name }), t('table.user.elMessageBox.deleteTitle'), { type: 'warning', dangerouslyUseHTMLString: true })
            await userResource.destroy(user.id)
            ElMessage.success(t('table.user.elMessage.delete.success.message'))
            getList()
        } catch (error) { if (error !== 'cancel') ElMessage.error(t('table.user.elMessage.delete.error.message')) }
    }

    const handleBanUser = async (user) => {
        try {
            await ElMessageBox.confirm(t('users.dialogs.banConfirm', { name: user.name }), t('users.dialogs.banTitle'), { type: 'warning' })
            await userResource.ban(user.id)
            ElMessage.success(t('users.messages.banSuccess'))
            getList()
        } catch (error) {
            if (error !== 'cancel') ElMessage.error(error.response?.data?.message || error.message || t('users.messages.banError'))
        }
    }

    const handleUnbanUser = async (user) => {
        try {
            await userResource.unban(user.id)
            ElMessage.success(t('users.messages.unbanSuccess'))
            getList()
        } catch (error) { ElMessage.error(t('users.messages.unbanError')) }
    }

    const handleRestoreUser = async (user) => {
        try {
            await ElMessageBox.confirm(t('users.dialogs.restoreConfirm', { name: user.name }), t('users.dialogs.restoreTitle'), { type: 'warning' })
            await userResource.restore(user.id)
            ElMessage.success(t('users.messages.restoreSuccess'))
            getList()
        } catch (error) { if (error !== 'cancel') ElMessage.error(t('users.messages.restoreError')) }
    }

    const handleEditPermissions = async (user) => {
        if (permissions.value.length === 0) await getPermissions()
        currentUser.value = { ...user }
        dialogPermissionVisible.value = true
    }

    const getPermissions = async () => {
        try {
            const { data } = await permissionResource.list({})
            permissions.value = classifyPermissions(data).all
        } catch (error) {
            ElMessage.error(t('error.loadPermissions'))
        }
    }

    const openAdminConfirmDialog = (actionType, row, title) => {
        adminConfirmDialog.actionType = actionType
        adminConfirmDialog.user = row
        adminConfirmDialog.title = title
        adminConfirmDialog.reason = ''
        adminConfirmDialog.visible = true
    }

    const executeAdminConfirm = async () => {
        try {
            adminConfirmDialog.loading = true
            if (adminConfirmDialog.actionType === 'admin-confirm-old') {
                await userResource.adminConfirmOldEmail(adminConfirmDialog.user.id, adminConfirmDialog.reason)
            } else {
                await userResource.adminConfirmNewEmail(adminConfirmDialog.user.id, adminConfirmDialog.reason)
            }
            ElMessage.success(t('users.messages.adminConfirmSuccess') || 'Действие успешно выполнено')
            adminConfirmDialog.visible = false
            getList()
        } catch (error) {
            ElMessage.error(error.response?.data?.message || t('users.messages.adminConfirmError') || 'Ошибка')
        } finally {
            adminConfirmDialog.loading = false
        }
    }

    // --- LIFECYCLE ---
    const updateHeight = () => { tableHeight.value = calculateTableHeight(300, 60) }

    onMounted(async () => {
        setTimeout(() => {
            updateHeight()
            window.addEventListener('resize', updateHeight)
        }, 300)
        await getList()
        if (checkPermission(['manage permission'])) await getPermissions()
    })

    onUnmounted(() => {
        window.removeEventListener('resize', updateHeight)
    })

    // --- EXPORT ---
    return {
        loading, tableData, filters, pagination, permissions, tableHeight,
        dialogFormVisible, dialogPermissionVisible, currentUser, adminConfirmDialog,
        roles, per_pages, tableOption, basicColumn, allSelectedRoles,
        handleFilter, resetFilters, handleStatusChange, handleSingleRoleSelect,
        handleSizeChange, handlePageChange, handleTableFilter, handleCreate, openFilter,
        tableActions, executeAdminConfirm,
        // Utils for template
        getUserActionType, getStatusTagType, getStatusLabel, getRoleColor, isAdmin, checkPermission
    }
}
