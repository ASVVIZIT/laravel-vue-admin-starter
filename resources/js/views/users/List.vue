<template>
  <el-card class="app-container">
    <h2>{{ $t('users.listTitle') }}</h2>

    <UserFilters
        v-model="filters"
        :roles="roles"
        :loading="loading"
        :size="store.size"
        @search="handleFilter"
        @reset="resetFilters"
        @create="handleCreate"
        @status-change="handleStatusChange"
        @role-change="handleSingleRoleSelect"
    />

    <custom-table
        :size="store.size"
        :table-data="tableData"
        :table-column="basicColumn"
        :table-option="tableOption"
        :pagination="{ meta: pagination }"
        :paginate="true"
        :page-sizes="per_pages"
        :loading="loading"
        :highlightCurrentRow="true"
        :highlightHoverRow="true"
        @filter-change="handleTableFilter"
        @table-action="tableActions"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        :row-style="{fontSize: store.size === 'small' ? '10px' : '12px'}"
        :header-cell-style="{fontSize: store.size === 'small' ? '12px' : '14px'}"
        :table-height="tableHeight"
    >
      <template #header="{ column }">
        <div class="custom-header">
          <span>{{ column.label }}</span>
          <el-icon class="filter-icon" @click="openFilter(column)"><Filter /></el-icon>
        </div>
      </template>

      <template #status_type="{ row }">
        <div class="status-cell">
          <EmailVerifyStars
              v-if="checkPermission(['confirm user email'])"
              :user="row"
          />
          <el-tag :type="getStatusTagType(getUserActionType(row))" effect="dark" :size="store.size">
            {{ getStatusLabel(getUserActionType(row)) }}
          </el-tag>
        </div>
      </template>

      <template #roles="{ row }">
        <el-tag
            v-for="role in row.roles"
            :key="role"
            :type="getRoleColor(role)"
            class="role-tag"
            effect="dark"
            :size="store.size"
        >
          {{ role }}
        </el-tag>
      </template>

      <template #table_options="{ row }">
        <UserTableActions :row="row" :size="store.size" @action="tableActions" />
      </template>
    </custom-table>

    <UserCreateDialog
        v-model="dialogFormVisible"
        :size="store.size"
        :roles="roles"
        @success="getList"
    />

    <UserPermissionsDialog
        v-model="dialogPermissionVisible"
        :user="currentUser"
        :all-permissions="permissions"
        :size="store.size"
        @update:user="(val) => currentUser = val"
        @success="getList"
    />

    <el-dialog
        v-model="adminConfirmDialog.visible"
        :title="adminConfirmDialog.title"
        width="500px"
    >
      <el-form label-width="140px">
        <el-form-item label="Пользователь:">
          <el-input :value="adminConfirmDialog.user?.name" disabled />
        </el-form-item>
        <el-form-item label="Новый email:">
          <el-input :value="adminConfirmDialog.user?.pending_new_email" disabled />
        </el-form-item>
        <el-form-item :label="$t('users.actions.confirmReason') || 'Причина'">
          <el-input
              v-model="adminConfirmDialog.reason"
              type="textarea"
              :rows="3"
              :placeholder="$t('users.actions.confirmReasonPlaceholder') || 'Укажите причину подтверждения...'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adminConfirmDialog.visible = false">{{ $t('form.button.cancel') || 'Отмена' }}</el-button>
        <el-button type="primary" :loading="adminConfirmDialog.loading" @click="executeAdminConfirm">
          {{ $t('form.button.confirm') || 'Подтвердить' }}
        </el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Filter } from '@element-plus/icons-vue'

import { getUserActionType, getStatusTagType, getStatusLabel, getRoleColor, isAdmin } from '@/utils/userStatus'
import { classifyPermissions } from '@/utils/permissionTree'
import { calculateTableHeight } from '@/utils/tableHeight'

