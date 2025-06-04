<template>
  <el-card class="app-container">
    <h2>Список пользователей</h2>
    <div class="filter-container">
      <el-input
        v-model="filters.search"
        :size="store.size"
        :placeholder="$t('table.user.form.fields.name.title') + '/' + $t('table.user.form.fields.email.title')"
        clearable
        class="filter-item search-filter-item"
        @keyup.enter="handleSearchInput"/>
        <el-select
          v-model="filters.singleRole"
          :size="store.size"
          :placeholder="$t('table.user.form.fields.role.title')"
          class="filter-item select-role-filter-item"
          :loading="loading"
          @change="handleSingleRoleSelect"
          filterable
          clearable
        >
          <el-option
            v-for="item in roles"
            :key="item"
            :label="uppercaseFirst(item)"
            :value="item"
            :disabled="disabledRoles.includes(item)"
          />
        </el-select>
      <el-button :size="store.size" class="filter-item" type="primary" :icon="Search" @click="handleFilter">
        {{ t('table.general.search') }}
      </el-button>
      <el-button :size="store.size" class="filter-item" type="danger" :icon="Refresh" @click="resetFilters">
        {{ t('table.general.filterReset') }}
      </el-button>
      <el-button :size="store.size" class="filter-item" type="success" :icon="Plus" @click="handleCreate">
        {{ t('table.general.add') }}
      </el-button>
    </div>
    <custom-table
        :size="store.size"
        :table-data="tableData"
        :table-column="basicColumn"
        :table-option="tableOption"
        :pagination="{ meta: pagination }"
        :paginate="true"
        :page-sizes="per_pages"
        :loading="loading"
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
          <el-icon class="filter-icon" @click="openFilter(column)">
            <Filter />
          </el-icon>
        </div>
      </template>
      <template #roles="{ row }">
        <el-tag
            v-for="role in row.roles"
            :key="role"
            :type="roleConfig.getColor(role)"
            class="role-tag"
            effect="dark"
            :size="store.size"
        >
          {{ role }}
        </el-tag>
      </template>
      <template #table_options="scope">
        <div v-if="!isAdmin(scope.row.roles)">
          <el-button-group :size="store.size">
          <el-button v-for="(action, index) in tableOption.item_actions"
                     :key="index"
                     :type="action.type || 'primary'"
                     :round="action.round || false"
                     @click="tableActions(action.name, scope.row)"
                     :size="store.size"
          >
            <svg-item :el-svg-name="action.icon" :title="action.label"></svg-item>
          </el-button>
          </el-button-group>
        </div>
        <div v-else style="font-style: italic;font-weight: 300;">Нельзя редактировать</div>
      </template>
    </custom-table>
    <el-dialog
        v-model="dialogFormVisible"
        :title="$t('table.user.form.title.create')"
        :width="store.size === 'small' ? '40%' : '60%'"
    >
      <div v-loading="userCreating" class="form-container">
        <el-form
          ref="refUserForm"
          status-icon
          :rules="rules"
          :model="newUser"
          label-position="right"
          label-width="170px"
          style="max-width: 600px;"
        >
          <el-form-item :label="$t('table.user.form.fields.role.title')" prop="role">
            <el-select
              v-if="isAdmin(roles)"
              :size="store.size"
              v-model="newUser.role"
              class="filter-item"
              :placeholder="$t('table.user.form.fields.role.placeholder')"
              filterable
              clearable
            >
              <el-option v-for="item in roles" :key="item" :label="uppercaseFirst(item)" :value="item"/>
            </el-select>
            <el-select
              v-else-if="!isAdmin(roles)"
              :size="store.size"
              v-model="newUser.role"
              class="filter-item" :placeholder="$t('table.form.fields.role.placeholder')"
              filterable
              clearable
            >
              <el-option v-for="item in nonAdminRoles" :key="item" :label="uppercaseFirst(item)" :value="item"/>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('table.user.form.fields.name.title')" prop="name">
            <el-input
              v-model="newUser.name"
              :size="store.size"
              type="text"
              :placeholder="$t('table.user.form.fields.name.placeholder')"
              clearable
            />
          </el-form-item>
          <el-form-item :label="$t('table.user.form.fields.email.title')" prop="email">
            <el-input
              v-model="newUser.email"
              :size="store.size"
              type="email"
              :placeholder="$t('table.user.form.fields.email.placeholder')"
              clearable
            />
          </el-form-item>
          <el-form-item
            :label="$t('table.user.form.fields.password.title')"
            prop="password"
            :validate-status="validationStatus"
            :error="errorMessage"
          >
            <el-input
              v-model="newUser.password"
              :size="store.size"
              type="password"
              show-password
              :placeholder="$t('table.user.form.fields.password.placeholder')"
              clearable
            />
          </el-form-item>
          <el-form-item
            :label="$t('table.user.form.fields.confirmPassword.title')"
            prop="confirmPassword"
            :validate-status="validationStatus"
            :error="errorMessage"
          >
            <el-input
              v-model="newUser.confirmPassword"
              :size="store.size"
              type="password"
              show-password
              @change="checkPasswordMatch"
              :placeholder="$t('table.user.form.fields.confirmPassword.placeholder')"
              clearable
            />
          </el-form-item>
          <el-form-item :label="$t('table.user.form.fields.sex.title')">
            <el-radio-group v-model="newUser.sex">
              <el-radio :size="store.size" :value="0">{{ $t('table.user.form.fields.male.title') }}</el-radio>
              <el-radio :size="store.size" :value="1">{{ $t('table.user.form.fields.female.title') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('table.user.form.fields.birthday.title')">
            <el-date-picker
              v-model="newUser.birthday_model"
              :size="store.size"
              type="datetime"
              :placeholder="$t('table.user.form.fields.birthday.placeholder')"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
            />
          </el-form-item>
          <el-form-item :label="$t('table.user.form.fields.description.title')">
            <el-input
              v-model="newUser.description"
              :size="store.size"
              maxlength="255"
              :placeholder="$t('table.user.form.fields.description.placeholder')"
              show-word-limit
              type="textarea"
              clearable
            />
          </el-form-item>
        </el-form>
        <div class="dialog-footer">
          <el-button :size="store.size" @click="dialogFormVisible = false">
            {{ t('table.general.cancel') }}
          </el-button>
          <el-button :size="store.size" type="primary" @click="createUser(refUserForm)">
            {{ t('table.general.confirm') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog v-model="dialogPermissionVisible" :title="$t('permission.table.edit.user') + ' - ' + currentUserName">
      <div v-if="currentUserName" v-loading="dialogPermissionLoading" class="form-container">
        <div class="permissions-container">
          <div class="block">
            <el-form :model="currentUser" label-width="80px" label-position="top">
              <el-form-item :label="$t('permission.table.userPermissions.name.menu')">
                <el-tree
                  ref="refMenuPermissions"
                  :data="normalizedMenuPermissions"
                  :default-checked-keys="permissionKeys(userMenuPermissions)"
                  :props="permissionProps"
                  show-checkbox
                  node-key="id"
                  class="permission-tree"
                />
              </el-form-item>
            </el-form>
          </div>
          <div class="block">
            <el-form :model="currentUser" label-width="80px" label-position="top">
              <el-form-item :label="$t('permission.table.userPermissions.name.permissions')">
                <el-tree
                  ref="refOtherPermissions"
                  :data="normalizedOtherPermissions"
                  :default-checked-keys="permissionKeys(userOtherPermissions)"
                  :props="permissionProps"
                  show-checkbox
                  node-key="id"
                  class="permission-tree"/>
              </el-form-item>
            </el-form>
          </div>
          <div class="clear-left" />
        </div>
        <div style="text-align:right;">
          <el-button :size="store.size" type="danger" @click="dialogPermissionVisible=false">
            {{ t('permission.actions.cancel') }}
          </el-button>
          <el-button :size="store.size" type="primary" @click="confirmPermission">
            {{ t('permission.actions.confirm') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </el-card>
</template>
<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, ElLoading, ElCard } from 'element-plus'
import { Search, Plus, Refresh, Filter } from '@element-plus/icons-vue'
import CustomTable from '@/components/CustomTable.vue'
import SvgItem from "@/components/Item/SvgItem.vue"
import UserResource from '@/api/user'
import Resource from '@/api/resource'
import checkPermission from '@/utils/permission'
import { uppercaseFirst } from "@/utils"
import createValidators from '@/utils/validators'
import { appStore } from '@/store/app'
import { userStore } from "@/store/user"
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { debounce } from 'lodash-es'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const userResource = new UserResource()
const permissionResource = new Resource('permissions')
const store = appStore()
const useUserStore = userStore()

// Реактивные переменные
const loading = ref(true)
const tableData = ref([])
const dialogFormVisible = ref(false)
const dialogPermissionVisible = ref(false)
const dialogPermissionLoading = ref(false)
const userCreating = ref(false)
const validationStatus = ref('')
const errorMessage = ref('')
const filters = ref({
  search: '',
  roles: [],
  singleRole: ''
})
const pagination = reactive({
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1
})
const newUser = reactive({
  role: 'user',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  sex: 0,
  birthday_model: null,
  description: ''
})

// Валидатор подтверждения пароля
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== newUser.password) {
    callback(new Error(t('validation.rules.confirmPassword.mismatched')))
  } else {
    callback() // Автоматически установит статус 'success'
  }
}

const checkPasswordMatch = (value) => {
  if (value.length > 6) {
    validationStatus.value = 'success'
    errorMessage.value = ''
  } else {
    validationStatus.value = 'error'
    errorMessage.value = t('validation.general.minLength')
  }
}

const currentUser = ref({
  id: 0,
  name: '',
  permissions: {
    role: [],
    user: []
  }
})

// Инициализируем валидаторы с доступом к форме
const v = createValidators(newUser)

// Каскадная валидация
const complexValidator = (rule, value, callback) => {
  if (value === 'admin') {
    callback(new Error(t('validation.general.notNameAdmin') + ' ' + value))
  } else {
    v.minLength(2).validator(rule, value, callback)
  }
}

// Правила валидации
const rules = {
  name: [
    v.required(),
    v.minLength(2),
    { validator: complexValidator, trigger: 'change' } // не писать admin
  ],
  email: [v.required(), v.email()],
  password: [
    v.required(),
    v.minLength(6),
    v.notMatch('email', t('validation.general.passwordNotEmail')), // Пароль != email
    v.notMatch('name', t('validation.general.passwordNotName'))    // Пароль != name
  ],
  confirmPassword: [
    v.required(),
    v.match('password', t('validation.general.matchPassword')) // Совпадение с паролем
  ]
}

// Refs для элементов форм
const refUserForm = ref(null)
const refMenuPermissions = ref(null)
const refOtherPermissions = ref(null)

// Конфигурация ролей
const roleConfig = ref({
  // Все доступные роли
  all: ['superadmin', 'admin', 'manager', 'editor', 'user', 'visitor'],
  // Роли без админа (для ограничения действий)
  nonAdmin: ['manager', 'editor', 'user', 'visitor'],
  // Цвета для тегов
  colors: {
    superadmin: 'danger',
    admin: 'danger',
    manager: 'warning',
    editor: 'primary',
    user: 'success',
    visitor: 'info'
  },
  // Метод получения цвета по роли
  getColor(role) {
    return this.colors[role] || 'info'
  }
})

const roles = computed(() => roleConfig.value.all)
const nonAdminRoles = computed(() => roleConfig.value.nonAdmin)
const roleColors = computed(() => roleConfig.value.colors)
const per_pages = ref([5, 10, 30, 50, 100, 150, 200])

const tableOption = computed(() => {
  if (!checkPermission(['manage user'])) return {}
  const actions = [
    { name: 'edit-item', type: 'primary', icon: 'EditPen', size: 'small', round: true },
    { name: 'delete-item', type: 'danger', icon: 'Delete', size: 'small', round: false },
  ]
  if (checkPermission(['manage permission'])) {
    actions.push({
      name: 'edit-permission-item',
      type: 'warning',
      icon: 'Finished',
      width: 100,
      label: t('permission.actions.editPermission'),
      size: 'small',
      round: true
    })
  }
  return {
    slot: true,
    width: '250',
    label: t('table.general.actions'),
    fixed: 'right',
    item_actions: actions
  }
})

// Метод фильтрации
const filterRole = (value, row) => {
  console.log('value ', value)
  console.log('row ', row)
  return row.roles.includes(value)
}

const basicColumn = computed(() => [
  { prop: 'id', label: t('table.user.columns.id'), width: '65', resizable: false, sortable: true, fixed: true },
  { prop: 'name', label: t('table.user.columns.name'), width: '130', sortable: true, fixed: true },
  { prop: 'email', label: t('table.user.columns.email'), sortable: true },
  {
    prop: 'roles',
    label: t('table.user.columns.role'),
    width: '110',
    slot: true,
    columnKey: 'roles',
    filters: roles.value.map(role => ({
      text: role.toUpperCase(),
      value: role,
      style: { color: roleConfig.value.getColor(role) }
    })),
    filterMethod: (value, row) => row.roles.includes(value),
    filterPlacement: 'bottom-end',
    filteredValue: allSelectedRoles.value
  },
])

// Обработка ошибок
const handleError = (error) => {
  console.error('Error details:', {
    url: error.config?.url,
    status: error.response?.status,
    data: error.response?.data
  })
  ElMessage.error(
      error.response?.data?.message ||
      error.message ||
      'Ошибка загрузки данных'
  )
}

// Остальные методы без изменений
const handleSizeChange = (size) => {
  pagination.per_page = size
  pagination.current_page = 1
  getList()
}

const handlePageChange = (newPage) => {
  pagination.current_page = newPage
  getList()
}

// Открытие фильтра
const openFilter = (column) => {
  const header = document.querySelector(`.${column.id}`)
  const popper = header?.querySelector('.el-table-filter')
  if (popper) {
    const isHidden = popper.style.display === 'none'
    popper.style.display = isHidden ? 'block' : 'none'
  }
}

// Пример использования в тегах
const roleTags = (roles) => roles.map(role => ({
  role,
  color: roleConfig.value.getColor(role)
}))

// Пример использования в условиях
const isAdmin = (userRoles) =>
    ['superadmin', 'admin'].some(role => userRoles.includes(role))

// Методы фильтрации
const handleSearchInput = debounce(() => {
  getList()
}, 500)

// Добавляем вычисляемые свойства
const allSelectedRoles = computed(() => {
  const roles = []
  if (filters.value.singleRole) roles.push(filters.value.singleRole)
  roles.push(...filters.value.roles)
  console.log('roles ', roles)
  return [...new Set(roles)]
})

const disabledRoles = computed(() => filters.value.roles)

const handleSingleRoleSelect = (role) => {
  console.log('role ', role)
  if (filters.value.roles.includes(role)) {
    // Если роль уже выбрана в таблице - отмена выбора
    filters.value.singleRole = ''
    return
  }
  filters.value.roles = role ? [role] : []
  getList()
}

const handleTableFilter = (columnFilters) => {
  if (columnFilters.roles) {
    // Синхронизация с селектом
    filters.value.roles = columnFilters.roles
    filters.value.singleRole = columnFilters.roles.length === 1
        ? columnFilters.roles[0]
        : ''
  }
  getList()
}

const resetFilters = () => {
  filters.value = { search: '', roles: [], singleRole: '' }
  pagination.current_page = 1
  getList()
}

// Методы
const getList = async () => {
  loading.value = true
  try {
    const params = {
      search: filters.value.search || null,
      role: allSelectedRoles.value || null,
      page: pagination.current_page || 1,
      per_page: pagination.per_page || 10
    }
    const response = await userResource.list(params)
    console.log('response ', response)
    tableData.value = response.items || []
    pagination.total = response.meta.total
    pagination.currentPage = response.meta.current_page
    pagination.pageSize = response.meta.per_page
    pagination.last_page = response.meta.last_page
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

const handleFilterChange = (columnKey, values) => {
  filters.value.roles = values
  getList()
}

const handleFilter = () => {
  pagination.current_page = 1
  getList()
}

const handleFilterReset = () => {
  console.log('Сброс фильтра')
  handleFilter()
}

const handleCreate = () => {
  resetNewUser()
  dialogFormVisible.value = true
}

const resetNewUser = () => {
  Object.assign(newUser, {
    role: 'user',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    sex: 0,
    birthday_model: null,
    description: ''
  })
}

// Добавьте эти объявления
const permissions = ref([])
const menuPermissions = ref([])
const otherPermissions = ref([])
const currentUserId = ref(0)
const currentUserName = ref('')
const currentUserRole = ref([])

// Работа с правами
const getPermissions = async () => {
  try {
    const { data } = await permissionResource.list({})
    console.log('permissionResource data:', data)
    const { all, menu, other } = classifyPermissions(data)
    console.log('classifyPermissions all menu other:', all, menu, other)
    permissions.value = all
    menuPermissions.value = menu
    otherPermissions.value = other
  } catch (error) {
    console.error('Ошибка загрузки разрешений:', error)
    let message = t('error.loadPermissions')
    if (error.response?.data?.message) {
      message += `: ${error.response.data.message}`
    } else if (error.message) {
      message += `: ${error.message}`
    }
    ElMessage.error(message)
  }
}

/**
 * Классификация разрешений на группы
 * @param {Array} permissions - Список разрешений
 */
const classifyPermissions = (permissions) => {
  const result = { all: [], menu: [], other: [] }
  permissions.forEach(permission => {
    const permissionName = permission.name || permission
    result.all.push(permission)
    if (permissionName.startsWith('view menu ')) {
      result.menu.push(normalizeMenuPermission(permission))
    } else {
      result.other.push(normalizePermission(permission))
    }
  })
  return result
}

// Нормализация разрешений для меню
const normalizeMenuPermission = (permission) => ({
  id: permission.id,
  name: uppercaseFirst(permission.name.replace('view menu ', '')),
  disabled: permission.disabled || false
})

// Нормализация обычных разрешений
const normalizePermission = (permission) => ({
  id: permission.id,
  name: uppercaseFirst(permission.name),
  disabled: permission.disabled || permission.name === 'manage permission'
});

// Обработчик действий таблицы
const tableActions = (action, row) => {
  switch (action) {
    case 'edit-item':
      router.push(`/administrator/users/edit/${row.id}`)
      break
    case 'delete-item':
      handleDeleteUser(row)
      break
    case 'edit-permission-item':
      handleEditPermissions(row)
      break
    default:
      console.warn('Неизвестное действие:', action)
  }
}

// Обработчик удаления пользователя
const handleDeleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
        t('table.user.elMessageBox.confirm1.message@j', { name: user.name }),
        t('table.user.elMessageBox.deleteTitle'),
        {
          confirmButtonText: t('table.user.elMessageBox.confirmButtonText'),
          cancelButtonText: t('table.user.elMessageBox.cancelButtonText'),
          dangerouslyUseHTMLString: true,
          type: 'warning'
        }
    )
    await userResource.destroy(user.id)
    ElMessage.success(t('table.user.elMessage.delete.success.message'))
    await getList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('table.user.elMessage.delete.error.message'))
    }
  }
}

