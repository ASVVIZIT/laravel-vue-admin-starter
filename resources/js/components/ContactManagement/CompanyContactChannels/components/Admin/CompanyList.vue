<template>
  <div class="company-list">
    <div class="header-row">
      <el-button
          type="primary"
          size="small"
          @click="openCreateDialog"
          :disabled="isLoading"
          class="add-btn"
      >
        <el-icon><Plus /></el-icon>
        {{ COMPANY_LIST_MESSAGES.BTN_ADD }}
      </el-button>

      <LoadingDataActions
          :loaded="companyStore.loadedCount"
          :total="companyStore.totalItems"
          :percentage="companyStore.loadedPercentage"
          :chunk-progress="companyStore.currentChunkProgress"
          :chunk-size="CHUNK_CONFIG.SIZE"
          :disabled="isLoading && !isLoadingAll"
          :is-loading="isLoadingAll"
          :is-paused="isLoadPaused"
          :show-load-more="showLoadMoreButton && !isLoadingAll"
          :show-load-all="showLoadAllButton && !isLoadingAll"
          :show-refresh="companyStore.allRecordsLoaded && !isLoadingAll"
          @load-more="loadNextChunk"
          @load-all="startChunkedLoad"
          @pause="pauseLoadAll"
          @resume="resumeLoadAll"
          @refresh="refreshData"
          @settings="openSettingsDialog"
      />
    </div>

    <div class="filters-row">
      <h3 class="title">{{ COMPANY_LIST_MESSAGES.TITLE }}</h3>
      <Filters
          :total-items="companyStore.totalItems"
          :total-filtered="companyStore.filteredCount"
          :disabled="isLoading"
          :available-sizes="availablePageSizes"
          :show-icon-filter="true"
          :search-debounce="COMPANY_LIST_FILTERS.SEARCH_DEBOUNCE"
          :sort-options="getSortOptions()"
          @search="handleSearch"
          @filter="handleFilter"
          @reset="handleResetFilters"
          @sort="handleSort"
      />
    </div>

    <div class="table-wrapper">
      <CompanyTable
          :key="tableKey"
          :data="paginatedFilteredCompanies"
          :loading="companyStore.loading"
          :icon-map="iconMap"
          :icon-options="iconOptions"
          :current-page="companyStore.currentPage"
          :page-size="companyStore.perPage"
          :table-height="COMPANY_TABLE_UI.TABLE_HEIGHT"
          :use-store="true"
          @edit="openEditDialog"
          @delete="showDeleteConfirm"
          @update-field="updateCompanyField"
          @refresh="refreshSingleRecord"
          @row-dblclick="openEditDialog"
      />
    </div>

    <Pagination
        :layout="PAGINATOR_DISPLAY.LAYOUT"
        :current-page="companyStore.currentPage"
        :page-size="companyStore.perPage"
        :loaded-count="companyStore.filteredCount"
        :total-items="companyStore.totalItems"
        :available-sizes="availablePageSizes"
        :disabled="isLoading || isRecalculatingPagination"
        :pager-count="PAGINATOR_DISPLAY.PAGER_COUNT"
        :hide-on-single-page="PAGINATOR_DISPLAY.HIDE_ON_SINGLE"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
    />

    <CompanyForm
        :visible="dialogVisible"
        :company="editingCompany"
        :loading="isLoading"
        :icon-map="iconMap"
        :icon-options="iconOptions"
        :use-store="true"
        @update:visible="dialogVisible = $event"
    />

    <DeleteConfirm
        :visible="deleteConfirmDialogVisible"
        :item="companyToDelete"
        :item-name="companyToDelete?.name"
        :entity-label="COMPANY_LIST_MESSAGES.ENTITY_LABEL"
        :loading="companyStore.loading"
        @update:visible="deleteConfirmDialogVisible = $event"
        @confirm="confirmDelete"
    />

    <SettingsModal
        :visible="settingsDialogVisible"
        :is-saving="isSavingSettings"
        @update:visible="settingsDialogVisible = $event"
        @save="handleSettingsSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useCompanyStore } from '@/components/ContactManagement/CompanyContactChannels/store/companyStore';