import CustomTable from '@/components/CustomTable.vue'
import UserFilters from './components/UserFilters.vue'
import UserTableActions from './components/UserTableActions.vue'
import UserCreateDialog from './components/UserCreateDialog.vue'
import UserPermissionsDialog from './components/UserPermissionsDialog.vue'
import EmailVerifyStars from './components/EmailVerifyStars.vue'

import UserResource from '@/api/user'
import Resource from '@/api/resource'
import { appStore } from '@/store/appStore'
import checkPermission from '@/utils/permission'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const userResource = new UserResource()
const permissionResource = new Resource('permissions')
const store = appStore()

// ============================================================================
// УПРАВЛЕНИЕ СОСТОЯНИЕМ ФИЛЬТРОВ (LocalStorage)
// ============================================================================
const STORAGE_KEY = 'users-table-filters'

const saveFiltersToStorage = (filtersData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtersData))
  } catch (e) {
    console.warn('Failed to save filters:', e)
  }
}

const loadFiltersFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    console.warn('Failed to load filters:', e)
    return null
  }
}

const defaultFilters = { search: '', roles: [], singleRole: '', status: 'all' }
const defaultPagination = { current_page: 1, per_page: 20 }

const storedFilters = loadFiltersFromStorage() || {}

// Безопасная инициализация: гарантируем наличие всех ключей
const filters = ref({
  search: storedFilters.search ?? defaultFilters.search,
  roles: Array.isArray(storedFilters.roles) ? storedFilters.roles : defaultFilters.roles,
  singleRole: storedFilters.singleRole ?? defaultFilters.singleRole,
  status: storedFilters.status ?? defaultFilters.status
})

const pagination = reactive({
  current_page: Number(storedFilters.current_page) || defaultPagination.current_page,
  per_page: Number(storedFilters.per_page) || defaultPagination.per_page,
  total: 0,
  last_page: 1
})

// Явное сохранение только нужных полей, чтобы избежать "мусора" или пропажи ключей
watch(
    () => ({
      search: filters.value.search,
      roles: filters.value.roles,
      singleRole: filters.value.singleRole,
      status: filters.value.status,
      current_page: pagination.current_page,
      per_page: pagination.per_page
    }),
    (newVal) => {
      saveFiltersToStorage(newVal)
    },
    { deep: true }
)

// ============================================================================
// ОСНОВНАЯ ЛОГИКА
// ============================================================================
const loading = ref(true)
const tableData = ref([])
const dialogFormVisible = ref(false)
const dialogPermissionVisible = ref(false)
const currentUser = ref({ id: 0, name: '', permissions: { role: [], user: [] } })
const permissions = ref([])
const tableHeight = ref('calc(100vh - 300px)')

const adminConfirmDialog = reactive({
  visible: false,
  loading: false,
  title: '',
  actionType: '',
  user: null,
  reason: ''
})

const roles = ['superadmin', 'admin', 'manager', 'editor', 'user', 'visitor']
const per_pages = [5, 10, 30, 50, 100, 150, 200]

// Объединяем singleRole и roles в один массив для отправки на бэкенд
const allSelectedRoles = computed(() => {
  const r = []
  if (filters.value.singleRole) r.push(filters.value.singleRole)
  r.push(...(filters.value.roles || []))
  return [...new Set(r)]
})

const tableOption = computed(() => {
  if (!checkPermission(['manage user'])) return {}
  return {
    slot: false,
    width: '280',
    label: t('table.general.actions'),
    fixed: 'right',
    item_actions: [],
    item_actions_down: []
  }
})

