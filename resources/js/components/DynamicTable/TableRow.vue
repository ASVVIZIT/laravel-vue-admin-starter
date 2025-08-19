<template>
  <tr class="table-row" :class="{ 'is-expanded': isExpanded, 'is-selected': isSelected }">
    <td class="expand-cell" @click.stop="toggleExpand">
      <el-icon v-if="hasChildren" :class="{ 'is-rotated': isExpanded }">
        <CaretRight />
      </el-icon>
    </td>

    <td v-for="(column, colIndex) in columns" :key="colIndex" class="row-cell">
      <TableCell
          :value="getRowData(column)"
          :column="column"
          :rowData="rowData"
          @update="updateCellData(column, $event)"
      />
    </td>

    <td class="actions-cell">
      <div class="row-actions">
        <el-button
            v-if="hasChildren"
            size="small"
            type="primary"
            circle
            @click.stop="addChildRow"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
        <el-button
            size="small"
            type="danger"
            circle
            @click.stop="confirmDeleteRow"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </td>

    <!-- Дочерние строки -->
    <td v-if="hasChildren && isExpanded" colspan="100%" class="children-container">
      <table class="children-table">
        <tbody>
        <TableRow
            v-for="child in rowData.children"
            :key="child.id"
            :rowData="child"
            :columns="columns"
            :level="level + 1"
            @row-updated="handleChildRowUpdated"
            @row-deleted="handleChildRowDeleted"
        />
        </tbody>
      </table>
    </td>
  </tr>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CaretRight, Plus, Delete } from '@element-plus/icons-vue';
import TableCell from './TableCell.vue';
import { dataSource } from './services/dataSource';

const props = defineProps({
  rowData: {
    type: Object,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  level: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['row-updated', 'row-deleted', 'row-selected']);

// Вычисляемое свойство для проверки наличия дочерних элементов
const hasChildren = computed(() => {
  return props.rowData.has_children || (props.rowData.children && props.rowData.children.length > 0);
});

// Состояние
const isExpanded = ref(false);
const isChildrenLoading = ref(false);
const isSelected = ref(false);

// Методы
const toggleExpand = async () => {
  if (!hasChildren.value) return;

  if (!isExpanded.value) {
    // Загружаем дочерние элементы, если они не загружены
    if (!props.rowData.children || props.rowData.children.length === 0) {
      try {
        isChildrenLoading.value = true;
        const response = await dataSource.fetchChildRows(props.rowData.id, {
          template_id: props.rowData.template_id
        });

        // Создаем корректную структуру для дочерних элементов
        const children = Array.isArray(response) ? response : response.data || [];

        // Форматируем данные
        const formattedChildren = children.map(child => ({
          ...child,
          children: child.children || [],
          has_children: child.has_children || child.children?.length > 0
        }));

        // Обновляем данные строки
        props.rowData.children = formattedChildren;
        props.rowData.has_children = formattedChildren.length > 0;
      } catch (err) {
        console.error('Ошибка загрузки дочерних строк:', err);
        ElMessage.error('Ошибка загрузки дочерних строк: ' + (err.response?.data?.message || err.message));
      } finally {
        isChildrenLoading.value = false;
      }
    }
    isExpanded.value = true;
  } else {
    isExpanded.value = !isExpanded.value;
  }
};

// Добавление дочерней строки
const addChildRow = async () => {
  try {
    // Создаем пустые данные для новой дочерней строки
    const rowData = {};
    props.columns.forEach(column => {
      switch (column.type) {
        case 'text':
          rowData[column.label] = '';
          break;
        case 'number':
          rowData[column.label] = 0;
          break;
        case 'select':
          // Устанавливаем null или первый доступный вариант
          rowData[column.label] = column.options && column.options.length > 0 ? column.options[0] : null;
          break;
        case 'reference':
          // Устанавливаем null для справочника (ID будет числом)
          rowData[column.label] = null;
          break;
        case 'date':
          // Устанавливаем текущую дату в правильном формате
          const today = new Date();
          const year = today.getFullYear();
          const month = (today.getMonth() + 1).toString().padStart(2, '0');
          const day = today.getDate().toString().padStart(2, '0');
          rowData[column.label] = `${year}-${month}-${day}`;
          break;
        case 'boolean':
          rowData[column.label] = false;
          break;
        default:
          rowData[column.label] = '';
      }
    });

    // Отправляем запрос на создание строки
    await dataSource.createRow({
      template_id: props.rowData.template_id,
      parent_id: props.rowData.id,
      data: rowData,
      order: props.rowData.children ? props.rowData.children.length : 0
    });

    // Перезагружаем данные
    await toggleExpand();
    ElMessage.success('Дочерняя строка добавлена');
  } catch (err) {
    console.error('Ошибка при добавлении дочерней строки:', err);
    ElMessage.error('Ошибка при добавлении дочерней строки: ' + (err.response?.data?.message || err.message));

    // Показываем детали ошибки валидации, если они есть
    if (err.response?.data?.errors) {
      Object.entries(err.response.data.errors).forEach(([field, errors]) => {
        errors.forEach(error => {
          ElMessage.error(`${field}: ${error}`);
        });
      });
    }
  }
};

// Обработка обновления дочерней строки
const handleChildRowUpdated = (updatedRow) => {
  if (props.rowData.children) {
    const updatedChildren = props.rowData.children.map(child =>
        child.id === updatedRow.id ? updatedRow : child
    );
    props.rowData.children = updatedChildren;
    emit('row-updated', { ...props.rowData });
  }
};

// Обработка удаления дочерней строки
const handleChildRowDeleted = (deletedRowId) => {
  if (props.rowData.children) {
    props.rowData.children = props.rowData.children.filter(child => child.id !== deletedRowId);
    // Если больше нет дочерних элементов, устанавливаем has_children в false
    if (props.rowData.children.length === 0) {
      props.rowData.has_children = false;
    }
    emit('row-updated', { ...props.rowData });
  }
};

// Удаление строки
const confirmDeleteRow = () => {
  ElMessageBox.confirm(
      'Вы действительно хотите удалить эту строку и все её дочерние элементы?',
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await dataSource.deleteRow(props.rowData.id);
      emit('row-deleted', props.rowData.id);
      ElMessage.success('Строка успешно удалена');
    } catch (err) {
      ElMessage.error('Ошибка удаления строки: ' + (err.response?.data?.message || err.message));
    }
  }).catch(() => {
    // Отмена удаления
  });
};

