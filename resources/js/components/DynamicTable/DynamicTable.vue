<template>
  <div class="dynamic-table">
    <div class="data-source-selector">
      <label>Источник данных:</label>
      <select
          v-model="selectedDataSource"
          @change="handleDataSourceChange"
          :disabled="store.loading"
      >
        <option value="api">Сервер 1 (API)</option>
        <option value="mock">Мок Сервер 2</option>
      </select>
      <span v-if="store.loading" class="loading-indicator">Загрузка...</span>
    </div>

    <table>
      <thead>
      <tr>
        <th style="width: 30px;"></th>
        <th v-for="column in columns" :key="column.id">
          {{ column.label }}
        </th>
        <th style="width: 50px;">Actions</th>
      </tr>
      </thead>
      <tbody>
      <TableRow
          v-for="row in rows"
          :key="row.id"
          :row-data="row"
          :columns="columns"
          :level="0"
      />
      </tbody>
    </table>

    <div v-if="store.error" class="error-message">
      Ошибка: {{ store.error }}
    </div>
  </div>
</template>

<script setup>
import {ElMessage} from "element-plus";
import { ref, computed, onMounted } from 'vue';
import TableRow from './TableRow.vue';
import { useTableStore } from './stores/tableStore';

const props = defineProps({
  templateId: {
    type: Number,
    required: true
  }
});

const store = useTableStore();
const selectedDataSource = ref('api');

const columns = computed(() => store.currentTemplate?.columns || []);
const rows = computed(() => store.rows);

const handleDataSourceChange = async () => {
  console.log('[DynamicTable] Выбран источник:', selectedDataSource.value); // Должно выводить "api" или "mock"
  try {
    await store.setDataSource(selectedDataSource.value);
    await store.resetAndFetchData(props.templateId);
  } catch (error) {
    console.error('[DynamicTable] Ошибка переключения:', error);
    ElMessage.error('Ошибка переключения режима');
  }
/*
  await store.setDataSource(selectedDataSource.value);
  await store.resetAndFetchData();*/
};

onMounted(async () => {
  console.log('[DynamicTable] Монтирование компонента');
  try {
    await store.fetchTemplate(props.templateId);
    await store.resetAndFetchData(props.templateId);
    console.log('[DynamicTable] Первоначальные данные:', store.rows);
  } catch (error) {
    console.error('[DynamicTable] Ошибка инициализации:', error);
  }
});

watch(store.rows, (newRows) => {
  console.log('[DynamicTable] Обновленные данные:', newRows);
});

</script>

<style lang="scss">
.dynamic-table {
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow-x: auto;

  .data-source-selector {
    padding: 8px;
    background: #f8f9fa;
    border-bottom: 1px solid #ddd;

    select {
      margin-left: 8px;
      padding: 2px 4px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    .loading-indicator {
      margin-left: 10px;
      color: #666;
      font-size: 0.9em;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 100%;

    th, td {
      padding: 4px;
      border: 1px solid #ddd;
      text-align: left;
    }

    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
  }

  .error-message {
    padding: 15px;
    color: #dc3545;
    background: #fff5f5;
    border: 1px solid #ffd6d6;
    margin: 10px;
    border-radius: 4px;
  }
}
</style>