// Полный код обработки прав
const handleEditPermissions = async (user) => {
  try {
    console.log('Starting handleEditPermissions for user:', user)
    let { data } = await userResource.permissions(user.id)
    console.log('Fetched user permissions:', data)
    if (!data || typeof data !== 'object') {
      console.error('handleEditPermissions: data is not an object:', data)
      data = { user: [], role: [] }
    }

    currentUser.value = {
      ...user,
      permissions: data
    }
    currentUserId.value = user.id
    currentUserName.value = user.name
    currentUserRole.value = user.roles
    dialogPermissionLoading.value = true
    dialogPermissionVisible.value = true
    console.log('Setting currentUser:', currentUser.value)
    dialogPermissionVisible.value = true
    nextTick(() => {
      console.log('userMenuPermissions:', userMenuPermissions.value)
      console.log('userOtherPermissions:', userOtherPermissions.value)
      console.log('permissionKeys(userMenuPermissions):', permissionKeys(userMenuPermissions.value))
      console.log('permissionKeys(userOtherPermissions):', permissionKeys(userOtherPermissions.value))
      refMenuPermissions.value?.setCheckedKeys(permissionKeys(userMenuPermissions.value))
      refOtherPermissions.value?.setCheckedKeys(permissionKeys(userOtherPermissions.value))
    })
  } catch (error) {
    console.error('Error in handleEditPermissions:', error)
    ElMessage.error(t('error.loadPermissions'))
  } finally {
    dialogPermissionLoading.value = false
  }
}

