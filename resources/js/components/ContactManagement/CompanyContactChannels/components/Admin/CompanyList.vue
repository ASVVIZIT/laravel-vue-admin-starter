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
          :chunk-size="companyStore.chunkSize"
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
          :loading="companyStore.loadingInitial || companyStore.loading"
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
        :item-name="companyToDelete?.name || 'неизвестно'"
        :entity-label="COMPANY_LIST_MESSAGES.ENTITY_LABEL"
        :loading="companyStore.deletionLoading"
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

import {
  getIconMap,
  getIconOptions,
  parseIconFilterValue,
  generateAvailablePageSizes,
  PAGE_SIZE_OPTIONS,
  CHUNK_CONFIG,
  COMPANY_LIST_THRESHOLDS,
  COMPANY_LIST_FILTERS,
  COMPANY_LIST_UI,
  COMPANY_LIST_FILTERS_UI,
  COMPANY_LIST_MESSAGES,
  COMPANY_TABLE_UI,
  PAGINATOR_DISPLAY,
  SORT_OPTIONS,
  getFieldLabel,
  getSortOptions,
  BREAKPOINTS,
  TIMINGS,
  ANIMATIONS,
} from '../../config/appConfigIndex.js';

const companyStore = useCompanyStore();
const fenixIconStore = useFenixIconsStore();

const dialogVisible = ref(false);
const editingCompany = ref(null);
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
  console.log('🔵 [CompanyList] paginatedFilteredCompanies computed:', {
    currentPage: companyStore.currentPage,
    perPage: companyStore.perPage,
    filteredDataLength: companyStore.filteredData.length,
    allCompaniesLength: companyStore.allCompanies.length,
  });

  const start = (companyStore.currentPage - 1) * companyStore.perPage;
  const end = start + companyStore.perPage;

  const result = companyStore.filteredData.slice(start, end);

  console.log('🔵 [CompanyList] paginatedFilteredCompanies result:', {
    start,
    end,
    resultLength: result.length,
  });

  return result;
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
  console.log('🔵 [CompanyList] handleFilter:', {
    hasIcon: filters.hasIcon || '',
    type: typeof (filters.hasIcon || ''),
  });

  companyStore.setFilters({
    searchQuery: filters.search || '',
    filterHasIcon: filters.hasIcon || '',
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

// ✅ Сохраняем настройки!
const handleSettingsSave = (settings) => {
  console.log('[CompanyList] Settings saved:', settings);

  isSavingSettings.value = true;

  // ✅ Применяем настройки (сохраняет в localStorage и store)
  companyStore.applyUserSettings(settings);

  // ✅ Если изменился pageSize — пересчитываем пагинацию
  if (settings.pageSize) {
    companyStore.recalculatePagination();
  }
  // ✅ Если изменился chunkSize — он применится к СЛЕДУЮЩИМ чанкам
  // (не требует перезагрузки)
  setTimeout(() => {
    isSavingSettings.value = false;
  }, 500);

  // ✅ Закрываем модалку
  settingsDialogVisible.value = false;

  console.log('🟢 [CompanyList] Settings applied without reload');
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
  console.log('🔵 [CompanyList] showDeleteConfirm:', company);
  companyToDelete.value = company;
  deleteConfirmDialogVisible.value = true;
};

const confirmDelete = async () => {
  if (!companyToDelete.value) return;

  try {
    await companyStore.deleteCompany(companyToDelete.value.id);
    ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_COMPANY_DELETED(companyToDelete.value.name));
  } catch (err) {
    ElMessage.error(COMPANY_LIST_MESSAGES.ERROR_DELETING);
  } finally {
    companyToDelete.value = null;
    deleteConfirmDialogVisible.value = false;
  }
};

watch(() => dialogVisible.value, (newVal) => { if (!newVal) editingCompany.value = null; });
watch(() => companyStore.currentPage, () => { tableKey.value++; });
watch(() => companyStore.perPage, () => { tableKey.value++; });
watch(() => companyStore.filteredData.length, () => {
  tableKey.value++;
  console.log('🔵 [CompanyList] filteredData changed, tableKey++');
}, { immediate: false });

onMounted(async () => {
  console.log('[CompanyList] Component mounted');

  console.log('[CompanyList] Initial state:', {
    searchQuery: companyStore.searchQuery,
    filterHasIcon: companyStore.filterHasIcon,
    sortBy: companyStore.sortBy,
    perPage: companyStore.perPage,
    chunkSize: companyStore.chunkSize,
  });

  console.log('[CompanyList] Fetching companies...');
  await companyStore.fetchAllCompanies();
  console.log('[CompanyList] Fetch complete');
  console.log('[CompanyList] allCompanies:', companyStore.allCompanies.length);
  console.log('[CompanyList] filteredData:', companyStore.filteredData.length);
});
</script>

<style scoped>
/* ============================================================================
   COMPANY LIST — СТИЛИ (БЕЗ ИЗМЕНЕНИЙ)
   ============================================================================ */
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

/* ✅ FILTERS ROW — ИЗ КОНФИГА */
.filters-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: v-bind('COMPANY_LIST_FILTERS_UI.ROW_GAP');
  height: v-bind('COMPANY_LIST_FILTERS_UI.ROW_HEIGHT');
  flex-wrap: nowrap;
  width: 100%;
  overflow: visible;
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
  gap: v-bind('COMPANY_LIST_FILTERS_UI.CONTAINER_GAP');
  min-width: 0;
}

