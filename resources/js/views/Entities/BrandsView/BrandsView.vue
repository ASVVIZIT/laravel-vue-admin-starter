<template>
  <el-card class="brand-table-container">
    <h2>{{ $t('brand.table.title') }}</h2>

    <!-- Панель поиска и добавления -->
    <el-row :gutter="12" class="toolbar">
      <el-col :span="12" style="text-align: left">
        <el-input
            v-model="searchQuery"
            :placeholder="$t('brand.table.search_placeholder')"
            @input="debouncedSearch"
            @clear="debouncedSearch"
            :size="store.size"
            clearable
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
          <el-icon><Plus /></el-icon> {{ $t('brand.table.add_button') }}
        </el-button>
      </el-col>
    </el-row>

    <!-- Таблица брендов -->
    <el-table
        border
        style="width: 100%"
        :data="brandStore.brands"
        v-loading="brandStore.loading"
        :empty-text="$t('brand.table.empty_text')"
        :size="store.size"
        :height="tableHeight"
    >
      <el-table-column
          prop="id"
          :label="$t('brand.table.columns.id')"
          width="60"
          sortable
      />
      <el-table-column
          prop="name"
          :label="$t('brand.table.columns.name')"
          sortable
      />
      <el-table-column
          prop="country"
          :label="$t('brand.table.columns.country')"
          width="110"
          sortable
      />
      <el-table-column
          prop="website"
          :label="$t('brand.table.columns.website')"
          fixed="right"
          sortable
      >
        <template #default="{row}">
          <el-link :href="row.website" target="_blank" type="primary" :size="store.size">
            {{ row.website }}
          </el-link>
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('brand.table.actions')"
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
          <span>{{ $t('brand.table.per_page_selector') }}</span>
          <el-select
              v-model="brandStore.pagination.per_page"
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
            :total="brandStore.pagination.total"
            :page-size="brandStore.pagination.per_page"
            :current-page="brandStore.pagination.current_page"
            @current-change="handlePageChange"
            :size="store.size"
        />
      </div>
      <div class="total-items">
        {{ $t('brand.table.total_items') }} {{ brandStore.pagination.total }}
      </div>
    </div>

    <!-- Диалог добавления -->
    <el-dialog
        v-model="dialogVisibleAdd"
        :title="$t('brand.form.add_title')"
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
                :label="$t('brand.form.fields.name.label')"
                prop="name"
                :rules="[{ required: true, message: $t('brand.form.rules.name_required') }]"
            >
              <el-input
                  v-model="newBrand.name"
                  :placeholder="$t('brand.form.fields.name.placeholder')"
                  :size="store.size"
                  clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                :label="$t('brand.form.fields.country.label')"
                prop="country"
            >
              <el-input
                  v-model="newBrand.country"
                  :placeholder="$t('brand.form.fields.country.placeholder')"
                  :size="store.size"
                  clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                :label="$t('brand.form.fields.website.label')"
                prop="website"
                :rules="[
                  { required: true, message: $t('brand.form.rules.website_required') },
                  { type: 'url', message: $t('brand.form.rules.website_url') }
                ]"
            >
              <el-input
                  v-model="newBrand.website"
                  :placeholder="$t('brand.form.fields.website.placeholder')"
                  :size="store.size"
                  clearable
              >
                <template #prepend>http://</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
                :label="$t('brand.form.fields.description.label')"
                prop="description"
            >
              <el-input
                  v-model="newBrand.description"
                  type="textarea"
                  :placeholder="$t('brand.form.fields.description.placeholder')"
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
          {{ $t('brand.form.buttons.cancel') }}
        </el-button>
        <el-button
            type="primary"
            @click="validateAddForm"
            :size="store.size"
        >
          {{ $t('brand.form.buttons.add') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Диалог редактирования -->
    <el-dialog
        v-model="dialogVisible"
        :title="$t('brand.form.edit_title', { name: editingBrand?.name })"
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
            :label="$t('brand.form.fields.name.label')"
            prop="name"
            :rules="[{ required: true, message: $t('brand.form.rules.name_required') }]"
        >
          <el-input
              v-model="editingBrand.name"
              :size="store.size"
              clearable
          />
        </el-form-item>
        <el-form-item
            :label="$t('brand.form.fields.country.label')"
            prop="country"
        >
          <el-input
              v-model="editingBrand.country"
              :size="store.size"
              clearable
          />
        </el-form-item>
        <el-form-item
            :label="$t('brand.form.fields.website.label')"
            prop="website"
            :rules="[
              { required: true, message: $t('brand.form.rules.website_required') },
              { type: 'url', message: $t('brand.form.rules.website_url') }
            ]"
        >
          <el-input
              v-model="editingBrand.website"
              :size="store.size"
              clearable
          />
        </el-form-item>
        <el-form-item
            :label="$t('brand.form.fields.description.label')"
            prop="description"
        >
          <el-input
              v-model="editingBrand.description"
              type="textarea"
              :rows="3"
              :size="store.size"
              clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button
            @click="dialogVisible = false"
            :size="store.size"
        >
          {{ $t('brand.form.buttons.cancel') }}
        </el-button>
        <el-button
            type="primary"
            @click="validateEditForm"
            :size="store.size"
        >
          {{ $t('brand.form.buttons.save') }}
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
import { useBrandStore } from '@store/ElectricalProtection/brandStore.js';

const { t } = useI18n();

// Инициализация хранилищ
const store = appStore();
const brandStore = useBrandStore();

// Рефы для форм
const addForm = ref(null);
const editForm = ref(null);

// Опции для пагинации
const per_pages = ref([5, 10, 20, 30, 50, 100, 200]);

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
  label: t('brand.table.actions'),
  fixed: 'right',
  item_actions: [
    {
      name: 'edit',
      type: 'primary',
      icon: Edit,
      label: t('brand.table.item_actions.edit'),
    },
    {
      name: 'delete',
      type: 'danger',
      icon: Delete,
      label: t('brand.table.item_actions.delete'),
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
      message: t('brand.messages.add_success'),
      duration: 3000
    });

    dialogVisibleAdd.value = false;
    newBrand.value = { name: '', country: '', website: '', description: '' };
  } catch (error) {
    let errorMessage = error.message || t('brand.messages.error', { error: '' });

    // Обработка ошибок валидации
    if (error.errors) {
      errorMessage = Object.values(error.errors)
          .flat()
          .join('; ');
    }
    // Обработка стандартных ошибок
    else if (error.details) {
      errorMessage = `${t('brand.messages.error', { error: '' })}: ${error.details}`;
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
      message: t('brand.messages.update_success'),
      duration: 3000
    });

    dialogVisible.value = false;
  } catch (error) {
    let errorMessage = error.message || t('brand.messages.error', { error: '' });

    if (error.errors) {
      errorMessage = Object.values(error.errors)
          .flat()
          .join('; ');
    }
    else if (error.details) {
      errorMessage = `${t('brand.messages.error', { error: '' })}: ${error.details}`;
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
        t('brand.messages.delete_confirm'),
        t('brand.messages.delete_confirm_title'),
        {
          confirmButtonText: t('table.general.delete'),
          cancelButtonText: t('table.general.cancel'),
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
          buttonSize: store.size
        }
    );

    await brandStore.delete(id);

    ElMessage.success({
      message: t('brand.messages.delete_success'),
      duration: 3000
    });

    if (brandStore.brands.length === 0 && brandStore.pagination.current_page > 1) {
      brandStore.pagination.current_page--;
      loadBrands();
    }
  } catch (error) {
    if (error !== 'cancel') {
      let errorMessage = error.message || t('brand.messages.error', { error: '' });

      if (error.response && error.response.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.details) {
        errorMessage = `${t('brand.messages.error', { error: '' })}: ${error.details}`;
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
