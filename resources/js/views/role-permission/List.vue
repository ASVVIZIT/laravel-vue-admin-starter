<template>
  <div class="app-container scroll-y">
    <custom-table :table-data="tableData" :table-column="basicColumn" :table-option="tableOption"
                  :pagination="pagination" :paginate="true" :page-sizes="pageSizes" :loading="loading"
                  @table-action="tableActions" @set-params="setParams">
      <template #name="scope">
        <span>{{ uppercaseFirst(scope.row.name) }}</span>
      </template>
      <template #table_options="scope">
        <div v-if="scope.row.name !== 'admin'">
          <el-button v-for="(action, index) in tableOption.item_actions"
                     :type="action.type ? action.type : 'primary'"
                     :size="action.size ? action.size : ''"
                     @click="tableActions(action.name, scope.row)">
            <el-svg-item :el-svg-name="action.icon" :title="action.label"></el-svg-item>
          </el-button>
        </div>
      </template>
    </custom-table>

    <el-dialog v-model="dialogVisible" :title="'Edit Permissions - ' + currentRole.name">
      <div v-loading="dialogLoading" class="form-container">
        <div class="permissions-container">
          <div class="block">
            <el-form :model="currentRole" label-width="80px" label-position="top">
              <el-form-item label="Menus">
                <el-tree ref="refMenuPermissions" :data="menuPermissions"
                         :default-checked-keys="permissionKeys(roleMenuPermissions)" :props="permissionProps"
                         show-checkbox node-key="id" class="permission-tree"/>
              </el-form-item>
            </el-form>
          </div>
          <div class="block">
            <el-form :model="currentRole" label-width="80px" label-position="top">
              <el-form-item label="Permissions">
                <el-tree ref="refOtherPermissions" :data="otherPermissions"
                         :default-checked-keys="permissionKeys(roleOtherPermissions)" :props="permissionProps"
                         show-checkbox node-key="id" class="permission-tree"/>
              </el-form-item>
            </el-form>
          </div>
          <div class="clear-left"/>
        </div>
        <div style="text-align:right;">
          <el-button type="danger" @click="dialogVisible=false">
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
// Импорты Vue и сторонних библиотек / Vue and third-party library imports
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

// Компоненты / Components
import CustomTable from '@/components/CustomTable.vue'
import ElSvgItem from "@/components/Item/ElSvgItem.vue"

// API и утилиты / API and utilities
import Resource from '@/api/resource'
import RoleResource from '@/api/role'
import { uppercaseFirst } from '@/utils'
// import { checkPermission } from '@/utils/permission'

// Инициализация i18n / Initialize i18n
const { t } = useI18n({ useScope: 'global' })

// Инициализация сторов Pinia / Initialize Pinia stores
const userStore = useUserStore()

// Реактивные ссылки для элементов DOM / Reactive refs for DOM elements
const refMenuPermissions = ref(null)
const refOtherPermissions = ref(null)

// API ресурсы / API resources
const roleResource = new RoleResource()
const permissionResource = new Resource('permissions')

// Реактивное состояние компонента / Component reactive state
const state = reactive({
    loading: true,
    dialogVisible: false,
    dialogLoading: false,
    currentRole: {},
    permissions: [],
    menuPermissions: [],
    otherPermissions: [],
    tableData: [],
    params: {
        page: 1,
        per_page: 10,
        keyword: '',
        role: '',
    },
    pagination: {
        total: 0,
        currentPage: 1,
        pageSize: 10
    },
    permissionProps: {
        children: 'children',
        label: 'name',
        disabled: 'disabled',
    },
})

// Константы и вычисляемые свойства / Constants and computed properties
const pageSizes = [10, 20, 50, 100]
const basicColumn = computed(() => [
    {
        prop: 'name',
        label: t('roles.name'),
        width: '150'
    },
    {
        prop: 'description',
        label: t('table.description'),
    }
])

const tableOption = computed(() => ({
    slot: true,
    label: t('table.actions'),
    fixed: 'right',
    item_actions: userStore.permissions.includes('manage user')
        ? [
            { name: 'edit-item', type: 'primary', icon: 'EditPen', label: t('permission.editPermission') }
        ]
        : []
}))

// Вычисление прав роли / Compute role permissions
const roleMenuPermissions = computed(() => {
    if (!state.currentRole.permissions) return []
    return classifyPermissions(state.currentRole.permissions).menu
})

const roleOtherPermissions = computed(() => {
    if (!state.currentRole.permissions) return []
    return classifyPermissions(state.currentRole.permissions).other
})

// Основные функции / Main functions
const getRoles = async () => {
    state.loading = true
    try {
        const res = await roleResource.list(state.params)
        res.data.forEach(role => {
            role.description = t(`roles.description.${role.name}`)
        })
        state.tableData = res.data
        state.pagination = res.meta
    } finally {
        state.loading = false
    }
}

const getPermissions = async () => {
    const { data } = await permissionResource.list({})
    const classified = classifyPermissions(data)
    state.permissions = classified.all
    state.menuPermissions = classified.menu
    state.otherPermissions = classified.other
}

// Классификация прав / Permissions classification
const classifyPermissions = (permissions) => {
    const all = []
    const menu = []
    const other = []

    permissions.forEach(permission => {
        all.push(permission)
        permission.name.startsWith('view menu')
            ? menu.push(normalizeMenuPermission(permission))
            : other.push(normalizePermission(permission))
    })

    return { all, menu, other }
}

// Нормализация прав меню / Normalize menu permissions
const normalizeMenuPermission = (permission) => ({
    id: permission.id,
    name: uppercaseFirst(permission.name.substring(10))
})

// Нормализация обычных прав / Normalize regular permissions
const normalizePermission = (permission) => ({
    id: permission.id,
    name: uppercaseFirst(permission.name),
    disabled: permission.name === 'manage permission'
})

// Обработчики событий / Event handlers
const tableActions = (action, data) => {
    if (action === 'edit-item') handleEditPermissions(data)
}

const handleEditPermissions = (data) => {
    state.dialogVisible = true
    state.currentRole = data
    nextTick(() => {
        refMenuPermissions.value?.setCheckedKeys(permissionKeys(roleMenuPermissions.value))
        refOtherPermissions.value?.setCheckedKeys(permissionKeys(roleOtherPermissions.value))
    })
}

const confirmPermission = async () => {
    try {
        state.dialogLoading = true
        const checkedPermissions = [
            ...refMenuPermissions.value.getCheckedKeys(),
            ...refOtherPermissions.value.getCheckedKeys()
        ]

        await roleResource.update(state.currentRole.id, { permissions: checkedPermissions })
        ElMessage.success(t('permission.updateSuccess'))
        state.dialogVisible = false
        await getRoles()
    } finally {
        state.dialogLoading = false
    }
}

// Вспомогательные функции / Helper functions
const permissionKeys = (permissions) => permissions.map(p => p.id)
const setParams = (key, value) => {
    if (key !== 'per_page' && key !== 'page') state.params.page = 1
    state.params[key] = value
    getRoles()
}

// Хуки жизненного цикла / Lifecycle hooks
onMounted(() => {
    getRoles()
    getPermissions()
})
</script>

<style lang="scss" scoped>
.permissions-container {
  flex: 1;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;

  .block {
    float: left;
    min-width: 250px;
  }

  .clear-left {
    clear: left;
  }
}
</style>
