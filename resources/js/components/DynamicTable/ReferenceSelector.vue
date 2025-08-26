<!-- resources/js/components/DynamicTable/ReferenceSelector.vue -->
<template>
  <div
      class="reference-selector"
      :class="{ 'drop-zone-over': isOverDropZone, 'has-items': items.length > 0, 'dragging': isAnyDragging }"
      @dragenter.self="handleDragEnter"
      @dragleave.self="handleDragLeave"
      @dragover.self="handleDragOver"
      @drop.self="handleDrop"
  >
    <!-- Содержимое селектора (загрузка, список, пусто и т.д.) -->
    <div v-if="loading" class="selector-loading">
      <el-icon class="is-loading"><Loading /></el-icon> Загрузка...
    </div>

    <div v-else-if="error" class="selector-error">
      <el-icon><Warning /></el-icon> {{ error }}
    </div>

    <div v-else-if="items.length === 0" class="selector-empty">
      Нет данных
    </div>

    <div v-else class="reference-items-container" ref="itemsContainerRef">
      <div
          v-for="item in paginatedItems"
          :key="item.id"
          class="reference-item"
          :class="{ 'selected': isSelected(item), 'dragging': isDragging === item.id }"
          :draggable="true"
          @dragstart="dragStart($event, item)"
          @dragend="dragEnd"
          @click="selectItem(item)"
          @dblclick="$emit('item-double-clicked', item)"
      >
        <span class="item-label">{{ formatReferenceDisplay(item, column) }}</span>
        <el-icon v-if="isSelected(item)" class="selected-icon"><Check /></el-icon>
      </div>

      <div
          v-if="hasMoreItems"
          class="load-more-trigger"
          ref="loadMoreTriggerRef"
      >
        <el-icon v-if="loadingMore" class="is-loading"><Loading /></el-icon>
        <span v-else>Загрузить еще...</span>
      </div>
    </div>

    <!-- Панель поиска и фильтрации -->
    <div class="selector-footer" v-if="showFooter">
      <el-input
          v-model="searchQuery"
          placeholder="Поиск..."
          size="small"
          clearable
          @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { ElIcon, ElMessage } from 'element-plus';
import {
  Loading,
  Warning,
  Check,
  Search
} from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import { dataSource } from './services/dataSource';
import { formatReferenceDisplay } from './utils/referenceUtils';

