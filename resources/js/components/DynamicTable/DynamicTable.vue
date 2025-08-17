<template>
  <div class="dynamic-table-container">
    <div class="table-header">
      <h2>Таблица: {{ currentTemplate?.name || 'Загрузка...' }}</h2>
      <div class="table-actions">
        <el-button type="primary" @click="addRow">
          <el-icon><Plus /></el-icon>
          Добавить строку
        </el-button>
        <el-button @click="toggleDataSource">
          {{ dataSource === 'api' ? 'Переключиться на моковые данные' : 'Переключиться на API' }}
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка данных...</span>
    </div>

    <div v-if="error" class="error-message">
      <el-alert type="error" :title="error" :closable="false" />
    </div>

    <div v-if="!loading && !error && rows.length === 0" class="empty-state">
      <el-empty description="В таблице пока нет данных">
        <el-button type="primary" @click="addRow">Добавить первую строку</el-button>
      </el-empty>
    </div>

    <div v-if="!loading && !error && rows.length > 0" class="table-wrapper">
      <table class="main-table">
        <thead>
        <tr>
          <th class="expand-header"></th>
          <th v-for="(column, index) in currentTemplate?.columns" :key="index" class="column-header">
            {{ column.label }}
          </th>
          <th class="actions-header">Действия</th>
        </tr>
        </thead>
        <tbody>
        <TableRow
            v-for="row in rows"
            :key="row.id"
            :rowData="row"
            :columns="currentTemplate?.columns || []"
            @row-updated="handleRowUpdated"
            @row-deleted="handleRowDeleted"
        />
        </tbody>
      </table>

      <div class="table-footer">
        <el-pagination
            v-model:current-page="pagination.current_page"
            v-model:page-size="pagination.per_page"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// resources/js/components/DynamicTable/DynamicTable.vue
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus, Loading } from '@element-plus/icons-vue';
import TableRow from '@/components/DynamicTable/TableRow.vue';
import { useTableStore } from './stores/tableStore';

const route = useRoute();
const tableStore = useTableStore();

// Состояние
const loading = ref(false);
const error = ref(null);

// Вычисляемые свойства
const currentTemplate = computed(() => tableStore.currentTemplate);
const rows = computed(() => tableStore.rows);
const dataSource = computed(() => tableStore.dataSource);
const pagination = computed({
  get: () => tableStore.pagination,
  set: (value) => {
    tableStore.pagination = value;
  }
});

// Методы
const loadTableData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const templateId = route.params.templateId;
    if (!templateId) {
      throw new Error('ID шаблона не указан');
    }

    // Проверяем, что шаблон загружен
    if (!currentTemplate.value) {
      await tableStore.fetchTemplate(templateId);
      if (!currentTemplate.value) {
        throw new Error('Не удалось загрузить шаблон');
      }
    }

    // Проверяем, что у шаблона есть колонки
    if (!currentTemplate.value.columns || currentTemplate.value.columns.length === 0) {
      throw new Error('Шаблон не содержит колонок');
    }

    await tableStore.resetAndFetchData(templateId);
  } catch (err) {
    error.value = 'Ошибка загрузки данных: ' + (err.response?.data?.message || err.message);
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};

const addRow = async () => {
  try {
    // Проверяем, что шаблон загружен и содержит колонки
    if (!currentTemplate.value || !currentTemplate.value.columns || currentTemplate.value.columns.length === 0) {
      ElMessage.warning('Сначала добавьте колонки в шаблон и сохраните его');
      return;
    }

    // Создаем пустой объект данных для всех колонок, используя label как ключи
    const emptyData = {};
    let hasTitleField = false;

    currentTemplate.value.columns.forEach(column => {
      // Проверяем, есть ли поле "Название" или "Name"
      const isTitleField = column.label.toLowerCase().includes('название') ||
          column.label.toLowerCase().includes('name');

      if (isTitleField) {
        emptyData[column.label] = `Новая строка ${rows.value.length + 1}`;
        hasTitleField = true;
      } else {
        emptyData[column.label] = '';
      }
    });

    // Если нет поля "Название", берем первую колонку текстового типа
    if (!hasTitleField) {
      const textColumn = currentTemplate.value.columns.find(col => col.type === 'text');
      if (textColumn) {
        emptyData[textColumn.label] = `Новая строка ${rows.value.length + 1}`;
      }
    }

    const newRow = {
      template_id: currentTemplate.value.id,
      data: emptyData,
      order: rows.value.length
    };

    await tableStore.addRow(newRow);
    await loadTableData();
  } catch (err) {
    ElMessage.error('Ошибка добавления строки: ' + (err.response?.data?.message || err.message));
  }
};

const handleRowUpdated = (updatedRow) => {
  // Обработка обновления строки
  console.log('Row updated:', updatedRow);
};

const handleRowDeleted = (deletedRowId) => {
  // Обработка удаления строки
  console.log('Row deleted:', deletedRowId);
};

const toggleDataSource = () => {
  tableStore.setDataSource(tableStore.dataSource === 'api' ? 'mock' : 'api');
  loadTableData();
};

const handlePageChange = (page) => {
  pagination.value.current_page = page;
  loadTableData();
};

const handleSizeChange = (size) => {
  pagination.value.per_page = size;
  loadTableData();
};

// Хуки
onMounted(() => {
  loadTableData();
});

// Следим за изменением параметров маршрута
watch(() => route.params.templateId, (newId) => {
  if (newId) {
    loadTableData();
  }
});
</script>

<style lang="scss" scoped>
.dynamic-table-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;

    h2 {
      margin: 0;
      font-size: 20px;
      color: #333;
    }
  }

  .loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;

    .el-icon {
      font-size: 24px;
      margin-bottom: 10px;
    }
  }

  .error-message {
    margin: 20px 0;
  }

  .empty-state {
    margin: 40px 0;
  }

  .table-wrapper {
    overflow-x: auto;

    .main-table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 8px 12px;
        border: 1px solid #ebeef5;
        text-align: left;
      }

      th {
        background-color: #f5f7fa;
        font-weight: 600;
      }

      .expand-header {
        width: 40px;
      }

      .actions-header {
        width: 120px;
      }
    }

    .table-footer {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
