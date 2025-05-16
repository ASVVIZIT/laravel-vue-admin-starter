<template>
  <div class="app-container scroll-y">
    <custom-table
        :table-data="tableData"
        :table-column="basicColumn"
        :table-option="tableOption"
        :pagination="pagination"
        :paginate="true"
        :page-sizes="pageSizes"
        :loading="loading"
        @table-action="tableActions"
        @set-params="setParams"
    >
      <template #name="scope">
        <span>{{ uppercaseFirst(scope.row.name) }}</span>
      </template>

      <template #table_options="scope">
        <div v-if="!['admin', 'superadmin'].includes(scope.row.name)">
          <el-button
              v-for="(action, index) in tableOption.item_actions"
              :key="index"
              :type="action.type || 'primary'"
              @click="tableActions(action.name, scope.row)"
          >
            <el-svg-item
                :el-svg-name="action.icon"
                :title="action.label"
            />
          </el-button>
        </div>
      </template>
    </custom-table>

    <!-- Диалог редактирования прав -->
    <el-dialog
        v-model="dialogVisible"
        :title="$t('permission.editPermissionForForm') + ' - ' + currentRole.name"
    >
      <div v-loading="dialogLoading" class="form-container">
        <div class="permissions-container">
          <div class="block">
            <el-form :model="currentRole" label-position="top">
              <el-form-item :label="$t('permission.table.userPermissions.name.menu')">
                <el-tree
                    ref="refMenuPermissions"
                    :data="menuPermissions"
                    :default-checked-keys="permissionKeys(roleMenuPermissions)"
                    :props="permissionProps"
                    show-checkbox
                    node-key="id"
                    class="permission-tree"
                />
              </el-form-item>
            </el-form>
          </div>

          <div class="block">
            <el-form :model="currentRole" label-position="top">
              <el-form-item :label="$t('permission.table.userPermissions.name.permissions')">
                <el-tree
                    ref="refOtherPermissions"
                    :data="otherPermissions"
                    :default-checked-keys="permissionKeys(roleOtherPermissions)"
                    :props="permissionProps"
                    show-checkbox
                    node-key="id"
                    class="permission-tree"
                />
              </el-form-item>
            </el-form>
          </div>

          <div class="clear-left"/>
        </div>

        <div class="dialog-footer">
          <el-button type="danger" @click="dialogVisible = false">
            {{ t('permission.cancel') }}
          </el-button>
          <el-button
              type="primary"
              :loading="dialogLoading"
              @click="confirmPermission"
          >
            {{ t('permission.confirm') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import CustomTable from '@/components/CustomTable.vue'
import ElSvgItem from "@/components/Item/ElSvgItem.vue"
import Resource from '@/api/resource'
import RoleResource from '@/api/role'
import checkPermission from '@/utils/permission'
import {useI18n} from "vue-i18n"
import {uppercaseFirst} from "../../utils"
import {userStore} from "../../store/user"
import {ElMessage} from "element-plus"

// Инициализация локализации
const { t } = useI18n({ useScope: 'global' })

// API клиенты
const roleResource = new RoleResource()
const permissionResource = new Resource('permissions')

// Стор пользователя
const useUserStore = userStore()

// Реактивные ссылки на элементы деревьев
const refMenuPermissions = ref(null)
const refOtherPermissions = ref(null)

// Основные данные таблицы
const tableData = ref([])
const loading = ref(true)
const pageSizes = ref([10, 20, 50])

// Пагинация и параметры запроса
const pagination = reactive({
  total: 0,
  currentPage: 1,
  pageSize: 10
})

const params = reactive({
  page: 1,
  per_page: 10,
  keyword: '',
  role: '',
})

// Данные для диалога редактирования
const dialogVisible = ref(false)
const dialogLoading = ref(false)
const currentRole = ref({})
const menuPermissions = ref([])
const otherPermissions = ref([])

// Конфигурация колонок таблицы
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

// Настройки действий таблицы
const tableOption = computed(() => {
  if (useUserStore.permissions.includes('manage user')) {
    return {
      slot: true,
      label: t('table.actions'),
      fixed: 'right',
      item_actions: [
        {name: 'edit-item', type: 'primary', icon: 'EditPen', label: t('permission.editPermission')},
      ]
    }
  }
  return {}
})

// Конфигурация дерева разрешений
const permissionProps = reactive({
  children: 'children',
  label: 'name',
  disabled: 'disabled'
})

// Вычисление текущих разрешений для меню
const roleMenuPermissions = computed(() =>
    currentRole.value.permissions
        ? classifyPermissions(currentRole.value.permissions).menu
        : []
)

// Вычисление текущих общих разрешений
const roleOtherPermissions = computed(() =>
    currentRole.value.permissions
        ? classifyPermissions(currentRole.value.permissions).other
        : []
)

/**
 * Загрузка списка ролей с сервера
 */
const getRoles = async () => {
  loading.value = true
  try {
    const res = await roleResource.list(params)
    res.data.forEach(role => {
      role.description = t(`roles.description.${role.name}`)
    })
    tableData.value = res.data
    pagination.total = res.meta.total
    pagination.currentPage = res.meta.current_page
    pagination.pageSize = res.meta.per_page
  } finally {
    loading.value = false
  }
}

/**
 * Обработчик действий таблицы
 * @param {string} action - Тип действия
 * @param {object} data - Данные строки
 */
const tableActions = (action, data) => {
  if (action === 'edit-item') {
    handleEditPermissions(data)
  }
}

/**
 * Загрузка разрешений с сервера
 */
const getPermissions = async () => {
  const { data } = await permissionResource.list({})
  const { menu, other } = classifyPermissions(data)
  menuPermissions.value = menu
  otherPermissions.value = other
}

/**
 * Классификация разрешений на группы
 * @param {Array} permissions - Список разрешений
 */
const classifyPermissions = (permissions) => {
  const result = { all: [], menu: [], other: [] }

  permissions.forEach(permission => {
    result.all.push(permission)
    permission.name.startsWith('view menu')
        ? result.menu.push(normalizeMenuPermission(permission))
        : result.other.push(normalizePermission(permission))
  })

  return result
}

/**
 * Нормализация разрешений для меню
 */
const normalizeMenuPermission = (permission) => ({
  id: permission.id,
  name: uppercaseFirst(permission.name.substring(10))
})

/**
 * Нормализация обычных разрешений
 */
const normalizePermission = (permission) => ({
  id: permission.id,
  name: uppercaseFirst(permission.name),
  disabled: permission.name === 'manage permission'
})

/**
 * Получение списка ID разрешений
 */
const permissionKeys = permissions => permissions.map(p => p.id)

/**
 * Открытие диалога редактирования разрешений
 */
const handleEditPermissions = (data) => {
  currentRole.value = data
  dialogVisible.value = true
  nextTick(() => {
    refMenuPermissions.value?.setCheckedKeys(permissionKeys(roleMenuPermissions.value))
    refOtherPermissions.value?.setCheckedKeys(permissionKeys(roleOtherPermissions.value))
  })
}

/**
 * Подтверждение изменения разрешений
 */
const confirmPermission = async () => {
  dialogLoading.value = true
  try {
    const checked = [
      ...refMenuPermissions.value.getCheckedKeys(),
      ...refOtherPermissions.value.getCheckedKeys()
    ]

    await roleResource.update(currentRole.value.id, { permissions: checked })
    ElMessage.success(t('permission.table.elMessage.update.success.message'))
    dialogVisible.value = false
    await getRoles()
  } finally {
    dialogLoading.value = false
  }
}

/**
 * Обновление параметров таблицы
 */
const setParams = (key, value) => {
  if (!['per_page', 'page'].includes(key)) params.page = 1
  params[key] = value
  getRoles()
}

// Инициализация данных при монтировании
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
