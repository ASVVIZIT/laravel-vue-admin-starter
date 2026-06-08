<template>
  <div class="training-settings-form">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка настроек...</span>
    </div>

    <div v-else class="form-container">
      <div class="meta-panel">
        <el-button type="text" size="small" @click="showMetaSettings = !showMetaSettings" class="meta-toggle">
          <el-icon><Setting /></el-icon>
          Настроить отображение формы
        </el-button>

        <el-collapse-transition>
          <div v-if="showMetaSettings" class="meta-settings">
            <el-form size="small" label-position="top">
              <el-row :gutter="12">
                <el-col :span="8">
                  <el-form-item label="Расположение табов">
                    <el-select v-model="metaForm.layout" size="small">
                      <el-option label="↔ Горизонтально" value="horizontal" />
                      <el-option label="↕ Вертикально" value="vertical" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="16">
                  <el-form-item label="Видимые табы">
                    <div class="tabs-order-list">
                      <div
                          v-for="tab in allTabs"
                          :key="tab.key"
                          class="tab-order-item"
                          :class="{ 'disabled': !metaForm.visible_tabs.includes(tab.key) }"
                          @click="toggleTab(tab.key)"
                      >
                        <el-icon v-if="metaForm.visible_tabs.includes(tab.key)"><Check /></el-icon>
                        <el-icon v-else><Close /></el-icon>
                        <span>{{ tab.label }}</span>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-collapse-transition>
      </div>

      <el-tabs
          v-if="metaForm.layout === 'horizontal'"
          v-model="activeTab"
          type="border-card"
          class="settings-tabs"
      >
        <el-tab-pane v-for="tab in visibleTabs" :key="tab.key" :label="tab.label" :name="tab.key">
          <component :is="tab.component" v-model="formData[tab.dataKey]" ref="panels" />
        </el-tab-pane>
      </el-tabs>

      <el-tabs
          v-else
          v-model="activeTab"
          tab-position="left"
          class="settings-tabs vertical-tabs"
      >
        <el-tab-pane v-for="tab in visibleTabs" :key="tab.key" :label="tab.label" :name="tab.key">
          <component :is="tab.component" v-model="formData[tab.dataKey]" ref="panels" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Loading, Setting, Check, Close } from '@element-plus/icons-vue'
import { useTrainingSettingsStore } from '@/components/Training/stores/trainingSettingsStore.js'
import { SETTINGS_DEFAULTS_CONFIG } from '@/components/Training/config/settingsDefaultsConfig.js'
import { deepClone, deepMerge } from '@/components/Training/utils/appSettingsHelpersUtils.js'

import TrainingSettingsInterface from './panels/TrainingSettingsInterface.vue'
import TrainingSettingsSearch from './panels/TrainingSettingsSearch.vue'
import TrainingSettingsDisplay from './panels/TrainingSettingsDisplay.vue'
import TrainingSettingsGrouping from './panels/TrainingSettingsGrouping.vue'

const props = defineProps({ initialSettings: { type: Object, default: null } })
const emit = defineEmits(['saved', 'cancelled', 'update:settings'])

const settingsStore = useTrainingSettingsStore()
const loading = ref(false)
const showMetaSettings = ref(false)
const panels = ref([])

const allTabs = [
  { key: 'interface', label: '⚙️ Интерфейс', component: TrainingSettingsInterface, dataKey: 'interface' },
  { key: 'search', label: '🔍 Поиск', component: TrainingSettingsSearch, dataKey: 'search' },
  { key: 'display', label: '📊 Отображение', component: TrainingSettingsDisplay, dataKey: 'display' },
  { key: 'grouping', label: '🗂 Группировки', component: TrainingSettingsGrouping, dataKey: 'grouping' },
]

const metaForm = ref(deepClone(SETTINGS_DEFAULTS_CONFIG.meta))
const activeTab = ref('interface')

const visibleTabs = computed(() => {
  return metaForm.value.tabs_order
      .filter(key => metaForm.value.visible_tabs.includes(key))
      .map(key => allTabs.find(t => t.key === key))
      .filter(Boolean)
})

