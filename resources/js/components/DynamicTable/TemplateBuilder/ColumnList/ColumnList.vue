<!-- resources/js/components/DynamicTable/TemplateBuilder/ColumnList/ColumnList.vue -->
<template>
  <div class="columns-section">
    <div class="section-header">
      <h3>Колонки шаблона</h3>
      <div class="column-creation">
        <el-select
            v-model="newColumnType"
            placeholder="Тип колонки"
            clearable
            style="width: 150px; margin-right: 10px;"
        >
          <el-option
              v-for="type in columnTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
          />
        </el-select>
        <el-button type="success" @click="addColumn">
          <el-icon><Plus /></el-icon>
          Добавить колонку
        </el-button>
      </div>
    </div>

    <el-alert
        v-if="columns.length === 0"
        type="info"
        :closable="false"
        style="margin-bottom: 10px;"
    >
      Добавьте хотя бы одну колонку для создания шаблона
    </el-alert>

    <div class="columns-table-container" ref="columnsListRef">
      <draggable
          v-model="internalColumns"
          item-key="tempId"
          tag="div"
          class="columns-table"
          :animation="200"
          ghost-class="drag-ghost"
          chosen-class="drag-chosen"
          drag-class="drag-class"
          @start="onDragStart"
          @end="onDragEnd"
          handle=".sort-handle"
          :scroll-sensitivity="100"
          :scroll-speed="10"
          :force-fallback="false"
          :fallback-tolerance="0"
          :fallback-on-body="false"
          :scroll="true"
          :scroll-auto-threshold="50"
          ref="columnsDraggableRef"
      >
        <template #item="{ element, index }">
          <ColumnRow
              :column="element"
              :index="index"
              :is-active="selectedIndex === index"
              @click="selectColumn(index)"
              @remove="removeColumn(index)"
              @update-column="updateColumn(index, $event)"
              @mouseenter="onRowMouseEnter(index)"
              @mouseleave="onRowMouseLeave"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
/**
 * @component ColumnList
 *
 * Компонент списка колонок шаблона с поддержкой перетаскивания (DnD).
 * Отображает список колонок, позволяет изменять их порядок и удалять.
 *
 * @props {Array} columns - Массив колонок шаблона
 * @props {number|null} selectedColumnIndex - Индекс выбранной колонки
 * @props {Array} columnTypes - Доступные типы колонок
 *
 * @emits {Event} update:columns - Событие обновления порядка колонок
 * @param {Array} newColumns - Новый порядок колонок
 * @emits {Event} column-select - Событие выбора колонки
 * @param {number} index - Индекс выбранной колонки
 * @emits {Event} column-remove - Событие удаления колонки
 * @param {number} index - Индекс удаляемой колонки
 * @emits {Event} column-add - Событие добавления колонки
 * @param {Object} columnData - Данные новой колонки
 * @emits {Event} column-update - Событие обновления колонки
 * @param {number} index - Индекс обновляемой колонки
 * @param {Object} updatedColumn - Объект обновленной колонки
 */
