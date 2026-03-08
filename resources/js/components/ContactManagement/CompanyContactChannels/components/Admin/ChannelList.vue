<template>
  <div class="channel-list-container">
    <!-- ========================================================================
         HEADER ROW
         ======================================================================== -->
    <div class="header-row">
      <el-button
          type="primary"
          size="small"
          :icon="Plus"
          :disabled="props.disabled || channelStore.isSaving"
          @click="handleAdd"
          class="add-btn"
      >
        {{ CHANNEL_LIST_MESSAGES.BTN_ADD }}
      </el-button>

      <LoadingDataActions
          v-if="channelStore.totalItems > 0"
          :loaded="channelStore.loadedCount"
          :total="channelStore.totalItems"
          :percentage="channelStore.loadedPercentage"
          :chunk-progress="channelStore.currentChunkProgress"
          :chunk-size="channelStore.chunkSize"
          :disabled="props.disabled"
          :is-loading="isLoadingAll"
          :is-paused="isLoadPaused"
          :show-load-more="showLoadMoreButton && !isLoadingAll"
          :show-load-all="showLoadAllButton && !isLoadingAll"
          :show-refresh="false"
          @load-more="handleLoadMore"
          @load-all="handleLoadAll"
          @pause="handlePause"
          @resume="handleResume"
          @refresh="handleRefresh"
          @settings="openOldSettingsDialog"
      />

      <el-tooltip
          :content="CHANNEL_LIST_MESSAGES.TOOLTIP_ENTITY_SETTINGS"
          placement="top"
          :show-after="TIMINGS.TOOLTIP_DELAY"
          :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
      >
        <el-button
            type="warning"
            :icon="Setting"
            circle
            :disabled="props.disabled"
            @click="openNewSettingsDialog"
            class="settings-entity-btn"
        />
      </el-tooltip>
    </div>

    <!-- ========================================================================
         ЗАГОЛОВОК + ФИЛЬТРЫ
         ======================================================================== -->
    <div class="channel-list-header">
      <div class="header-left">
        <div class="header-title">
          <el-icon :size="20" :color="COLORS.PRIMARY"><Connection /></el-icon>
          <h2>{{ CHANNEL_LIST_MESSAGES.TITLE }}</h2>
          <span class="channels-count" v-if="channelStore.hasChannels">
            ({{ channelStore.channelsCount }})
          </span>
        </div>

        <div class="header-filters">
          <!-- ✅ ПОИСК -->
          <el-tooltip
              :content="CHANNEL_LIST_MESSAGES.TOOLTIP_SEARCH"
              placement="top"
              :show-after="TIMINGS.TOOLTIP_DELAY"
              :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
          >
            <el-input
                v-model="selectedSearch"
                placeholder="Поиск..."
                class="search-input"
                clearable
                @input="handleSearchChange"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-tooltip>

          <!-- ✅ СОРТИРОВКА -->
          <el-tooltip
              :content="CHANNEL_LIST_MESSAGES.TOOLTIP_SORT"
              placement="top"
              :show-after="TIMINGS.TOOLTIP_DELAY"
              :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
          >
            <el-select
                v-model="selectedSortBy"
                placeholder="Сортировка"
                class="sort-select"
                @change="handleSortChange"
            >
              <el-option
                  v-for="option in CHANNEL_SORT_OPTIONS_LIST"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
              />
            </el-select>
          </el-tooltip>

          <!-- ✅ КОМПАНИЯ -->
          <el-tooltip
              :content="CHANNEL_LIST_MESSAGES.TOOLTIP_FILTER_COMPANY"
              placement="top"
              :show-after="TIMINGS.TOOLTIP_DELAY"
              :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
          >
            <el-select
                v-model="selectedCompanyId"
                placeholder="Все компании"
                clearable
                filterable
                class="company-filter-select"
                @change="handleCompanyFilterChange"
            >
              <el-option
                  v-for="company in companies"
                  :key="company.id"
                  :label="company.name"
                  :value="company.id"
              />
            </el-select>
          </el-tooltip>

          <!-- ✅ ТИП -->
          <el-tooltip
              :content="CHANNEL_LIST_MESSAGES.TOOLTIP_FILTER_TYPE"
              placement="top"
              :show-after="TIMINGS.TOOLTIP_DELAY"
              :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
          >
            <el-select
                v-model="selectedType"
                placeholder="Все типы"
                clearable
                class="type-filter-select"
                @change="handleTypeFilterChange"
            >
              <el-option
                  v-for="(label, value) in CHANNEL_TYPE_LABELS"
                  :key="value"
                  :label="label"
                  :value="value"
              />
            </el-select>
          </el-tooltip>

          <!-- ✅ СТАТУС -->
          <el-tooltip
              :content="CHANNEL_LIST_MESSAGES.TOOLTIP_FILTER_STATUS"
              placement="top"
              :show-after="TIMINGS.TOOLTIP_DELAY"
              :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
          >
            <el-select
                v-model="selectedIsActive"
                placeholder="Все статусы"
                clearable
                class="status-filter-select"
                @change="handleStatusFilterChange"
            >
              <el-option label="Активные" :value="true" />
              <el-option label="Неактивные" :value="false" />
            </el-select>
          </el-tooltip>

          <!-- ✅ КНОПКА СБРОСА -->
          <el-tooltip
              :content="CHANNEL_LIST_MESSAGES.TOOLTIP_RESET_FILTERS"
              placement="top"
              :show-after="TIMINGS.TOOLTIP_DELAY"
              :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
          >
            <el-button
                v-if="hasActiveFilters"
                size="small"
                :icon="RefreshLeft"
                circle
                @click="handleResetFilters"
                class="reset-filters-btn"
            />
          </el-tooltip>
        </div>
      </div>

      <div class="header-actions">
        <el-tooltip
            :content="CHANNEL_LIST_MESSAGES.BTN_REFRESH"
            placement="top"
            :show-after="TIMINGS.TOOLTIP_DELAY"
            :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
        >
          <el-button
              :icon="Refresh"
              :disabled="props.disabled || channelStore.loading"
              @click="handleRefresh"
              circle
          />
        </el-tooltip>
      </div>
    </div>

    <!-- ========================================================================
         ЗАГРУЗКА / ОШИБКА
         ======================================================================== -->
    <div v-if="channelStore.loadingInitial" class="loading-wrapper">
      <el-icon class="is-loading" :size="32" :color="COLORS.PRIMARY">
        <Loading />
      </el-icon>
      <p>{{ CHANNEL_LIST_MESSAGES.LOADING }}</p>
    </div>

    <div v-else-if="channelStore.hasError" class="error-wrapper">
      <el-icon :size="32" :color="COLORS.DANGER"><WarningFilled /></el-icon>
      <p>{{ channelStore.error }}</p>
      <el-button type="primary" @click="handleRefresh">Повторить</el-button>
    </div>

    <!-- ========================================================================
         ТАБЛИЦА + ПАГИНАЦИЯ
         ======================================================================== -->
    <div v-else-if="channelStore.hasChannels" class="channel-table-wrapper">
      <ChannelTable
          :key="tableKey"
          :data="paginatedChannels"
          :company-id="props.companyId"
          :loading="channelStore.isSaving || channelStore.isDeleting || channelStore.isReordering"
          :disabled="props.disabled"
          :show-edit-button="CHANNEL_LIST_PROPS_CONFIG.showEditButton.default"
          :show-delete-button="CHANNEL_LIST_PROPS_CONFIG.showDeleteButton.default"
          :allow-reorder="CHANNEL_LIST_PROPS_CONFIG.allowReorder.default"
          :use-store="CHANNEL_LIST_PROPS_CONFIG.useStore.default"
          @edit="handleEdit"
          @delete="handleDelete"
          @reorder="handleReorder"
          @update-field="handleUpdateField"
          @refresh="handleRefreshRow"
      />

      <!-- ✅ ПАГИНАЦИЯ -->
      <Pagination
          :layout="PAGINATOR_DISPLAY.LAYOUT"
          :current-page="channelStore.currentPage"
          :page-size="channelStore.perPage"
          :loaded-count="channelStore.filteredCount"
          :total-items="channelStore.totalItems"
          :available-sizes="availablePageSizes"
          :disabled="channelStore.loadingChunks"
          :pager-count="PAGINATOR_DISPLAY.PAGER_COUNT"
          :hide-on-single-page="PAGINATOR_DISPLAY.HIDE_ON_SINGLE"
          @page-change="handlePageChange"
          @size-change="handleSizeChange"
      />
    </div>

    <div v-else class="empty-wrapper">
      <el-icon :size="48" :color="COLORS.INFO"><Connection /></el-icon>
      <p>{{ CHANNEL_LIST_MESSAGES.EMPTY_NO_DATA }}</p>
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        {{ CHANNEL_LIST_MESSAGES.EMPTY_ADD_FIRST }}
      </el-button>
    </div>

    <ChannelForm
        v-model:visible="formVisible"
        :channel="currentChannel"
        :company-id="props.companyId"
        :companies="companies"
        :loading="channelStore.isSaving"
        :disabled="props.disabled"
        :use-store="CHANNEL_LIST_PROPS_CONFIG.useStore.default"
        @submit="handleSubmit"
        @cancel="handleFormCancel"
    />

    <DeleteConfirm
        v-model:visible="deleteDialogVisible"
        :item="currentChannel"
        :item-name="currentChannel?.title"
        entity-label="канал"
        :loading="channelStore.isDeleting"
        @confirm="confirmDelete"
        @cancel="deleteDialogVisible = false"
    />

    <SettingsModal
        v-model:visible="oldSettingsDialogVisible"
        :is-saving="isSavingSettings"
        @save="handleOldSettingsSave"
    />

    <SettingsModalEntity
        v-model:visible="newSettingsDialogVisible"
        entity-type="channel"
        :is-saving="isSavingSettings"
        @save="handleNewSettingsSave"
        @reset="handleSettingsReset"
    />
  </div>
