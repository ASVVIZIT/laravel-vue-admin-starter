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
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
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
            <svg-item
                :el-svg-name="action.icon"
                :title="action.label"
            />
          </el-button>
        </div>
      </template>
    </custom-table>

    <el-dialog
        v-model="dialogVisible"
        :title="$t('permission.actions.editPermissionForForm') + ' - ' + currentRole.name"
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
            {{ t('permission.actions.cancel') }}
          </el-button>
          <el-button
              type="primary"
              :loading="dialogLoading"
              @click="confirmPermission"
          >
            {{ t('permission.actions.confirm') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import CustomTable from '@/components/CustomTable.vue';
import SvgItem from '@/components/Item/SvgItem.vue';
import Resource from '@/api/resource'
import RoleResource from '@/api/role';
import {useI18n} from 'vue-i18n';
import {uppercaseFirst} from '@/utils';
import {userStore} from '@/store/userStore';
import {ElMessage} from 'element-plus';

const { t } = useI18n({ useScope: 'global' });
const roleResource = new RoleResource();
const permissionResource = new Resource('permissions');
const useUserStore = userStore();

// Реактивные переменные
const tableData = ref([]);
const loading = ref(true);
const pageSizes = ref([5, 10, 30, 50, 100, 150, 200]);
const filters = reactive({
  role: null,
  search: null
});

// Пагинация
const pagination = reactive({
  meta: {
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  }
});

// Диалог редактирования
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const currentRole = ref({});
const menuPermissions = ref([]);
const otherPermissions = ref([]);
const refMenuPermissions = ref(null);
const refOtherPermissions = ref(null);

// Колонки таблицы
const basicColumn = computed(() => [
  {
    prop: 'name',
    label: t('roles.name'),
    width: '150'
  },
  {
    prop: 'description',
    label: t('table.general.description'),
  }
]);

// Опции таблицы
const tableOption = computed(() => {
  if (useUserStore.permissions.includes('manage user')) {
    return {
      slot: true,
      label: t('table.general.actions'),
      fixed: 'right',
      item_actions: [
        {name: 'edit-item', type: 'primary', icon: 'EditPen', label: t('permission.actions.editPermission')},
      ]
    }
  }
  return {}
});

// Свойства дерева разрешений
const permissionProps = reactive({
  children: 'children',
  label: 'name',
  disabled: 'disabled'
});

// Вычисляемые свойства для разрешений
const roleMenuPermissions = computed(() =>
    currentRole.value.permissions
        ? classifyPermissions(currentRole.value.permissions).menu
        : []
);

const roleOtherPermissions = computed(() =>
    currentRole.value.permissions
        ? classifyPermissions(currentRole.value.permissions).other
        : []
);

// Загрузка ролей
const getRoles = async () => {
  loading.value = true;
  try {
    const params = {
      ...filters,
      current_page: pagination.meta.current_page,
      per_page: pagination.meta.per_page
    }

    const response = await roleResource.list(params);

    console.log('Role List response ', response);

    // Обновление данных
    response.items.forEach(role => {
      role.description = t(`roles.description.${role.name}`)
    });

    tableData.value = response.items;
    // Обновляем метаданные пагинации
    pagination.meta = {
      total: response.meta.total,
      current_page: response.meta.current_page,
      per_page: response.meta.per_page,
      last_page: response.meta.last_page
    }
  } finally {
    loading.value = false
  }
}

// Обработка действий таблицы
const tableActions = (action, data) => {
  if (action === 'edit-item') {
    handleEditPermissions(data);
  }
}

// Загрузка разрешений
const getPermissions = async () => {
  try {
    const { data } = await permissionResource.list({});
    const { menu, other } = classifyPermissions(data);
    menuPermissions.value = menu;
    otherPermissions.value = other;
  } catch (error) {
    console.error('Ошибка загрузки разрешений:', error);
    ElMessage.error(t('error.loadPermissions'));
  }
}

// Классификация разрешений
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

// Нормализация разрешений
const normalizeMenuPermission = (permission) => ({
  id: permission.id,
  name: uppercaseFirst(permission.name.substring(10))
})

const normalizePermission = (permission) => ({
  id: permission.id,
  name: uppercaseFirst(permission.name),
  disabled: permission.name === 'manage permission'
})

// Получение ключей разрешений
const permissionKeys = permissions => permissions.map(p => p.id)

// Открытие диалога редактирования
const handleEditPermissions = (data) => {
  currentRole.value = data
  dialogVisible.value = true
  nextTick(() => {
    refMenuPermissions.value?.setCheckedKeys(permissionKeys(roleMenuPermissions.value))
    refOtherPermissions.value?.setCheckedKeys(permissionKeys(roleOtherPermissions.value))
  })
}

// Подтверждение изменений
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

// Обработчики пагинации
const handleSizeChange = (perPage) => {
  pagination.meta.per_page = perPage
  pagination.meta.current_page = 1
  getRoles()
}

const handleCurrentChange = (currentPage) => {
  pagination.meta.current_page = currentPage
  getRoles()
}

// Инициализация
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