import { ref, computed, watch, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import ColumnRow from './ColumnRow.vue';

const props = defineProps({
  /**
   * Массив колонок шаблона
   * @type {Array}
   */
  columns: {
    type: Array,
    required: true,
    default: () => []
  },
  /**
   * Индекс выбранной колонки
   * @type {number|null}
   */
  selectedColumnIndex: {
    type: Number,
    default: null
  },
  /**
   * Доступные типы колонок
   * @type {Array}
   */
  columnTypes: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits([
  /**
   * Событие обновления порядка колонок
   * @param {Array} newColumns - Новый порядок колонок
   */
  'update:columns',
  /**
   * Событие выбора колонки
   * @param {number} index - Индекс выбранной колонки
   */
  'column-select',
  /**
   * Событие удаления колонки
   * @param {number} index - Индекс удаляемой колонки
   */
  'column-remove',
  /**
   * Событие добавления колонки
   * @param {Object} columnData - Данные новой колонки
   */
  'column-add',
  /**
   * Событие обновления колонки
   * @param {number} index - Индекс обновляемой колонки
   * @param {Object} updatedColumn - Объект обновленной колонки
   */
  'column-update'
]);

const internalColumns = ref([...props.columns]);
const newColumnType = ref('text');
const columnsListRef = ref(null);
const columnsDraggableRef = ref(null);

const selectedIndex = computed(() => props.selectedColumnIndex);

// === ИСПРАВЛЕНИЕ: Синхронизация internalColumns с props.columns ===
watch(() => props.columns, (newVal) => {
  console.log(`[ColumnList.watch.props.columns] TRIGGERED`);
  console.log(`[ColumnList.watch.props.columns] props.columns:`, JSON.parse(JSON.stringify(newVal)));
  console.log(`[ColumnList.watch.props.columns] internalColumns.value (before):`, JSON.parse(JSON.stringify(internalColumns.value)));

  if (JSON.stringify(internalColumns.value) !== JSON.stringify(newVal)) {
    internalColumns.value = [...newVal];
    console.log(`[ColumnList.watch.props.columns] internalColumns.value UPDATED`);
  } else {
    console.log(`[ColumnList.watch.props.columns] internalColumns.value NO CHANGE NEEDED`);
  }
  console.log(`[ColumnList.watch.props.columns] FINISHED`);
}, { deep: true });
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

// === ИСПРАВЛЕНИЕ: Эмит изменений из internalColumns ===
watch(internalColumns, (newVal) => {
  console.log(`[ColumnList.watch.internalColumns] TRIGGERED`);
  console.log(`[ColumnList.watch.internalColumns] newVal:`, JSON.parse(JSON.stringify(newVal)));
  emit('update:columns', newVal.map((col, index) => ({
    ...col,
    order: index
  })));
  console.log(`[ColumnList.watch.internalColumns] EMITTED 'update:columns'`);
  console.log(`[ColumnList.watch.internalColumns] FINISHED`);
}, { deep: true });
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

const selectColumn = (index) => {
  console.log(`[ColumnList.selectColumn] CALLED with index: ${index}`);
  emit('column-select', index);
  console.log(`[ColumnList.selectColumn] EMITTED 'column-select' with index: ${index}`);
  console.log(`[ColumnList.selectColumn] FINISHED`);
};

const removeColumn = (index) => {
  console.log(`[ColumnList.removeColumn] CALLED with index: ${index}`);
  emit('column-remove', index);
  console.log(`[ColumnList.removeColumn] EMITTED 'column-remove' with index: ${index}`);
  console.log(`[ColumnList.removeColumn] FINISHED`);
};

const updateColumn = (index, updatedColumn) => {
  console.log(`[ColumnList.updateColumn] CALLED with index: ${index} and updatedColumn:`, updatedColumn);
  emit('column-update', index, updatedColumn);
  console.log(`[ColumnList.updateColumn] EMITTED 'column-update' with index: ${index} and updatedColumn`);
  console.log(`[ColumnList.updateColumn] FINISHED`);
};

const addColumn = () => {
  console.log(`[ColumnList.addColumn] CALLED`);
  if (!newColumnType.value) {
    console.warn(`[ColumnList.addColumn] newColumnType is empty`);
    return;
  }

  const newColumnData = {
    type: newColumnType.value,
    label: `Колонка ${internalColumns.value.length + 1}`,
    order: internalColumns.value.length
  };
  console.log(`[ColumnList.addColumn] newColumnData:`, newColumnData);

  emit('column-add', newColumnData);
  console.log(`[ColumnList.addColumn] EMITTED 'column-add' with newColumnData`);
  console.log(`[ColumnList.addColumn] FINISHED`);

  newColumnType.value = 'text';
};

// === ИСПРАВЛЕНИЕ: Улучшенная логика DnD ===
const onDragStart = (event) => {
  console.log(`[ColumnList.onDragStart] DRAG STARTED`);
  console.log(`[ColumnList.onDragStart] event:`, event);
  console.log(`[ColumnList.onDragStart] event.oldIndex: ${event.oldIndex}`);
  // Добавляем класс к body для глобальных стилей
  document.body.classList.add('column-list-dragging-in-progress');
  // Отключаем выделение текста во время перетаскивания
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
  document.body.style.mozUserSelect = 'none';
  document.body.style.msUserSelect = 'none';
  // Устанавливаем курсор на grabbing
  document.body.style.cursor = 'grabbing';
  console.log(`[ColumnList.onDragStart] Added class 'column-list-dragging-in-progress' to body`);
  console.log(`[ColumnList.onDragStart] Disabled text selection and set cursor to grabbing`);
};

const onDragEnd = (event) => {
  console.log(`[ColumnList.onDragEnd] DRAG ENDED`);
  console.log(`[ColumnList.onDragEnd] event:`, event);
  console.log(`[ColumnList.onDragEnd] event.oldIndex: ${event.oldIndex}, event.newIndex: ${event.newIndex}`);

  // Убираем класс с body
  document.body.classList.remove('column-list-dragging-in-progress');
  // Включаем выделение текста
  document.body.style.userSelect = '';
  document.body.style.webkitUserSelect = '';
  document.body.style.mozUserSelect = '';
  document.body.style.msUserSelect = '';
  // Сбрасываем курсор
  document.body.style.cursor = '';
  console.log(`[ColumnList.onDragEnd] Removed class 'column-list-dragging-in-progress' from body`);
  console.log(`[ColumnList.onDragEnd] Enabled text selection and reset cursor`);

  // Обновляем порядок колонок
  const updatedColumns = internalColumns.value.map((col, index) => ({
    ...col,
    order: index
  }));
  console.log(`[ColumnList.onDragEnd] Updated columns after DnD:`, JSON.parse(JSON.stringify(updatedColumns)));
  console.log(`[ColumnList.onDragEnd] Emitting 'update:columns' with updatedColumns`);
  emit('update:columns', updatedColumns);
  console.log(`[ColumnList.onDragEnd] FINISHED`);
};
// === КОНЕЦ ИСПРАВЛЕНИЯ ===

const onRowMouseEnter = (index) => {
  // Логика для зоны сброса, если нужна
};

const onRowMouseLeave = () => {
  // Логика для зоны сброса, если нужна
};
</script>

<style lang="scss" scoped>
.columns-section {
  flex: 1;
  background-color: #fff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-shrink: 0;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .column-creation {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      .el-select {
        width: 150px;

        :deep(.el-input__wrapper) {
          padding: 0 8px;
          height: 28px;
          line-height: 28px;
        }
        :deep(.el-input__inner) {
          height: 28px;
          line-height: 28px;
          padding: 0 8px;
          font-size: 13px;
        }
        :deep(.el-input__prefix) {
          .el-icon {
            font-size: 14px;
          }
        }
      }

      .el-button {
        height: 28px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;

        .el-icon {
          margin-right: 5px;
          width: 14px;
          height: 14px;

          > svg {
            width: 14px;
            height: 14px;
          }
        }
      }
    }
  }

  .columns-table-container {
    flex: 1;
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 2px;
    position: relative;

    .columns-table {
      width: 100%;

      .draggable-columns-list {
        min-height: 50px;
      }
    }
  }
}

/* Стили для drag-and-drop - улучшенные */
.drag-ghost {
  opacity: 0.8 !important;
  background-color: #ecf5ff !important;
  border: 1px dashed #409eff !important;
  transform: scale(1.02) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 1000 !important;
  position: relative !important;
  transition: all 0.2s ease !important;
  cursor: grabbing !important;

  .column-row {
    border: 1px solid #409eff !important;
    background-color: #fff !important;
    box-shadow: none !important;

    .sort-handle {
      color: #409eff !important;
    }
  }
}

.drag-chosen {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
  border-right: 3px solid #409eff;
}

.drag-class {
  display: none;
}

// Глобальные стили для body во время перетаскивания
.column-list-dragging-in-progress {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  cursor: grabbing !important;
}
</style>