</template>

<script setup>
/**
 * ============================================================================
 * CHANNEL LIST — СПИСОК КАНАЛОВ СВЯЗИ (С ПОЛНОЙ СИНХРОНИЗАЦИЕЙ!)
 * ============================================================================
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Connection, Loading, WarningFilled, Refresh, RefreshLeft, Setting, Search } from '@element-plus/icons-vue';
import ChannelTable from './ChannelTable.vue';
import ChannelForm from './ChannelForm.vue';
import DeleteConfirm from '../Common/DeleteConfirm.vue';
import LoadingDataActions from '../Common/LoadingDataActions.vue';
import Pagination from '../Common/Pagination.vue';
import SettingsModal from '../Common/SettingsModal.vue';
import SettingsModalEntity from '../Common/SettingsModalEntity.vue';
import { useChannelStore } from '@/components/ContactManagement/CompanyContactChannels/store/channelStore.js';
import { useCompanyStore } from '@/components/ContactManagement/CompanyContactChannels/store/companyStore.js';
import {
  // ✅ HELPERS
  getChannelSortOptions,
  getChannelUserSettings,

  // ✅ CONSTANTS
  CHUNK_CONFIG,
  CHANNEL_LIST_PROPS_CONFIG,
  CHANNEL_LIST_THRESHOLDS,
  CHANNEL_LIST_FILTERS,
  CHANNEL_USER_SETTINGS,
  CHANNEL_SORT_OPTIONS,
  CHANNEL_TYPE_LABELS,
  PAGE_SIZE_OPTIONS,

  // ✅ UI CONFIGS
  CHANNEL_LIST_MESSAGES,
  CHANNEL_LIST_UI,
  CHANNEL_LIST_FILTERS_UI,
  PAGINATOR_DISPLAY,

  // ✅ GLOBAL
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
} from '../../config/appConfigIndex.js';

const props = defineProps({ ...CHANNEL_LIST_PROPS_CONFIG });
const emit = defineEmits(['update', 'delete']);

const channelStore = useChannelStore();
const companyStore = useCompanyStore();

// ============================================================================
// STATE (КАК В COMPANIES — ЕДИНЫЙ ПОРЯДОК!)
// ============================================================================

// ✅ 1. DIALOG STATES
const formVisible = ref(false);
const deleteDialogVisible = ref(false);
const oldSettingsDialogVisible = ref(false);
const newSettingsDialogVisible = ref(false);
const isSavingSettings = ref(false);
const currentChannel = ref(null);

// ✅ 2. FILTER STATES
const selectedCompanyId = ref(null);
const selectedType = ref(null);
const selectedIsActive = ref(null);
const selectedSortBy = ref(CHANNEL_SORT_OPTIONS.DEFAULT);
const selectedSearch = ref('');

// ✅ 3. TABLE STATES
const tableKey = ref(0);

// ✅ 4. LOADING STATES
const isLoadingAll = ref(false);
const isLoadPaused = ref(false);
const isRecalculatingPagination = ref(false);

// ============================================================================
// COMPUTED
// ============================================================================
const companies = computed(() => companyStore.allCompanies);

const paginatedChannels = computed(() => {
  const start = (channelStore.currentPage - 1) * channelStore.perPage;
  const end = start + channelStore.perPage;
  return channelStore.filteredData.slice(start, end);
});

const availablePageSizes = computed(() => {
  const baseSizes = PAGE_SIZE_OPTIONS.BASE_AVAILABLE;
  const filtered = baseSizes.filter(size => size <= channelStore.totalItems);
  if (channelStore.totalItems > 0 && !filtered.includes(channelStore.totalItems)) {
    filtered.push(channelStore.totalItems);
  }
  return filtered.sort((a, b) => a - b);
});

const showLoadMoreButton = computed(() => {
  return (
      !channelStore.allRecordsLoaded &&
      channelStore.totalItems > CHANNEL_LIST_THRESHOLDS.SHOW_LOAD_BUTTONS_MIN &&
      channelStore.loadedCount < channelStore.totalItems
  );
});

const showLoadAllButton = computed(() => {
  return (
      !channelStore.allRecordsLoaded &&
      channelStore.totalItems > CHANNEL_LIST_THRESHOLDS.SHOW_LOAD_BUTTONS_MIN &&
      channelStore.loadedCount < channelStore.totalItems &&
      channelStore.totalItems > 0
  );
});

const CHANNEL_SORT_OPTIONS_LIST = computed(() => getChannelSortOptions());

const hasActiveFilters = computed(() => {
  return (
      selectedCompanyId.value !== null ||
      selectedType.value !== null ||
      selectedIsActive.value !== null ||
      selectedSortBy.value !== CHANNEL_SORT_OPTIONS.DEFAULT ||
      selectedSearch.value !== ''
  );
});

// ============================================================================
// ⭐ WATCH — СИНХРОНИЗАЦИЯ STORE.FILTERS → UI (6 WATCH!)
// ============================================================================
watch(() => channelStore.filters.sort_by, (newVal) => {
  if (newVal && newVal !== selectedSortBy.value) {
    selectedSortBy.value = newVal;
  }
}, { immediate: true });

watch(() => channelStore.filters.type, (newVal) => {
  if (newVal !== selectedType.value) {
    selectedType.value = newVal;
  }
}, { immediate: true });

watch(() => channelStore.filters.is_active, (newVal) => {
  if (newVal !== selectedIsActive.value) {
    selectedIsActive.value = newVal;
  }
}, { immediate: true });

watch(() => channelStore.filters.company_id, (newVal) => {
  if (newVal !== selectedCompanyId.value) {
    selectedCompanyId.value = newVal;
  }
}, { immediate: true });

watch(() => channelStore.filters.search, (newVal) => {
  if (newVal !== selectedSearch.value) {
    selectedSearch.value = newVal;
  }
}, { immediate: true });

watch(() => channelStore.perPage, (newVal) => {
  console.log('🔵 [ChannelList] Watch: perPage changed:', newVal);
  tableKey.value++;
}, { immediate: true });

watch(() => channelStore.currentPage, () => {
  tableKey.value++;
});

watch(() => channelStore.filteredData.length, () => {
  tableKey.value++;
}, { immediate: false });

watch(() => channelStore.allChannels, (newVal) => {
  console.log('🔵 [ChannelList] allChannels:', newVal.length);
}, { immediate: true });

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(async () => {
  console.log('🔵 [ChannelList] onMounted: START');

  // ✅ 1. ЗАГРУЗИТЬ НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ
  const userSettings = getChannelUserSettings();
  console.log('🟢 [ChannelList] User settings loaded:', userSettings);

  // ✅ 2. ЗАГРУЗИТЬ КОМПАНИИ ДЛЯ ФИЛЬТРА
  if (!companyStore.hasChannels) {
    await companyStore.fetchAllCompanies();
  }

  // ✅ 3. ВОССТАНАВЛИВАЕМ ФИЛЬТРЫ ИЗ STORE
  selectedCompanyId.value = channelStore.filters.company_id;
  selectedType.value = channelStore.filters.type;
  selectedIsActive.value = channelStore.filters.is_active;
  selectedSortBy.value = channelStore.filters.sort_by;
  selectedSearch.value = channelStore.filters.search || '';

  console.log('🟢 [ChannelList] Filters restored from store:', {
    companyId: selectedCompanyId.value,
    type: selectedType.value,
    isActive: selectedIsActive.value,
    sortBy: selectedSortBy.value,
    search: selectedSearch.value,
  });

  await loadChannels();
  console.log('🟢 [ChannelList] onMounted: COMPLETE');
});

onUnmounted(() => {
  console.log('🔵 [ChannelList] onUnmounted: RESET STORE');
  channelStore.resetStore();
});

// ============================================================================
// LOAD CHANNELS
// ============================================================================
async function loadChannels() {
  console.log('🔵 [ChannelList] loadChannels: START');
  const result = await channelStore.fetchAllChannels();
  if (!result.success) {
    ElMessage.error(result.error || CHANNEL_LIST_MESSAGES.ERROR_LOADING);
  }
  console.log('🟢 [ChannelList] loadChannels: COMPLETE', {
    loaded: channelStore.allChannels.length,
    total: channelStore.totalItems,
  });
}

// ============================================================================
// FILTER HANDLERS — UI → STORE
// ============================================================================
function handleCompanyFilterChange() {
  console.log('🔵 [ChannelList] handleCompanyFilterChange:', selectedCompanyId.value);
  channelStore.setFilters({ company_id: selectedCompanyId.value });
  loadChannels();
}

function handleTypeFilterChange() {
  console.log('🔵 [ChannelList] handleTypeFilterChange:', selectedType.value);
  channelStore.setFilters({ type: selectedType.value });
  loadChannels();
}

function handleStatusFilterChange() {
  console.log('🔵 [ChannelList] handleStatusFilterChange:', selectedIsActive.value);
  channelStore.setFilters({ is_active: selectedIsActive.value });
  loadChannels();
}

function handleSortChange() {
  console.log('🔵 [ChannelList] handleSortChange:', selectedSortBy.value);
  channelStore.setFilters({ sort_by: selectedSortBy.value });
  loadChannels();
}

function handleSearchChange() {
  console.log('🔵 [ChannelList] handleSearchChange:', selectedSearch.value);
  channelStore.setFilters({ search: selectedSearch.value });
  loadChannels();
}

// ============================================================================
// HANDLE RESET FILTERS
// ============================================================================
function handleResetFilters() {
  console.log('🔵 [ChannelList] handleResetFilters');

  selectedCompanyId.value = null;
  selectedType.value = null;
  selectedIsActive.value = null;
  selectedSortBy.value = CHANNEL_SORT_OPTIONS.DEFAULT;
  selectedSearch.value = '';

  channelStore.setFilters({
    company_id: null,
    type: null,
    is_active: null,
    search: '',
    sort_by: CHANNEL_SORT_OPTIONS.DEFAULT,
  });

  loadChannels();
  ElMessage.success(CHANNEL_LIST_MESSAGES.SUCCESS_FILTERS_RESET);
}

// ============================================================================
// CRUD / ACTIONS
// ============================================================================
function handleAdd() { currentChannel.value = null; formVisible.value = true; }
function handleEdit(channel) { currentChannel.value = channel; formVisible.value = true; }
function handleDelete(channel) { currentChannel.value = channel; deleteDialogVisible.value = true; }

async function confirmDelete() {
  if (!currentChannel.value) return;
  const result = await channelStore.deleteChannel(currentChannel.value.id);
  if (result.success) {
    ElMessage.success(CHANNEL_LIST_MESSAGES.SUCCESS_CHANNEL_DELETED);
    emit('delete', currentChannel.value);
  } else {
    ElMessage.error(result.error || CHANNEL_LIST_MESSAGES.ERROR_DELETING);
  }
  deleteDialogVisible.value = false;
  currentChannel.value = null;
}

async function handleSubmit(data) {
  let result;
  if (currentChannel.value?.id) {
    result = await channelStore.updateChannel(currentChannel.value.id, data);
    if (result.success) {
      ElMessage.success(CHANNEL_LIST_MESSAGES.SUCCESS_CHANNEL_UPDATED);
      emit('update', result.data);
    } else {
      ElMessage.error(result.error || CHANNEL_LIST_MESSAGES.ERROR_SAVING);
      return;
    }
  } else {
    result = await channelStore.createChannel(data);
    if (result.success) {
      ElMessage.success(CHANNEL_LIST_MESSAGES.SUCCESS_CHANNEL_CREATED);
      emit('update', result.data);
    } else {
      ElMessage.error(result.error || CHANNEL_LIST_MESSAGES.ERROR_SAVING);
      return;
    }
  }
  formVisible.value = false;
  currentChannel.value = null;
}

function handleFormCancel() { formVisible.value = false; currentChannel.value = null; }

async function handleReorder(order) {
  const result = await channelStore.reorderChannels(order);
  if (result.success) {
    ElMessage.success(CHANNEL_LIST_MESSAGES.SUCCESS_ORDER_UPDATED);
  } else {
    ElMessage.error(result.error || CHANNEL_LIST_MESSAGES.ERROR_REORDER);
  }
}

async function handleUpdateField(channelId, fieldName, newValue) {
  const data = { [fieldName]: newValue };
  const result = await channelStore.updateChannel(channelId, data);
  if (!result.success) ElMessage.error(result.error || 'Ошибка обновления');
}

async function handleRefreshRow(row) {
  // ✅ ИЗВЛЕКАЕМ ID ИЗ PROXY
  const channelId = typeof row.id === 'object'
      ? JSON.parse(JSON.stringify(row.id))
      : row.id;

  console.log('🔵 [ChannelList] handleRefreshRow:', { row, channelId, type: typeof channelId });

  const result = await channelStore.refreshSingleRecord(channelId);
  if (result.success) {
    ElMessage.success(CHANNEL_LIST_MESSAGES.SUCCESS_RECORD_REFRESHED(row.title || `Канал #${channelId}`));
  } else {
    ElMessage.error(result.error || CHANNEL_LIST_MESSAGES.ERROR_RECORD_REFRESH(row.title || `Канал #${channelId}`));
  }
}

async function handleLoadMore() {
  const hasMore = await channelStore.loadNextChunk();
  if (hasMore) {
    ElMessage.success(CHANNEL_LIST_MESSAGES.SUCCESS_CHUNK_LOADED(channelStore.chunkSize));
  } else {
    ElMessage.info(CHANNEL_LIST_MESSAGES.ALL_RECORDS_LOADED);
  }
}

// ✅ УБЕДИТЬСЯ ЧТО CHUNK_CONFIG.DELAY = 200:
async function handleLoadAll() {
  if (channelStore.allRecordsLoaded) {
    ElMessage.info(CHANNEL_LIST_MESSAGES.ALL_RECORDS_LOADED);
    return;
  }

  if (channelStore.totalItems > CHANNEL_LIST_THRESHOLDS.CONFIRM_LOAD_ALL_MIN) {
    try {
      await ElMessageBox.confirm(
          CHANNEL_LIST_MESSAGES.CONFIRM_LOAD_ALL_MESSAGE(channelStore.totalItems),
          CHANNEL_LIST_MESSAGES.CONFIRM_LOAD_ALL_TITLE,
          { confirmButtonText: CHANNEL_LIST_MESSAGES.CONFIRM_LOAD_ALL_CONFIRM, cancelButtonText: CHANNEL_LIST_MESSAGES.CONFIRM_LOAD_ALL_CANCEL, type: 'warning' }
      );
    } catch (e) { return; }
  }

  isLoadingAll.value = true;
  isLoadPaused.value = false;
  isRecalculatingPagination.value = true;

  try {
    while (!channelStore.allRecordsLoaded && !isLoadPaused.value) {
      await channelStore.loadNextChunk();
      await new Promise((resolve) => setTimeout(resolve, CHUNK_CONFIG.DELAY));  // ← ← ← 200ms
    }

    if (channelStore.allRecordsLoaded) {
      ElMessage.success(CHANNEL_LIST_MESSAGES.SUCCESS_ALL_LOADED(channelStore.totalItems));
    }
  } catch (err) {
    ElMessage.error(CHANNEL_LIST_MESSAGES.ERROR_LOADING + ': ' + err.message);
  } finally {
    isLoadingAll.value = false;
    isLoadPaused.value = false;
    setTimeout(() => {
      isRecalculatingPagination.value = false;
    }, TIMINGS.RECALCULATING_DURATION);
  }
}

function handlePause() {
  isLoadPaused.value = true;
  ElMessage.info(CHANNEL_LIST_MESSAGES.LOAD_PAUSED);
}

function handleResume() {
  isLoadPaused.value = false;
  ElMessage.info(CHANNEL_LIST_MESSAGES.LOAD_RESUMED);
}

// ============================================================================
// SETTINGS — СТАРАЯ МОДАЛКА
// ============================================================================
function openOldSettingsDialog() { console.log('🔵 [ChannelList] openOldSettingsDialog'); oldSettingsDialogVisible.value = true; }

function handleOldSettingsSave(settings) {
  console.log('🔵 [ChannelList] handleOldSettingsSave:', settings);
  isSavingSettings.value = true;
  channelStore.applyUserSettings(settings);
  if (settings.pageSize) channelStore.recalculatePagination();
  setTimeout(() => { isSavingSettings.value = false; }, 500);
  oldSettingsDialogVisible.value = false;
  ElMessage.success(CHANNEL_LIST_MESSAGES.SUCCESS_SETTINGS_SAVED);
}

// ============================================================================
// ⭐ SETTINGS — НОВАЯ МОДАЛКА (SettingsModalEntity) С ПОЛНОЙ СИНХРОНИЗАЦИЕЙ!
// ============================================================================
function openNewSettingsDialog() { console.log('🔵 [ChannelList] openNewSettingsDialog'); newSettingsDialogVisible.value = true; }

function handleNewSettingsSave(settings) {
  console.log('🔵 [ChannelList] handleNewSettingsSave:', settings);
  isSavingSettings.value = true;

  // ✅ 1. ПРИМЕНЯЕМ НАСТРОЙКИ ЧЕРЕЗ STORE
  channelStore.applyUserSettings(settings);

  // ✅ 2. СИНХРОНИЗАЦИЯ UI — PAGE SIZE
  if (settings.pageSize) {
    channelStore.recalculatePagination();
  }

  // ✅ 3. СИНХРОНИЗАЦИЯ UI — СОРТИРОВКА
  if (settings.defaultSortBy) {
    channelStore.setFilters({ sort_by: settings.defaultSortBy });
    selectedSortBy.value = settings.defaultSortBy;
  }

  // ✅ 4. СИНХРОНИЗАЦИЯ UI — ФИЛЬТР КОМПАНИИ
  if (settings.defaultFilterCompanyId !== undefined) {
    channelStore.setFilters({ company_id: settings.defaultFilterCompanyId });
    selectedCompanyId.value = settings.defaultFilterCompanyId;
  }

  // ✅ 5. СИНХРОНИЗАЦИЯ UI — ФИЛЬТР ТИПА
  if (settings.defaultFilterType !== undefined) {
    channelStore.setFilters({ type: settings.defaultFilterType });
    selectedType.value = settings.defaultFilterType;
  }

  // ✅ 6. СИНХРОНИЗАЦИЯ UI — ФИЛЬТР СТАТУСА
  if (settings.defaultFilterIsActive !== undefined) {
    channelStore.setFilters({ is_active: settings.defaultFilterIsActive });
    selectedIsActive.value = settings.defaultFilterIsActive;
  }

  // ✅ 7. СИНХРОНИЗАЦИЯ UI — ПОИСК
  if (settings.defaultSearch !== undefined) {
    channelStore.setFilters({ search: settings.defaultSearch });
    selectedSearch.value = settings.defaultSearch;
  }

  setTimeout(() => { isSavingSettings.value = false; }, 500);
  newSettingsDialogVisible.value = false;
  loadChannels();
  ElMessage.success('Настройки применены и синхронизированы с фильтром');
}

// ============================================================================
// ⭐ PAGINATION HANDLERS — КАК В COMPANIES!
// ============================================================================
function handleSizeChange(newSize) {
  if (newSize >= channelStore.loadedCount && channelStore.loadedCount > 0) {
    handleLoadAll();
    return;
  }

  if (newSize > PAGE_SIZE_OPTIONS.MAX) {
    channelStore.fetchChannels({ page: 1, per_page: newSize });
    return;
  }

  channelStore.setPageSize(newSize);  // ← ← ← ЧЕРЕЗ STORE!
}

function handlePageChange(newPage) {
  channelStore.setCurrentPage(newPage);
}

function handleSettingsReset(defaultSettings) {
  console.log('🔵 [ChannelList] handleSettingsReset:', defaultSettings);

  channelStore.applyUserSettings(defaultSettings);

  // ✅ СИНХРОНИЗАЦИЯ UI
  if (defaultSettings.defaultSortBy) selectedSortBy.value = defaultSettings.defaultSortBy;
  if (defaultSettings.defaultFilterCompanyId !== undefined) selectedCompanyId.value = defaultSettings.defaultFilterCompanyId;
  if (defaultSettings.defaultFilterType !== undefined) selectedType.value = defaultSettings.defaultFilterType;
  if (defaultSettings.defaultFilterIsActive !== undefined) selectedIsActive.value = defaultSettings.defaultFilterIsActive;
  if (defaultSettings.defaultSearch !== undefined) selectedSearch.value = defaultSettings.defaultSearch;

  channelStore.setFilters({
    company_id: defaultSettings.defaultFilterCompanyId || null,
    type: defaultSettings.defaultFilterType || null,
    is_active: defaultSettings.defaultFilterIsActive || null,
    search: defaultSettings.defaultSearch || '',
    sort_by: defaultSettings.defaultSortBy || CHANNEL_SORT_OPTIONS.DEFAULT,
  });

  loadChannels();
  ElMessage.success('Настройки сброшены к значениям по умолчанию');
}

function handleRefresh() { loadChannels(); }
</script>

<style scoped>
.channel-list-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  border-radius: 4px;
  overflow: hidden;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  flex-wrap: nowrap;
  white-space: nowrap;
  padding: 8px;
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

.settings-entity-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.settings-entity-btn:hover:not(:disabled) {
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.channel-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #EBEEF5;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.header-title h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.channels-count {
  font-size: 14px;
  color: #909399;
  font-weight: 400;
}

.header-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.search-input {
  width: v-bind('CHANNEL_LIST_FILTERS_UI.SEARCH_WIDTH');
  transition: width v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.search-input:focus {
  width: v-bind('CHANNEL_LIST_FILTERS_UI.SEARCH_WIDTH_FOCUSED');
}

.company-filter-select,
.type-filter-select,
.status-filter-select,
.sort-select {
  width: v-bind('CHANNEL_LIST_UI.FILTER_WIDTH');
}

.reset-filters-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent !important;
  color: v-bind('COLORS.INFO');
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.reset-filters-btn:hover:not(:disabled) {
  color: v-bind('COLORS.PRIMARY');
  transform: rotate(90deg);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.channel-table-wrapper {
  flex: 1;
  overflow: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.pagination-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: v-bind('CHANNEL_LIST_UI.PAGINATION_MARGIN_TOP') 0 0 0;
  gap: v-bind('CHANNEL_LIST_UI.PAGINATION_GAP');
  border-top: 1px solid #EBEEF5;
  margin-top: v-bind('CHANNEL_LIST_UI.PAGINATION_MARGIN_TOP');
}

.loading-wrapper,
.error-wrapper,
.empty-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 20px;
  color: #909399;
}

.loading-wrapper p,
.error-wrapper p,
.empty-wrapper p {
  margin: 0;
  font-size: 14px;
}

.error-wrapper { color: #F56C6C; }
.empty-wrapper { color: #909399; }

@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .header-row { flex-wrap: wrap; height: auto; gap: 4px; }
  .channel-list-header { flex-direction: column; align-items: flex-start; }
  .header-left { flex-direction: column; align-items: flex-start; width: 100%; }
  .header-filters { flex-wrap: wrap; width: 100%; }
  .company-filter-select, .type-filter-select, .status-filter-select, .sort-select, .search-input { width: v-bind('CHANNEL_LIST_UI.FILTER_WIDTH_MOBILE'); }
  .header-actions { width: 100%; justify-content: flex-end; }
  .pagination-section { flex-direction: column; align-items: center; gap: 8px; }
}

@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .header-title h2 { font-size: 14px; }
  .header-actions .el-button { padding: 8px 12px; font-size: 12px; }
  .company-filter-select, .type-filter-select, .status-filter-select, .sort-select, .search-input { width: v-bind('CHANNEL_LIST_UI.FILTER_WIDTH_SMALL'); }
  .reset-filters-btn { width: 28px; height: 28px; }
  .add-btn { height: 22px; padding: 2px 8px; font-size: 10px; }
  .settings-entity-btn { width: 28px; height: 28px; }
}

@media (hover: none) and (pointer: coarse) and (max-width: v-bind('BREAKPOINTS.XS')) {
  .add-btn { min-height: 36px; padding: 10px 16px; }
  .header-actions .el-button { min-height: 44px; padding: 10px 16px; }
  .company-filter-select, .type-filter-select, .status-filter-select, .sort-select, .search-input { min-height: 36px; }
  .settings-entity-btn { min-height: 36px; min-width: 36px; }
}
</style>
