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
          :placeholder="ICON_FILTER_MESSAGES.PLACEHOLDER"
          :disabled="props.disabled"
          clearable
          class="icon-select"
          @change="handleFilterChange"
      >
        <el-option
            v-for="option in ICON_FILTER_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
        />
      </el-select>
    </div>

    <div class="filter-item sort-filter">
      <el-select
          v-model="localSortBy"
          :placeholder="FILTERS_MESSAGES.SORT_LABEL"
          size="small"
          :disabled="props.disabled"
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
          :title="FILTERS_MESSAGES.RESET_TOOLTIP"
      >
        <el-icon><RefreshLeft /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue';
import { Search, RefreshLeft } from '@element-plus/icons-vue';
import {
  FILTERS_PROPS_CONFIG,
  FILTERS_UI,
  FILTERS_FILTERS_UI,
  FILTERS_MESSAGES,
  ICON_FILTER_OPTIONS,
  ICON_FILTER_MESSAGES,
  SORT_OPTIONS,
  getSortOptions,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
} from '../../config/appConfigIndex.js';
import { useCompanyStore } from '@/components/ContactManagement/CompanyContactChannels/store/companyStore';

const companyStore = useCompanyStore();

const props = defineProps({...FILTERS_PROPS_CONFIG});

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

onMounted(() => {
  setTimeout(() => {
    localSearch.value = companyStore.searchQuery || '';
    localHasIcon.value = companyStore.filterHasIcon || '';
    localSortBy.value = companyStore.sortBy || SORT_OPTIONS.DEFAULT;
  }, 100);
});

watch(() => companyStore.searchQuery, (newVal) => {
  localSearch.value = newVal || '';
});

watch(() => companyStore.filterHasIcon, (newVal) => {
  localHasIcon.value = newVal || '';
});

