<template>
  <el-card class="device-type-table-container">
    <h2>{{ $t('deviceType.table.title') }}</h2>

    <!-- Панель поиска и добавления -->
    <el-row :gutter="12" class="toolbar">
      <el-col :span="12" style="text-align: left">
        <el-input
          v-model="searchQuery"
          :placeholder="$t('deviceType.table.search_placeholder')"
          clearable
          @input="debouncedSearch"
          @clear="debouncedSearch"
          :size="store.size"
        >
          <template #prefix>
            <el-icon :size="store.size"><Search /></el-icon>
          </template>
        </el-input>
      </el-col>
      <el-col :span="12" style="text-align: right">
        <el-button
          type="primary"
          @click="dialogVisibleAdd = true"
          :size="store.size"
        >
          <el-icon><Plus /></el-icon> {{ $t('deviceType.table.add_button') }}
        </el-button>
      </el-col>
    </el-row>

    <!-- Таблица типов устройств -->
    <el-table
      border
      style="width: 100%"
      :data="deviceTypeStore.deviceTypes"
      v-loading="deviceTypeStore.loading"
      :empty-text="$t('deviceType.table.empty_text')"
      :size="store.size"
      :height="tableHeight"
    >
      <el-table-column
        prop="id"
        :label="$t('deviceType.table.columns.id')"
        width="60"
        sortable
      />
      <el-table-column
        prop="name"
        :label="$t('deviceType.table.columns.name')"
        sortable
      />
      <el-table-column
        prop="code"
        :label="$t('deviceType.table.columns.code')"
        width="120"
        sortable
      />
      <el-table-column
        prop="description"
        :label="$t('deviceType.table.columns.description')"
        sortable
      />
      <el-table-column
        :label="$t('deviceType.table.actions')"
        fixed="right"
        width="100"
      >
        <template #default="scope">
          <el-button-group :size="store.size">
            <el-button
              v-for="(action, index) in tableOption.item_actions"
              :key="index"
              :type="action.type || 'primary'"
              :icon="action.icon"
              :title="action.label"
              @click="tableActions(action.name, scope.row)"
              circle
              :size="store.size"
            />
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- Пагинация с выбором количества строк -->
    <div class="pagination-container">
      <div class="pagination-controls">
        <div class="per-page-selector">
          <span>{{ $t('deviceType.table.per_page_selector') }}</span>
          <el-select
            v-model="deviceTypeStore.pagination.per_page"
            @change="handlePerPageChange"
            :size="store.size"
            style="width: 100px"
            clearable
          >
            <el-option
              v-for="item in per_pages"
              :key="item"
              :label="item"
              :value="item"
              :size="store.size"
            />
          </el-select>
        </div>

        <el-pagination
          background
          layout="sizes, prev, pager, next, jumper"
          :total="deviceTypeStore.pagination.total"
          :page-size="deviceTypeStore.pagination.per_page"
          :current-page="deviceTypeStore.pagination.current_page"
          @current-change="handlePageChange"
          :size="store.size"
        />
      </div>
      <div class="total-items">
        {{ $t('deviceType.table.total_items') }} {{ deviceTypeStore.pagination.total }}
      </div>
    </div>

    <!-- Диалог добавления -->
    <el-dialog
      v-model="dialogVisibleAdd"
      :title="$t('deviceType.form.add_title')"
      :size="store.size"
      width="50%"
    >
      <el-form
        :model="newDeviceType"
        label-width="140px"
        ref="addForm"
        label-position="top"
        :size="store.size"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item
              :label="$t('deviceType.form.fields.name.label')"
              prop="name"
              :rules="[{ required: true, message: 'Название обязательно' }]"
            >
              <el-input
                v-model="newDeviceType.name"
                :placeholder="$t('deviceType.form.fields.name.placeholder')"
                :size="store.size"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              :label="$t('deviceType.form.fields.code.label')"
              prop="code"
              :rules="[{ required: true, message: $t('deviceType.form.rules.code_required') }]"
            >
              <el-input
                v-model="newDeviceType.code"
                :placeholder="$t('deviceType.form.fields.code.placeholder')"
                :size="store.size"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              :label="$t('deviceType.form.fields.description.label')"
              prop="description"
            >
              <el-input
                v-model="newDeviceType.description"
                type="textarea"
                :placeholder="$t('deviceType.form.fields.description.placeholder')"
                :rows="3"
                :size="store.size"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button
          @click="dialogVisibleAdd = false"
          :size="store.size"
        >
          {{ $t('deviceType.form.buttons.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="validateAddForm"
          :size="store.size"
        >
          {{ $t('deviceType.form.buttons.add') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Диалог редактирования -->
    <el-dialog
      v-model="dialogVisible"
      :title="$t('deviceType.form.edit_title', { name: editingDeviceType?.name })"
      :size="store.size"
      width="50%"
    >
      <el-form
        :model="editingDeviceType"
        label-width="140px"
        ref="editForm"
        label-position="top"
        :size="store.size"
      >
        <el-form-item
          :label="$t('deviceType.form.fields.name.label')"
          prop="name"
          :rules="[{ required: true, message: $t('deviceType.form.rules.name_required') }]"
        >
          <el-input
            v-model="editingDeviceType.name"
            :size="store.size"
          />
        </el-form-item>
        <el-form-item
          :label="$t('deviceType.form.fields.code.label')"
          prop="code"
          :rules="[{ required: true, message: $t('deviceType.form.rules.code_required') }]"
        >
          <el-input
            v-model="editingDeviceType.code"
            :size="store.size"
          />
        </el-form-item>
        <el-form-item
          :label="$t('deviceType.form.fields.description.label')"
          prop="description"
        >
          <el-input
            v-model="editingDeviceType.description"
            type="textarea"
            :rows="3"
            :size="store.size"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
          @click="dialogVisible = false"
          :size="store.size"
        >
          {{ $t('deviceType.form.buttons.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="validateEditForm"
          :size="store.size"
        >
          {{ $t('deviceType.form.buttons.save') }}
        </el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash-es';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { appStore } from '@/store/appStore'
import { useDeviceTypeStore } from '@store/ElectricalProtection/deviceTypeStore.js';

const { t } = useI18n();

// Инициализация хранилищ
const store = appStore();
const deviceTypeStore = useDeviceTypeStore();

// Рефы для форм
const addForm = ref(null);
const editForm = ref(null);

// Опции для пагинации
const per_pages = ref([5, 10, 20, 30, 50, 100, 200]);

// Данные форм
const newDeviceType = ref({
  name: '',
  code: '',
  description: ''
});
const dialogVisible = ref(false);
const dialogVisibleAdd = ref(false);
const editingDeviceType = ref(null);
const searchQuery = ref('');

// Конфигурация таблицы
const tableOption = ref({
  slot: true,
  width: '180',
  label: t('deviceType.table.actions'),
  fixed: 'right',
  item_actions: [
    {
      name: 'edit',
      type: 'primary',
      icon: Edit,
      label: t('deviceType.table.item_actions.edit'),
    },
    {
      name: 'delete',
      type: 'danger',
      icon: Delete,
      label: t('deviceType.table.item_actions.delete'),
    },
  ]
});

// Дебаунс для поиска (400мс)
const debouncedSearch = debounce(() => {
  deviceTypeStore.pagination.current_page = 1;
  loadDeviceTypes();
}, 400);

// Загрузка данных с параметрами
const loadDeviceTypes = async () => {
  await deviceTypeStore.fetchPaginated({
    search: searchQuery.value,
    page: deviceTypeStore.pagination.current_page,
    per_page: deviceTypeStore.pagination.per_page
  });
};

// Обработчик изменения количества строк на странице
const handlePerPageChange = () => {
  deviceTypeStore.pagination.current_page = 1;
  loadDeviceTypes();
};

// Обработчик пагинации
const handlePageChange = (page) => {
  deviceTypeStore.pagination.current_page = page;
  loadDeviceTypes();
};

// Валидация и отправка формы добавления
const validateAddForm = async () => {
  try {
    await addForm.value.validate();
    await addDeviceType();
  } catch (e) {
    console.log('Validation failed', e);
  }
};

// Валидация и отправка формы редактирования
const validateEditForm = async () => {
  try {
    await editForm.value.validate();
    await saveEdit();
  } catch (e) {
    console.log('Validation failed', e);
  }
};

// Добавление типа устройства
const addDeviceType = async () => {
  try {
    await deviceTypeStore.create(newDeviceType.value);

    ElMessage.success({
      message: t('deviceType.messages.add_success'),
      duration: 3000
    });

    dialogVisibleAdd.value = false;
    newDeviceType.value = { name: '', code: '', description: '' };
  } catch (error) {
    let errorMessage = error.message || t('deviceType.messages.error', { error: '' });

    // Обработка ошибок валидации
    if (error.errors) {
      errorMessage = Object.values(error.errors)
        .flat()
        .join('; ');
  }
    // Обработка стандартных ошибок
    else if (error.details) {
      errorMessage = `${t('deviceType.messages.error', { error: '' })}: ${error.details}`;
    }

    ElMessage.error({
      message: errorMessage,
      duration: 5000
    });
  }
};

// Редактирование типа устройства
const editDeviceType = (deviceType) => {
  editingDeviceType.value = { ...deviceType };
  dialogVisible.value = true;
};

// Сохранение изменений
const saveEdit = async () => {
  try {
    await deviceTypeStore.update(editingDeviceType.value.id, editingDeviceType.value);

    ElMessage.success({
      message: t('deviceType.messages.update_success'),
      duration: 3000
    });

    dialogVisible.value = false;
  } catch (error) {
    let errorMessage = error.message || t('deviceType.messages.error', { error: '' });

    if (error.errors) {
      errorMessage = Object.values(error.errors)
        .flat()
        .join('; ');
    }
    else if (error.details) {
      errorMessage = `${t('deviceType.messages.error', { error: '' })}: ${error.details}`;
    }

    ElMessage.error({
      message: errorMessage,
      duration: 5000
    });
  }
};

// Удаление типа устройства
const deleteDeviceType = async (id) => {
  try {
    await ElMessageBox.confirm(
      t('deviceType.messages.delete_confirm'),
      t('deviceType.messages.delete_confirm_title'),
      {
        confirmButtonText: t('table.general.delete'),
        cancelButtonText: t('table.general.cancel'),
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        buttonSize: store.size
      }
    );

    await deviceTypeStore.delete(id);

    ElMessage.success({
      message: t('deviceType.messages.delete_success'),
      duration: 3000
    });

    if (deviceTypeStore.deviceTypes.length === 0 && deviceTypeStore.pagination.current_page > 1) {
      deviceTypeStore.pagination.current_page--;
      loadDeviceTypes();
    }
  } catch (error) {
    if (error !== 'cancel') {
      let errorMessage = error.message || t('deviceType.messages.error', { error: '' });

      if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.details) {
        errorMessage = `${t('deviceType.messages.error', { error: '' })}: ${error.details}`;
      }

      ElMessage.error({
        message: errorMessage,
        duration: 5000
      });
    }
  }
};

// Обработчик действий таблицы
const tableActions = (actionName, row) => {
  switch (actionName) {
    case 'edit':
      editDeviceType(row);
      break;
    case 'delete':
      deleteDeviceType(row.id);
      break;
    default:
      console.warn(`Неизвестное действие: ${actionName}`);
  }
};

const tableHeight = ref('calc(100vh - 1000px)');

function updateTableHeight() {
  const titleHeight = 50;
  const tagHeight = 50;
  const headerHeight = 120;      // Высота вашего заголовка
  const paginationHeight = 60;   // Высота пагинации
  const offset = 30;             // Дополнительные отступы

  tableHeight.value = `calc(100vh - ${titleHeight + tagHeight + headerHeight + paginationHeight + offset}px)`;
}

// Инициализация компонента
onMounted(() => {
  // Установка начального размера пагинации
  deviceTypeStore.pagination.per_page = 20; // По умолчанию 20 строк
  loadDeviceTypes();

  updateTableHeight();
  window.addEventListener('resize', updateTableHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTableHeight);
});

</script>

<style scoped>
.device-type-table-container {
  margin: 10px;
}

.toolbar {
  margin-bottom: 10px;
}

.pagination-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.total-items {
  text-align: right;
  font-size: 12px;
  color: #666;
}
</style>
