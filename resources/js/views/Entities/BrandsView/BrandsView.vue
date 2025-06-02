<template>
  <el-card class="brand-table-container">
    <h2>Список брендов</h2>

    <!-- Панель поиска и добавления -->
    <el-row :gutter="12" class="toolbar">
      <el-col :span="12" style="text-align: left">
        <el-input
            v-model="searchQuery"
            placeholder="Поиск по названию, стране или сайту..."
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
          <el-icon><Plus /></el-icon> Добавить бренд
        </el-button>
      </el-col>
    </el-row>

    <!-- Таблица брендов -->
    <el-table
        border
        style="width: 100%"
        :data="brandStore.brands"
        v-loading="brandStore.loading"
        empty-text="Нет данных"
        :size="store.size"
        :height="tableHeight"
    >
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="name" label="Название" />
      <el-table-column prop="country" label="Страна" width="110" />
      <el-table-column prop="website" label="Веб-сайт">
        <template #default="{row}">
          <el-link :href="row.website" target="_blank" type="primary" :size="store.size">
            {{ row.website }}
          </el-link>
        </template>
      </el-table-column>

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
              v-model="brandStore.pagination.per_page"
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
            :total="brandStore.pagination.total"
            :page-size="brandStore.pagination.per_page"
            :current-page="brandStore.pagination.current_page"
            @current-change="handlePageChange"
            :size="store.size"
        />
      </div>
      <div class="total-items">
        Всего записей: {{ brandStore.pagination.total }}
      </div>
    </div>

    <!-- Диалог добавления -->
    <el-dialog
        v-model="dialogVisibleAdd"
        title="Добавить бренд"
        width="40%"
    >
      <el-form
          :model="newBrand"
          label-width="140px"
          ref="addForm"
          label-position="top"
          :size="store.size"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item
                label="Название бренда"
                prop="name"
                :rules="[{ required: true, message: 'Название обязательно' }]"
            >
              <el-input
                  v-model="newBrand.name"
                  placeholder="Например: Schneider Electric"
                  :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                label="Страна производитель"
                prop="country"
            >
              <el-input
                  v-model="newBrand.country"
                  placeholder="Например: Франция"
                  :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                label="Веб-сайт"
                prop="website"
                :rules="[
                  { required: true, message: 'Сайт обязателен' },
                  { type: 'url', message: 'Введите корректный URL' }
                ]"
            >
              <el-input
                  v-model="newBrand.website"
                  placeholder="https://example.com"
                  :size="store.size"
              >
                <template #prepend>http://</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                label="Описание"
                prop="description"
            >
              <el-input
                  v-model="newBrand.description"
                  type="textarea"
                  placeholder="Краткое описание бренда"
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
        :title="`Редактирование: ${editingBrand?.name}`"
        width="40%"
    >
      <el-form
          :model="editingBrand"
          label-width="140px"
          ref="editForm"
          label-position="top"
          :size="store.size"
      >
        <el-form-item
            label="Название бренда"
            prop="name"
            :rules="[{ required: true, message: 'Название обязательно' }]"
        >
          <el-input
              v-model="editingBrand.name"
              :size="store.size"
          />
        </el-form-item>
        <el-form-item
            label="Страна производитель"
            prop="country"
        >
          <el-input
              v-model="editingBrand.country"
              :size="store.size"
          />
        </el-form-item>
        <el-form-item
            label="Веб-сайт"
            prop="website"
            :rules="[
              { required: true, message: 'Сайт обязателен' },
              { type: 'url', message: 'Введите корректный URL' }
            ]"
        >
          <el-input
              v-model="editingBrand.website"
              :size="store.size"
          />
        </el-form-item>
        <el-form-item
            label="Описание"
            prop="description"
        >
          <el-input
              v-model="editingBrand.description"
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
import { useBrandStore } from '@/store/brandStore';

// Инициализация хранилищ
const store = appStore();
const brandStore = useBrandStore();

// Рефы для форм
const addForm = ref(null);
const editForm = ref(null);

// Опции для пагинации
const per_pages = ref([5, 10, 20, 30, 50, 100]);

// Данные форм
const newBrand = ref({
  name: '',
  country: '',
  website: '',
  description: ''
});
const dialogVisible = ref(false);
const dialogVisibleAdd = ref(false);
const editingBrand = ref(null);
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
  brandStore.pagination.current_page = 1;
  loadBrands();
}, 400);

// Загрузка данных с параметрами
const loadBrands = async () => {
  await brandStore.fetchPaginated({
    search: searchQuery.value,
    page: brandStore.pagination.current_page,
    per_page: brandStore.pagination.per_page
  });
};

// Обработчик изменения количества строк на странице
const handlePerPageChange = () => {
  brandStore.pagination.current_page = 1;
  loadBrands();
};

// Обработчик пагинации
const handlePageChange = (page) => {
  brandStore.pagination.current_page = page;
  loadBrands();
};

// Валидация и отправка формы добавления
const validateAddForm = async () => {
  try {
    await addForm.value.validate();
    await addBrand();
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

// Добавление бренда
const addBrand = async () => {
  try {
    await brandStore.create(newBrand.value);

    ElMessage.success({
      message: 'Бренд успешно добавлен',
      duration: 3000
    });

    dialogVisibleAdd.value = false;
    newBrand.value = { name: '', country: '', website: '', description: '' };
  } catch (error) {
    let errorMessage = error.message || 'Ошибка при добавлении бренда';

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

// Редактирование бренда
const editBrand = (brand) => {
  editingBrand.value = { ...brand };
  dialogVisible.value = true;
};

// Сохранение изменений
const saveEdit = async () => {
  try {
    await brandStore.update(editingBrand.value.id, editingBrand.value);

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

// Удаление бренда
const deleteBrand = async (id) => {
  try {
    await ElMessageBox.confirm(
        'Вы уверены, что хотите удалить бренд? Это действие нельзя отменить.',
        'Подтверждение удаления',
        {
          confirmButtonText: 'Удалить',
          cancelButtonText: 'Отмена',
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
          buttonSize: store.size
        }
    );

    await brandStore.delete(id);

    ElMessage.success({
      message: 'Бренд успешно удален',
      duration: 3000
    });

    if (brandStore.brands.length === 0 && brandStore.pagination.current_page > 1) {
      brandStore.pagination.current_page--;
      loadBrands();
    }
  } catch (error) {
    if (error !== 'cancel') {
      let errorMessage = error.message || 'Ошибка удаления бренда';

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
      editBrand(row);
      break;
    case 'delete':
      deleteBrand(row.id);
      break;
    default:
      console.warn(`Неизвестное действие: ${actionName}`);
  }
};

const tableHeight = ref('calc(100vh - 1000px)');

function updateTableHeight() {
  const titleHeight = 50;
  const tagHeight = 50;
  const headerHeight = 120; // Высота вашего заголовка
  const paginationHeight = 60; // Высота пагинации
  const offset = 30; // Дополнительные отступы

  tableHeight.value = `calc(100vh - ${titleHeight + tagHeight + headerHeight + paginationHeight + offset}px)`;
}

// Инициализация компонента
onMounted(() => {
  // Установка начального размера пагинации
  brandStore.pagination.per_page = 20; // По умолчанию 20 строк
  loadBrands();

  updateTableHeight();
  window.addEventListener('resize', updateTableHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTableHeight);
});

</script>

<style scoped>
.brand-table-container {
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
  gap: 5px;
  font-size: 13px;
}

.total-items {
  text-align: right;
  font-size: 13px;
  color: #666;
}
</style>
