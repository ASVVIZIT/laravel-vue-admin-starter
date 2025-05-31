<template>
  <el-card class="device-type-table-container">
    <h2>Список типов устройств</h2>

    <!-- Панель поиска и добавления -->
    <el-row :gutter="12" class="toolbar">
      <el-col :span="12" style="text-align: left">
        <el-input
            v-model="searchQuery"
            placeholder="Поиск по названию, коду или описанию..."
            clearable
            @input="debouncedSearch"
            @clear="debouncedSearch"
            :size="store.size"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-col>
      <el-col :span="12" style="text-align: right">
        <el-button
            type="primary"
            @click="dialogVisibleAdd = true"
            :size="store.size"
        >
          <el-icon><Plus /></el-icon> Добавить тип
        </el-button>
      </el-col>
    </el-row>

    <!-- Таблица типов устройств -->
    <el-table
        border
        style="width: 100%"
        :data="deviceTypeStore.deviceTypes"
        v-loading="deviceTypeStore.loading"
        empty-text="Нет данных"
        :size="store.size"
        :height="tableHeight"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="Название" />
      <el-table-column prop="code" label="Код" width="120" />
      <el-table-column prop="description" label="Описание" />
      <el-table-column
        label="Действия"
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
          <span>Записей на странице:</span>
          <el-select
              v-model="deviceTypeStore.pagination.per_page"
              @change="handlePerPageChange"
              :size="store.size"
              style="width: 100px"
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
            layout="prev, pager, next, jumper"
            :total="deviceTypeStore.pagination.total"
            :page-size="deviceTypeStore.pagination.per_page"
            :current-page="deviceTypeStore.pagination.current_page"
            @current-change="handlePageChange"
            :size="store.size"
        />
      </div>
      <div class="total-items">
        Всего записей: {{ deviceTypeStore.pagination.total }}
      </div>
    </div>

    <!-- Диалог добавления -->
    <el-dialog
        v-model="dialogVisibleAdd"
        title="Добавить тип устройства"
        width="40%"
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
                label="Название типа"
                prop="name"
                :rules="[{ required: true, message: 'Название обязательно' }]"
            >
              <el-input
                  v-model="newDeviceType.name"
                  placeholder="Например: Автоматический выключатель"
                  :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                label="Код типа"
                prop="code"
                :rules="[{ required: true, message: 'Код обязателен' }]"
            >
              <el-input
                  v-model="newDeviceType.code"
                  placeholder="Например: CB"
                  :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                label="Описание"
                prop="description"
            >
              <el-input
                  v-model="newDeviceType.description"
                  type="textarea"
                  placeholder="Краткое описание типа устройства"
                  :rows="3"
                  :size="store.size"
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
          Отмена
        </el-button>
        <el-button
            type="primary"
            @click="validateAddForm"
            :size="store.size"
        >
          Добавить
        </el-button>
      </template>
    </el-dialog>

    <!-- Диалог редактирования -->
    <el-dialog
        v-model="dialogVisible"
        :title="`Редактирование: ${editingDeviceType?.name}`"
        width="40%"
    >
      <el-form
          :model="editingDeviceType"
          label-width="140px"
          ref="editForm"
          label-position="top"
          :size="store.size"
      >
        <el-form-item
            label="Название типа"
            prop="name"
            :rules="[{ required: true, message: 'Название обязательно' }]"
        >
          <el-input
              v-model="editingDeviceType.name"
              :size="store.size"
          />
        </el-form-item>
        <el-form-item
            label="Код типа"
            prop="code"
            :rules="[{ required: true, message: 'Код обязателен' }]"
        >
          <el-input
              v-model="editingDeviceType.code"
              :size="store.size"
          />
        </el-form-item>
        <el-form-item
            label="Описание"
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
          Отмена
        </el-button>
        <el-button
            type="primary"
            @click="validateEditForm"
            :size="store.size"
        >
          Сохранить
        </el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { debounce } from 'lodash-es';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { appStore } from "@/store/app";
import { useDeviceTypeStore } from '@/store/deviceTypeStore';

// Инициализация хранилищ
const store = appStore();
const deviceTypeStore = useDeviceTypeStore();

// Рефы для форм
const addForm = ref(null);
const editForm = ref(null);

// Опции для пагинации
const per_pages = ref([5, 10, 20, 30, 50, 100]);

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
  label: 'Действия',
  fixed: 'right',
  item_actions: [
    {
      name: 'edit',
      type: 'primary',
      icon: Edit,
      label: 'Редактировать',
    },
    {
      name: 'delete',
      type: 'danger',
      icon: Delete,
      label: 'Удалить',
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
  await deviceTypeStore.fetchAll({
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
      message: 'Тип устройства успешно добавлен',
      duration: 3000
    });

    dialogVisibleAdd.value = false;
    newDeviceType.value = { name: '', code: '', description: '' };
  } catch (error) {
    let errorMessage = error.message || 'Ошибка при добавлении типа устройства';

    // Обработка ошибок валидации
    if (error.errors) {
      errorMessage = Object.values(error.errors)
          .flat()
          .join('; ');
    }
    // Обработка стандартных ошибок
    else if (error.details) {
      errorMessage = `${error.message}: ${error.details}`;
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
      message: 'Изменения сохранены',
      duration: 3000
    });

    dialogVisible.value = false;
  } catch (error) {
    let errorMessage = error.message || 'Ошибка сохранения изменений';

    if (error.errors) {
      errorMessage = Object.values(error.errors)
          .flat()
          .join('; ');
    }
    else if (error.details) {
      errorMessage = `${error.message}: ${error.details}`;
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
        'Вы уверены, что хотите удалить тип устройства? Это действие нельзя отменить.',
        'Подтверждение удаления',
        {
          confirmButtonText: 'Удалить',
          cancelButtonText: 'Отмена',
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
          buttonSize: store.size
        }
    );

    await deviceTypeStore.delete(id);

    ElMessage.success({
      message: 'Тип устройства успешно удален',
      duration: 3000
    });

    if (deviceTypeStore.deviceTypes.length === 0 && deviceTypeStore.pagination.current_page > 1) {
      deviceTypeStore.pagination.current_page--;
      loadDeviceTypes();
    }
  } catch (error) {
    if (error !== 'cancel') {
      let errorMessage = error.message || 'Ошибка удаления типа устройства';

      if (error.details) {
        errorMessage = `${error.message}: ${error.details}`;
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
  deviceTypeStore.pagination.per_page = 100;
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
