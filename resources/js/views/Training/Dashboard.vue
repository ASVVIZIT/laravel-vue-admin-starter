<template>
  <div class="training-dashboard">
    <TrainingDashboardHeader
        :summary="summary"
        :stats="stats"
        :loading="logStore.currentLoading"
        :show-form="showForm"
        :show-settings="true"
        :show-debug="true"
        :debug-visible="debugStore.isVisible"
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
        <el-tag :type="currentGroupingInfo.mode === 'server' ? 'warning' : 'info'" size="small" effect="plain">
          {{ currentGroupingInfo.mode === 'server' ? '🖥' : '📱' }}
        </el-tag>
        <el-button v-if="settingsStore.isGroupingToggleVisibleStore" size="small" text @click="toggleGroupingMode" class="toggle-btn" title="Переключить режим">
          <el-icon><Switch /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="filter-wrapper">
      <TrainingFilterBar />
    </div>

    <main class="dashboard-main">
      <div v-if="logStore.currentLoading" class="state-container">
        <el-skeleton :rows="8" animated />
      </div>

      <el-empty v-else-if="!logStore.hasLogs" :description="emptyDescription" class="state-container">
        <el-button v-if="activeTab === 'mine'" type="primary" @click="toggleForm">
          <el-icon><Plus /></el-icon> Добавить запись
        </el-button>
        <el-button v-else type="info" @click="activeTab = 'mine'">Перейти к моим записям</el-button>
      </el-empty>

      <template v-else>
        <div class="table-wrapper">
          <TrainingLogTable
              :logs="logStore.currentLogs"
              :loading="logStore.currentLoading"
              :active-tab="activeTab"
              :current-user-id="currentUserId"
              :pagination="logStore.currentPagination"
              :compact="frontendSettings.compact_view"
              :is-grouped="logStore.isGrouped"
              :columns-config="currentColumnsConfig"
              @edit="handleEdit"
              @delete="handleDelete"
              @page-change="logStore.setPage"
              @per-page-change="logStore.setPerPage"
          />
        </div>
      </template>
    </main>

    <el-dialog v-model="showForm" :title="isEdit ? 'Редактирование' : 'Новая запись'" width="900px" destroy-on-close>
      <TrainingLogForm
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
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import { useTrainingSettingsStore } from '@/components/Training/stores/trainingSettingsStore.js'
import { useTrainingDebugStore } from '@/components/Training/stores/trainingDebugStore.js'
import { useDebug } from '@/components/Training/composables/useDebug.js'

import TrainingDashboardHeader from '@/components/Training/components/TrainingDashboardHeader.vue'
import TrainingFilterBar from '@/components/Training/components/TrainingFilterBar.vue'
import TrainingLogTable from '@/components/Training/components/TrainingLogTable.vue'
import TrainingLogForm from '@/components/Training/components/TrainingLogForm.vue'
import TrainingSettingsModal from '@/components/Training/components/settings/modals/TrainingSettingsModal.vue'
import DebugPanel from '@/components/Training/components/layout/panels/DebugPanel.vue'

const debug = useDebug('Dashboard')

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()
const settingsStore = useTrainingSettingsStore()
const debugStore = useTrainingDebugStore()

const showForm = ref(false)
const showSettings = ref(false)
const currentLogId = ref(null)
const currentLogData = ref(null)
const activeTab = ref('mine')
const tabConfig = TAB_CONFIG

// 🔥 УБРАН локальный forcedGroupingMode — теперь он в logStore

const currentUserId = computed(() => {
  if (typeof window !== 'undefined' && window.__CURRENT_USER_ID) {
    return window.__CURRENT_USER_ID
  }
  if (!currentUserId._warned) {
    debug.error('Глобальная переменная window.__CURRENT_USER_ID не найдена. Используется фолбэк id=1.')
    currentUserId._warned = true
  }
  return 1
})

const isEdit = computed(() => !!currentLogId.value)
const stats = computed(() => logStore.stats || {})
const summary = computed(() => logStore.summary || {})
const frontendSettings = computed(() => settingsStore.frontendSettings)

const currentColumnsConfig = computed(() => settingsStore.getColumnsForTabStore(activeTab.value))

// 🔥 ИСПРАВЛЕНО: currentGroupingInfo теперь учитывает forced из стора
const currentGroupingInfo = computed(() => {
  const forced = logStore.currentForcedMode
  if (forced) {
    return {
      mode: forced,
      reason: `Принудительно пользователем`,
      isForced: true
    }
  }
  // Авто-режим из настроек
  const autoMode = settingsStore.getGroupingModeForTabStore(activeTab.value)
  return { ...autoMode, isForced: false }
})

