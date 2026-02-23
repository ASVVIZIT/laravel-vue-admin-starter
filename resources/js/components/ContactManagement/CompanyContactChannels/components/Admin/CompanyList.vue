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
          :disabled="isLoading"
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
        :loading="formLoading"
        :icon-map="iconMap"
        :icon-options="iconOptions"
        @update:visible="dialogVisible = $event"
        @submit="submitForm"
    />

    <DeleteConfirm
        :visible="deleteConfirmDialogVisible"
        :item="companyToDelete"
        :item-name="companyToDelete?.name"
        :entity-label="COMPANY_LIST_MESSAGES.ENTITY_LABEL"
        :loading="deletionLoading"
        @update:visible="deleteConfirmDialogVisible = $event"
        @confirm="confirmDelete"
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
} from '../../utils/appConfig.js';

const companyStore = useCompanyStore();
const fenixIconStore = useFenixIconsStore();

const dialogVisible = ref(false);
const editingCompany = ref(null);
const formLoading = ref(false);
const deletionLoading = ref(false);
const deleteConfirmDialogVisible = ref(false);
const companyToDelete = ref(null);
const filteringLoading = ref(false);
const pageSizeLoading = ref(false);
const tableKey = ref(0);

const isLoadingAll = ref(false);
const isLoadPaused = ref(false);
const isRecalculatingPagination = ref(false);

const iconMap = computed(() => getIconMap(fenixIconStore));
const iconOptions = computed(() => getIconOptions());

const availablePageSizes = computed(() => {
  return generateAvailablePageSizes(companyStore.loadedCount);
});

const isLoading = computed(() => {
  return (
      companyStore.loadingInitial ||
      companyStore.loading ||
      filteringLoading.value ||
      pageSizeLoading.value
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

const filteredCompanies = computed(() => {
  let result = [...companyStore.allCompanies];

  if (companyStore.searchQuery) {
    const query = companyStore.searchQuery.toLowerCase();
    result = result.filter((company) =>
        (company.name && company.name.toLowerCase().includes(query)) ||
        (company.address && company.address.toLowerCase().includes(query)) ||
        (company.description && company.description.toLowerCase().includes(query))
    );
  }

  if (companyStore.filterHasIcon !== '') {
    const hasIcon = companyStore.filterHasIcon === 'true';
    result = result.filter((company) => {
      const companyHasIcon = company.settings?.icon && company.settings.icon !== '';
      return hasIcon ? companyHasIcon : !companyHasIcon;
    });
  }

  result = sortCompanies(result, companyStore.sortBy);

  const paginationResult = companyStore.recalculatePagination(result);
  console.log('[CompanyList] filteredCompanies:', {
    total: result.length,
    pages: paginationResult.filteredTotalPages,
    current: paginationResult.currentPage,
  });

  return result;
});

const paginatedFilteredCompanies = computed(() => {
  const start = (companyStore.currentPage - 1) * companyStore.perPage;
  const end = start + companyStore.perPage;
  return filteredCompanies.value.slice(start, end);
});

const sortCompanies = (companies, sortValue) => {
  const sorted = [...companies];
  switch (sortValue) {
    case 'id_asc': return sorted.sort((a, b) => a.id - b.id);
    case 'id_desc': return sorted.sort((a, b) => b.id - a.id);
    case 'name_asc': return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'name_desc': return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    case 'created_at_desc': return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    case 'created_at_asc': return sorted.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    default: return sorted;
  }
};

const submitForm = async (formData) => {
  console.log('[CompanyList] submitForm: START', formData);

  formLoading.value = true;

  try {
    if (editingCompany.value) {
      await companyStore.updateCompany(editingCompany.value.id, formData);
      ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_COMPANY_UPDATED);
    } else {
      await companyStore.createCompany(formData);
      ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_COMPANY_CREATED);

      if (companyStore.sortBy === 'id_desc' || companyStore.sortBy === 'created_at_desc') {
        companyStore.currentPage = 1;
      }
    }
    dialogVisible.value = false;
    console.log('[CompanyList] submitForm: SUCCESS');
  } catch (err) {
    console.error('[CompanyList] submitForm: ERROR', err);
    ElMessage.error(COMPANY_LIST_MESSAGES.ERROR_SAVING);
  } finally {
    formLoading.value = false;
  }
};

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
    }, 100);
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
    }, 100);
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
  console.log('[CompanyList] refreshSingleRecord: START', { companyId });

  const row = companyStore.allCompanies.find((c) => c.id === companyId);
  if (!row) {
    console.error('[CompanyList] refreshSingleRecord: ROW NOT FOUND', { companyId });
    ElMessage.error(COMPANY_LIST_MESSAGES.ERROR_RECORD_REFRESH('Запись не найдена'));
    return;
  }

  console.log('[CompanyList] refreshSingleRecord: ROW FOUND', {
    id: row.id,
    name: row.name,
    _refreshing: row._refreshing,
  });

  row._refreshing = true;

  try {
    console.log('[CompanyList] refreshSingleRecord: CALLING STORE');

    const result = await companyStore.refreshSingleRecordWithRollback(companyId);

    console.log('[CompanyList] refreshSingleRecord: STORE RESULT', { result });

    if (result.success) {
      console.log('[CompanyList] refreshSingleRecord: SUCCESS');
      ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_RECORD_REFRESHED(row.name || `ID: ${row.id}`));
    } else {
      console.warn('[CompanyList] refreshSingleRecord: FAILED', { rolledBack: result.rolledBack });
      if (result.rolledBack) {
        ElMessage.warning(COMPANY_LIST_MESSAGES.ERROR_RECORD_REFRESH(row.name || `ID: ${row.id}`) + ' (данные восстановлены)');
      } else {
        ElMessage.error(COMPANY_LIST_MESSAGES.ERROR_RECORD_REFRESH(row.name || `ID: ${row.id}`));
      }
    }
  } catch (err) {
    console.error('[CompanyList] refreshSingleRecord: EXCEPTION', { error: err.message });
    companyStore.rollbackRefresh(companyId);
    ElMessage.error(COMPANY_LIST_MESSAGES.ERROR_RECORD_REFRESH(row.name || `ID: ${row.id}`) + ' (данные восстановлены)');
  } finally {
    console.log('[CompanyList] refreshSingleRecord: FINALLY');

    const updatedRow = companyStore.allCompanies.find((c) => c.id === companyId);
    if (updatedRow && updatedRow._refreshing === true) {
      updatedRow._refreshing = false;
      companyStore.allCompanies = [...companyStore.allCompanies];
      companyStore.companies = [...companyStore.allCompanies];
      console.log('[CompanyList] refreshSingleRecord: _refreshing RESET');
    }
  }
};