const toggleTab = (key) => {
  const idx = metaForm.value.visible_tabs.indexOf(key)
  if (idx === -1) metaForm.value.visible_tabs.push(key)
  else metaForm.value.visible_tabs.splice(idx, 1)
}

const formData = ref(deepClone(SETTINGS_DEFAULTS_CONFIG))

// 🔥 ИСПРАВЛЕНО: Загружаем из API если store пустой
const loadSettings = async () => {
  if (!settingsStore.serverSettings || Object.keys(settingsStore.serverSettings).length === 0) {
    await settingsStore.fetchSettingsStore()
  }

  const normalizeBoolean = (val) => typeof val === 'string' ? val === 'true' : Boolean(val)

  if (settingsStore.frontendSettings) {
    formData.value.interface.frontend = deepMerge(
        deepClone(SETTINGS_DEFAULTS_CONFIG.interface.frontend),
        settingsStore.frontendSettings
    )
  }

  if (settingsStore.columnsConfig) {
    Object.keys(SETTINGS_DEFAULTS_CONFIG.interface.columns).forEach(tab => {
      formData.value.interface.columns[tab] = deepMerge(
          deepClone(SETTINGS_DEFAULTS_CONFIG.interface.columns[tab]),
          settingsStore.columnsConfig[tab] || {}
      )
    })
  }

  // 🔥 ИСПРАВЛЕНО: Разделяем limits на search и display
  if (settingsStore.limits) {
    // Search limits
    formData.value.search.limits = {
      search_min_length: settingsStore.limits.search_min_length ?? SETTINGS_DEFAULTS_CONFIG.search.limits.search_min_length,
      search_results_limit: settingsStore.limits.search_results_limit ?? SETTINGS_DEFAULTS_CONFIG.search.limits.search_results_limit,
    }

    // Display limits
    formData.value.display.limits = {
      max_shared_with: settingsStore.limits.max_shared_with ?? SETTINGS_DEFAULTS_CONFIG.display.limits.max_shared_with,
      max_sets: settingsStore.limits.max_sets ?? SETTINGS_DEFAULTS_CONFIG.display.limits.max_sets,
      max_notes_length: settingsStore.limits.max_notes_length ?? SETTINGS_DEFAULTS_CONFIG.display.limits.max_notes_length,
    }
  }

  if (settingsStore.serverSettings) {
    formData.value.display.server = {
      ...deepClone(SETTINGS_DEFAULTS_CONFIG.display.server),
      logs_per_page: settingsStore.serverSettings.logs_per_page ?? SETTINGS_DEFAULTS_CONFIG.display.server.logs_per_page,
      grouping_per_page: settingsStore.serverSettings.grouping_per_page ?? SETTINGS_DEFAULTS_CONFIG.display.server.grouping_per_page,
      enable_stats: normalizeBoolean(settingsStore.serverSettings.enable_stats),
      enable_sharing: normalizeBoolean(settingsStore.serverSettings.enable_sharing),
    }

    formData.value.grouping.server = {
      ...deepClone(SETTINGS_DEFAULTS_CONFIG.grouping.server),
      grouping_mode: settingsStore.serverSettings.grouping_mode ?? SETTINGS_DEFAULTS_CONFIG.grouping.server.grouping_mode,
      grouping_auto_threshold: settingsStore.serverSettings.grouping_auto_threshold ?? SETTINGS_DEFAULTS_CONFIG.grouping.server.grouping_auto_threshold,
      enable_min_groups_check: normalizeBoolean(settingsStore.serverSettings.enable_min_groups_check),
      grouping_min_groups: settingsStore.serverSettings.grouping_min_groups ?? SETTINGS_DEFAULTS_CONFIG.grouping.server.grouping_min_groups,
      grouping_by: settingsStore.serverSettings.grouping_by ?? SETTINGS_DEFAULTS_CONFIG.grouping.server.grouping_by,
    }
  }

  if (settingsStore.serverSettings?.form_meta) {
    metaForm.value = deepMerge(
        deepClone(SETTINGS_DEFAULTS_CONFIG.meta),
        settingsStore.serverSettings.form_meta
    )
  }
}