const permissionProps = reactive({
  children: 'children',
  label: 'name',
  disabled: 'disabled'
})

/*const userMenuPermissions = computed(() => {
  if (!currentUser.value || !currentUser.value.permissions?.role) return []
  return classifyPermissions(currentUser.value.permissions.role).menu
})

const userOtherPermissions = computed(() => {
  if (!currentUser.value || !currentUser.value.permissions?.role) return []
  return classifyPermissions(currentUser.value.permissions.role).other
})*/

const userMenuPermissions = computed(() => {
  if (!currentUser.value?.permissions?.role) return []
  let tmp = currentUser.value.permissions.role.map(permission => ({
    ...permission,
    disabled: true
  }))
  console.log('userMenuPermissions tmp ', tmp)
  return tmp
})

const userOtherPermissions = computed(() => {
  if (!currentUser.value?.permissions?.role) return []
  let tmp = currentUser.value.permissions.role.map(permission => ({
    ...permission,
    disabled: true
  }))
  console.log('userMenuPermissions tmp ', tmp)
  return tmp
})

const normalizedMenuPermissions = computed(() => {
  let tmp = []
  const rolePermissions = {
    id: -1,
    name: t('permission.table.rolePermissions.name'),
    disabled: true,
    children: classifyPermissions(userMenuPermissions.value).menu,
  }
  tmp = menuPermissions.value.filter(permission => !currentUser.value.permissions.user.find(p => p.id === permission.id))
  console.log('normalizedMenuPermissions tmp ', tmp)
  const userPermissions = {
    id: 0,
    name: t('permission.table.userPermissions.name.menu'),
    children: tmp,
    disabled: tmp.length === 0,
  }
  console.log('normalizedMenuPermissions:', [rolePermissions, userPermissions])
  return [rolePermissions, userPermissions]
})