import { useFenixIconsStore } from '@components/FenixIconVue/store/fenixIconsStore.js';
import CompanyTable from './CompanyTable.vue';
import CompanyForm from './CompanyForm.vue';
import Pagination from '../Common/Pagination.vue';
import Filters from '../Common/Filters.vue';
import DeleteConfirm from '../Common/DeleteConfirm.vue';
import SettingsModal from '../Common/SettingsModal.vue';
import LoadingDataActions from '../Common/LoadingDataActions.vue';
import { getIconMap, getIconOptions } from '../../utils/iconConfig.js';
import { getFieldLabel } from '../../utils/fieldLabels.js';
import {
  generateAvailablePageSizes,
  PAGE_SIZE_OPTIONS,
  CHUNK_CONFIG,
  COMPANY_LIST_THRESHOLDS,
  COMPANY_LIST_FILTERS,
  COMPANY_LIST_UI,
  COMPANY_LIST_MESSAGES,
  COMPANY_TABLE_UI,
  PAGINATOR_DISPLAY,
  SORT_OPTIONS,
  getSortOptions,
  BREAKPOINTS,
  TIMINGS,
  ANIMATIONS,
} from '../../utils/appConfig.js';

const companyStore = useCompanyStore();
const fenixIconStore = useFenixIconsStore();

const dialogVisible = ref(false);
const editingCompany = ref(null);
const deletionLoading = ref(false);
const settingsDialogVisible = ref(false);
const deleteConfirmDialogVisible = ref(false);
const companyToDelete = ref(null);
const tableKey = ref(0);

const isLoadingAll = ref(false);
const isLoadPaused = ref(false);
const isRecalculatingPagination = ref(false);
const isSavingSettings = ref(false);

const iconMap = computed(() => getIconMap(fenixIconStore));
const iconOptions = computed(() => getIconOptions());

const availablePageSizes = computed(() => {
  return generateAvailablePageSizes(companyStore.loadedCount);
});

const isLoading = computed(() => {
  return (
      companyStore.loadingInitial ||
      companyStore.loading ||
      companyStore.loadingChunks
  );
});

const chunkSize = computed(() => companyStore.chunkSize);

const showLoadMoreButton = computed(() => {
  return (
      !companyStore.allRecordsLoaded &&
      companyStore.totalItems > COMPANY_LIST_THRESHOLDS.SHOW_LOAD_BUTTONS_MIN &&
      companyStore.loadedCount < companyStore.totalItems
  );
});

const showLoadAllButton = computed(() => {
  return (
      !companyStore.allRecordsLoaded &&
      companyStore.totalItems > COMPANY_LIST_THRESHOLDS.SHOW_LOAD_BUTTONS_MIN &&
      companyStore.loadedCount < companyStore.totalItems &&
      companyStore.totalItems > 0
  );
});

const paginatedFilteredCompanies = computed(() => {
  const start = (companyStore.currentPage - 1) * companyStore.perPage;
  const end = start + companyStore.perPage;
  return companyStore.filteredData.slice(start, end);
});

const openSettingsDialog = () => {
  settingsDialogVisible.value = true;
};

watch(() => companyStore.allCompanies, (newVal) => {
  console.log('[CompanyList] allCompanies:', newVal.length);
}, { immediate: true });

watch(() => companyStore.error, (error) => {
  if (error) {
    ElMessage.error(`Ошибка: ${error}`);
  }
});

const loadNextChunk = async () => {
  isRecalculatingPagination.value = true;
  try {
    await companyStore.loadNextChunk();
    ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_CHUNK_LOADED(chunkSize.value));
  } catch (err) {
    ElMessage.error(COMPANY_LIST_MESSAGES.ERROR_LOADING);
  } finally {
    setTimeout(() => {
      isRecalculatingPagination.value = false;
    }, TIMINGS.RECALCULATING_DURATION);
  }
};

const startChunkedLoad = async () => {
  if (companyStore.allRecordsLoaded) {
    ElMessage.info(COMPANY_LIST_MESSAGES.ALL_RECORDS_LOADED);
    return;
  }

  if (companyStore.totalItems > COMPANY_LIST_THRESHOLDS.CONFIRM_LOAD_ALL_MIN) {
    try {
      await ElMessageBox.confirm(
          COMPANY_LIST_MESSAGES.CONFIRM_LOAD_ALL_MESSAGE(companyStore.totalItems),
          COMPANY_LIST_MESSAGES.CONFIRM_LOAD_ALL_TITLE,
          {
            confirmButtonText: COMPANY_LIST_MESSAGES.CONFIRM_LOAD_ALL_CONFIRM,
            cancelButtonText: COMPANY_LIST_MESSAGES.CONFIRM_LOAD_ALL_CANCEL,
            type: 'warning',
          }
      );
    } catch {
      return;
    }
  }

  isLoadingAll.value = true;
  isLoadPaused.value = false;
  isRecalculatingPagination.value = true;

  try {
    while (!companyStore.allRecordsLoaded && !isLoadPaused.value) {
      await companyStore.loadNextChunk();
      await new Promise((resolve) => setTimeout(resolve, CHUNK_CONFIG.DELAY));
    }

    if (companyStore.allRecordsLoaded) {
      ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_ALL_LOADED(companyStore.totalItems));
    }
  } catch (err) {
    ElMessage.error(COMPANY_LIST_MESSAGES.ERROR_LOADING + ': ' + err.message);
  } finally {
    isLoadingAll.value = false;
    isLoadPaused.value = false;
    setTimeout(() => {
      isRecalculatingPagination.value = false;
    }, TIMINGS.RECALCULATING_DURATION);
  }
};

