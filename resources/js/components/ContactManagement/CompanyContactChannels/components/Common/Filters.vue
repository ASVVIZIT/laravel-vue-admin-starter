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
          size="small"
          :disabled="props.disabled"
          @change="handleSortChange"
      >
        <el-option
            v-for="option in props.sortOptions"
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
import { ref, computed, watch, onUnmounted, onMounted } from 'vue';
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
import { useCompanyStore } from '@/components/ContactManagement/CompanyContactChannels/store/companyStore';

const companyStore = useCompanyStore();

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
  gap: 6px;
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-end;
  position: relative;
  min-height: 20px;
  padding: 2px 0;
}

.filter-item {
  display: flex;
  align-items: center;
}

.search-filter {
  position: relative;
  z-index: 1;
  flex: 0 0 120px !important;
  max-width: 120px !important;
  transition: all 0.2s ease;
  margin-left: 0 !important;
}

.search-filter.is-focused {
  position: relative !important;
  right: auto !important;
  top: auto !important;
  flex: 0 0 180px !important;
  max-width: 180px !important;
  z-index: 100;
  margin-left: calc(120px - 180px) !important;
}

.search-input :deep(.el-input__wrapper) {
  height: 20px !important;
  min-height: 20px !important;
  font-size: 11px;
  padding: 0 3px;
  border-radius: 2px;
  transition: all 0.15s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.search-input :deep(.el-input__inner) {
  font-size: 11px;
  height: 18px !important;
  line-height: 18px !important;
  padding: 0 !important;
}

.search-input :deep(.el-input__prefix) {
  font-size: 11px;
  color: v-bind('COLORS.INFO');
}

.search-input :deep(.el-input__prefix-inner) {
  display: flex;
  align-items: center;
}

.search-input :deep(.el-input__clear) {
  font-size: 8px;
}

.icon-filter {
  flex: 0 0 60px !important;
  max-width: 60px !important;
}

.icon-select {
  width: 100%;
}

.icon-select :deep(.el-select__wrapper) {
  height: 20px !important;
  min-height: 20px !important;
  font-size: 11px;
  padding: 0 3px;
  border-radius: 2px;
  transition: all 0.15s ease;
}

.icon-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.icon-select :deep(.el-select__input) {
  font-size: 11px;
  height: 18px !important;
}

.icon-select :deep(.el-select__caret) {
  font-size: 8px;
}

.sort-filter {
  flex: 0 0 60px !important;
  max-width: 60px !important;
}

.sort-select {
  width: 100%;
}

.sort-select :deep(.el-select__wrapper) {
  height: 20px !important;
  min-height: 20px !important;
  font-size: 11px;
  padding: 0 3px;
  border-radius: 2px;
  transition: all 0.15s ease;
}

.sort-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.sort-select :deep(.el-select__input) {
  font-size: 11px;
  height: 18px !important;
}

.sort-select :deep(.el-select__caret) {
  font-size: 8px;
}

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
  font-size: 5px;
  font-weight: 600;
  color: v-bind('COLORS.INFO');
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}

.info-count {
  font-size: 7px;
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
  font-size: 11px !important;
  padding: 0 6px !important;
  height: 18px !important;
  line-height: 18px !important;
  min-height: 18px !important;
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
  font-size: 11px;
  padding: 6px 8px;
  color: #909399;
  text-align: center;
}

.filter-actions {
  flex-shrink: 0;
}

.filter-actions .el-button {
  height: 20px;
  min-height: 20px;
  padding: 0 4px;
  font-size: 11px;
  border-radius: 2px;
  min-width: auto;
  width: auto;
  transition: all 0.2s ease;
}

.filter-actions .el-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.filter-actions :deep(.el-icon) {
  font-size: 9px;
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
}

@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
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
    font-size: 5px;
  }

  .info-count {
    font-size: 6px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .search-input :deep(.el-input__wrapper),
  .icon-select :deep(.el-select__wrapper),
  .sort-select :deep(.el-select__wrapper) {
    height: 32px !important;
    min-height: 32px !important;
  }

  .search-input :deep(.el-input__inner),
  .icon-select :deep(.el-select__input),
  .sort-select :deep(.el-select__input) {
    font-size: 14px !important;
    height: 30px !important;
  }

  .filter-actions .el-button {
    min-height: 36px;
    min-width: 36px;
    padding: 8px 12px;
  }

  .filter-actions :deep(.el-icon) {
    font-size: 14px;
  }

  .info-label {
    font-size: 9px;
  }

  .info-count {
    font-size: 11px;
  }
}
</style>
