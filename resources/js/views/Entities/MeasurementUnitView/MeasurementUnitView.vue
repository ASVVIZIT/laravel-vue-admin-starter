<template>
  <el-card class="measurement-unit-table-container" :size="store.size">
    <h2>{{ $t('measurementUnit.table.title') }}</h2>

    <!-- Панель поиска и добавления -->
    <el-row :gutter="12" class="toolbar">
      <el-col :span="12" style="text-align: left">
        <el-input
          v-model="searchQuery"
          :placeholder="$t('measurementUnit.table.search_placeholder')"
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
          <el-icon><Plus /></el-icon> {{ $t('measurementUnit.table.add_button') }}
        </el-button>
      </el-col>
    </el-row>

    <!-- Таблица единиц измерений -->
    <el-table
      border
      style="width: 100%"
      :data="measurementUnitStore.measurementUnits"
      v-loading="measurementUnitStore.loading"
      :empty-text="$t('measurementUnit.table.empty_text')"
      :size="store.size"
      :height="tableHeight"
  >
      <el-table-column
        prop="id"
        sortable
        :label="$t('measurementUnit.table.columns.id')"
        width="60"
      />
      <el-table-column
        prop="name"
        :label="$t('measurementUnit.table.columns.name')"
        sortable
      />
      <el-table-column
        prop="display_symbol"
        :label="$t('measurementUnit.table.columns.display_symbol')"
        width="100"
        sortable
      />
      <el-table-column
        prop="physical_quantity"
        :label="$t('measurementUnit.table.columns.physical_quantity')"
        width="150"
        sortable
      />
      <el-table-column
        :label="$t('measurementUnit.table.columns.category')"
        sortable
      >
        <template #default="scope">
          {{ getCategoryName(scope.row.measurement_category_id) || '-' }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('measurementUnit.table.actions')"
        fixed="right"
        width="100"
      >
        <template #default="scope">
          <el-button-group :size="store.size">
            <el-button
              type="primary"
              :icon="Edit"
              :title="$t('measurementUnit.table.item_actions.edit')"
              @click="editMeasurementUnit(scope.row)"
              :size="store.size"
              circle
            />
            <el-button
              type="danger"
              :icon="Delete"
              :title="$t('measurementUnit.table.item_actions.delete')"
              :size="store.size"
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
          <span>{{ $t('measurementUnit.table.per_page_selector') }}</span>
          <el-select
            v-model="measurementUnitStore.pagination.per_page"
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
          :total="measurementUnitStore.pagination.total"
          :page-size="measurementUnitStore.pagination.per_page"
          :current-page="measurementUnitStore.pagination.current_page"
          @current-change="handlePageChange"
          :size="store.size"
        />
      </div>
      <div class="total-items">
        {{ $t('measurementUnit.table.total_items') }} {{ measurementUnitStore.pagination.total }}
      </div>
    </div>

    <!-- Диалог добавления -->
    <el-dialog
        v-model="dialogVisibleAdd"
        :title="$t('measurementUnit.form.add_title')"
        :size="store.size"
        width="50%"
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
              :label="$t('measurementUnit.form.fields.name.label')"
              prop="name"
              :rules="[{ required: true, message: $t('measurementUnit.form.rules.name_required') }]"
            >
              <el-input
                v-model="newMeasurementUnit.name"
                :placeholder="$t('measurementUnit.form.fields.name.placeholder')"
                :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              :label="$t('measurementUnit.form.fields.symbol.label')"
              prop="symbol"
              :rules="[{ required: true, message: $t('measurementUnit.form.rules.symbol_required') }]"
            >
              <el-input
                v-model="newMeasurementUnit.symbol"
                :placeholder="$t('measurementUnit.form.fields.symbol.placeholder')"
                :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              :label="$t('measurementUnit.form.fields.display_symbol.label')"
              prop="display_symbol"
              :rules="[{ required: true, message: $t('measurementUnit.form.rules.display_symbol_required') }]"
            >
              <el-input
                v-model="newMeasurementUnit.display_symbol"
                :placeholder="$t('measurementUnit.form.fields.display_symbol.placeholder')"
                :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              :label="$t('measurementUnit.form.fields.physical_quantity.label')"
              prop="physical_quantity"
              :rules="[{ required: true, message: $t('measurementUnit.form.rules.physical_quantity_required') }]"
            >
              <el-input
                v-model="newMeasurementUnit.physical_quantity"
                :placeholder="$t('measurementUnit.form.fields.physical_quantity.placeholder')"
                :size="store.size"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              :label="$t('measurementUnit.form.fields.measurement_category_id.label')"
              prop="measurement_category_id"
              :rules="[{ required: true, message: $t('measurementUnit.form.rules.category_required') }]"
            >
              <el-select
                v-model="newMeasurementUnit.measurement_category_id"
                :placeholder="$t('measurementUnit.form.fields.measurement_category_id.placeholder')"
                :size="store.size"
                style="width: 100%"
                filterable
                clearable
              >
                <el-option
                  v-for="category in categoryStore.dropdownCategories"
                  :key="category.id"
                  :label="category.name + ' (' + category.description + ')'"
                  :value="category.id"
                >
                  <span style="min-width: 80px; max-width: 80px;">{{ category.name }}</span>
                  <el-tag :size="store.size" style="margin-left: 10px">{{ category.description }}</el-tag>
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
          {{ $t('measurementUnit.form.buttons.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="validateAddForm"
          :size="store.size"
        >
          {{ $t('measurementUnit.form.buttons.add') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Диалог редактирования -->
    <el-dialog
      v-model="dialogVisible"
      :title="$t('measurementUnit.form.edit_title', { name: editingMeasurementUnit?.name })"
      :size="store.size"
      width="50%"
    >
      <el-form
        :model="editingMeasurementUnit"
        label-width="140px"
        ref="editForm"
        label-position="top"
        :size="store.size"
      >
        <el-form-item
          :label="$t('measurementUnit.form.fields.name.label')"
          prop="name"
          :rules="[{ required: true, message: $t('measurementUnit.form.rules.name_required') }]"
        >
          <el-input
            v-model="editingMeasurementUnit.name"
            :size="store.size"
          />
        </el-form-item>
        <el-form-item
          :label="$t('measurementUnit.form.fields.symbol.label')"
          prop="symbol"
          :rules="[{ required: true, message: $t('measurementUnit.form.rules.symbol_required') }]"
        >
          <el-input
            v-model="editingMeasurementUnit.symbol"
            :size="store.size"
          />
        </el-form-item>
        <el-form-item
          :label="$t('measurementUnit.form.fields.display_symbol.label')"
          prop="display_symbol"
          :rules="[{ required: true, message: $t('measurementUnit.form.rules.display_symbol_required') }]"
        >
          <el-input
            v-model="editingMeasurementUnit.display_symbol"
            :size="store.size"
          />
        </el-form-item>
        <el-form-item
          :label="$t('measurementUnit.form.fields.physical_quantity.label')"
          prop="physical_quantity"
          :rules="[{ required: true, message: $t('measurementUnit.form.rules.physical_quantity_required') }]"
        >
          <el-input
            v-model="editingMeasurementUnit.physical_quantity"
            :size="store.size"
          />
        </el-form-item>
        <el-form-item
          :label="$t('measurementUnit.form.fields.measurement_category_id.label')"
          prop="measurement_category_id"
          :rules="[{ required: true, message: $t('measurementUnit.form.rules.category_required') }]"
        >
          <el-select
            v-model="editingMeasurementUnit.measurement_category_id"
            :placeholder="$t('measurementUnit.form.fields.measurement_category_id.placeholder')"
            :size="store.size"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="category in categoryStore.dropdownCategories"
              :key="category.id"
              :label="category.name + ' (' + category.description + ')'"
              :value="category.id"
            >
              <span style="min-width: 80px; max-width: 80px;">{{ category.name }}</span>
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
          {{ $t('measurementUnit.form.buttons.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="validateEditForm"
          :size="store.size"
        >
          {{ $t('measurementUnit.form.buttons.save') }}
        </el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash-es';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { appStore } from "@/store/app";
import { useMeasurementUnitStore } from '@store/ElectricalProtection/measurementUnitStore.js';
import { useMeasurementCategoryStore } from '@store/ElectricalProtection/measurementCategoryStore.js';

const { t } = useI18n();

// Инициализация хранилищ
const store = appStore();
const measurementUnitStore = useMeasurementUnitStore();
const categoryStore = useMeasurementCategoryStore();

// Рефы для форм
const addForm = ref(null);
const editForm = ref(null);

// Опции для пагинации
const per_pages = ref([5, 10, 20, 30, 50, 100, 200]);

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
      message: t('measurementUnit.messages.add_success'),
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
    let errorMessage = t('measurementUnit.messages.error', { error: '' });

    // Обработка ошибок валидации
    if (error.errors) {
      errorMessage = Object.values(error.errors)
          .flat()
          .join('; ');
    }
    // Обработка стандартных ошибок
    else if (error.details) {
      errorMessage = `${t('measurementUnit.messages.error', { error: '' })}: ${error.details}`;
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
      message: t('measurementUnit.messages.update_success'),
      duration: 3000
    });

    dialogVisible.value = false;
  } catch (error) {
    let errorMessage = t('measurementUnit.messages.error', { error: '' });

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
        t('measurementUnit.messages.delete_confirm'),
        t('measurementUnit.messages.delete_confirm_title'),
        {
          confirmButtonText: t('table.general.delete'),
          cancelButtonText: t('table.general.cancel'),
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
          buttonSize: store.size
        }
    );

    await measurementUnitStore.delete(id);

    ElMessage.success({
      message: t('measurementUnit.messages.delete_success'),
      duration: 3000
    });

    if (measurementUnitStore.measurementUnits.length === 0 &&
        measurementUnitStore.pagination.current_page > 1) {
      measurementUnitStore.pagination.current_page--;
      loadMeasurementUnits();
    }
  } catch (error) {
    if (error !== 'cancel') {
      let errorMessage = t('measurementUnit.messages.error', { error: '' });

      if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.details) {
        errorMessage = `${t('measurementUnit.messages.error', { error: '' })}: ${error.details}`;
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
