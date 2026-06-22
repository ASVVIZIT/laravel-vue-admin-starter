<template>
  <div class="settings-panel">
    <el-form label-position="top" size="small" class="compact-form">
      <el-divider content-position="left" class="compact-divider">Источник иконок</el-divider>
      <el-form-item label="Тип иконок" class="compact-item">
        <el-select v-model="localData.source" class="full-width compact-select" size="small">
          <el-option label="🅱️ Bootstrap Icons" value="bootstrap" />
          <el-option label="🦊 Fenix SVG" value="fenix" />
          <el-option label="🎨 Custom" value="custom" />
        </el-select>
        <div class="form-tip">Источник из которого будут браться иконки модуля</div>
      </el-form-item>

      <el-divider content-position="left" class="compact-divider">Размер и цвет</el-divider>
      <el-form-item label="Размер иконок (px)" class="compact-item">
        <el-input-number v-model="localData.size" :min="12" :max="48" :step="2" controls-position="right" class="full-width compact-input" />
      </el-form-item>
      <el-form-item label="Цвет иконок" class="compact-item">
        <el-color-picker v-model="localData.color" show-alpha size="small" />
        <div class="form-tip">Текущее значение: <code>{{ localData.color }}</code></div>
      </el-form-item>

      <el-divider content-position="left" class="compact-divider">Отображение</el-divider>
      <el-form-item label="Показывать подписи в превью" class="compact-item">
        <el-switch v-model="localData.showLabels" :active-value="true" :inactive-value="false" />
      </el-form-item>
    </el-form>

    <div class="icons-preview-section">
      <div class="preview-header">
        <h4>Предпросмотр иконок</h4>
        <span class="preview-count">{{ previewIcons.length }} иконок</span>
      </div>
      <div class="icons-grid">
        <div
            v-for="icon in previewIcons"
            :key="icon.key"
            class="icon-preview-item"
            :title="icon.key"
        >
          <div class="icon-display">
            <I18nIcon
                :name="icon.key"
                :size="localData.size"
                :color="localData.color === 'currentColor' ? undefined : localData.color"
            />
          </div>
          <div v-if="localData.showLabels" class="icon-label">{{ icon.key }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import I18nIcon from '@components/I18nChecker/components/shared/I18nIcon.vue'
import { ICONS } from '@components/I18nChecker/config/iconsConfig.js'
import { I18N_SETTINGS_DEFAULTS_CONFIG } from '@components/I18nChecker/config/i18nSettingsDefaultsConfig.js'
import { useI18nSettingsStore } from '@components/I18nChecker/stores/i18nSettingsStore.js'
import { storeToRefs } from 'pinia'
import { deepClone } from '@components/I18nChecker/utils/i18nSettingsHelpersUtils.js'

const settingsStore = useI18nSettingsStore()
const { iconsSettings } = storeToRefs(settingsStore)

// 🔥 localData синхронизируется с store
const localData = ref(deepClone(iconsSettings.value))

// 🔥 Следим за store → обновляем localData
watch(iconsSettings, (newVal) => {
  localData.value = deepClone(newVal)
}, { deep: true })

const previewIcons = computed(() => {
  return Object.entries(ICONS).map(([key]) => ({ key }))
})

// 🔥 ИСПРАВЛЕНО: используем I18N_SETTINGS_DEFAULTS_CONFIG вместо $state()
const resetToDefaults = () => {
  localData.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.icons)
}

defineExpose({ localData, resetToDefaults })
</script>

<style scoped>
.settings-panel { padding: 4px; }
:deep(.compact-divider) { margin: 12px 0 8px; }
:deep(.compact-divider .el-divider__text) { font-size: 11px; font-weight: 600; color: #303133; padding: 0 6px; background: #fff; }
:deep(.compact-item) { margin-bottom: 10px; }
:deep(.compact-item .el-form-item__label) { font-size: 11px; font-weight: 600; color: #606266; margin-bottom: 4px; }
:deep(.compact-input), :deep(.compact-select) { width: 100%; --el-input-height: 28px; --el-input-font-size: 12px; }
.form-tip { font-size: 10px; color: #909399; margin-top: 4px; line-height: 1.3; }
.form-tip code { background: #f5f7fa; padding: 1px 4px; border-radius: 2px; font-size: 10px; color: #d4380d; }
.full-width { width: 100%; }

.icons-preview-section { margin-top: 16px; padding: 12px; background: #f8f9fa; border: 1px solid #ebeef5; border-radius: 4px; }
.preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #ebeef5; }
.preview-header h4 { margin: 0; font-size: 13px; font-weight: 600; color: #303133; }
.preview-count { font-size: 11px; color: #909399; padding: 2px 8px; background: #fff; border: 1px solid #dcdfe6; border-radius: 10px; }
.icons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; max-height: 250px; overflow-y: auto; padding: 4px; }
.icons-grid::-webkit-scrollbar { width: 4px; }
.icons-grid::-webkit-scrollbar-track { background: transparent; }
.icons-grid::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 2px; }
.icon-preview-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; background: #fff; border: 1px solid #ebeef5; border-radius: 4px; transition: all 0.2s; min-height: 60px; justify-content: center; }
.icon-preview-item:hover { border-color: #409eff; background: #ecf5ff; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08); }
.icon-display { display: flex; align-items: center; justify-content: center; width: 100%; height: 32px; }
.icon-label { font-size: 9px; color: #606266; text-align: center; word-break: break-all; line-height: 1.2; max-width: 100%; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
</style>