/* ✅ WRAPPER — ИЗ КОНФИГА */
.filters-row :deep(.el-input__wrapper),
.filters-row :deep(.el-select__wrapper) {
  height: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_HEIGHT') !important;
  min-height: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_HEIGHT') !important;
  padding: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_PADDING') !important;
  border-radius: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_BORDER_RADIUS') !important;
  font-size: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_FONT_SIZE') !important;
  box-shadow: none !important;
  border: 1px solid #dcdfe6 !important;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

/* ✅ INNER — ИЗ КОНФИГА */
.filters-row :deep(.el-input__inner) {
  height: v-bind('COMPANY_LIST_FILTERS_UI.INNER_HEIGHT') !important;
  line-height: v-bind('COMPANY_LIST_FILTERS_UI.INNER_LINE_HEIGHT') !important;
  font-size: v-bind('COMPANY_LIST_FILTERS_UI.INNER_FONT_SIZE') !important;
  padding: 0 !important;
}

/* ✅ SELECT INPUT — ИЗ КОНФИГА */
.filters-row :deep(.el-select__input) {
  font-size: v-bind('COMPANY_LIST_FILTERS_UI.INNER_FONT_SIZE') !important;
  height: v-bind('COMPANY_LIST_FILTERS_UI.INNER_HEIGHT') !important;
}

/* ✅ PREFIX / SUFFIX — ИЗ КОНФИГА */
.filters-row :deep(.el-input__prefix),
.filters-row :deep(.el-input__suffix) {
  display: flex;
  align-items: center;
  height: v-bind('COMPANY_LIST_FILTERS_UI.PREFIX_HEIGHT') !important;
}

.filters-row :deep(.el-input__prefix-inner > .el-icon),
.filters-row :deep(.el-input__suffix-inner > .el-icon) {
  font-size: v-bind('COMPANY_LIST_FILTERS_UI.PREFIX_FONT_SIZE') !important;
}

/* ✅ CARET / ARROW — ИЗ КОНФИГА */
.filters-row :deep(.el-select__caret),
.filters-row :deep(.el-select__arrow) {
  font-size: v-bind('COMPANY_LIST_FILTERS_UI.CARET_FONT_SIZE') !important;
  height: v-bind('COMPANY_LIST_FILTERS_UI.CARET_HEIGHT') !important;
  line-height: v-bind('COMPANY_LIST_FILTERS_UI.CARET_LINE_HEIGHT') !important;
}

/* ✅ DROPDOWN — ИЗ КОНФИГА */
.filters-row :deep(.el-select-dropdown__item) {
  font-size: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_FONT_SIZE') !important;
  padding: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_PADDING') !important;
  height: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_HEIGHT') !important;
  line-height: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_LINE_HEIGHT') !important;
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

/* ✅ АДАПТИВ — XXXL */
@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .header-row {
    flex-wrap: wrap;
    height: auto;
    gap: 4px;
  }

  .filters-row {
    flex-wrap: wrap;
    height: auto;
    gap: v-bind('COMPANY_LIST_FILTERS_UI.ROW_GAP_MOBILE');
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
    height: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_HEIGHT_MOBILE') !important;
    min-height: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_HEIGHT_MOBILE') !important;
    padding: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_PADDING_MOBILE') !important;
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_FONT_SIZE_MOBILE') !important;
  }

  .filters-row :deep(.el-input__inner) {
    height: v-bind('COMPANY_LIST_FILTERS_UI.INNER_HEIGHT_MOBILE') !important;
    line-height: v-bind('COMPANY_LIST_FILTERS_UI.INNER_LINE_HEIGHT_MOBILE') !important;
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.INNER_FONT_SIZE_MOBILE') !important;
  }

  .filters-row :deep(.el-select-dropdown__item) {
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_FONT_SIZE_MOBILE') !important;
    padding: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_PADDING_MOBILE') !important;
    height: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_HEIGHT_MOBILE') !important;
    line-height: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_LINE_HEIGHT_MOBILE') !important;
  }
}

/* ✅ АДАПТИВ — XL */
@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .company-list {
    padding: 8px;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: v-bind('COMPANY_LIST_FILTERS_UI.ROW_GAP_MOBILE');
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
    height: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_HEIGHT_MOBILE') !important;
    min-height: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_HEIGHT_MOBILE') !important;
    padding: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_PADDING_MOBILE') !important;
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_FONT_SIZE_MOBILE') !important;
  }

  .filters-row :deep(.el-input__inner) {
    height: v-bind('COMPANY_LIST_FILTERS_UI.INNER_HEIGHT_MOBILE') !important;
    line-height: v-bind('COMPANY_LIST_FILTERS_UI.INNER_LINE_HEIGHT_MOBILE') !important;
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.INNER_FONT_SIZE_MOBILE') !important;
  }

  .add-btn {
    height: 22px;
    padding: 2px 8px;
    font-size: 10px;
  }
}

