<template>
  <div class="app-container scroll-y">
    <div class="filter-container">
      <el-input
          v-model="params.keyword"
          :placeholder="$t('user.name') + '/' + $t('user.email')"
          clearable
          class="filter-item search-filter-item"
          @keyup.enter.native="handleFilter"/>
      <el-select
          v-model="params.role"
          :placeholder="$t('roles.name')"
          clearable
          class="filter-item select-role-filter-item"
          @change="handleFilter">
        <el-option v-for="item in roles" :key="item" :label="uppercaseFirst(item)" :value="item"/>
      </el-select>
      <el-button class="filter-item" type="primary" :icon="Search" @click="handleFilter">
        {{ t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="primary" :icon="Plus"  @click="handleCreate">
        {{ t('table.add') }}
      </el-button>
    </div>

    <custom-table :table-data="tableData" :table-column="basicColumn" :table-option="tableOption"
                  :pagination="pagination" :paginate="true" :page-sizes="pageSizes" :loading="loading"
                  @table-action="tableActions" @set-params="setParams">
      <template #roles="{ row }">
        <span>{{ row.roles.join(', ') }}</span>
      </template>
      <template #table_options="scope">
        <div v-if="!scope.row.roles.includes('admin')">
          <el-button v-for="(action, index) in tableOption.item_actions"
                     :type="action.type ? action.type : 'primary'"
                     :size="action.size ? action.size : ''"
                     @click="tableActions(action.name, scope.row)">
            <el-svg-item :el-svg-name="action.icon" :title="action.label"></el-svg-item>
          </el-button>
        </div>
      </template>
    </custom-table>

    <el-dialog :title="$t('table.form.create.user')" v-model="dialogFormVisible">
      <div v-loading="userCreating" class="form-container">
        <el-form
            ref="refUserForm"
            :rules="rules"
            :model="newUser"
            label-position="right"
            label-width="170px"
            style="max-width: 600px;">
          <el-form-item :label="$t('user.role')" prop="role">
            <el-select v-if="roles.includes('admin')" v-model="newUser.role" class="filter-item" :placeholder="$t('table.form.create.role.select.placeholder')">
              <el-option v-for="item in roles" :key="item" :label="uppercaseFirst(item)" :value="item"/>
            </el-select>
            <el-select v-else-if="roles.includes('admin')" v-model="newUser.role" class="filter-item" :placeholder="$t('table.form.create.role.select.placeholder')">
                <el-option v-for="item in nonAdminRoles" :key="item" :label="uppercaseFirst(item)" :value="item"/>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('user.name')" prop="name">
            <el-input v-model="newUser.name"/>
          </el-form-item>
          <el-form-item :label="$t('user.email')" prop="email">
            <el-input v-model="newUser.email"/>
          </el-form-item>
          <el-form-item :label="$t('user.password')" prop="password">
            <el-input v-model="newUser.password" show-password/>
          </el-form-item>
          <el-form-item :label="$t('user.confirmPassword')" prop="confirmPassword">
            <el-input v-model="newUser.confirmPassword" show-password/>
          </el-form-item>
          <el-form-item :label="$t('user.sex')">
            <el-radio-group v-model="newUser.sex">
              <el-radio :value="0">{{ $t('user.male') }}</el-radio>
              <el-radio :value="1">{{ $t('user.female') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('user.birthday')">
          <el-config-provider :locale="locale">
            <el-date-picker
                v-model="newUser.birthday_model"
                type="datetime"
                :placeholder="$t('user.birthday')"
                value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-config-provider>
          </el-form-item>
          <el-form-item :label="$t('user.description')">
            <el-input
                v-model="newUser.description"
                maxlength="255"
                :placeholder="$t('user.description')"
                show-word-limit
                type="textarea"
            />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            {{ t('table.cancel') }}
          </el-button>
          <el-button type="primary" @click="createUser(refUserForm)">
            {{ t('table.confirm') }}
          </el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="dialogPermissionVisible" :title="$t('permission.table.edit.user') + ' - ' + currentUser.name">
      <div v-if="currentUser.name" v-loading="dialogPermissionLoading" class="form-container">
        <div class="permissions-container">
          <div class="block">
            <el-form :model="currentUser" label-width="80px" label-position="top">
              <el-form-item label="Menus">
                <el-tree ref="refMenuPermissions" :data="normalizedMenuPermissions"
                         :default-checked-keys="permissionKeys(userMenuPermissions)"
                         :props="permissionProps"
                         show-checkbox node-key="id" class="permission-tree"/>
              </el-form-item>
            </el-form>
          </div>
        <div class="block">
          <el-form :model="currentUser" label-width="80px" label-position="top">
            <el-form-item label="Permissions">
              <el-tree ref="refOtherPermissions" :data="normalizedOtherPermissions" :default-checked-keys="permissionKeys(userOtherPermissions)" :props="permissionProps" show-checkbox node-key="id" class="permission-tree" />
            </el-form-item>
          </el-form>
        </div>
        <div class="clear-left" />
        </div>
        <div style="text-align:right;">
          <el-button type="danger" @click="dialogPermissionVisible=false">
            {{ t('permission.cancel') }}
          </el-button>
          <el-button type="primary" @click="confirmPermission">
            {{ t('permission.confirm') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
// Импорты Vue и сторонних библиотек
// Imports from Vue and third-party libraries
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

// Компоненты
// Components
import CustomTable from '@/components/CustomTable.vue'
import ElSvgItem from "@/components/Item/ElSvgItem.vue"

// API и утилиты
// API and utilities
import UserResource from '@/api/user'
import Resource from '@/api/resource'
import checkPermission from '@/utils/permission'
import { uppercaseFirst } from '@/utils'
import ru from 'element-plus/dist/locale/ru.mjs'
import en from 'element-plus/dist/locale/en.mjs'

// Pinia хранилище
// Pinia store
import { useUserStore } from '@/store/user'

// Настройка i18n
// i18n setup
const { t } = useI18n({ useScope: 'global' })
const router = useRouter()

// Локализация Element Plus
// Element Plus localization
const language = ref('ru')
const locale = computed(() => language.value === 'ru' ? ru : en)

// Реактивные состояния
// Reactive states
const userStore = useUserStore()
const userResource = new UserResource()
const permissionResource = new Resource('permissions')

// Ссылки на элементы DOM и компоненты
// DOM element and component refs
const refUserForm = ref(null)
const refMenuPermissions = ref(null)
const refOtherPermissions = ref(null)

// Параметры таблицы и пагинации
// Table and pagination parameters
const params = reactive({
    page: 1,
    per_page: 10,
    keyword: '',
    role: '',
})

const pagination = reactive({
    total: 0,
    currentPage: 1,
    pageSize: 10
})

// Данные таблицы и фильтры
// Table data and filters
const tableData = ref([])
const loading = ref(true)
const roles = ['admin', 'manager', 'editor', 'user', 'visitor']
const nonAdminRoles = ['editor', 'user', 'visitor']
const pageSizes = [5, 10, 30, 50, 100, 150, 200]

// Настройки таблицы
// Table settings
const basicColumn = computed(() => [
    { prop: 'id', label: t('table.roleColumn.label.id'), width: '100' },
    { prop: 'name', label: t('table.roleColumn.label.name') },
    { prop: 'email', label: t('table.roleColumn.label.email') },
    { prop: 'roles', label: t('table.roleColumn.label.role'), width: '200', slot: true }
])

const tableOption = reactive({
    slot: true,
    label: t('table.actions'),
    fixed: 'right',
    item_actions: []
})

// Состояния формы создания пользователя
// User creation form states
const dialogFormVisible = ref(false)
const userCreating = ref(false)
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

// Правила валидации формы
// Form validation rules
const validateConfirmPassword = (rule, value, callback) => {
    if (value !== newUser.password) {
        callback(new Error(t('validateMassages.rules.confirmPassword.mismatched')))
    } else {
        callback()
    }
}

const rules = reactive({
    role: [{ required: true, message: t('validateMassages.rules.rule.required'), trigger: 'change' }],
    name: [{ required: true, message: t('validateMassages.rules.name.required'), trigger: 'blur' }],
    email: [
        { required: true, message: t('validateMassages.rules.email.required'), trigger: 'blur' },
        { type: 'email', message: t('validateMassages.rules.email.type') + ' ' + '(' + 'example@gmail.com' + ')', trigger: ['blur', 'change'] },
    ],
    password: [{ required: true, message: t('validateMassages.rules.password.required'), trigger: 'blur' }],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
})

// Состояния управления разрешениями
// Permission management states
const dialogPermissionVisible = ref(false)
const dialogPermissionLoading = ref(false)
const currentUserId = ref(0)
const currentUser = reactive({
    name: '',
    permissions: { role: [], user: [] }
})

const permissions = ref([])
const menuPermissions = ref([])
const otherPermissions = ref([])
const permissionProps = reactive({
    children: 'children',
    label: 'name',
    disabled: 'disabled',
})

// Вычисляемые свойства для разрешений
// Computed properties for permissions
const userPermissions = computed(() =>
    currentUser.permissions.role.concat(currentUser.permissions.user)
)

const userMenuPermissions = computed(() => {
    const { menu } = classifyPermissions(userPermissions.value)
    return menu
})

const userOtherPermissions = computed(() => {
    const { other } = classifyPermissions(userPermissions.value)
    return other
})

const normalizedMenuPermissions = computed(() => {
    const rolePermissions = {
        id: -1,
        name: t('permission.table.rolePermissions.name'),
        disabled: true,
        children: classifyPermissions(currentUser.permissions.role.map(p => ({
            id: p.id,
            name: p.name,
            disabled: true
        }))).menu
    }

    const userPermissions = {
        id: 0,
        name: t('permission.table.userPermissions.name.menu'),
        children: menuPermissions.value.filter(p =>
            !currentUser.permissions.role.some(rp => rp.id === p.id)
        ),
        disabled: menuPermissions.value.length === 0
    }

    return [rolePermissions, userPermissions]
})

const normalizedOtherPermissions = computed(() => {
    const rolePermissions = {
        id: -1,
        name: t('permission.table.rolePermissions.name'),
        disabled: true,
        children: classifyPermissions(currentUser.permissions.role.map(p => ({
            id: p.id,
            name: p.name,
            disabled: true
        }))).other
    }

    const userPermissions = {
        id: 0,
        name: t('permission.table.userPermissions.name.permissions'),
        children: otherPermissions.value.filter(p =>
            !currentUser.permissions.role.some(rp => rp.id === p.id)
        ),
        disabled: otherPermissions.value.length === 0
    }

    return [rolePermissions, userPermissions]
})

// Основные методы
// Main methods
const getList = async () => {
    loading.value = true
    try {
        const res = await userResource.list(params)
        tableData.value = res.data
        Object.assign(pagination, res.meta)
    } finally {
        loading.value = false
    }
}

const handleFilter = () => {
    params.page = 1
    getList()
    refUserForm.value?.clearValidate()
}

const setParams = (key, value) => {
    if (key !== 'per_page' && key !== 'page') params.page = 1
    params[key] = value
    getList()
}

const tableActions = (action, data) => {
    if (action === 'edit-item') {
        router.push(`/administrator/users/edit/${data.id}`)
    } else if (action === 'edit-permission-item') {
        handleEditPermissions(data)
    } else if (action === 'delete-item') {
        handleDelete(data)
    }
}

const handleDelete = (data) => {
    ElMessageBox.confirm(
        `${t('permission.table.elMessageBox.confirm1.message')} ${data.name}. ${t('permission.table.elMessageBox.continue')}`,
        t('permission.table.elMessageBox.warning'),
        {
            confirmButtonText: t('permission.table.elMessageBox.confirmButtonText'),
            cancelButtonText: t('permission.table.elMessageBox.cancelButtonText'),
            type: 'warning'
        }
    ).then(async () => {
        await userResource.destroy(data.id)
        ElMessage.success(t('permission.table.elMessage.delete.success.message'))
        handleFilter()
    }).catch(() => {
        ElMessage.info(t('permission.table.elMessage.delete.canceled.message'))
    })
}

const handleCreate = () => {
    resetNewUser()
    dialogFormVisible.value = true
}

const createUser = async (formEl) => {
    if (!formEl) return
    const valid = await formEl.validate()
    if (!valid) return

    try {
        userCreating.value = true
        const userData = {
            ...newUser,
            roles: [newUser.role],
            birthday: newUser.birthday_model ? dayjs(newUser.birthday_model).format('YYYY-MM-DD HH:mm:ss') : null
        }

        await userResource.store(userData)
        ElMessage.success(
            `${t('permission.table.elMessage.newUser.success.message.part1')} ${newUser.name} (${newUser.email}) ${t('permission.table.elMessage.newUser.success.message.part2')}`
        )
        dialogFormVisible.value = false
        handleFilter()
    } finally {
        userCreating.value = false
    }
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

const getPermissions = async () => {
    const { data } = await permissionResource.list({})
    const classified = classifyPermissions(data)
    permissions.value = classified.all
    menuPermissions.value = classified.menu
    otherPermissions.value = classified.other
}

const handleEditPermissions = async (user) => {
    currentUserId.value = user.id
    dialogPermissionLoading.value = true
    dialogPermissionVisible.value = true

    try {
        const { data } = await userResource.permissions(user.id)
        Object.assign(currentUser, {
            id: user.id,
            name: user.name,
            permissions: data
        })

        await nextTick()
        refMenuPermissions.value?.setCheckedKeys(permissionKeys(userMenuPermissions.value))
        refOtherPermissions.value?.setCheckedKeys(permissionKeys(userOtherPermissions.value))
    } finally {
        dialogPermissionLoading.value = false
    }
}

const confirmPermission = async () => {
    try {
        dialogPermissionLoading.value = true
        const checkedKeys = [
            ...refMenuPermissions.value.getCheckedKeys(),
            ...refOtherPermissions.value.getCheckedKeys()
        ]

        await userResource.updatePermission(currentUserId.value, { permissions: checkedKeys })
        ElMessage.success(t('permission.table.elMessage.confirmPermission.success.message'))
        dialogPermissionVisible.value = false
    } finally {
        dialogPermissionLoading.value = false
    }
}

// Вспомогательные функции
// Helper functions
const permissionKeys = permissions => permissions.map(p => p.id)

const classifyPermissions = (permissions) => {
    const all = []
    const menu = []
    const other = []

    permissions.forEach(p => {
        all.push(p)
        p.name.startsWith('view menu')
            ? menu.push(normalizeMenuPermission(p))
            : other.push(normalizePermission(p))
    })

    return { all, menu, other }
}

const normalizeMenuPermission = (p) => ({
    id: p.id,
    name: uppercaseFirst(p.name.substring(10)),
    disabled: p.disabled || false
})

const normalizePermission = (p) => ({
    id: p.id,
    name: uppercaseFirst(p.name),
    disabled: p.disabled || p.name === 'manage permission'
})

// Инициализация таблицы действий
// Initialize table actions
if (userStore.permissions?.includes('manage user')) {
    tableOption.item_actions = [
        { name: 'edit-item', type: 'primary', icon: 'EditPen', label: t('table.edit') },
        { name: 'delete-item', type: 'danger', icon: 'Delete', label: t('table.delete') }
    ]

    if (userStore.permissions?.includes('manage permission')) {
        tableOption.item_actions.push({
            name: 'edit-permission-item',
            type: 'warning',
            icon: 'EditPen',
            label: t('permission.editPermission')
        })
    }
}

// Хук жизненного цикла
// Lifecycle hook
onMounted(() => {
    getList()
    if (checkPermission(['manage permission'])) {
        getPermissions()
    }
})
</script>

<style lang="scss" scoped>
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
  padding-right: 8px;

  .filter-container {

      .filter-item.search-filter-item {
          width: 220px;
          margin-right: 5px;
      }
      .filter-item.select-role-filter-item {
          width: 110px;
          margin-right: 5px;
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