const pauseLoadAll = () => {
  isLoadPaused.value = true;
  ElMessage.info(COMPANY_LIST_MESSAGES.LOAD_PAUSED);
};

const resumeLoadAll = () => {
  isLoadPaused.value = false;
  ElMessage.info(COMPANY_LIST_MESSAGES.LOAD_RESUMED);
};

const refreshData = async () => {
  try {
    const result = await companyStore.refreshData();
    if (result.success) {
      ElMessage.success(
          result.newRecords > 0
              ? COMPANY_LIST_MESSAGES.NEW_RECORDS_LOADED(result.newRecords)
              : COMPANY_LIST_MESSAGES.NO_NEW_RECORDS
      );
    }
  } catch (err) {
    ElMessage.error(COMPANY_LIST_MESSAGES.REFRESH_ERROR(err.message));
  }
};

const refreshSingleRecord = async (companyId) => {
  try {
    const result = await companyStore.refreshSingleRecord(companyId);

    if (result.success) {
      ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_RECORD_REFRESHED(
          companyStore.allCompanies.find(c => c.id === companyId)?.name || `ID: ${companyId}`
      ));
    } else {
      ElMessage.warning(COMPANY_LIST_MESSAGES.ERROR_RECORD_REFRESH(
          companyStore.allCompanies.find(c => c.id === companyId)?.name || `ID: ${companyId}`
      ) + ' (данные восстановлены)');
    }
  } catch (err) {
    ElMessage.error(COMPANY_LIST_MESSAGES.ERROR_RECORD_REFRESH(
        companyStore.allCompanies.find(c => c.id === companyId)?.name || `ID: ${companyId}`
    ) + ' (данные восстановлены)');
  }
};

const handleSearch = (query) => {
  companyStore.setFilters({ searchQuery: query });
};

const handleFilter = (filters) => {
  let iconFilter = '';
  if (filters.hasIcon === 'with' || filters.hasIcon === true || filters.hasIcon === 'true') {
    iconFilter = 'true';
  } else if (filters.hasIcon === 'without' || filters.hasIcon === false || filters.hasIcon === 'false') {
    iconFilter = 'false';
  } else {
    iconFilter = '';
  }

  companyStore.setFilters({
    searchQuery: filters.search || '',
    filterHasIcon: iconFilter,
    sortBy: filters.sortBy || SORT_OPTIONS.DEFAULT,
  });
};

const handleResetFilters = () => {
  companyStore.resetFilters();
  ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_FILTERS_RESET);
};

const handleSort = (sortValue) => {
  console.log('🔵 [CompanyList] handleSort:', sortValue);
  companyStore.setFilters({ sortBy: sortValue });
};

const handlePageChange = (newPage) => {
  companyStore.currentPage = newPage;
};

const handleSizeChange = (newSize) => {
  if (newSize >= companyStore.loadedCount && companyStore.loadedCount > 0) {
    startChunkedLoad();
    return;
  }

  if (newSize > PAGE_SIZE_OPTIONS.MAX) {
    companyStore.loadPage(1, newSize);
    return;
  }

  companyStore.perPage = newSize;
  companyStore.recalculatePagination();
};


const handleSettingsSave = (settings) => {
  console.log('[CompanyList] Settings saved:', settings);

  // ✅ ВКЛЮЧАЕМ СПИНЕР ТОЛЬКО НА ВРЕМЯ СОХРАНЕНИЯ
  isSavingSettings.value = true;

  // Применяем настройки
  if (settings.pageSize) {
    companyStore.perPage = settings.pageSize;
  }
  if (settings.defaultSortBy) {
    companyStore.sortBy = settings.defaultSortBy;
  }
  if (settings.defaultFilterHasIcon !== undefined) {
    companyStore.filterHasIcon = settings.defaultFilterHasIcon;
  }

  setTimeout(() => {
    isSavingSettings.value = false;
  }, 500);

  // Перезагружаем данные с новыми настройками
  companyStore.fetchAllCompanies();
};

