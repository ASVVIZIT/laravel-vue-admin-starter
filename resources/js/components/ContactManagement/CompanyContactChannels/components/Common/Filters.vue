<template>
  <div class="filters-container">
    <div class="filter-item search-filter" :class="{ 'is-focused': isSearchFocused }">
      <el-input
          ref="searchInputRef"
          v-model="localSearch"
          :placeholder="FILTERS_MESSAGES.SEARCH_PLACEHOLDER"
          :disabled="props.disabled"
          clearable
          class="search-input"
          @input="handleSearchInput"
          @focus="isSearchFocused = true"
          @blur="isSearchFocused = false"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div v-if="props.showIconFilter" class="filter-item icon-filter">
      <el-select
          v-model="localHasIcon"
          :placeholder="FILTERS_MESSAGES.ICON_FILTER_LABEL"
          :disabled="props.disabled"
          clearable
          class="icon-select"
          @change="handleFilterChange"
      >
        <el-option
            :label="FILTERS_MESSAGES.ICON_FILTER_ALL"
            value=""
        />
        <el-option
            :label="FILTERS_MESSAGES.ICON_FILTER_WITH"
            value="true"
        />
        <el-option
            :label="FILTERS_MESSAGES.ICON_FILTER_WITHOUT"
            value="false"
        />
      </el-select>
    </div>

    <div class="filter-item sort-filter">
      <el-select
          v-model="localSortBy"
          :placeholder="FILTERS_MESSAGES.SORT_LABEL"
          :disabled="props.disabled"
          class="sort-select"
          @change="handleSortChange"
      >
        <el-option
            v-for="option in sortOptionsList"
            :key="option.value"
            :label="option.label"
            :value="option.value"
        />
      </el-select>
    </div>

    <div class="filter-info">
      <div class="info-label">{{ FILTERS_MESSAGES.FOUND_LABEL }}</div>
      <div class="info-count">{{ props.totalFiltered }}/{{ props.totalItems }}</div>
    </div>

    <div class="filter-actions">
      <el-button
          v-if="hasActiveFilters"
          size="small"
          @click="handleReset"
          :disabled="props.disabled"
      >
        <el-icon><RefreshLeft /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { Search, RefreshLeft } from '@element-plus/icons-vue';
import {
  FILTERS_PROPS_CONFIG,
  FILTERS_UI,
  FILTERS_MESSAGES,
  SORT_OPTIONS,
  getSortOptions,
} from '../../utils/appConfig.js';

const props = defineProps({
  ...FILTERS_PROPS_CONFIG,
  sortOptions: { type: Array, default: null },
});

const emit = defineEmits(['search', 'filter', 'reset', 'sort']);

const searchInputRef = ref(null);
const localSearch = ref('');
const localHasIcon = ref('');
const localSortBy = ref(SORT_OPTIONS.DEFAULT);
const isSearchFocused = ref(false);

let searchTimeout = null;

const sortOptionsList = computed(() => {
  return props.sortOptions || getSortOptions();
});

const hasActiveFilters = computed(() => {
  return (
      localSearch.value !== '' ||
      localHasIcon.value !== '' ||
      localSortBy.value !== SORT_OPTIONS.DEFAULT
  );
});

const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    emit('search', localSearch.value);
    emitFilter();
  }, props.searchDebounce);
};

const handleFilterChange = () => {
  emitFilter();
};

const handleSortChange = () => {
  emit('sort', localSortBy.value);
  emitFilter();
};

const emitFilter = () => {
  emit('filter', {
    search: localSearch.value,
    hasIcon: localHasIcon.value,
    sortBy: localSortBy.value,
  });
};

const handleReset = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  localSearch.value = '';
  localHasIcon.value = '';
  localSortBy.value = SORT_OPTIONS.DEFAULT;
  emit('reset');
  emitFilter();

  setTimeout(() => {
    if (searchInputRef.value) {
      searchInputRef.value.focus();
    }
  }, 50);
};

watch(() => props.totalItems, (newVal) => {
  console.log('[Filters] totalItems changed:', newVal);
}, { immediate: true });

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>

<style scoped>
.filters-container {
  display: flex;
  align-items: center;
  gap: v-bind('FILTERS_UI.GAP');
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-end;
  position: relative;
  min-height: v-bind('FILTERS_UI.HEIGHT');
}

.filter-item {
  display: flex;
  align-items: center;
}