/* ✅ АДАПТИВ — XS */
@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .company-list {
    padding: 4px;
  }

  .title {
    font-size: 11px;
  }

  .filters-row {
    gap: v-bind('COMPANY_LIST_FILTERS_UI.ROW_GAP_SMALL');
  }

  .filters-row :deep(.filters-component-wrapper),
  .filters-row :deep(.filters) {
    gap: 3px;
  }

  .filters-row :deep(.el-input__wrapper),
  .filters-row :deep(.el-select__wrapper) {
    height: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_HEIGHT_SMALL') !important;
    min-height: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_HEIGHT_SMALL') !important;
    padding: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_PADDING_SMALL') !important;
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_FONT_SIZE_SMALL') !important;
  }

  .filters-row :deep(.el-input__inner) {
    height: v-bind('COMPANY_LIST_FILTERS_UI.INNER_HEIGHT_SMALL') !important;
    line-height: v-bind('COMPANY_LIST_FILTERS_UI.INNER_LINE_HEIGHT_SMALL') !important;
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.INNER_FONT_SIZE_SMALL') !important;
  }

  .filters-row :deep(.el-select-dropdown__item) {
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_FONT_SIZE_SMALL') !important;
    padding: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_PADDING_SMALL') !important;
    height: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_HEIGHT_SMALL') !important;
    line-height: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_LINE_HEIGHT_SMALL') !important;
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

/* ✅ TOUCH DEVICES — ТОЛЬКО ЕСЛИ ЭКРАН МАЛЕНЬКИЙ (≤576px) */
@media (hover: none) and (pointer: coarse) and (max-width: v-bind('BREAKPOINTS.XS')) {
  .add-btn {
    min-height: v-bind('COMPANY_LIST_FILTERS_UI.BUTTON_HEIGHT_TOUCH');
    padding: 10px 16px;
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.BUTTON_FONT_SIZE_TOUCH');
  }

  .filters-row :deep(.el-input__wrapper),
  .filters-row :deep(.el-select__wrapper) {
    height: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_HEIGHT_TOUCH') !important;
    min-height: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_HEIGHT_TOUCH') !important;
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.WRAPPER_FONT_SIZE_TOUCH') !important;
  }

  .filters-row :deep(.el-input__inner),
  .filters-row :deep(.el-select__input) {
    height: v-bind('COMPANY_LIST_FILTERS_UI.INNER_HEIGHT_TOUCH') !important;
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.INNER_FONT_SIZE_TOUCH') !important;
  }

  .filters-row :deep(.el-select-dropdown__item) {
    height: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_HEIGHT_TOUCH') !important;
    line-height: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_LINE_HEIGHT_TOUCH') !important;
    font-size: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_FONT_SIZE_TOUCH') !important;
    padding: v-bind('COMPANY_LIST_FILTERS_UI.DROPDOWN_PADDING_TOUCH') !important;
  }

  .title {
    font-size: 16px;
  }
}
</style>
