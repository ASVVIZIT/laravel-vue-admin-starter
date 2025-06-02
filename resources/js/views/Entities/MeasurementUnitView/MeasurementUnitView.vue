<template>
  <el-card class="measurement-unit-table-container">
    <h2>Список единиц измерений</h2>

    <!-- Панель поиска и добавления -->
    <el-row :gutter="12" class="toolbar">
      <el-col :span="12" style="text-align: left">
        <el-input
            v-model="searchQuery"
            placeholder="Поиск по названию, символу, величине или категории..."
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
          <el-icon><Plus /></el-icon> Добавить единицу
        </el-button>
      </el-col>
    </el-row>

    <!-- Таблица единиц измерений -->
    <el-table
        border
        style="width: 100%"
        :data="measurementUnitStore.measurementUnits"
        v-loading="measurementUnitStore.loading"
        empty-text="Нет данных"
        :size="store.size"
        :height="tableHeight"
    >
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="name" label="Название" />
      <el-table-column prop="display_symbol" label="Символ" width="100" />
      <el-table-column prop="physical_quantity" label="Физическая величина" width="120" />
      <el-table-column label="Категория">
        <template #default="scope">
          {{ getCategoryName(scope.row.measurement_category_id) || '-' }}
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
                type="primary"
                :icon="Edit"
                title="Редактировать"
                @click="editMeasurementUnit(scope.row)"
                circle
            />
            <el-button
                type="danger"
                :icon="Delete"
                title="Удалить"
                @click="deleteMeasurementUnit(scope.row.id)"
                circle
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
              v-model="measurementUnitStore.pagination.per_page"
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
            :total="measurementUnitStore.pagination.total"
            :page-size="measurementUnitStore.pagination.per_page"
            :current-page="measurementUnitStore.pagination.current_page"
            @current-change="handlePageChange"
            :size="store.size"
        />
      </div>
      <div class="total-items">
        Всего записей: {{ measurementUnitStore.pagination.total }}
      </div>
    </div>

    <!-- Диалог добавления -->
    <el-dialog
        v-model="dialogVisibleAdd"
        title="Добавить единицу измерения"
        width="40%"
    >
      <el-form
          :model="newMeasurementUnit"
          label-width="140px"
          ref="addForm"
          label-position="top"
          :size="store.size"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item
                label="Название"
                prop="name"
                :rules="[{ required: true, message: 'Название обязательно' }]"
            >
              <el-input
                  v-model="newMeasurementUnit.name"
                  placeholder="Например: Ампер"
                  :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                label="Символ (хранится)"
                prop="symbol"
                :rules="[{ required: true, message: 'Символ обязателен' }]"
            >
              <el-input
                  v-model="newMeasurementUnit.symbol"
                  placeholder="Например: a (в нижнем регистре)"
                  :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                label="Отображаемый символ"
                prop="display_symbol"
                :rules="[{ required: true, message: 'Отображаемый символ обязателен' }]"
            >
              <el-input
                  v-model="newMeasurementUnit.display_symbol"
                  placeholder="Например: A"
                  :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                label="Физическая величина"
                prop="physical_quantity"
                :rules="[{ required: true, message: 'Физическая величина обязательна' }]"
            >
              <el-input
                  v-model="newMeasurementUnit.physical_quantity"
                  placeholder="Например: ток"
                  :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                label="Категория"
                prop="measurement_category_id"
                :rules="[{ required: true, message: 'Категория обязательна' }]"
            >
              <el-select
                  v-model="newMeasurementUnit.measurement_category_id"
                  placeholder="Выберите категорию"
                  :size="store.size"
                  style="width: 100%"
              >
                <el-option
                    v-for="category in categoryStore.dropdownCategories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                >
                  <span>{{ category.name }}</span>
                  <el-tag size="small" style="margin-left: 10px">{{ category.description }}</el-tag>
                </el-option>
              </el-select>
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
        :title="`Редактирование: ${editingMeasurementUnit?.name}`"
        width="40%"
    >
      <el-form
          :model="editingMeasurementUnit"
          label-width="140px"
          ref="editForm"
          label-position="top"
          :size="store.size"
      >
        <el-form-item
            label="Название"
            prop="name"
            :rules="[{ required: true, message: 'Название обязательно' }]"
        >
          <el-input
              v-model="editingMeasurementUnit.name"
              :size="store.size"
          />
        </el-form-item>
        <el-form-item
            label="Символ (хранится)"
            prop="symbol"
            :rules="[{ required: true, message: 'Символ обязателен' }]"
        >
          <el-input
              v-model="editingMeasurementUnit.symbol"
              :size="store.size"
          />
        </el-form-item>
        <el-form-item
            label="Отображаемый символ"
            prop="display_symbol"
            :rules="[{ required: true, message: 'Отображаемый символ обязателен' }]"
        >
          <el-input
              v-model="editingMeasurementUnit.display_symbol"
              :size="store.size"
          />
        </el-form-item>
        <el-form-item
            label="Физическая величина"
            prop="physical_quantity"
            :rules="[{ required: true, message: 'Физическая величина обязательна' }]"
        >
          <el-input
              v-model="editingMeasurementUnit.physical_quantity"
              :size="store.size"
          />
        </el-form-item>
        <el-form-item
            label="Категория"
            prop="measurement_category_id"
            :rules="[{ required: true, message: 'Категория обязательна' }]"
        >
          <el-select
              v-model="editingMeasurementUnit.measurement_category_id"
              placeholder="Выберите категорию"
              :size="store.size"
              style="width: 100%"
          >
            <el-option
                v-for="category in categoryStore.dropdownCategories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
            >
              <span style="min-width: 40px; max-width: 80px;">{{ category.name }}</span>
              <el-tag :size="store.size" style="margin-left: 10px">{{ category.description }}</el-tag>
            </el-option>
          </el-select>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { debounce } from 'lodash-es';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { appStore } from "@/store/app";
