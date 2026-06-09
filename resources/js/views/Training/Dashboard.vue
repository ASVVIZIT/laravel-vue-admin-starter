<template>
  <div class="training-dashboard">
    <TrainingDashboardHeader
        :summary="summary"
        :stats="stats"
        :show-stats="settingsStore.serverSettings?.enable_stats !== false"
        :loading="logStore.currentLoading"
        :show-form="showForm"
        :show-settings="true"
        :show-debug="true"
        :debug-visible="debugStore.isVisible"
        :has-logs="logStore.hasLogs"
        @toggle-form="toggleForm"
        @toggle-settings="toggleSettings"
        @toggle-debug="debugStore.toggleVisibility()"
        @refresh="handleRefresh"
    />

    <div class="tabs-row">
      <el-tabs v-model="activeTab" type="card" class="compact-tabs">
        <el-tab-pane v-for="(config, key) in tabConfig" :key="key" :label="config.label" :name="key" />
      </el-tabs>

      <div v-if="currentGroupingInfo" class="grouping-indicator">
        <el-tag
            :type="currentGroupingInfo.mode === 'server' ? 'warning' : 'info'"
            size="small" effect="plain"
            :title="currentGroupingInfo.displayReason"
        >
          {{ currentGroupingInfo.mode === 'server' ? '🖥' : '📱' }}
        </el-tag>
        <el-button v-if="settingsStore.isGroupingToggleVisibleStore" size="small" text @click="toggleGroupingMode" class="toggle-btn" title="Переключить режим">
          <el-icon><Switch /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="filter-wrapper"><TrainingLogFilterBarTable /></div>

    <main class="dashboard-main">
      <div v-if="logStore.currentLoading" class="state-container"><el-skeleton :rows="8" animated /></div>

      <el-empty v-else-if="!logStore.hasLogs" :description="emptyDescription" class="state-container">
        <el-button v-if="activeTab === 'mine'" type="primary" @click="toggleForm"><el-icon><Plus /></el-icon> Добавить запись</el-button>
        <el-button v-else type="info" @click="activeTab = 'mine'">Перейти к моим записям</el-button>
      </el-empty>

      <template v-else>
        <div class="table-wrapper">
          <TrainingLogTable
              :logs="logStore.currentLogs" :loading="logStore.currentLoading" :active-tab="activeTab"
              :current-user-id="currentUserId" :pagination="logStore.currentPagination" :compact="frontendSettings.compact_view"
              :is-grouped="logStore.isGrouped" :columns-config="currentColumnsConfig"
              @edit="handleEdit" @delete="handleTableDelete" @page-change="logStore.setPage" @per-page-change="logStore.setPerPage"
          />
        </div>
      </template>
    </main>

    <el-dialog v-model="showForm" :title="isEdit ? 'Редактирование' : 'Новая запись'" width="900px" destroy-on-close>
      <TrainingLogForm
          :key="currentLogId ?? 'new'"
          :log-id="currentLogId"
          :initial-data="currentLogData"
          @saved="handleSaved"
          @deleted="handleDeleted"
          @cancelled="showForm = false"
      />
    </el-dialog>

    <TrainingSettingsModal v-model="showSettings" />
    <DebugPanel />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Switch } from '@element-plus/icons-vue'

import { useTrainingLogStore, TAB_CONFIG } from '@/components/Training/stores/trainingLogStore.js'
import { useTrainingExerciseStore } from '@components/Training/stores/trainingExerciseStore.js'
import { useTrainingSettingsStore } from '@/components/Training/stores/trainingSettingsStore.js'
import { useTrainingDebugStore } from '@/components/Training/stores/trainingDebugStore.js'
import { useDebug } from '@/components/Training/composables/useDebug.js'

import TrainingDashboardHeader from '@/components/Training/components/TrainingDashboardHeader.vue'
import TrainingLogFilterBarTable from '@components/Training/components/TrainingLogFilterBarTable.vue'
import TrainingLogTable from '@/components/Training/components/TrainingLogTable.vue'
import TrainingLogForm from '@/components/Training/components/TrainingLogForm.vue'
import TrainingSettingsModal from '@/components/Training/components/settings/modals/TrainingSettingsModal.vue'
import DebugPanel from '@components/Training/components/layout/panels/TrainingDebugPanel.vue'

const debug = useDebug('Dashboard')
const logStore = useTrainingLogStore()
const exerciseStore = useTrainingExerciseStore()
const settingsStore = useTrainingSettingsStore()
const debugStore = useTrainingDebugStore()

