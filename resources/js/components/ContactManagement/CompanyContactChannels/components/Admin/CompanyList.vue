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
        Добавить
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
      <h3 class="title">Список Компаний</h3>
      <Filters
          :total-items="companyStore.totalItems"
          :total-filtered="filteredCount"
          :disabled="isLoading"
          :available-sizes="availablePageSizes"
          :show-icon-filter="true"
          :search-debounce="COMPANY_LIST_FILTERS.SEARCH_DEBOUNCE"
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
          @row-dblclick="openEditDialog"
      />
    </div>

    <Pagination
        :layout="PAGINATOR_DISPLAY.LAYOUT"
        :current-page="companyStore.currentPage"
        :page-size="companyStore.perPage"
        :loaded-count="companyStore.loadedCount"
        :total-items="companyStore.totalItems"
        :available-sizes="availablePageSizes"
        :disabled="isLoading || isRecalculatingPagination"
        :pager-count="PAGINATOR_DISPLAY.PAGER_COUNT"
        :hide-on-single-page="PAGINATOR_DISPLAY.HIDE_ON_SINGLE"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
    />

    <CompanyForm
        v-model:visible="dialogVisible"
        :company="editingCompany"
        :loading="formLoading"
        :icon-map="iconMap"
        :icon-options="iconOptions"
        @submit="submitForm"
    />

    <DeleteConfirm
        v-model:visible="deleteConfirmDialogVisible"
        :item="companyToDelete"
        :item-name="companyToDelete?.name"
        entity-label="компанию"
        :loading="deletionLoading"
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
  getInitialCompanyListState,
} from '../../utils/paginationOptions.js';

const companyStore = useCompanyStore();
const fenixIconStore = useFenixIconsStore();

const initialState = getInitialCompanyListState();

const dialogVisible = ref(initialState.dialogVisible);
const editingCompany = ref(initialState.editingCompany);
const formLoading = ref(initialState.formLoading);
const deletionLoading = ref(initialState.deletionLoading);
const deleteConfirmDialogVisible = ref(initialState.deleteConfirmDialogVisible);
const companyToDelete = ref(initialState.companyToDelete);
const filteringLoading = ref(initialState.filteringLoading);
const pageSizeLoading = ref(initialState.pageSizeLoading);
const searchQuery = ref(initialState.searchQuery);
const filterHasIcon = ref(initialState.filterHasIcon);
const sortBy = ref(initialState.sortBy);
const filteredCount = ref(initialState.filteredCount);
const totalPages = ref(initialState.totalPages);
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

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((company) =>
        (company.name && company.name.toLowerCase().includes(query)) ||
        (company.address && company.address.toLowerCase().includes(query)) ||
        (company.description && company.description.toLowerCase().includes(query))
    );
  }

  if (filterHasIcon.value !== '') {
    const hasIcon = filterHasIcon.value === 'true';
    result = result.filter((company) => {
      const companyHasIcon = company.settings?.icon && company.settings.icon !== '';
      return hasIcon ? companyHasIcon : !companyHasIcon;
    });
  }

  result = sortCompanies(result, sortBy.value);
  filteredCount.value = result.length;
  totalPages.value = Math.ceil(result.length / companyStore.perPage);

  if (companyStore.currentPage > totalPages.value && totalPages.value > 0) {
    companyStore.currentPage = 1;
  }

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

// ★★★ ВАРИАНТ 3: УМНОЕ СОХРАНЕНИЕ СТРАНИЦЫ ПОСЛЕ СОЗДАНИЯ ★★★
const submitForm = async (formData) => {
  formLoading.value = true;

  try {
    if (editingCompany.value) {
      // РЕДАКТИРОВАНИЕ — остаёмся на той же странице
      await companyStore.updateCompany(editingCompany.value.id, formData);
      ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_COMPANY_UPDATED);
    } else {
      // СОЗДАНИЕ — проверяем сортировку для решения о переходе на страницу 1
      await companyStore.createCompany(formData);
      ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_COMPANY_CREATED);

      // Переходим на страницу 1 только если новая запись будет там
      // id_desc = новые ID сверху, created_at_desc = новые записи сверху
      if (sortBy.value === 'id_desc' || sortBy.value === 'created_at_desc') {
        companyStore.currentPage = 1;
      }
      // Для id_asc, name_asc, name_desc, created_at_asc — остаёмся на текущей странице
    }
    dialogVisible.value = false;
  } catch (err) {
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
    }, 200);
  }
};

const startChunkedLoad = async () => {
  if (companyStore.allRecordsLoaded) {
    ElMessage.info('Все записи уже загружены');
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
    }, 200);
  }
};

const pauseLoadAll = () => {
  isLoadPaused.value = true;
  ElMessage.info('Загрузка приостановлена');
};

const resumeLoadAll = () => {
  isLoadPaused.value = false;
  ElMessage.info('Загрузка возобновлена');
};

const refreshData = async () => {
  try {
    const result = await companyStore.refreshData();
    if (result.success) {
      ElMessage.success(result.newRecords > 0 ? `Загружено ${result.newRecords} новых записей` : 'Новых записей нет');
    }
  } catch (err) {
    ElMessage.error('Ошибка при обновлении: ' + err.message);
  }
};

const handleSearch = (query) => {
  filteringLoading.value = true;
  searchQuery.value = query;
  companyStore.currentPage = 1;
  nextTick(() => setTimeout(() => { filteringLoading.value = false; }, COMPANY_LIST_FILTERS.FILTER_TRANSITION_DELAY));
};

const handleFilter = (filters) => {
  filteringLoading.value = true;
  searchQuery.value = filters.search || '';
  filterHasIcon.value = filters.hasIcon || '';
  sortBy.value = filters.sortBy || 'id_asc';
  companyStore.currentPage = 1;
  nextTick(() => setTimeout(() => { filteringLoading.value = false; }, COMPANY_LIST_FILTERS.FILTER_TRANSITION_DELAY));
};

const handleResetFilters = () => {
  filteringLoading.value = true;
  searchQuery.value = '';
  filterHasIcon.value = '';
  sortBy.value = 'id_asc';
  companyStore.currentPage = 1;
  ElMessage.success(COMPANY_LIST_MESSAGES.SUCCESS_FILTERS_RESET);
  nextTick(() => setTimeout(() => { filteringLoading.value = false; }, COMPANY_LIST_FILTERS.FILTER_TRANSITION_DELAY));
};

const handleSort = (sortValue) => {
  filteringLoading.value = true;
  sortBy.value = sortValue;
  companyStore.currentPage = 1;
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

  pageSizeLoading.value = true;
  companyStore.perPage = newSize;
  companyStore.currentPage = 1;
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
    if (companyStore.currentPage > totalPages.value) {
      companyStore.currentPage = Math.max(1, totalPages.value);
    }
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
  flex-wrap: nowrap;
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

@media (max-width: 640px) {
  .header-row {
    flex-wrap: wrap;
    height: auto;
    gap: 6px;
  }

  .filters-row {
    flex-wrap: wrap;
    height: auto;
    gap: 8px;
  }

  .title {
    width: 100%;
    text-align: center;
  }
}
</style>