import { useMeasurementUnitStore } from '@/store/measurementUnitStore';
import { useMeasurementCategoryStore } from '@/store/measurementCategoryStore';

// Инициализация хранилищ
const store = appStore();
const measurementUnitStore = useMeasurementUnitStore();
const categoryStore = useMeasurementCategoryStore();

// Рефы для форм
const addForm = ref(null);
const editForm = ref(null);

// Опции для пагинации
const per_pages = ref([5, 10, 20, 30, 50, 100]);

// Данные форм
const newMeasurementUnit = ref({
  name: '',
  symbol: '',
  display_symbol: '',
  physical_quantity: '',
  measurement_category_id: null
});
const dialogVisible = ref(false);
const dialogVisibleAdd = ref(false);
const editingMeasurementUnit = ref(null);
const searchQuery = ref('');

// Дебаунс для поиска (400мс)
const debouncedSearch = debounce(() => {
  measurementUnitStore.pagination.current_page = 1;
  loadMeasurementUnits();
}, 400);

// Загрузка данных с параметрами
const loadMeasurementUnits = async () => {
  await measurementUnitStore.fetchPaginated({
    search: searchQuery.value,
    page: measurementUnitStore.pagination.current_page,
    per_page: measurementUnitStore.pagination.per_page
  });
};

// Обработчик изменения количества строк на странице
const handlePerPageChange = () => {
  measurementUnitStore.pagination.current_page = 1;
  loadMeasurementUnits();
};

// Обработчик пагинации
const handlePageChange = (page) => {
  measurementUnitStore.pagination.current_page = page;
  loadMeasurementUnits();
};

// Получение названия категории по ID из запроса где находятся все категории
const getCategoryName = (categoryId) => {
  const category = categoryStore.dropdownCategories.find(cat => cat.id === categoryId);
  console.log('getCategoryName ', category)
  return category ? category.name : null;
};