// Получение данных для ячейки
const getRowData = (column) => {
  return props.rowData.data?.[column.label];
};

// Обновление данных ячейки
const updateCellData = async (column, newValue) => {
  try {
    const updatedData = {
      ...props.rowData.data,
      [column.label]: newValue
    };

    await dataSource.updateRow(props.rowData.id, {
      data: updatedData,
      order: props.rowData.order
    });

    ElMessage.success('Данные обновлены');
  } catch (err) {
    ElMessage.error('Ошибка обновления данных: ' + (err.response?.data?.message || err.message));
    // Возвращаем исходное значение
    props.rowData.data[column.label] = getRowData(column);
  }
};
</script>

<style lang="scss" scoped>
.table-row {
  &.is-expanded {
    .expand-cell {
      .el-icon {
        transform: rotate(90deg);
      }
    }
  }

  &.is-selected {
    background-color: #e6f7ff;
    border: 1px solid #409eff;
  }

  .expand-cell {
    width: 40px;
    text-align: center;
    cursor: pointer;

    .el-icon {
      transition: transform 0.3s ease;

      &.is-rotated {
        transform: rotate(90deg);
      }
    }
  }

  .row-cell {
    padding: 4px 8px;
    border: 1px solid #ebeef5;
    text-align: left;
  }

  .actions-cell {
    width: 120px;
    padding: 0;

    .row-actions {
      display: flex;
      gap: 5px;
      padding: 4px;

      .el-button {
        padding: 4px;
      }
    }
  }

  .children-container {
    padding: 0 !important;
    border: none;

    .children-table {
      width: 100%;
      border-collapse: collapse;

      .table-row {
        .expand-cell {
          padding-left: 20px;
        }
      }
    }
  }
}
</style>
