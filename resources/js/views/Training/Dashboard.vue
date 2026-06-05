<template>
  <div class="training-dashboard">
    <TrainingDashboardHeader
        :summary="summary"
        :stats="stats"
        :loading="logStore.currentLoading"
        :show-form="showForm"
        :show-settings="settingsStore.isGroupingToggleVisibleStore"
        @toggle-form="showForm = !showForm"
        @toggle-settings="showSettings = !showSettings"
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
        <el-button v-if="settingsStore.isGroupingToggleVisibleStore" size="small" text @click="toggleGroupingMode" class="toggle-btn">
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
        <el-button v-if="activeTab === 'mine'" type="primary" @click="showForm = true">
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
      <TrainingLogForm :log-id="currentLogId" :initial-data="currentLogData" @saved="handleSaved" @deleted="handleDeleted" @cancelled="showForm = false" />
    </el-dialog>

    <TrainingSettingsModal v-model="showSettings" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Switch } from '@element-plus/icons-vue'

import { useTrainingLogStore, TAB_CONFIG } from '@/components/Training/stores/trainingLogStore.js'
import { useExerciseStore } from '@/components/Training/stores/exerciseStore.js'
import { useTrainingSettingsStore } from '@/components/Training/stores/trainingSettingsStore.js'

import TrainingDashboardHeader from '@/components/Training/components/TrainingDashboardHeader.vue'
import TrainingFilterBar from '@/components/Training/components/TrainingFilterBar.vue'
import TrainingLogTable from '@/components/Training/components/TrainingLogTable.vue'
import TrainingLogForm from '@/components/Training/components/TrainingLogForm.vue'
import TrainingSettingsModal from '@/components/Training/components/settings/modals/TrainingSettingsModal.vue'

const logStore = useTrainingLogStore()
const exerciseStore = useExerciseStore()
const settingsStore = useTrainingSettingsStore()

const showForm = ref(false)
const showSettings = ref(false)
const currentLogId = ref(null)
const currentLogData = ref(null)
const activeTab = ref('mine')
const tabConfig = TAB_CONFIG
const forcedGroupingMode = ref(null)

const currentUserId = computed(() => {
  if (typeof window !== 'undefined' && window.__CURRENT_USER_ID) return window.__CURRENT_USER_ID
  return 1
})

const isEdit = computed(() => !!currentLogId.value)
const stats = computed(() => logStore.stats || {})
const summary = computed(() => logStore.summary || {})
const frontendSettings = computed(() => settingsStore.frontendSettings)

// 🔥 Конфигурация колонок для текущей вкладки
const currentColumnsConfig = computed(() => settingsStore.getColumnsForTabStore(activeTab.value))

const currentGroupingInfo = computed(() => {
  const autoMode = settingsStore.getGroupingModeForTabStore(activeTab.value)
  if (forcedGroupingMode.value) {
    return { ...autoMode, mode: forcedGroupingMode.value, reason: `Принудительно: ${forcedGroupingMode.value}` }
  }
  return autoMode
})

const emptyDescription = computed(() => logStore.config?.emptyText || 'Записей не найдено')

const handleEdit = (log) => {
  currentLogId.value = log.id
  currentLogData.value = { ...log }
  showForm.value = true
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('Удалить?', 'Подтверждение', { type: 'warning' })
    await logStore.deleteLog(id)
    ElMessage.success('Удалено')
  } catch {}
}

const handleSaved = () => {
  showForm.value = false
  ElMessage.success('Сохранено')
  logStore.refreshCurrentTab()
}

const handleDeleted = () => {
  showForm.value = false
  ElMessage.success('Удалено')
  logStore.refreshCurrentTab()
}

const handleRefresh = () => {
  settingsStore.fetchSettingsStore(activeTab.value)
  logStore.refreshCurrentTab()
}

const toggleGroupingMode = () => {
  const currentMode = currentGroupingInfo.value.mode
  forcedGroupingMode.value = currentMode === 'server' ? 'frontend' : 'server'
  ElMessage.success({ message: `Режим: ${forcedGroupingMode.value === 'server' ? '🖥 Серверная' : '📱 Локальная'}`, duration: 1500 })
  logStore.refreshCurrentTab()
}

watch(activeTab, async (newTab) => {
  logStore.setActiveTab(newTab)
  forcedGroupingMode.value = null
  await settingsStore.fetchSettingsStore(newTab)
  await logStore.refreshCurrentTab()
})

onMounted(async () => {
  try {
    await settingsStore.fetchSettingsStore('mine')
    const defaultTab = frontendSettings.value.default_tab
    if (defaultTab && tabConfig[defaultTab]) activeTab.value = defaultTab
  } catch (err) {
    console.warn('[Dashboard] Settings load failed:', err)
  }

  logStore.setActiveTab(activeTab.value)

  // 🔥 Восстанавливаем фильтры из localStorage перед первой загрузкой
  logStore.loadFiltersFromStorage()

  await logStore.refreshCurrentTab()
  exerciseStore.fetchExercisesStore().catch(err => console.warn('Exercises fetch skipped:', err))
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
