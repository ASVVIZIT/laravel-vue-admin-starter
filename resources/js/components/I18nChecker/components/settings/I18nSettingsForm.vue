<template>
  <div class="i18n-settings-form">
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
          <component :is="tab.component" :model-value="formData[tab.dataKey]" ref="panels" />
        </el-tab-pane>
      </el-tabs>

      <el-tabs
          v-else
          v-model="activeTab"
          tab-position="left"
          class="settings-tabs vertical-tabs"
      >
        <el-tab-pane v-for="tab in visibleTabs" :key="tab.key" :label="tab.label" :name="tab.key">
          <component :is="tab.component" :model-value="formData[tab.dataKey]" ref="panels" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Loading, Setting, Check, Close } from '@element-plus/icons-vue'
import { useI18nSettingsStore } from '@components/I18nChecker/stores/i18nSettingsStore.js'
import { I18N_SETTINGS_DEFAULTS_CONFIG } from '@components/I18nChecker/config/i18nSettingsDefaultsConfig.js'
import { deepClone, deepMerge } from '@components/I18nChecker/utils/i18nSettingsHelpersUtils.js'

import I18nSettingsIconsPanel from './forms/panels/I18nSettingsIconsPanel.vue'
import I18nSettingsDisplayPanel from './forms/panels/I18nSettingsDisplayPanel.vue'
import I18nSettingsBehaviorPanel from './forms/panels/I18nSettingsBehaviorPanel.vue'

const emit = defineEmits(['saved', 'cancelled', 'update:settings'])

let settingsStore = null
try {
  settingsStore = useI18nSettingsStore()
} catch (error) {
  console.error('[I18nSettingsForm] Store init error:', error)
}

const loading = ref(false)
const showMetaSettings = ref(false)
const panels = ref([])

const allTabs = [
  { key: 'icons', label: '🎨 Иконки', component: I18nSettingsIconsPanel, dataKey: 'icons' },
  { key: 'display', label: '📊 Отображение', component: I18nSettingsDisplayPanel, dataKey: 'display' },
  { key: 'behavior', label: '⚙️ Поведение', component: I18nSettingsBehaviorPanel, dataKey: 'behavior' },
]

const metaForm = ref(deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.meta))
const activeTab = ref('icons')

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

const formData = ref(deepClone(I18N_SETTINGS_DEFAULTS_CONFIG))

const loadSettings = () => {
  try {
    if (!settingsStore) return

    if (!settingsStore.initialized) {
      settingsStore.loadFromStorage()
    }

    formData.value.icons = deepMerge(
        deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.icons),
        settingsStore.iconsSettings
    )
    formData.value.display = deepMerge(
        deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.display),
        settingsStore.displaySettings
    )
    formData.value.behavior = deepMerge(
        deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.behavior),
        settingsStore.behaviorSettings
    )

    if (settingsStore.metaSettings) {
      metaForm.value = deepMerge(
          deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.meta),
          settingsStore.metaSettings
      )
    }
  } catch (error) {
    console.error('[I18nSettingsForm] Load error:', error)
  }
}

const collectDataFromPanels = () => {
  const panelData = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG)
  panels.value.forEach(panel => {
    if (!panel?.localData) return
    const data = deepClone(panel.localData)
    if (data.source !== undefined) panelData.icons = data
    else if (data.tableHeight !== undefined) panelData.display = data
    else if (data.autoRunScanner !== undefined) panelData.behavior = data
  })
  return panelData
}

const saveSettings = async () => {
  loading.value = true
  try {
    const panelData = collectDataFromPanels()
    const payload = {
      icons: panelData.icons,
      display: panelData.display,
      behavior: panelData.behavior,
      meta: metaForm.value,
    }
    const result = await settingsStore.updateSettingsStore(payload)
    if (result?.success) { emit('saved', panelData); return true }
    emit('cancelled', result)
    return false
  } catch (error) {
    console.error('[I18nSettingsForm] Save error:', error)
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
    formData.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG)
    await nextTick()
    panels.value.forEach(panel => { if (panel?.resetToDefaults) panel.resetToDefaults() })
    emit('saved', formData.value)
  } catch (error) {
    console.error('[I18nSettingsForm] Reset error:', error)
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

onMounted(() => {
  try {
    loadSettings()
  } catch (error) {
    console.error('[I18nSettingsForm] Mounted error:', error)
  }
})

defineExpose({ saveSettings, resetSettings, formData, metaForm })
</script>

<style scoped>
.i18n-settings-form { padding: 2px; }
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