const showForm = ref(false)
const showSettings = ref(false)
const currentLogId = ref(null)
const currentLogData = ref(null)
const activeTab = ref('mine')
const tabConfig = TAB_CONFIG

const currentUserId = computed(() => {
  if (typeof window !== 'undefined' && window.__CURRENT_USER_ID) return window.__CURRENT_USER_ID
  if (!currentUserId._warned) { debug.error('Глобальная переменная window.__CURRENT_USER_ID не найдена. Используется фолбэк id=1.'); currentUserId._warned = true }
  return 1
})

const isEdit = computed(() => !!currentLogId.value)
const stats = computed(() => logStore.stats || {})
const summary = computed(() => logStore.summary || {})
const frontendSettings = computed(() => settingsStore.frontendSettings)
const currentColumnsConfig = computed(() => settingsStore.getColumnsForTabStore(activeTab.value))

const currentGroupingInfo = computed(() => {
  const forced = logStore.currentForcedMode
  if (forced) return { mode: forced, displayReason: `Принудительно пользователем`, isForced: true }

  const autoMode = settingsStore.getGroupingModeForTabStore(activeTab.value)
  let displayReason = autoMode.reason || 'Неизвестно'
  if (autoMode.unique_groups !== undefined) displayReason = `Групп: ${autoMode.unique_groups} (мин: ${autoMode.min_groups})`
  else if (autoMode.count !== undefined) displayReason = `Записей: ${autoMode.count} (порог: ${autoMode.threshold})`

  return { ...autoMode, displayReason, isForced: false }
})

const emptyDescription = computed(() => logStore.config?.emptyText || 'Записей не найдено')

const toggleForm = () => {
  if (showForm.value) return showForm.value = false
  currentLogId.value = null
  currentLogData.value = null
  showForm.value = true
}

const toggleSettings = () => { showSettings.value = !showSettings.value; debug.action(`Модальное окно настроек ${showSettings.value ? 'открыто' : 'закрыто'}`) }

const handleEdit = (log) => {
  debug.action('Открыто редактирование записи', { logId: log.id, exercise: log.exercise?.name || 'Неизвестно', date: log.date })
  currentLogId.value = log.id
  currentLogData.value = { ...log }
  showForm.value = true
}

const handleTableDelete = async (logId) => {
  try {
    await ElMessageBox.confirm('Удалить запись?', 'Подтверждение', { type: 'warning' })
    await logStore.deleteLog(logId)
    ElMessage.success('Запись удалена')
    logStore.refreshCurrentTab()
  } catch (e) { if (e !== 'cancel') debug.error('Ошибка удаления', e) }
}

const handleSaved = () => {
  showForm.value = false
  currentLogId.value = null
  currentLogData.value = null
  ElMessage.success('Сохранено')
  logStore.refreshCurrentTab()
}

const handleDeleted = () => {
  showForm.value = false
  currentLogId.value = null
  currentLogData.value = null
  ElMessage.success('Запись удалена')
  logStore.refreshCurrentTab()
}

const handleRefresh = () => { debug.api('Ручное обновление данных', { tab: activeTab.value }); logStore.refreshCurrentTab() }

const toggleGroupingMode = () => {
  const currentMode = currentGroupingInfo.value.mode; const newMode = currentMode === 'server' ? 'frontend' : 'server'
  logStore.setForcedGroupingMode(activeTab.value, newMode)
  debug.action('Принудительное переключение режима группировки', { tab: activeTab.value, oldMode: currentMode, newMode })
  ElMessage.success({ message: `Режим: ${newMode === 'server' ? '🖥 Серверная' : '📱 Локальная'}`, duration: 1500 })
  logStore.refreshCurrentTab()
}

watch(activeTab, async (newTab, oldTab) => {
  debug.action('Смена активной вкладки', { from: oldTab, to: newTab, previousForcedMode: logStore.forcedGroupingMode[oldTab] })
  logStore.setActiveTab(newTab)
  try {
    await logStore.refreshCurrentTab()
    debug.store('Данные вкладки загружены', { tab: newTab, logsLoaded: logStore.currentLogs.length, isGrouped: logStore.isGrouped, forcedMode: logStore.currentForcedMode })
  } catch (err) { debug.error(`Ошибка загрузки вкладки "${newTab}"`, err) }
})