// Валидация и отправка формы добавления
const validateAddForm = async () => {
  try {
    await addForm.value.validate();
    await addMeasurementUnit();
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

// Добавление единицы измерения
const addMeasurementUnit = async () => {
  try {
    await measurementUnitStore.create(newMeasurementUnit.value);

    ElMessage.success({
      message: 'Единица измерения успешно добавлена',
      duration: 3000
    });

    dialogVisibleAdd.value = false;
    newMeasurementUnit.value = {
      name: '',
      symbol: '',
      display_symbol: '',
      physical_quantity: '',
      measurement_category_id: null
    };
  } catch (error) {
    let errorMessage = 'Ошибка при добавлении единицы измерения';

    if (error.response && error.response.data) {
      if (error.response.data.errors) {
        errorMessage = Object.values(error.response.data.errors)
            .flat()
            .join('; ');
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else {
      errorMessage = error.message || errorMessage;
    }

    ElMessage.error({
      message: errorMessage,
      duration: 5000
    });
  }
};

// Редактирование единицы измерения
const editMeasurementUnit = (measurementUnit) => {
  editingMeasurementUnit.value = { ...measurementUnit };
  dialogVisible.value = true;
};

// Сохранение изменений
const saveEdit = async () => {
  try {
    await measurementUnitStore.update(
        editingMeasurementUnit.value.id,
        {
          name: editingMeasurementUnit.value.name,
          symbol: editingMeasurementUnit.value.symbol,
          display_symbol: editingMeasurementUnit.value.display_symbol,
          physical_quantity: editingMeasurementUnit.value.physical_quantity,
          measurement_category_id: editingMeasurementUnit.value.measurement_category_id
        }
    );

    ElMessage.success({
      message: 'Изменения сохранены',
      duration: 3000
    });

    dialogVisible.value = false;
  } catch (error) {
    let errorMessage = 'Ошибка сохранения изменений';

    if (error.response && error.response.data) {
      if (error.response.data.errors) {
        errorMessage = Object.values(error.response.data.errors)
            .flat()
            .join('; ');
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    } else {
      errorMessage = error.message || errorMessage;
    }

    ElMessage.error({
      message: errorMessage,
      duration: 5000
    });
  }
};

// Удаление единицы измерения
const deleteMeasurementUnit = async (id) => {
  try {
    await ElMessageBox.confirm(
        'Вы уверены, что хотите удалить единицу измерения? Это действие нельзя отменить.',
        'Подтверждение удаления',
        {
          confirmButtonText: 'Удалить',
          cancelButtonText: 'Отмена',
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
          buttonSize: store.size
        }
    );

    await measurementUnitStore.delete(id);

    ElMessage.success({
      message: 'Единица измерения успешно удалена',
      duration: 3000
    });

    if (measurementUnitStore.measurementUnits.length === 0 &&
        measurementUnitStore.pagination.current_page > 1) {
      measurementUnitStore.pagination.current_page--;
      loadMeasurementUnits();
    }
  } catch (error) {
    if (error !== 'cancel') {
      let errorMessage = 'Ошибка удаления единицы измерения';

      if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      ElMessage.error({
        message: errorMessage,
        duration: 5000
      });
    }
  }
};

const tableHeight = ref('calc(100vh - 1000px)');

function updateTableHeight() {
  const titleHeight = 50;
  const tagHeight = 50;
  const headerHeight = 120;
  const paginationHeight = 60;
  const offset = 30;

  tableHeight.value = `calc(100vh - ${titleHeight + tagHeight + headerHeight + paginationHeight + offset}px)`;
}

// Инициализация компонента
onMounted(() => {
  // Установка начального размера пагинации
  measurementUnitStore.pagination.per_page = 20; // По умолчанию 20 строк
  categoryStore.fetchAllForDropdown(); // Загрузка всех категорий categoryStore
  loadMeasurementUnits();

  updateTableHeight();
  window.addEventListener('resize', updateTableHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTableHeight);
});
</script>

<style scoped>
.measurement-unit-table-container {
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
  font-size: 12px;
}

.total-items {
  text-align: right;
  font-size: 12px;
  color: #666;
}
</style>