const handleSearch = (query) => {
  companyStore.setFilters({ searchQuery: query });
  filteringLoading.value = true;
  nextTick(() => setTimeout(() => { filteringLoading.value = false; }, COMPANY_LIST_FILTERS.FILTER_TRANSITION_DELAY));
};

const handleFilter = (filters) => {
  companyStore.setFilters({
    searchQuery: filters.search || '',
    filterHasIcon: filters.hasIcon || '',
    sortBy: filters.sortBy || SORT_OPTIONS.DEFAULT,
  });
  filteringLoading.value = true;
  nextTick(() => setTimeout(() => { filteringLoading.value = false; }, COMPANY_LIST_FILTERS.FILTER_TRANSITION_DELAY));
};

const handleResetFilters = () => {
  companyStore.resetFilters();
  ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_FILTERS_RESET);
  filteringLoading.value = true;
  nextTick(() => setTimeout(() => { filteringLoading.value = false; }, COMPANY_LIST_FILTERS.FILTER_TRANSITION_DELAY));
};

const handleSort = (sortValue) => {
  companyStore.setFilters({ sortBy: sortValue });
  filteringLoading.value = true;
  nextTick(() => setTimeout(() => { filteringLoading.value = false; }, COMPANY_LIST_FILTERS.FILTER_TRANSITION_DELAY));
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
    pageSizeLoading.value = true;
    companyStore.loadPage(1, newSize).finally(() => {
      pageSizeLoading.value = false;
    });
    return;
  }

  companyStore.perPage = newSize;
  companyStore.recalculatePagination();
  pageSizeLoading.value = true;
  nextTick(() => setTimeout(() => { pageSizeLoading.value = false; }, COMPANY_LIST_FILTERS.PAGE_SIZE_TRANSITION_DELAY));
};

const updateCompanyField = async (companyId, fieldName, newValue) => {
  const company = companyStore.allCompanies.find((c) => c.id === companyId);
  if (!company) return;

  company._updating = true;

  try {
    const updateData =
        fieldName === 'settings.icon'
            ? { settings: { ...company.settings, icon: newValue } }
            : { [fieldName]: newValue };

    await companyStore.updateCompany(companyId, updateData);
    ElMessage.success(`Поле "${getFieldLabel(fieldName, 'company')}" обновлено`);
  } catch (err) {
    ElMessage.warning(`Поле "${getFieldLabel(fieldName, 'company')}" не обновлено`);
  } finally {
    company._updating = false;
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
  await companyStore.fetchAllCompanies();
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
}

.add-btn :deep(.el-icon) {
  font-size: 12px;
  margin-right: 3px;
  vertical-align: middle;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: v-bind('COMPANY_LIST_UI.HEADER_TITLE_FILTERS_GAP');
  height: 28px;
  flex-wrap: nowrap !important;
  width: 100%;
  overflow: hidden;
}

.title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  color: #303133;
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
}

:deep(.el-loading-text) {
  color: v-bind('COMPANY_LIST_UI.LOADING_TEXT_COLOR');
  font-size: v-bind('COMPANY_LIST_UI.LOADING_TEXT_SIZE');
}

@media (max-width: 768px) {
  .header-row {
    flex-wrap: wrap;
    height: auto;
    gap: 6px;
  }

  .filters-row {
    flex-wrap: wrap;
    height: auto;
    gap: 6px;
  }

  .title {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .title {
    width: 100%;
    text-align: center;
    margin-bottom: 8px;
  }
}
</style>