const emptyDescription = computed(() => logStore.config?.emptyText || 'Записей не найдено')

// ===== Обработчики =====

const toggleForm = () => {
  const newState = !showForm.value
  showForm.value = newState
  if (newState && !isEdit.value) {
    currentLogId.value = null
    currentLogData.value = null
  }
  debug.action(`Форма записи ${newState ? 'открыта' : 'закрыта'}`, {
    isEdit: isEdit.value,
    logId: currentLogId.value
  })
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
  debug.action(`Модальное окно настроек ${showSettings.value ? 'открыто' : 'закрыто'}`)
}

const handleEdit = (log) => {
  debug.action('Открыто редактирование записи', {
    logId: log.id,
    exercise: log.exercise?.name || 'Неизвестно',
    date: log.date
  })
  currentLogId.value = log.id
  currentLogData.value = { ...log }
  showForm.value = true
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('Удалить эту запись?', 'Подтверждение', { type: 'warning' })
    await logStore.deleteLog(id)
    debug.action('Запись успешно удалена', { logId: id })
    ElMessage.success('Удалено')
  } catch (err) {
    debug.action('Удаление отменено', { logId: id, error: err?.message })
  }
}

const handleSaved = () => {
  const wasEdit = isEdit.value
  const logId = currentLogId.value

  showForm.value = false
  ElMessage.success('Сохранено')

  debug.action('Запись сохранена', {
    logId,
    isEdit: wasEdit,
    changedFields: currentLogData.value ? Object.keys(currentLogData.value) : []
  })

  logStore.refreshCurrentTab()
}

const handleDeleted = () => {
  const logId = currentLogId.value
  showForm.value = false
  ElMessage.success('Удалено')
  debug.action('Запись удалена из формы', { logId })
  logStore.refreshCurrentTab()
}

const handleRefresh = () => {
  debug.api('Ручное обновление данных', { tab: activeTab.value })
  logStore.refreshCurrentTab()
}

// 🔥 ИСПРАВЛЕНО: toggleGroupingMode теперь работает через store
const toggleGroupingMode = () => {
  const currentMode = currentGroupingInfo.value.mode
  const newMode = currentMode === 'server' ? 'frontend' : 'server'

  // 🔥 Устанавливаем принудительный режим в store для текущей вкладки
  logStore.setForcedGroupingMode(activeTab.value, newMode)

  debug.action('Принудительное переключение режима группировки', {
    tab: activeTab.value,
    oldMode: currentMode,
    newMode
  })

  ElMessage.success({
    message: `Режим: ${newMode === 'server' ? '🖥 Серверная' : '📱 Локальная'}`,
    duration: 1500
  })

  // 🔥 Теперь refreshCurrentTab увидит forcedGroupingMode и использует его
  logStore.refreshCurrentTab()
}

// ===== Watchers =====

watch(activeTab, async (newTab, oldTab) => {
  debug.action('Смена активной вкладки', {
    from: oldTab,
    to: newTab,
    previousForcedMode: logStore.forcedGroupingMode[oldTab]
  })

  logStore.setActiveTab(newTab)

  // 🔥 НЕ сбрасываем forcedGroupingMode — он сохраняется для каждой вкладки отдельно
  // Если хочешь сбрасывать при переключении — раскомментируй:
  // logStore.setForcedGroupingMode(newTab, null)

  try {
    await logStore.refreshCurrentTab()
    debug.store('Данные вкладки загружены', {
      tab: newTab,
      logsLoaded: logStore.currentLogs.length,
      isGrouped: logStore.isGrouped,
      forcedMode: logStore.currentForcedMode
    })
  } catch (err) {
    debug.error(`Ошибка загрузки вкладки "${newTab}"`, err)
  }
})

// ===== Горячие клавиши =====

const handleKeyDown = (e) => {
  if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd' || e.key === 'В')) {
    e.preventDefault()
    debugStore.toggleVisibility()
    debug.action(`Панель отладки ${debugStore.isVisible ? 'открыта' : 'закрыта'} (Ctrl+Shift+D)`)
  }
}

// ===== Инициализация =====

onMounted(async () => {
  debug.action('Dashboard начал инициализацию', { defaultTab: activeTab.value })

  try {
    await settingsStore.fetchSettingsStore('mine')
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
:deep(.el-table .cell) { padding: 4px 8px; }

@media (max-width: 768px) {
  .tabs-row { padding: 0 8px; }
  .compact-tabs :deep(.el-tabs__item) { font-size: 10px !important; padding: 0 8px !important; }
  .dashboard-main { padding: 2px; }
}
</style>