watch(() => companyStore.sortBy, (newVal) => {
  localSortBy.value = newVal || SORT_OPTIONS.DEFAULT;
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
  console.log('🔵 [Filters] handleFilterChange:', {
    localHasIcon: localHasIcon.value || '',
    type: typeof (localHasIcon.value || ''),
  });
  emitFilter();
};

const handleSortChange = () => {
  emit('sort', localSortBy.value);
  emitFilter();
};

const emitFilter = () => {
  emit('filter', {
    search: localSearch.value || '',
    hasIcon: localHasIcon.value || '',
    sortBy: localSortBy.value || SORT_OPTIONS.DEFAULT,
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
  gap: v-bind('FILTERS_FILTERS_UI.CONTAINER_GAP');
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-end;
  position: relative;
  min-height: v-bind('FILTERS_FILTERS_UI.CONTAINER_MIN_HEIGHT');
  padding: v-bind('FILTERS_FILTERS_UI.CONTAINER_PADDING');
}

.filter-item {
  display: flex;
  align-items: center;
}

.search-filter {
  position: relative;
  z-index: 1;
  flex: 0 0 v-bind('FILTERS_FILTERS_UI.SEARCH_WIDTH') !important;
  max-width: v-bind('FILTERS_FILTERS_UI.SEARCH_WIDTH') !important;
  transition: all v-bind('FILTERS_UI.TRANSITION_DURATION') ease;
  margin-left: 0 !important;
}

.search-filter.is-focused {
  position: relative !important;
  right: auto !important;
  top: auto !important;
  flex: 0 0 v-bind('FILTERS_FILTERS_UI.SEARCH_WIDTH_FOCUSED') !important;
  max-width: v-bind('FILTERS_FILTERS_UI.SEARCH_WIDTH_FOCUSED') !important;
  z-index: 100;
  margin-left: calc(v-bind('FILTERS_FILTERS_UI.SEARCH_WIDTH') - v-bind('FILTERS_FILTERS_UI.SEARCH_WIDTH_FOCUSED')) !important;
}

/* ✅ SEARCH INPUT — ИЗ КОНФИГА */
.search-input :deep(.el-input__wrapper) {
  height: v-bind('FILTERS_FILTERS_UI.WRAPPER_HEIGHT') !important;
  min-height: v-bind('FILTERS_FILTERS_UI.WRAPPER_HEIGHT') !important;
  font-size: v-bind('FILTERS_FILTERS_UI.WRAPPER_FONT_SIZE');
  padding: v-bind('FILTERS_FILTERS_UI.WRAPPER_PADDING');
  border-radius: v-bind('FILTERS_FILTERS_UI.WRAPPER_BORDER_RADIUS');
  transition: all 0.15s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.search-input :deep(.el-input__inner) {
  font-size: v-bind('FILTERS_FILTERS_UI.INNER_FONT_SIZE');
  height: v-bind('FILTERS_FILTERS_UI.INNER_HEIGHT') !important;
  line-height: v-bind('FILTERS_FILTERS_UI.INNER_LINE_HEIGHT') !important;
  padding: 0 !important;
}

.search-input :deep(.el-input__prefix) {
  font-size: v-bind('FILTERS_FILTERS_UI.PREFIX_FONT_SIZE');
  color: v-bind('COLORS.INFO');
}

.search-input :deep(.el-input__prefix-inner) {
  display: flex;
  align-items: center;
}

.search-input :deep(.el-input__clear) {
  font-size: v-bind('FILTERS_FILTERS_UI.CLEAR_FONT_SIZE');
}

/* ✅ ICON SELECT — ИЗ КОНФИГА */
.icon-filter {
  flex: 0 0 v-bind('FILTERS_FILTERS_UI.SELECT_WIDTH') !important;
  max-width: v-bind('FILTERS_FILTERS_UI.SELECT_WIDTH') !important;
}

.icon-select {
  width: 100%;
}

.icon-select :deep(.el-select__wrapper) {
  height: v-bind('FILTERS_FILTERS_UI.WRAPPER_HEIGHT') !important;
  min-height: v-bind('FILTERS_FILTERS_UI.WRAPPER_HEIGHT') !important;
  font-size: v-bind('FILTERS_FILTERS_UI.WRAPPER_FONT_SIZE');
  padding: v-bind('FILTERS_FILTERS_UI.WRAPPER_PADDING');
  border-radius: v-bind('FILTERS_FILTERS_UI.WRAPPER_BORDER_RADIUS');
  transition: all 0.15s ease;
}

.icon-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.icon-select :deep(.el-select__input) {
  font-size: v-bind('FILTERS_FILTERS_UI.INNER_FONT_SIZE');
  height: v-bind('FILTERS_FILTERS_UI.INNER_HEIGHT') !important;
}

.icon-select :deep(.el-select__caret) {
  font-size: v-bind('FILTERS_FILTERS_UI.CARET_FONT_SIZE');
}

/* ✅ SORT SELECT — ИЗ КОНФИГА */
.sort-filter {
  flex: 0 0 v-bind('FILTERS_FILTERS_UI.SELECT_WIDTH') !important;
  max-width: v-bind('FILTERS_FILTERS_UI.SELECT_WIDTH') !important;
}

.sort-select {
  width: 100%;
}

.sort-select :deep(.el-select__wrapper) {
  height: v-bind('FILTERS_FILTERS_UI.WRAPPER_HEIGHT') !important;
  min-height: v-bind('FILTERS_FILTERS_UI.WRAPPER_HEIGHT') !important;
  font-size: v-bind('FILTERS_FILTERS_UI.WRAPPER_FONT_SIZE');
  padding: v-bind('FILTERS_FILTERS_UI.WRAPPER_PADDING');
  border-radius: v-bind('FILTERS_FILTERS_UI.WRAPPER_BORDER_RADIUS');
  transition: all 0.15s ease;
}

.sort-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.sort-select :deep(.el-select__input) {
  font-size: v-bind('FILTERS_FILTERS_UI.INNER_FONT_SIZE');
  height: v-bind('FILTERS_FILTERS_UI.INNER_HEIGHT') !important;
}

.sort-select :deep(.el-select__caret) {
  font-size: v-bind('FILTERS_FILTERS_UI.CARET_FONT_SIZE');
}

/* ✅ FILTER INFO — ИЗ КОНФИГА */
.filter-info {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 0 3px;
  animation: fadeIn 0.2s ease;
}

.info-label {
  font-size: v-bind('FILTERS_FILTERS_UI.INFO_LABEL_FONT_SIZE');
  font-weight: 600;
  color: v-bind('COLORS.INFO');
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}

.info-count {
  font-size: v-bind('FILTERS_FILTERS_UI.INFO_COUNT_FONT_SIZE');
  font-weight: 700;
  color: v-bind('COLORS.PRIMARY');
  line-height: 1;
}

/* ✅ DROPDOWN — ИЗ КОНФИГА */
:deep(.el-select-dropdown) {
  padding: 4px 0;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-select-dropdown__item) {
  font-size: v-bind('FILTERS_FILTERS_UI.DROPDOWN_FONT_SIZE') !important;
  padding: v-bind('FILTERS_FILTERS_UI.DROPDOWN_PADDING') !important;
  height: v-bind('FILTERS_FILTERS_UI.DROPDOWN_HEIGHT') !important;
  line-height: v-bind('FILTERS_FILTERS_UI.DROPDOWN_LINE_HEIGHT') !important;
  min-height: v-bind('FILTERS_FILTERS_UI.DROPDOWN_HEIGHT') !important;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: #f5f7fa;
}

:deep(.el-select-dropdown__item.selected) {
  color: v-bind('COLORS.PRIMARY');
  font-weight: 600;
  background-color: #f0f9eb;
}

:deep(.el-select-dropdown__empty) {
  font-size: v-bind('FILTERS_FILTERS_UI.DROPDOWN_FONT_SIZE');
  padding: 6px 8px;
  color: #909399;
  text-align: center;
}

/* ✅ FILTER ACTIONS — ИЗ КОНФИГА */
.filter-actions {
  flex-shrink: 0;
}

.filter-actions .el-button {
  height: v-bind('FILTERS_FILTERS_UI.BUTTON_HEIGHT');
  min-height: v-bind('FILTERS_FILTERS_UI.BUTTON_HEIGHT');
  padding: v-bind('FILTERS_FILTERS_UI.BUTTON_PADDING');
  font-size: v-bind('FILTERS_FILTERS_UI.BUTTON_FONT_SIZE');
  border-radius: v-bind('FILTERS_FILTERS_UI.WRAPPER_BORDER_RADIUS');
  min-width: auto;
  width: auto;
  transition: all 0.2s ease;
}

.filter-actions .el-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.filter-actions :deep(.el-icon) {
  font-size: v-bind('FILTERS_FILTERS_UI.BUTTON_ICON_SIZE');
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

/* ✅ АДАПТИВ — XXXL */
@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .filters-container {
    gap: v-bind('FILTERS_FILTERS_UI.CONTAINER_GAP_MOBILE');
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

/* ✅ АДАПТИВ — XL */
@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .filters-container {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .filter-item {
    flex: 1;
    min-width: 100px;
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
    margin-top: 3px;
  }

  .filter-actions {
    order: 5;
  }

  .search-input :deep(.el-input__wrapper),
  .icon-select :deep(.el-select__wrapper),
  .sort-select :deep(.el-select__wrapper) {
    height: v-bind('FILTERS_FILTERS_UI.WRAPPER_HEIGHT_MOBILE') !important;
    font-size: v-bind('FILTERS_FILTERS_UI.WRAPPER_FONT_SIZE_MOBILE') !important;
    padding: v-bind('FILTERS_FILTERS_UI.WRAPPER_PADDING_MOBILE') !important;
  }

  .search-input :deep(.el-input__inner),
  .icon-select :deep(.el-select__input),
  .sort-select :deep(.el-select__input) {
    height: v-bind('FILTERS_FILTERS_UI.INNER_HEIGHT_MOBILE') !important;
    font-size: v-bind('FILTERS_FILTERS_UI.INNER_FONT_SIZE_MOBILE') !important;
  }

  :deep(.el-select-dropdown__item) {
    height: v-bind('FILTERS_FILTERS_UI.DROPDOWN_HEIGHT_MOBILE') !important;
    font-size: v-bind('FILTERS_FILTERS_UI.DROPDOWN_FONT_SIZE_MOBILE') !important;
  }
}

/* ✅ АДАПТИВ — XS */
@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: v-bind('FILTERS_FILTERS_UI.CONTAINER_GAP_SMALL');
    padding: 2px 0;
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
    gap: 3px;
  }

  .filter-actions {
    order: 5;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .info-label {
    font-size: v-bind('FILTERS_FILTERS_UI.INFO_LABEL_FONT_SIZE');
  }

  .info-count {
    font-size: v-bind('FILTERS_FILTERS_UI.INFO_COUNT_FONT_SIZE');
  }

  .search-input :deep(.el-input__wrapper),
  .icon-select :deep(.el-select__wrapper),
  .sort-select :deep(.el-select__wrapper) {
    height: v-bind('FILTERS_FILTERS_UI.WRAPPER_HEIGHT_SMALL') !important;
    font-size: v-bind('FILTERS_FILTERS_UI.WRAPPER_FONT_SIZE_SMALL') !important;
    padding: v-bind('FILTERS_FILTERS_UI.WRAPPER_PADDING_SMALL') !important;
  }

  .search-input :deep(.el-input__inner),
  .icon-select :deep(.el-select__input),
  .sort-select :deep(.el-select__input) {
    height: v-bind('FILTERS_FILTERS_UI.INNER_HEIGHT_SMALL') !important;
    font-size: v-bind('FILTERS_FILTERS_UI.INNER_FONT_SIZE_SMALL') !important;
  }

  :deep(.el-select-dropdown__item) {
    height: v-bind('FILTERS_FILTERS_UI.DROPDOWN_HEIGHT_SMALL') !important;
    font-size: v-bind('FILTERS_FILTERS_UI.DROPDOWN_FONT_SIZE_SMALL') !important;
  }
}

/* ✅ TOUCH DEVICES — ИЗ КОНФИГА */
@media (hover: none) and (pointer: coarse) {
  .search-input :deep(.el-input__wrapper),
  .icon-select :deep(.el-select__wrapper),
  .sort-select :deep(.el-select__wrapper) {
    height: v-bind('FILTERS_FILTERS_UI.WRAPPER_HEIGHT_TOUCH') !important;
    min-height: v-bind('FILTERS_FILTERS_UI.WRAPPER_HEIGHT_TOUCH') !important;
    font-size: v-bind('FILTERS_FILTERS_UI.WRAPPER_FONT_SIZE_TOUCH') !important;
    padding: v-bind('FILTERS_FILTERS_UI.WRAPPER_PADDING_TOUCH') !important;
  }

  .search-input :deep(.el-input__inner),
  .icon-select :deep(.el-select__input),
  .sort-select :deep(.el-select__input) {
    font-size: v-bind('FILTERS_FILTERS_UI.INNER_FONT_SIZE_TOUCH') !important;
    height: v-bind('FILTERS_FILTERS_UI.INNER_HEIGHT_TOUCH') !important;
  }

  .filter-actions .el-button {
    min-height: v-bind('FILTERS_FILTERS_UI.BUTTON_HEIGHT_TOUCH');
    min-width: v-bind('FILTERS_FILTERS_UI.BUTTON_HEIGHT_TOUCH');
    padding: v-bind('FILTERS_FILTERS_UI.BUTTON_PADDING_TOUCH');
    font-size: v-bind('FILTERS_FILTERS_UI.BUTTON_FONT_SIZE_TOUCH');
  }

  .filter-actions :deep(.el-icon) {
    font-size: v-bind('FILTERS_FILTERS_UI.BUTTON_ICON_SIZE_TOUCH');
  }

  .info-label {
    font-size: v-bind('FILTERS_FILTERS_UI.INFO_LABEL_FONT_SIZE_TOUCH');
  }

  .info-count {
    font-size: v-bind('FILTERS_FILTERS_UI.INFO_COUNT_FONT_SIZE_TOUCH');
  }

  .search-input :deep(.el-input__clear) {
    font-size: v-bind('FILTERS_FILTERS_UI.CLEAR_FONT_SIZE_TOUCH');
  }

  .search-input :deep(.el-input__prefix) {
    font-size: v-bind('FILTERS_FILTERS_UI.PREFIX_FONT_SIZE_TOUCH');
  }

  :deep(.el-select-dropdown__item) {
    height: v-bind('FILTERS_FILTERS_UI.DROPDOWN_HEIGHT_TOUCH') !important;
    line-height: v-bind('FILTERS_FILTERS_UI.DROPDOWN_LINE_HEIGHT_TOUCH') !important;
    font-size: v-bind('FILTERS_FILTERS_UI.DROPDOWN_FONT_SIZE_TOUCH') !important;
    padding: v-bind('FILTERS_FILTERS_UI.DROPDOWN_PADDING_TOUCH') !important;
  }
}
</style>