const updateCompanyField = async (companyId, fieldName, newValue) => {
  try {
    const company = companyStore.allCompanies.find((c) => c.id === companyId);
    if (!company) return;

    company._updating = true;
    await companyStore.updateCompany(companyId, { [fieldName]: newValue });
    ElMessage.success(`Поле "${getFieldLabel(fieldName, 'company')}" обновлено`);
  } catch (err) {
    ElMessage.warning(`Поле "${getFieldLabel(fieldName, 'company')}" не обновлено`);
  } finally {
    const company = companyStore.allCompanies.find((c) => c.id === companyId);
    if (company) {
      company._updating = false;
    }
  }
};

const openCreateDialog = () => {
  editingCompany.value = null;
  dialogVisible.value = true;
};

const openEditDialog = (company) => {
  if (!company) return;
  editingCompany.value = { ...company };
  dialogVisible.value = true;
};

const showDeleteConfirm = (company) => {
  companyToDelete.value = company;
  deleteConfirmDialogVisible.value = true;
};

const confirmDelete = async () => {
  if (!companyToDelete.value) return;

  deletionLoading.value = true;

  try {
    await companyStore.deleteCompany(companyToDelete.value.id);
    ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_COMPANY_DELETED(companyToDelete.value.name));
  } catch (err) {
    ElMessage.error(COMPANY_LIST_MESSAGES.ERROR_DELETING);
  } finally {
    deletionLoading.value = false;
    companyToDelete.value = null;
    deleteConfirmDialogVisible.value = false;
  }
};

watch(() => companyStore.currentPage, () => { tableKey.value++; });
watch(() => companyStore.perPage, () => { tableKey.value++; });
watch(() => dialogVisible.value, (newVal) => { if (!newVal) editingCompany.value = null; });

onMounted(async () => {
  console.log('[CompanyList] Component mounted');

  // ✅ 1. Сначала восстанавливаем фильтры из localStorage
  companyStore.restoreFiltersFromStorage();

  console.log('[CompanyList] Filters restored:', {
    searchQuery: companyStore.searchQuery,
    filterHasIcon: companyStore.filterHasIcon,
    sortBy: companyStore.sortBy,
  });

  // ✅ 2. Загружаем данные (фильтры применятся автоматически через getter)
  console.log('[CompanyList] Fetching companies...');
  await companyStore.fetchAllCompanies();
  console.log('[CompanyList] Fetch complete');
  console.log('[CompanyList] allCompanies:', companyStore.allCompanies.length);
  console.log('[CompanyList] filteredData:', companyStore.filteredData.length);
});
</script>

<style scoped>
.company-list {
  padding: v-bind('COMPANY_LIST_UI.PADDING');
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: v-bind('COMPANY_LIST_UI.HEADER_GAP');
  position: relative;
}

