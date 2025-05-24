<template>
  <tr class="table-row" :style="indentStyle">
    <td class="expand-cell">
      <button v-if="hasChildren" @click="toggleExpand" :disabled="isChildrenLoading">
        {{ isExpanded ? '▼' : '▶' }}
        <span v-if="isChildrenLoading">⌛</span>
      </button>
    </td>

    <TableCell
        v-for="column in columns"
        :key="column.id"
        :value="rowData.data[column.label]"
        :column="column"
        @update="handleCellUpdate(column.label, $event)"
    />

    <td class="actions">
      <button @click="deleteRow">✕</button>
    </td>
  </tr>

  <template v-if="isExpanded && hasChildren">
    <TableRow
        v-for="child in rowData.children"
        :key="`${child.id}-${child.updatedAt}`"
        :row-data="child"
        :columns="columns"
        :level="level + 1"
    />
  </template>
</template>

<!-- TableRow.vue -->
<script setup>
import { computed, ref, watch } from 'vue';
import TableCell from './TableCell.vue';

import { useTableStore } from './stores/tableStore';
const store = useTableStore();

const props = defineProps({
  rowData: {
    type: Object,
    required: true,
    validator: (row) => {
      return 'children' in row && Array.isArray(row.children);
    },
    // Гарантируем наличие children и has_children
    default: () => ({
      children: [],
      has_children: false,
      data: {},
      id: null
    })
  },
  columns: {
    type: Array,
    required: true
  },
  level: Number
});

console.log(`[TableRow ${props.rowData.id}] Initializing, level: ${props.level}`);

// Реактивные свойства
const isExpanded = computed(() => store.expandedRows.has(props.rowData.id));

const columns = computed(() => store.currentTemplate?.columns || []);

// Вместо хардкода проверяйте наличие дочерних элементов
const hasChildren = computed(() => {
  // Явная проверка всех возможных вариантов
  return !!(
      props.rowData.has_children ||
      props.rowData.children?.length ||
      props.rowData._meta?.hasChildren
  );
});

const indentStyle = computed(() => ({
  paddingLeft: `${props.level * 20}px`
}));



// Упрощенная логика расширения/сворачивания
const isChildrenLoading = ref(false);

const toggleExpand = async () => {
  if (isChildrenLoading.value) return;

  const wasExpanded = store.expandedRows.has(props.rowData.id);
  store.toggleRow(props.rowData.id);
  if (wasExpanded) return;

  try {
    isChildrenLoading.value = true;
    await store.fetchChildRows(props.rowData.id);
  } catch (error) {
    console.error(`[TableRow] Ошибка загрузки дочерних строк:`, error);
    // Закрываем строку при ошибке
    store.toggleRow(props.rowData.id);
    ElMessage.error('Не удалось загрузить данные');
  } finally {
    isChildrenLoading.value = false;
  }
};

// Удаление строки
const deleteRow = async () => {
  await store.deleteRow(props.rowData.id);
};

</script>
<style lang="scss">
.table-row td {
  transition: background 0.3s;
}

/* Для дочерних строк */
.table-row[data-level="1"] td {
  background: #f8f9fa;
}

.table-row[data-level="2"] td {
  background: #e9ecef;
}
</style>