const normalizedOtherPermissions = computed(() => {
  let tmp = []
  const rolePermissions = {
    id: -1,
    name: t('permission.table.rolePermissions.name'),
    disabled: true,
    children: classifyPermissions(userOtherPermissions.value).other
  }
  tmp = otherPermissions.value.filter(permission => !currentUser.value.permissions.user.find(p => p.id === permission.id))
  console.log('normalizedOtherPermissions tmp ', tmp)
  const userPermissions = {
    id: 0,
    name: t('permission.table.userPermissions.name.permissions'),
    children: tmp,
    disabled: tmp.length === 0,
  }
  console.log('normalizedOtherPermissions:', [rolePermissions, userPermissions])
  return [rolePermissions, userPermissions]
})

const createUser = async (formEl) => {
  if (!await formEl.validate()) return
  userCreating.value = true
  try {
    const userData = {
      ...newUser,
      roles: [newUser.role],
      birthday: newUser.birthday_model
          ? dayjs(newUser.birthday_model).format('YYYY-MM-DD HH:mm:ss')
          : null
    }
    await userResource.store(userData)
    ElMessage.success(t('table.user.elMessage.created.success.message'))
    dialogFormVisible.value = false
    await getList()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || t('table.user.elMessage.created.success.error'))
  } finally {
    userCreating.value = false
  }
}