.header-row {
  display: flex;
  align-items: center;
  gap: v-bind('COMPANY_LIST_UI.HEADER_ACTIONS_GAP');
  height: 28px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.add-btn {
  height: 24px;
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 3px;
  flex-shrink: 0;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.add-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-btn :deep(.el-icon) {
  font-size: 12px;
  margin-right: 3px;
  vertical-align: middle;
}

.filters-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 28px;
  flex-wrap: nowrap;
  width: 100%;
  overflow: hidden;
}

.title {
  margin: 0;
  font-size: v-bind('COMPANY_LIST_UI.TITLE_FONT_SIZE');
  font-weight: v-bind('COMPANY_LIST_UI.TITLE_FONT_WEIGHT');
  white-space: nowrap;
  flex-shrink: 0;
  color: v-bind('COMPANY_LIST_UI.TITLE_COLOR');
  text-align: left;
}

.filters-row :deep(.filters-component-wrapper),
.filters-row :deep(.filters) {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;
}

.filters-row :deep(.el-input__wrapper),
.filters-row :deep(.el-select__wrapper) {
  height: 28px !important;
  min-height: 28px !important;
  padding: 0 8px !important;
  border-radius: 3px !important;
  font-size: 12px !important;
  box-shadow: none !important;
  border: 1px solid #dcdfe6 !important;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.filters-row :deep(.el-input__inner) {
  height: 26px !important;
  line-height: 26px !important;
  font-size: 12px !important;
  padding: 0 !important;
}

.filters-row :deep(.el-select__input) {
  font-size: 12px !important;
  height: 26px !important;
}

.filters-row :deep(.el-input__prefix),
.filters-row :deep(.el-input__suffix) {
  display: flex;
  align-items: center;
  height: 26px !important;
}

.filters-row :deep(.el-input__prefix-inner > .el-icon),
.filters-row :deep(.el-input__suffix-inner > .el-icon) {
  font-size: 12px !important;
}

.filters-row :deep(.el-select__caret),
.filters-row :deep(.el-select__arrow) {
  font-size: 12px !important;
  height: 26px !important;
  line-height: 26px !important;
}

.filters-row :deep(.el-select-dropdown__item) {
  font-size: 12px !important;
  padding: 4px 10px !important;
  height: 28px !important;
  line-height: 28px !important;
  transition: background-color v-bind('ANIMATIONS.TRANSITION_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  margin-bottom: v-bind('COMPANY_LIST_UI.TABLE_WRAPPER_MARGIN_BOTTOM');
  border: v-bind('COMPANY_LIST_UI.TABLE_WRAPPER_BORDER');
  border-radius: v-bind('COMPANY_LIST_UI.TABLE_WRAPPER_BORDER_RADIUS');
  min-height: v-bind('COMPANY_LIST_UI.TABLE_WRAPPER_MIN_HEIGHT');
  position: relative;
}

:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-loading-spinner .el-icon-loading) {
  font-size: v-bind('COMPANY_LIST_UI.LOADING_SPINNER_SIZE');
  color: v-bind('COMPANY_LIST_UI.LOADING_SPINNER_COLOR');
  animation: v-bind('ANIMATIONS.SPINNER_ROTATION');
}

:deep(.el-loading-text) {
  color: v-bind('COMPANY_LIST_UI.LOADING_TEXT_COLOR');
  font-size: v-bind('COMPANY_LIST_UI.LOADING_TEXT_SIZE');
}

@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .header-row {
    flex-wrap: wrap;
    height: auto;
    gap: 4px;
  }

  .filters-row {
    flex-wrap: wrap;
    height: auto;
    gap: 6px;
  }

  .title {
    width: 100%;
    text-align: center;
    margin-bottom: 4px;
    font-size: 12px;
  }

  .filters-row :deep(.filters-component-wrapper),
  .filters-row :deep(.filters) {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  .filters-row :deep(.el-input__wrapper),
  .filters-row :deep(.el-select__wrapper) {
    height: 26px !important;
    min-height: 26px !important;
    padding: 0 6px !important;
    font-size: 11px !important;
  }

  .filters-row :deep(.el-input__inner) {
    height: 24px !important;
    line-height: 24px !important;
    font-size: 11px !important;
  }

  .filters-row :deep(.el-select-dropdown__item) {
    font-size: 11px !important;
    padding: 3px 8px !important;
    height: 26px !important;
    line-height: 26px !important;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .company-list {
    padding: 8px;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .title {
    width: 100%;
    text-align: center;
    margin-bottom: 4px;
    font-size: 12px;
  }

  .filters-row :deep(.filters-component-wrapper),
  .filters-row :deep(.filters) {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .filters-row :deep(.el-input__wrapper),
  .filters-row :deep(.el-select__wrapper) {
    height: 26px !important;
    min-height: 26px !important;
    padding: 0 6px !important;
    font-size: 11px !important;
  }

  .filters-row :deep(.el-input__inner) {
    height: 24px !important;
    line-height: 24px !important;
    font-size: 11px !important;
  }

  .add-btn {
    height: 22px;
    padding: 2px 8px;
    font-size: 10px;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .company-list {
    padding: 4px;
  }

  .title {
    font-size: 11px;
  }

  .filters-row {
    gap: 4px;
  }

  .filters-row :deep(.filters-component-wrapper),
  .filters-row :deep(.filters) {
    gap: 3px;
  }

  .filters-row :deep(.el-input__wrapper),
  .filters-row :deep(.el-select__wrapper) {
    height: 24px !important;
    min-height: 24px !important;
    padding: 0 4px !important;
    font-size: 10px !important;
  }

  .filters-row :deep(.el-input__inner) {
    height: 22px !important;
    line-height: 22px !important;
    font-size: 10px !important;
  }

  .filters-row :deep(.el-select-dropdown__item) {
    font-size: 10px !important;
    padding: 2px 6px !important;
    height: 24px !important;
    line-height: 24px !important;
  }

  .add-btn {
    height: 20px;
    padding: 2px 6px;
    font-size: 9px;
  }

  .add-btn :deep(.el-icon) {
    font-size: 10px !important;
    margin-right: 2px;
  }
}

@media (hover: none) and (pointer: coarse) {
  .add-btn {
    min-height: 44px;
    padding: 10px 16px;
    font-size: 14px;
  }

  .filters-row :deep(.el-input__wrapper),
  .filters-row :deep(.el-select__wrapper) {
    height: 36px !important;
    font-size: 14px !important;
  }

  .title {
    font-size: 16px;
  }
}
</style>
