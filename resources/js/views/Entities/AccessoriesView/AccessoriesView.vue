<template>
    <el-card class="accessories-container">
      <div class="header-section">
        <div class="header-with-button">
          <h2>{{ $t('accessory.table.title') }}</h2>
          <el-button
              type="primary"
              @click="$router.push({ name: 'AccessoryCreate' })"
              :size="store.size"
              class="compact-btn"
          >
            <el-icon><Plus /></el-icon> {{ $t('accessory.table.add_button') }}
          </el-button>
        </div>

        <!-- Панель поиска -->
        <el-input
          v-model="searchQuery"
          :placeholder="$t('accessory.table.search_placeholder')"
          @input="debouncedSearch"
          @clear="debouncedSearch"
          :size="store.size"
          class="search-input compact-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- Таблица аксессуаров - ОСНОВНЫЕ ИЗМЕНЕНИЯ ЗДЕСЬ -->
      <el-table
        border
        :data="accessoryStore.accessories"
        v-loading="accessoryStore.loading"
        :empty-text="$t('accessory.table.empty_text')"
        :size="store.size"
        class="accessories-table"
        :height="tableHeight"
      >
        <el-table-column
          prop="id"
          :label="$t('accessory.table.columns.id')"
          width="60"
          sortable
        />
        <el-table-column
          prop="name"
          :label="$t('accessory.table.columns.name')"
          sortable
        />
        <el-table-column
          prop="model"
          :label="$t('accessory.table.columns.model')"
          width="150"
          sortable
        />
        <el-table-column
          :label="$t('accessory.table.columns.brand')"
          width="110"
          sortable
        >
          <template #default="{ row }">
            {{ row.brand?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('accessory.table.columns.type')"
          width="130"
          sortable
        >
          <template #default="{ row }">
            {{ row.type?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('accessory.table.columns.compatible_models')"
          sortable
        >
          <template #default="{ row }">
            <el-tooltip
              v-if="row.compatible_models"
              :content="row.compatible_models"
              placement="top"
            >
              <span class="truncate-text">{{ row.compatible_models }}</span>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('accessory.table.actions')"
          fixed="right"
          width="100"
        >
          <template #default="{ row }">
            <el-button-group :size="store.size">
              <el-button
                type="primary"
                :icon="Edit"
                :title="$t('accessory.table.columns.edit')"
                @click="editAccessory(row.id)"
                circle
                class="action-btn"
              />
              <el-button
                type="danger"
                :icon="Delete"
                :title="$t('accessory.table.columns.delete')"
                @click="deleteAccessory(row.id)"
                circle
                class="action-btn"
              />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- Пагинация с выбором количества строк -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="sizes, prev, pager, next, jumper"
          :total="accessoryStore.pagination.total"
          :page-size="accessoryStore.pagination.per_page"
          :page-sizes="[5, 10, 20, 50, 100, 200, 300]"
          :current-page="accessoryStore.pagination.current_page"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          :size="store.size"
          class="compact-pagination"
          sortable
        />
        <div class="total-items">
          {{ $t('accessory.table.total_items') }} {{ accessoryStore.pagination.total }}
        </div>
      </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash-es';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { appStore } from '@/store/appStore'
import { useAccessoryStore } from '@store/ElectricalProtection/accessoryStore.js';

const { t } = useI18n();

const store = appStore();
const accessoryStore = useAccessoryStore();
const router = useRouter();

const searchQuery = ref('');

// Дебаунс для поиска
const debouncedSearch = debounce(() => {
  accessoryStore.pagination.current_page = 1;
  loadAccessories();
}, 400);

// Загрузка данных
const loadAccessories = async () => {
  await accessoryStore.fetchPaginated({
    search: searchQuery.value,
    page: accessoryStore.pagination.current_page,
    per_page: accessoryStore.pagination.per_page
  });
};

// Обработчик пагинации
const handlePageChange = (page) => {
  accessoryStore.pagination.current_page = page;
  loadAccessories();
};

// Обработчик изменения количества элементов на странице
const handleSizeChange = (per_page) => {
  accessoryStore.pagination.per_page = per_page;
  accessoryStore.pagination.current_page = 1;
  loadAccessories();
};

// Редактирование аксессуара
const editAccessory = (id) => {
  router.push({ name: 'AccessoryEdit', params: { id } });
};

// Удаление аксессуара
const deleteAccessory = async (id) => {
  try {
    await ElMessageBox.confirm(
      t('accessory.messages.delete_confirm'),
      t('accessory.messages.delete_confirm_title'),
      {
        confirmButtonText: t('table.general.delete'),
        cancelButtonText: t('table.general.cancel'),
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        buttonSize: store.size
      }
    );

    await accessoryStore.delete(id);
    ElMessage.success(t('accessory.messages.delete_success'));

  } catch (error) {
    if (error !== 'cancel') {
      let errorMessage = error.message || t('accessory.messages.error', { error: '' });

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

const tableHeight = ref('calc(100vh - 1000px)');

function updateTableHeight() {
  const titleHeight = 50;
  const tagHeight = 50;
  const headerHeight = 130;      // Высота вашего заголовка
  const paginationHeight = 60;   // Высота пагинации
  const offset = 30;             // Дополнительные отступы

  tableHeight.value = `calc(100vh - ${titleHeight + tagHeight + headerHeight + paginationHeight + offset}px)`;
}

// Инициализация
onMounted(() => {
  // Установка начального размера пагинации
  accessoryStore.pagination.per_page = 20; // По умолчанию 20 строк
  loadAccessories();

  updateTableHeight();
  window.addEventListener('resize', updateTableHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTableHeight);
});
</script>

<style scoped>
.accessories-container {
  margin: 10px;
}

.header-section {
  margin-bottom: 5px;
}

.header-with-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  flex-wrap: wrap;
  gap: 5px;
}

.search-input {
  margin-bottom: 5px;
}

.accessories-table {
  flex: 1;
  width: 100%;
  margin-bottom: 5px;
}

.accessories-table :deep(.el-table__inner-wrapper) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.accessories-table :deep(.el-table__header-wrapper) {
  flex-shrink: 0;
}

.accessories-table :deep(.el-table__body-wrapper) {
  flex: 1;
  overflow: auto;
}

.truncate-text {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.total-items {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

/* Компактные стили */
.compact-input :deep(.el-input__inner) {
  height: 36px;
  padding: 0 8px;
  font-size: 12px;
}

.accessories-table :deep(.el-table__cell) {
  padding: 6px 0;
}
.accessories-table :deep(.cell) {
  padding: 0 5px;
  max-height: 40px;
  line-height: 1.5;
}

.compact-btn {
  padding: 4px 8px;
  font-size: 13px;
}

.action-btn {
  padding: 6px;
}

.compact-pagination :deep(.number),
.compact-pagination :deep(.btn-prev),
.compact-pagination :deep(.btn-next) {
  min-width: 28px;
  height: 28px;
  line-height: 28px;
  font-size: 12px;
}

.compact-pagination :deep(.el-pagination__jump) {
  margin-left: 8px;
  font-size: 12px;
}

.compact-pagination :deep(.el-pagination__sizes) {
  margin-right: 8px;
}

/* Медиа-запросы для адаптации высоты */

@media (max-width: 768px) {
  .accessories-container {
    margin: 4px;
    padding: 4px;
  }

  .header-with-button {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .header-with-button h2 {
    margin-bottom: 5px;
  }

  .pagination-container {
    align-items: center;
  }

  .compact-pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .compact-pagination :deep(.el-pagination__sizes) {
    margin: 0 0 10px 0;
    width: 100%;
    text-align: center;
  }

  .compact-pagination :deep(.el-pagination__jump) {
    margin: 10px 0 0 0;
    width: 100%;
    text-align: center;
  }

  /* Адаптация высоты таблицы для мобильных */
  .accessories-table {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>