.search-filter {
  position: relative;
  z-index: 1;
  flex: 0 0 v-bind('FILTERS_UI.INPUT_WIDTH') !important;
  max-width: v-bind('FILTERS_UI.INPUT_WIDTH') !important;
  transition: all v-bind('FILTERS_UI.TRANSITION_DURATION') ease;
  margin-left: 0 !important;
}

.search-filter.is-focused {
  position: relative !important;
  right: auto !important;
  top: auto !important;
  flex: 0 0 v-bind('FILTERS_UI.INPUT_WIDTH_FOCUSED') !important;
  max-width: v-bind('FILTERS_UI.INPUT_WIDTH_FOCUSED') !important;
  z-index: 100;
  margin-left: calc(v-bind('FILTERS_UI.INPUT_WIDTH') - v-bind('FILTERS_UI.INPUT_WIDTH_FOCUSED')) !important;
}

.search-input :deep(.el-input__wrapper) {
  height: v-bind('FILTERS_UI.HEIGHT');
  font-size: v-bind('FILTERS_UI.FONT_SIZE');
  padding: 0 5px;
  border-radius: 3px;
}

.search-input :deep(.el-input__inner) {
  font-size: v-bind('FILTERS_UI.FONT_SIZE');
  height: v-bind('FILTERS_UI.HEIGHT');
}

.search-input :deep(.el-input__prefix) {
  font-size: v-bind('FILTERS_UI.FONT_SIZE');
}

.search-input :deep(.el-input__prefix-inner) {
  display: flex;
  align-items: center;
}

.icon-filter {
  flex: 0 0 70px !important;
  max-width: 70px !important;
}

.icon-select {
  width: 100%;
}

.icon-select :deep(.el-select__wrapper) {
  height: v-bind('FILTERS_UI.HEIGHT');
  font-size: v-bind('FILTERS_UI.FONT_SIZE');
  padding: 0 5px;
  border-radius: 3px;
}

.icon-select :deep(.el-select__input) {
  font-size: v-bind('FILTERS_UI.FONT_SIZE');
}

.sort-filter {
  flex: 0 0 70px !important;
  max-width: 70px !important;
}

.sort-select {
  width: 100%;
}

.sort-select :deep(.el-select__wrapper) {
  height: v-bind('FILTERS_UI.HEIGHT');
  font-size: v-bind('FILTERS_UI.FONT_SIZE');
  padding: 0 5px;
  border-radius: 3px;
}

.sort-select :deep(.el-select__input) {
  font-size: v-bind('FILTERS_UI.FONT_SIZE');
}

.filter-info {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 0 4px;
}

.info-label {
  font-size: 6px;
  font-weight: 600;
  color: #606266;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}

.info-count {
  font-size: 8px;
  font-weight: 700;
  color: #409EFF;
  line-height: 1;
}

:deep(.el-select-dropdown) {
  padding: 4px 0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-select-dropdown__item) {
  font-size: v-bind('FILTERS_UI.FONT_SIZE') !important;
  padding: 0 8px !important;
  height: 20px !important;
  line-height: 20px !important;
  min-height: 20px !important;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--el-text-color-regular);
  box-sizing: border-box;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: #f5f7fa;
}

:deep(.el-select-dropdown__item.selected) {
  color: #409EFF;
  font-weight: 600;
  background-color: #f0f9eb;
}

:deep(.el-select-dropdown__item.disabled) {
  color: #c0c4cc;
  cursor: not-allowed;
}

:deep(.el-select-dropdown__empty) {
  font-size: v-bind('FILTERS_UI.FONT_SIZE');
  padding: 8px 10px;
  color: #909399;
  text-align: center;
}

.filter-actions {
  flex-shrink: 0;
}

.filter-actions .el-button {
  height: v-bind('FILTERS_UI.HEIGHT');
  padding: 2px 5px;
  font-size: v-bind('FILTERS_UI.FONT_SIZE');
  border-radius: 3px;
  min-width: auto;
  width: auto;
}

.filter-actions :deep(.el-icon) {
  font-size: 10px;
}

@media (max-width: 768px) {
  .filters-container {
    gap: 4px;
    justify-content: center;
  }

  .search-filter {
    width: 100%;
    max-width: none;
    flex: 1;
    order: 1;
    margin-left: 0 !important;
  }

  .search-filter.is-focused {
    max-width: none;
    margin-left: 0 !important;
  }

  .icon-filter {
    order: 2;
  }

  .sort-filter {
    order: 3;
  }

  .filter-info {
    order: 4;
  }

  .filter-actions {
    order: 5;
  }
}

@media (max-width: 480px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    width: 100%;
  }

  .icon-select,
  .sort-select {
    width: 100%;
  }
}
</style>