const props = defineProps({
  column: {
    type: Object,
    required: true
  },
  modelValue: [Number, String, Object, Array, null, undefined],
  multiple: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits([
  'update:modelValue',
  'item-selected',
  'item-double-clicked',
  'items-loaded',
  'loading' // <-- НОВОЕ: для отслеживания состояния загрузки
]);

// === Состояния ===
const items = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const pageSize = ref(20);

// === Состояния DnD ===
const isDragging = ref(null); // ID элемента, который сейчас перетаскивается
const isAnyDragging = ref(false); // Глобальный флаг перетаскивания в этом селекторе
const isOverDropZone = ref(false); // Флаг, находится ли курсор над зоной сброса (этот компонент)

// === Refs ===
const itemsContainerRef = ref(null);
const loadMoreTriggerRef = ref(null);
const observer = ref(null);

// === Вычисляемые свойства ===
const paginatedItems = computed(() => {
  return items.value;
});

const hasMoreItems = computed(() => {
  return currentPage.value < totalPages.value;
});

// === Методы ===
const loadItems = async (page = 1, query = '') => {
  if (!props.column || props.column.type !== 'reference' || !props.column.reference?.entityType) {
    items.value = [];
    return;
  }

  const entityType = props.column.reference.entityType;
  emit('loading', true); // <-- Эмитируем событие загрузки

  try {
    if (page === 1) {
      loading.value = true;
      error.value = '';
    } else {
      loadingMore.value = true;
    }

    const response = await dataSource.getReferenceData(entityType, {
      page: page,
      per_page: pageSize.value,
      search: query
    });

    if (page === 1) {
      items.value = response.data || [];
    } else {
      items.value = [...items.value, ...(response.data || [])];
    }

    if (response.meta) {
      currentPage.value = response.meta.current_page;
      totalPages.value = response.meta.last_page;
      totalItems.value = response.meta.total;
    }

    emit('items-loaded', response);
  } catch (err) {
    console.error('Ошибка загрузки данных справочника:', err);
    error.value = err.response?.data?.message || 'Не удалось загрузить данные справочника';
    if (page === 1) {
      items.value = [];
    }
  } finally {
    loading.value = false;
    loadingMore.value = false;
    emit('loading', false); // <-- Эмитируем окончание загрузки
  }
};

const loadMoreItems = async () => {
  if (loadingMore.value || !hasMoreItems.value) return;
  await loadItems(currentPage.value + 1, searchQuery.value);
};

const handleSearch = async (query) => {
  searchQuery.value = query;
  await loadItems(1, query);
};

const isSelected = (item) => {
  if (!props.modelValue) return false;
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.some(v => v.id === item.id);
  } else {
    if (typeof props.modelValue === 'object' && props.modelValue !== null) {
      return props.modelValue.id === item.id;
    } else {
      return props.modelValue === item.id;
    }
  }
};

const selectItem = (item) => {
  // Предотвращаем выбор во время перетаскивания
  if (isDragging.value) {
    console.log("[ReferenceSelector] Click ignored during drag.");
    return;
  }
  console.log("[ReferenceSelector] Item clicked:", item);

  let valueToEmit;
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = currentValue.findIndex(v => v.id === item.id);
    if (index > -1) {
      currentValue.splice(index, 1);
    } else {
      currentValue.push(item);
    }
    valueToEmit = currentValue;
  } else {
    valueToEmit = item; // Всегда выбираем элемент
  }

  console.log("[ReferenceSelector] Emitting update:modelValue:", valueToEmit);
  emit('update:modelValue', valueToEmit);
  emit('item-selected', valueToEmit);
};

// === Методы DnD ===
const dragStart = (event, item) => {
  console.log("[ReferenceSelector] dragStart for item:", item);
  isDragging.value = item.id;
  isAnyDragging.value = true; // <-- Устанавливаем глобальный флаг

  event.dataTransfer.effectAllowed = 'copy';

  // Используем уникальный тип данных и формат JSON
  const dataToSend = {
    id: item.id,
    _referenceType: props.column.reference?.entityType
    // Можно добавить другие поля, если нужно для отображения в предпросмотре
  };
  event.dataTransfer.setData('application/json', JSON.stringify(dataToSend));

  // Добавляем класс к body для глобальных стилей (опционально)
  document.body.classList.add('reference-dragging-in-progress');
};

const dragEnd = (event) => {
  console.log("[ReferenceSelector] dragEnd");
  isDragging.value = null;
  isAnyDragging.value = false; // <-- Сбрасываем глобальный флаг
  isOverDropZone.value = false;

  // Убираем глобальный класс
  document.body.classList.remove('reference-dragging-in-progress');
};

// === Методы для подсветки зоны сброса ===
const handleDragEnter = (event) => {
  console.log("[ReferenceSelector] handleDragEnter");
  // Проверяем, если перетаскиваются данные нашего типа
  if (event.dataTransfer.types.includes('application/json')) {
    event.preventDefault();
    isOverDropZone.value = true;
    console.log("[ReferenceSelector] Drop zone activated");
  }
};

const handleDragLeave = (event) => {
  console.log("[ReferenceSelector] handleDragLeave");
  isOverDropZone.value = false;
};

const handleDragOver = (event) => {
  // Необходимо для того, чтобы событие drop сработало
  event.preventDefault();
};