const basicColumn = computed(() => [
  { prop: 'id', label: t('table.user.columns.id'), width: '65', resizable: false, sortable: true, fixed: true },
  { prop: 'name', label: t('table.user.columns.name'), width: '130', sortable: true, fixed: true },
  { prop: 'email', label: t('table.user.columns.email'), sortable: true },
  { prop: 'status_type', label: t('users.status.label'), minWidth: '170', slot: true },
  {
    prop: 'roles', label: t('table.user.columns.role'), width: '110', slot: true, columnKey: 'roles',
    filters: roles.map(role => ({ text: role.toUpperCase(), value: role, style: { color: getRoleColor(role) } })),
    filterMethod: (value, row) => row.roles.includes(value),
    filterPlacement: 'bottom-end',
    filteredValue: allSelectedRoles.value
  },
])

const getList = async () => {
  loading.value = true
  try {
    // Формируем параметры строго в том виде, который ожидает UserController@index
    const params = {
      search: filters.value.search || null,
      role: allSelectedRoles.value.length > 0 ? allSelectedRoles.value : null, // Бэкенд ждет именно 'role' (array)
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
  pagination.current_page = defaultPagination.current_page
  pagination.per_page = defaultPagination.per_page
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.warn('Failed to clear filters:', e)
  }
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

const tableActions = async (action, row) => {
  switch (action) {
    case 'edit-item': router.push(`/administrator/users/edit/${row.id}`); break
    case 'view-item': router.push(`/administrator/users/view/${row.id}`); break
    case 'delete-item': await handleDeleteUser(row); break
    case 'ban-item': await handleBanUser(row); break
    case 'unban-item': await handleUnbanUser(row); break
    case 'restore-item': await handleRestoreUser(row); break
    case 'edit-permission-item': await handleEditPermissions(row); break
    case 'admin-confirm-old':
      openAdminConfirmDialog('admin-confirm-old', row, t('users.actions.adminConfirmOld'))
      break
    case 'admin-confirm-new':
      openAdminConfirmDialog('admin-confirm-new', row, t('users.actions.adminConfirmNew'))
      break
    case 'resend-new-email':
      await handleResendNewEmail(row)
      break
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
    if (error !== 'cancel') {
      const errorMsg = error.response?.data?.message || error.message || t('users.messages.banError')
      ElMessage.error(errorMsg)
    }
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
  if (permissions.value.length === 0) {
    await getPermissions()
  }
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
    ElMessage.error(error.response?.data?.message || t('users.messages.adminConfirmError') || 'Ошибка при выполнении действия')
  } finally {
    adminConfirmDialog.loading = false
  }
}

const handleResendNewEmail = async (user) => {
  try {
    const res = await userResource.resendNewEmailConfirmation(user.id)
    ElMessage.success(res?.message || t('users.messages.resendNewEmailSuccess'))
    getList()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || t('users.messages.resendNewEmailError'))
  }
}

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
</script>

<style lang="scss" scoped>
.custom-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-icon {
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: var(--el-color-primary);
  }
}

.status-cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
}

.el-tag {
  margin: 2px;
}
.role-tag {
  margin: 2px;
  vertical-align: middle;
  cursor: default;
}
:deep(.el-form-item.is-success .el-input__validateIcon) {
  color: var(--el-color-success) !important;
}
:deep(.el-form-item.is-error .el-input__validateIcon) {
  color: var(--el-color-danger) !important;
}
.app-container {
  flex: 1;
  justify-content: space-between;
  font-size: 14px;
  padding: 8px;

  .el-dialog__body {
    .form-container {
      margin-top: 1rem;
    }
  }

  .el-table-filter__checkbox-group {
    max-height: 300px;
    overflow-y: auto;
    .is-checked {
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }

  .filter-container {
    .filter-item.search-filter-item {
      width: 220px;
      margin-right: 5px;
    }
    .filter-item.select-role-filter-item {
      width: 130px;
      margin-right: 5px;
    }
    .filter-item.select-status-filter-item {
      width: 150px;
      margin-right: 5px;
    }
    .select-role-filter-item {
      &.is-disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }

  .block {
    float: left;
    min-width: 250px;
  }
  .clear-left {
    clear: left;
  }
}
</style>