const confirmPermission = async () => {
  try {
    const checkedMenu = refMenuPermissions.value.getCheckedKeys()
    const checkedOther = refOtherPermissions.value.getCheckedKeys()
    const selectedPermissions = [...checkedMenu, ...checkedOther];

    dialogPermissionLoading.value = true
    console.log('Checked menu permissions:', checkedMenu)
    console.log('Checked other permissions:', checkedOther)
    console.log('currentUser.value.id:', currentUser.value.id)
    await userResource.updatePermission(currentUser.value.id, {
      permissions: selectedPermissions
    });
    ElMessage.success(t('success.permissionsUpdated'))
    dialogPermissionLoading.value = false
    await getList()
  } catch (error) {
    console.error('Error in confirmPermission:', error)
    ElMessage.error(error.response?.data?.message || t('error.updatePermissions'))
  } finally {
    dialogPermissionVisible.value = false
    dialogPermissionLoading.value = false
  }
}

// Получение ID разрешений
const permissionKeys = (permissions) =>
    permissions.map(p => p.id)

const tableHeight = ref('calc(100vh - 1000px)')

function updateTableHeight() {
  const breadHeight = 50 // Высота вашего заголовка
  const tagHeight = 50 // Высота вашего заголовка
  const headerHeight = 140 // Высота вашего заголовка
  const paginationHeight = 60 // Высота пагинации
  const offset = 30 // Дополнительные отступы
  tableHeight.value = `calc(100vh - ${breadHeight + tagHeight + headerHeight + paginationHeight + offset}px)`
}

// Инициализация
onMounted(async () => {
  pagination.per_page = 20
  updateTableHeight()
  window.addEventListener('resize', updateTableHeight)
  await getList()
  // Убрали проверку блокировки manage permission
  await getPermissions()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateTableHeight)
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
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
.dialog-footer {
  text-align: left;
  padding-top: 0;
  margin-left: 150px;
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
      width: 110px;
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