const handleDrop = (event) => {
  console.log("[ReferenceSelector] handleDrop");
  event.preventDefault();
  isOverDropZone.value = false;

  try {
    const jsonData = event.dataTransfer.getData('application/json');
    if (jsonData) {
      const data = JSON.parse(jsonData);
      console.log("[ReferenceSelector] Dropped data:", data);
      // Здесь можно выполнить действие при сбросе на себя, если нужно
      // Например, добавить элемент в список (если это допустимо)
      ElMessage.info('Элемент сброшен в зону селектора справочника.');
    } else {
      console.warn("[ReferenceSelector] No application/json data received on drop.");
    }
  } catch (e) {
    console.error("[ReferenceSelector] Error parsing dropped data:", e);
  }
};

// === Intersection Observer ===
const setupIntersectionObserver = () => {
  if (!loadMoreTriggerRef.value || !itemsContainerRef.value) return;

  observer.value = new IntersectionObserver(async (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && hasMoreItems.value && !loadingMore.value) {
      await loadMoreItems();
    }
  }, {
    root: itemsContainerRef.value,
    rootMargin: '0px',
    threshold: 1.0
  });

  if (loadMoreTriggerRef.value) {
    observer.value.observe(loadMoreTriggerRef.value);
  }
};

const tearDownIntersectionObserver = () => {
  if (observer.value) {
    observer.value.disconnect();
    observer.value = null;
  }
};

// === Watchers ===
watch(
    () => props.column?.reference?.entityType,
    async (newEntityType) => {
      if (newEntityType) {
        await loadItems(1, searchQuery.value);
      } else {
        items.value = [];
        error.value = '';
      }
    },
    { immediate: true }
);

// === Lifecycle ===
onMounted(() => {
  nextTick(() => {
    setupIntersectionObserver();
  });
});

onUnmounted(() => {
  tearDownIntersectionObserver();
});
</script>

<style lang="scss" scoped>
.reference-selector {
  width: 100%;
  height: 100%;
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;

  &.drop-zone-over {
    border-color: #409eff;
    box-shadow: 0 0 0 1px #409eff;
    background-color: #f0f9ff;
  }

  &.dragging {
    // Можно добавить эффекты всей зоны при перетаскивании
  }

  .selector-loading,
  .selector-error,
  .selector-empty {
    padding: 20px;
    text-align: center;
    color: #909399;
    font-size: 14px;

    .el-icon {
      margin-right: 5px;

      &.is-loading {
        animation: rotating 1s linear infinite;
        margin-right: 5px;
      }
    }
  }

  .selector-error {
    color: #f56c6c;
  }

  .reference-items-container {
    flex: 1;
    overflow-y: auto;
    position: relative;

    .reference-item {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      border-radius: 4px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 4px;
      position: relative;

      &:hover {
        background-color: #f5f7fa;
        border-color: #dcdfe6;
      }

      &.selected {
        background-color: #ecf5ff;
        border-color: #409eff;
      }

      &.dragging {
        display: none; /* Скрываем оригинальный элемент при перетаскивании */
      }

      .item-label {
        flex: 1;
        padding: 0 6px;
        cursor: pointer;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 13px;
      }

      .selected-icon {
        color: #409eff;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          width: 100%;
          height: 100%;

          > svg {
            width: 14px;
            height: 14px;
          }
        }
      }
    }

    .load-more-trigger {
      padding: 10px;
      text-align: center;
      color: #909399;
      font-size: 13px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;
      }

      .el-icon.is-loading {
        animation: rotating 1s linear infinite;
        margin-right: 5px;
      }
    }
  }

  .selector-footer {
    padding: 6px 8px;
    border-top: 1px solid #ebeef5;
    background-color: #f5f7fa;
    flex-shrink: 0;

    .el-input {
      :deep(.el-input__wrapper) {
        padding: 0 8px;
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
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Глобальные стили для состояния перетаскивания (можно добавить в основной SCSS) */
body.reference-dragging-in-progress {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
