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
          :title="FILTERS_MESSAGES.RESET_TOOLTIP ?? 'Сбросить фильтры'"
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
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
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
  }, props.searchDebounce || TIMINGS.DEBOUNCE_SEARCH);
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
  }, TIMINGS.DELAY_FAST);
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
  transition: all v-bind('FILTERS_UI.TRANSITION_DURATION') v-bind('ANIMATIONS.EASING_EASE');
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
  transition: all v-bind('ANIMATIONS.TRANSITION_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.search-input :deep(.el-input__inner) {
  font-size: v-bind('FILTERS_UI.FONT_SIZE');
  height: v-bind('FILTERS_UI.HEIGHT');
}

.search-input :deep(.el-input__prefix) {
  font-size: v-bind('FILTERS_UI.FONT_SIZE');
  color: v-bind('COLORS.INFO');
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
  transition: all v-bind('ANIMATIONS.TRANSITION_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.icon-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
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
  transition: all v-bind('ANIMATIONS.TRANSITION_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.sort-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
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
  animation: fadeIn v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.info-label {
  font-size: 6px;
  font-weight: 600;
  color: v-bind('COLORS.INFO');
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}

.info-count {
  font-size: 8px;
  font-weight: 700;
  color: v-bind('COLORS.PRIMARY');
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
  transition: background-color v-bind('ANIMATIONS.TRANSITION_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

:deep(.el-select-dropdown__item:hover) {
  background-color: #f5f7fa;
}

:deep(.el-select-dropdown__item.selected) {
  color: v-bind('COLORS.PRIMARY');
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
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.filter-actions .el-button:hover:not(:disabled) {
  transform: scale(1.1);
}

.filter-actions :deep(.el-icon) {
  font-size: 10px;
  color: v-bind('COLORS.INFO');
}

.filter-actions .el-button:hover:not(:disabled) :deep(.el-icon) {
  color: v-bind('COLORS.PRIMARY');
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================================================
   АДАПТИВ — ПЛАНШЕТЫ (577px - 768px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
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

/* ============================================================================
   АДАПТИВ — МОБИЛЬНЫЕ (321px - 576px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .filters-container {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .filter-item {
    flex: 1;
    min-width: 120px;
  }

  .search-filter {
    flex: 2;
    width: 100%;
    order: 1;
  }

  .icon-filter {
    order: 2;
  }

  .sort-filter {
    order: 3;
  }

  .filter-info {
    order: 4;
    width: 100%;
    margin-top: 4px;
  }

  .filter-actions {
    order: 5;
  }
}

/* ============================================================================
   АДАПТИВ — ОЧЕНЬ МАЛЕНЬКИЕ ЭКРАНЫ (≤320px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .filter-item {
    width: 100%;
    flex: none;
  }

  .search-filter {
    width: 100%;
    max-width: none;
    order: 1;
  }

  .icon-filter {
    width: 100%;
    order: 2;
  }

  .sort-filter {
    width: 100%;
    order: 3;
  }

  .filter-info {
    order: 4;
    flex-direction: row;
    justify-content: center;
    gap: 4px;
  }

  .filter-actions {
    order: 5;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .info-label {
    font-size: 5px;
  }

  .info-count {
    font-size: 7px;
  }
}

/* ============================================================================
   TOUCH DEVICES — УЛУЧШЕННАЯ ВИДИМОСТЬ
   ============================================================================ */
@media (hover: none) and (pointer: coarse) {
  .search-input :deep(.el-input__wrapper),
  .icon-select :deep(.el-select__wrapper),
  .sort-select :deep(.el-select__wrapper) {
    height: 32px !important;
  }

  .search-input :deep(.el-input__inner),
  .icon-select :deep(.el-select__input),
  .sort-select :deep(.el-select__input) {
    font-size: 14px !important;
  }

  .filter-actions .el-button {
    min-height: 44px;
    min-width: 44px;
    padding: 10px 16px;
  }

  .filter-actions :deep(.el-icon) {
    font-size: 14px;
  }
}
</style>
