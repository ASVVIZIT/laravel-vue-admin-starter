<template>
  <div class="i18n-settings-form">
    <div class="form-container">
      <div class="meta-panel">
        <el-button type="text" size="small" @click="showMetaSettings = !showMetaSettings" class="meta-toggle">
          <el-icon><Setting /></el-icon>
          {{ $t('i18nChecker.settings.meta.toggle') }}
        </el-button>
        <el-collapse-transition>
          <div v-if="showMetaSettings" class="meta-settings">
            <el-form size="small" label-position="top">
              <el-row :gutter="12">
                <el-col :span="8">
                  <el-form-item :label="$t('i18nChecker.settings.meta.layout')">
                    <el-select v-model="metaForm.layout" size="small">
                      <el-option :label="$t('i18nChecker.settings.meta.layoutHorizontal')" value="horizontal" />
                      <el-option :label="$t('i18nChecker.settings.meta.layoutVertical')" value="vertical" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="16">
                  <el-form-item :label="$t('i18nChecker.settings.meta.visibleTabs')">
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
          <component :is="tab.component" ref="panels" />
        </el-tab-pane>
      </el-tabs>

      <el-tabs
          v-else
          v-model="activeTab"
          tab-position="left"
          class="settings-tabs vertical-tabs"
      >
        <el-tab-pane v-for="tab in visibleTabs" :key="tab.key" :label="tab.label" :name="tab.key">
          <component :is="tab.component" ref="panels" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Setting, Check, Close } from '@element-plus/icons-vue'
import { useI18nSettingsStore } from '@components/I18nChecker/stores/i18nSettingsStore.js'
import { storeToRefs } from 'pinia'
import { deepClone } from '@components/I18nChecker/utils/i18nSettingsHelpersUtils.js'

import I18nSettingsIconsPanel from './forms/panels/I18nSettingsIconsPanel.vue'
import I18nSettingsDisplayPanel from './forms/panels/I18nSettingsDisplayPanel.vue'
import I18nSettingsBehaviorPanel from './forms/panels/I18nSettingsBehaviorPanel.vue'

const emit = defineEmits(['saved', 'cancelled'])
const { t } = useI18n()

const settingsStore = useI18nSettingsStore()
const { metaSettings } = storeToRefs(settingsStore)

const loading = ref(false)
const showMetaSettings = ref(false)
const panels = ref([])
const activeTab = ref('icons')

// 🔥 Используем переводы для названий табов
const allTabs = computed(() => [
  { key: 'icons', label: t('i18nChecker.settings.meta.tabIcons'), component: I18nSettingsIconsPanel },
  { key: 'display', label: t('i18nChecker.settings.meta.tabDisplay'), component: I18nSettingsDisplayPanel },
  { key: 'behavior', label: t('i18nChecker.settings.meta.tabBehavior'), component: I18nSettingsBehaviorPanel },
])

const metaForm = ref(deepClone(metaSettings.value))

watch(metaSettings, (newVal) => {
  metaForm.value = deepClone(newVal)
}, { deep: true })

const visibleTabs = computed(() => {
  return metaForm.value.tabs_order
      .filter(key => metaForm.value.visible_tabs.includes(key))
      .map(key => allTabs.value.find(t => t.key === key))
      .filter(Boolean)
})

const toggleTab = (key) => {
  const idx = metaForm.value.visible_tabs.indexOf(key)
  if (idx === -1) metaForm.value.visible_tabs.push(key)
  else metaForm.value.visible_tabs.splice(idx, 1)
}

const saveSettings = () => {
  const payload = { meta: metaForm.value }

  panels.value.forEach(panel => {
    if (!panel?.localData) return
    const data = deepClone(panel.localData)
    if (data.source !== undefined) payload.icons = data
    else if (data.tableHeight !== undefined) payload.display = data
    else if (data.autoRunScanner !== undefined) payload.behavior = data
  })

  const result = settingsStore.updateSettingsStore(payload)
  if (result?.success) {
    emit('saved')
    return true
  }
  emit('cancelled')
  return false
}

const resetSettings = () => {
  settingsStore.resetSettingsStore()
  emit('saved')
}

defineExpose({ saveSettings, resetSettings })
</script>

<style scoped>
.i18n-settings-form { padding: 2px; }
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
.settings-tabs :deep(.el-tabs__content) { padding: 12px; overflow: visible; }
.settings-tabs :deep(.el-tabs__item) { font-size: 12px; }
.vertical-tabs :deep(.el-tabs__header) { margin-right: 12px; }
.vertical-tabs :deep(.el-tabs__item) { text-align: left; padding: 0 16px; }
</style>
