<template>
    <el-card class="accessories-container">
      <div class="header-section">
        <div class="header-with-button">
          <h2>Список аксессуаров</h2>
          <el-button
              type="primary"
              @click="$router.push({ name: 'AccessoryCreate' })"
              :size="store.size"
              class="compact-btn"
          >
            <el-icon><Plus /></el-icon> Добавить аксессуар
          </el-button>
        </div>

        <!-- Панель поиска -->
        <el-input
            v-model="searchQuery"
            placeholder="Поиск по модели, названию или бренду..."
            clearable
            @input="debouncedSearch"
            @clear="debouncedSearch"
            :size="store.size"
            class="search-input compact-input"
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
          empty-text="Нет данных"
          :size="store.size"
          class="accessories-table"
          :height="tableHeight"
      >
        <el-table-column prop="id" label="ID" width="50" />
        <el-table-column prop="name" label="Название" />
        <el-table-column prop="model" label="Модель" width="150"/>
        <el-table-column label="Бренд" width="110">
          <template #default="{ row }">
            {{ row.brand?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Тип" width="130">
          <template #default="{ row }">
            {{ row.type?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="Совместимые модели">
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

        <el-table-column label="Действия" fixed="right" width="100">
          <template #default="{ row }">
            <el-button-group :size="store.size">
              <el-button
                  type="primary"
                  :icon="Edit"
                  title="Редактировать"
                  @click="editAccessory(row.id)"
                  circle
                  class="action-btn"
              />
              <el-button
                  type="danger"
                  :icon="Delete"
                  title="Удалить"
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
        />
        <div class="total-items">
          Всего записей: {{ accessoryStore.pagination.total }}
        </div>
      </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash-es';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { appStore } from "@/store/app";
import { useAccessoryStore } from '@/store/accessoryStore';

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
  await accessoryStore.fetchAll({
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
        'Вы уверены, что хотите удалить аксессуар? Это действие нельзя отменить.',
        'Подтверждение удаления',
        {
          confirmButtonText: 'Удалить',
          cancelButtonText: 'Отмена',
          type: 'warning',
          confirmButtonClass: 'el-button--danger',
          buttonSize: store.size
        }
    );

    await accessoryStore.delete(id);
    ElMessage.success('Аксессуар успешно удален');

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Ошибка при удалении аксессуара: ' + (error.message || error));
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
  accessoryStore.pagination.per_page = 20; // По умолчанию 5 строк
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
 /* font-size: 13px;*/
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
