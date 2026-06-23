<template>
  <div class="settings-panel">
    <el-form label-position="top" size="small" class="compact-form">
      <el-divider content-position="left" class="compact-divider">{{ $t('i18nChecker.settings.display.tablesTitle') }}</el-divider>
      <el-form-item :label="$t('i18nChecker.settings.display.tableHeight')" class="compact-item">
        <el-input-number v-model="localData.tableHeight" :min="200" :max="800" :step="50" controls-position="right" class="full-width compact-input" />
      </el-form-item>
      <el-form-item :label="$t('i18nChecker.settings.display.fontSize')" class="compact-item">
        <el-input-number v-model="localData.fontSize" :min="10" :max="18" :step="1" controls-position="right" class="full-width compact-input" />
      </el-form-item>

      <el-divider content-position="left" class="compact-divider">{{ $t('i18nChecker.settings.display.limitsTitle') }}</el-divider>
      <el-form-item :label="$t('i18nChecker.settings.display.maxFilesPerRow')" class="compact-item">
        <el-input-number v-model="localData.maxFilesPerRow" :min="1" :max="10" :step="1" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">{{ $t('i18nChecker.settings.display.maxFilesPerRowTip') }}</div>
      </el-form-item>
      <el-form-item :label="$t('i18nChecker.settings.display.maxUnusedKeys')" class="compact-item">
        <el-input-number v-model="localData.maxUnusedKeys" :min="50" :max="2000" :step="50" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">{{ $t('i18nChecker.settings.display.maxUnusedKeysTip') }}</div>
      </el-form-item>
      <el-form-item :label="$t('i18nChecker.settings.display.maxFlatKeys')" class="compact-item">
        <el-input-number v-model="localData.maxFlatKeys" :min="50" :max="1000" :step="50" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">{{ $t('i18nChecker.settings.display.maxFlatKeysTip') }}</div>
      </el-form-item>

      <el-divider content-position="left" class="compact-divider">{{ $t('i18nChecker.settings.display.appearanceTitle') }}</el-divider>
      <el-form-item :label="$t('i18nChecker.settings.display.compactMode')" class="compact-item">
        <el-switch v-model="localData.compactMode" :active-value="true" :inactive-value="false" />
        <div class="form-tip">{{ $t('i18nChecker.settings.display.compactModeTip') }}</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18nSettingsStore } from '@components/I18nChecker/stores/i18nSettingsStore.js'
import { I18N_SETTINGS_DEFAULTS_CONFIG } from '@components/I18nChecker/config/i18nSettingsDefaultsConfig.js'
import { storeToRefs } from 'pinia'
import { deepClone } from '@components/I18nChecker/utils/i18nSettingsHelpersUtils.js'

const settingsStore = useI18nSettingsStore()
const { displaySettings } = storeToRefs(settingsStore)

const localData = ref(deepClone(displaySettings.value))

watch(displaySettings, (newVal) => {
  localData.value = deepClone(newVal)
}, { deep: true })

const resetToDefaults = () => {
  localData.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.display)
}

defineExpose({ localData, resetToDefaults })
</script>

<style scoped>
.settings-panel { padding: 4px; }
:deep(.compact-divider) { margin: 12px 0 8px; }
:deep(.compact-divider .el-divider__text) { font-size: 11px; font-weight: 600; color: #303133; padding: 0 6px; background: #fff; }
:deep(.compact-item) { margin-bottom: 10px; }
:deep(.compact-item .el-form-item__label) { font-size: 11px; font-weight: 600; color: #606266; margin-bottom: 4px; }
:deep(.compact-input) { width: 100%; --el-input-height: 28px; --el-input-font-size: 12px; }
.form-tip { font-size: 10px; color: #909399; margin-top: 4px; line-height: 1.3; }
.full-width { width: 100%; }
</style>