const handleKeyDown = (e) => {
  if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd' || e.key === 'В')) {
    e.preventDefault(); debugStore.toggleVisibility(); debug.action(`Панель отладки ${debugStore.isVisible ? 'открыта' : 'закрыта'} (Ctrl+Shift+D)`)
  }
}

onMounted(async () => {
  debug.action('Dashboard начал инициализацию', { defaultTab: activeTab.value })
  try {
    await settingsStore.fetchSettingsStore('mine')

    const logsPerPage = settingsStore.serverSettings?.logs_per_page
    if (logsPerPage && logStore.setPerPage) {
      logStore.setPerPage(logsPerPage)
      debug.action('Применён размер страницы из настроек', { logsPerPage })
    }

    const defaultTab = frontendSettings.value.default_tab
    if (defaultTab && tabConfig[defaultTab]) {
      activeTab.value = defaultTab
      debug.action('Применена вкладка по умолчанию', { tab: defaultTab })
    }
  } catch (err) {
    debug.error('Ошибка загрузки настроек', err)
  }

  logStore.setActiveTab(activeTab.value)
  logStore.loadFiltersFromStorage()
  try {
    await logStore.refreshCurrentTab()
    debug.store('Первичная загрузка логов завершена', {
      tab: activeTab.value,
      logsLoaded: logStore.currentLogs.length,
      isGrouped: logStore.isGrouped
    })
  } catch (err) {
    debug.error('Ошибка первичной загрузки логов', err)
  }

  exerciseStore.fetchExercisesStore()
      .then(() => debug.store('Справочник упражнений загружен', { count: exerciseStore.exercises?.length || 0 }))
      .catch(err => debug.error('Ошибка загрузки упражнений', err))

  window.addEventListener('keydown', handleKeyDown)
  debug.action('Dashboard полностью смонтирован')
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  debug.action('Dashboard размонтирован')
})
</script>

<style scoped>
.training-dashboard { display: flex; flex-direction: column; height: 100%; background: #f5f7fa; }
.tabs-row { display: flex; align-items: center; background: #fff; border-bottom: 1px solid #ebeef5; padding: 0 12px; gap: 8px; flex-shrink: 0; }
.compact-tabs { flex: 1; min-width: 0; }
.compact-tabs :deep(.el-tabs__header) { margin: 0 !important; padding: 0 !important; }
.compact-tabs :deep(.el-tabs__nav) { border: none !important; }
.compact-tabs :deep(.el-tabs__item) { font-size: 11px !important; padding: 0 12px !important; height: 28px !important; line-height: 28px !important; }
.compact-tabs :deep(.el-tabs__active-bar) { height: 2px !important; }
.grouping-indicator { display: flex; align-items: center; gap: 4px; padding: 2px 8px; background: #f0f9ff; border: 1px solid #b3d8ff; border-radius: 4px; font-size: 10px; flex-shrink: 0; }
.toggle-btn { padding: 0 !important; font-size: 10px !important; color: #409eff !important; }
.filter-wrapper { background: #fff; border-bottom: 1px solid #ebeef5; flex-shrink: 0; padding: 0; }
.dashboard-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 4px; gap: 0; }
.state-container { display: flex; align-items: center; justify-content: center; min-height: 200px; background: #fff; border-radius: 4px; }
.table-wrapper { flex: 1; background: #fff; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: auto; }
:deep(.el-pagination__sizes) { min-width: 115px !important; }
:deep(.el-select-dropdown) { z-index: 2100 !important; }
:deep(.el-table) { font-size: 12px; }
:deep(.el-table .cell) { padding: 1px 4px !important; }
@media (max-width: 768px) {
  .tabs-row { padding: 0 8px; }
  .compact-tabs :deep(.el-tabs__item) { font-size: 10px !important; padding: 0 8px !important; }
  .dashboard-main { padding: 2px; }
}

/* ========================================================================
   КОМПАКТНЫЕ ЗАГОЛОВКИ МОДУЛЯ (только для Training)
   ======================================================================== */

:deep(.layout-card-wrapper .card-header) {
  padding: 4px 8px !important;
}

:deep(.layout-card-wrapper .card-title) {
  font-size: 13px !important;
  gap: 4px;
  margin: 0;
}

:deep(.layout-card-wrapper .card-content) {
  padding: 4px !important;
}

:deep(.layout-card-wrapper .card-footer) {
  padding: 4px 8px !important;
}

/* Заголовки внутри модуля */
:deep(h1), :deep(h2), :deep(h3) {
  margin: 2px 0 !important;
  padding: 0 !important;
  font-size: 14px !important;
}
</style>