const collectDataFromPanels = () => {
  const panelData = deepClone(SETTINGS_DEFAULTS_CONFIG)
  panels.value.forEach(panel => {
    if (!panel?.localData) return
    if (panel.localData.frontend !== undefined) panelData.interface = deepClone(panel.localData)
    else if (panel.localData.limits?.search_min_length !== undefined) panelData.search = deepClone(panel.localData)
    else if (panel.localData.server?.logs_per_page !== undefined) panelData.display = deepClone(panel.localData)
    else if (panel.localData.server?.grouping_mode !== undefined) panelData.grouping = deepClone(panel.localData)
  })
  return panelData
}

const saveSettings = async () => {
  loading.value = true
  try {
    const panelData = collectDataFromPanels()
    const payload = {
      server: { ...panelData.display.server, ...panelData.grouping.server, form_meta: metaForm.value },
      limits: { ...panelData.search.limits, ...panelData.display.limits },
      // 🔥 ИСПРАВЛЕНО: columns теперь внутри frontend (консистентно с бэкендом)
      frontend: {
        ...panelData.interface.frontend,
        columns: panelData.interface.columns
      }
    }
    const result = await settingsStore.updateSettingsStore(payload)
    if (result?.success) { emit('saved', panelData); return true }
    emit('cancelled', result)
    return false
  } catch (error) {
    emit('cancelled', error)
    return false
  } finally {
    loading.value = false
  }
}

const resetSettings = async () => {
  loading.value = true
  try {
    await settingsStore.resetSettingsStore()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    formData.value = deepClone(SETTINGS_DEFAULTS_CONFIG)
    await nextTick()
    panels.value.forEach(panel => { if (panel?.resetToDefaults) panel.resetToDefaults() })
    emit('saved', formData.value)
  } catch (error) {
    emit('cancelled', error)
  } finally {
    loading.value = false
  }
}

let metaDebounceTimer = null
let isMetaUpdating = false

watch(() => metaForm.value, (val) => {
  if (isMetaUpdating) return
  clearTimeout(metaDebounceTimer)
  metaDebounceTimer = setTimeout(() => {
    isMetaUpdating = true
    try {
      emit('update:settings', { meta: val, data: formData.value })
    } finally {
      nextTick(() => { isMetaUpdating = false })
    }
  }, 400)
}, { deep: true })

onMounted(() => loadSettings())
defineExpose({ saveSettings, resetSettings, formData, metaForm })
</script>

<style scoped>
.training-settings-form { padding: 2px; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; color: #909399; gap: 8px; font-size: 12px; }
.loading-state .el-icon { font-size: 24px; }
.form-container { max-height: 410px; overflow-y: auto; padding-right: 6px; padding-bottom: 8px; }
.form-container::-webkit-scrollbar { width: 4px; }
.form-container::-webkit-scrollbar-track { background: transparent; }
.form-container::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 2px; }
.meta-panel { margin-bottom: 12px; padding: 8px 12px; background: #f8f9fa; border: 1px dashed #dcdfe6; border-radius: 4px; }
.meta-toggle { font-size: 11px; color: #606266; display: flex; align-items: center; gap: 4px; }
.meta-settings { margin-top: 8px; padding-top: 8px; border-top: 1px solid #ebeef5; }
.tabs-order-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tab-order-item { display: flex; align-items: center; gap: 4px; padding: 4px 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.2s; user-select: none; }
.tab-order-item:hover { border-color: #409eff; background: #ecf5ff; }
.tab-order-item.disabled { opacity: 0.5; background: #f5f7fa; }
.tab-order-item .el-icon { font-size: 12px; }
.settings-tabs :deep(.el-tabs__content) { padding: 12px; overflow: visible; }
.settings-tabs :deep(.el-tabs__item) { font-size: 12px; }
.vertical-tabs :deep(.el-tabs__header) { margin-right: 12px; }
.vertical-tabs :deep(.el-tabs__item) { text-align: left; padding: 0 16px; }
</style>
