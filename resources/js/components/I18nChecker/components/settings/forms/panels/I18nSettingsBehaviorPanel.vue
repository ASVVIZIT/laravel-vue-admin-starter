<template>
  <div class="settings-panel">
    <el-form label-position="top" size="small" class="compact-form">
      <el-divider content-position="left" class="compact-divider">{{ $t('i18nChecker.settings.behavior.autoRunTitle') }}</el-divider>
      <el-form-item :label="$t('i18nChecker.settings.behavior.autoRunScanner')" class="compact-item">
        <el-switch v-model="localData.autoRunScanner" :active-value="true" :inactive-value="false" />
        <div class="form-tip">{{ $t('i18nChecker.settings.behavior.autoRunScannerTip') }}</div>
      </el-form-item>
      <el-form-item :label="$t('i18nChecker.settings.behavior.autoRunValidator')" class="compact-item">
        <el-switch v-model="localData.autoRunValidator" :active-value="true" :inactive-value="false" />
        <div class="form-tip">{{ $t('i18nChecker.settings.behavior.autoRunValidatorTip') }}</div>
      </el-form-item>

      <el-divider content-position="left" class="compact-divider">{{ $t('i18nChecker.settings.behavior.cacheTitle') }}</el-divider>
      <el-form-item :label="$t('i18nChecker.settings.behavior.cacheResults')" class="compact-item">
        <el-switch v-model="localData.cacheResults" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item v-if="localData.cacheResults" :label="$t('i18nChecker.settings.behavior.cacheTTL')" class="compact-item">
        <el-input-number v-model="localData.cacheTTL" :min="60" :max="3600" :step="60" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">{{ $t('i18nChecker.settings.behavior.cacheTTLTip') }}</div>
      </el-form-item>

      <el-divider content-position="left" class="compact-divider">{{ $t('i18nChecker.settings.behavior.uiTitle') }}</el-divider>
      <el-form-item :label="$t('i18nChecker.settings.behavior.confirmExport')" class="compact-item">
        <el-switch v-model="localData.confirmBeforeExport" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item :label="$t('i18nChecker.settings.behavior.highlightSearch')" class="compact-item">
        <el-switch v-model="localData.highlightSearch" :active-value="true" :inactive-value="false" />
      </el-form-item>

      <el-form-item v-if="localData.highlightSearch" :label="$t('i18nChecker.settings.behavior.highlightColor')" class="compact-item">
        <div class="highlight-color-wrapper">
          <el-color-picker v-model="localData.highlightColor" size="small" />
          <div class="highlight-preview">
            <span
                class="highlight-preview-text"
                :style="{
                  backgroundColor: localData.highlightColor,
                  color: getContrastColor(localData.highlightColor),
                  borderBottom: `2px solid ${localData.highlightColor}`
                }"
            >
              {{ $t('i18nChecker.settings.behavior.highlightPreview') || 'Пример' }}
            </span>
          </div>
        </div>
        <div class="form-tip">{{ $t('i18nChecker.settings.behavior.highlightColorTip') || 'Цвет автоматически подбирает контрастный текст' }}</div>
      </el-form-item>

      <el-form-item :label="$t('i18nChecker.settings.behavior.preserveSearch')" class="compact-item">
        <el-switch v-model="localData.preserveSearch" :active-value="true" :inactive-value="false" />
        <div class="form-tip">{{ $t('i18nChecker.settings.behavior.preserveSearchTip') || 'Поисковые запросы сохраняются при смене языка и режима' }}</div>
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
import { getContrastTextColor } from '@components/I18nChecker/utils/highlightUtils.js'

const settingsStore = useI18nSettingsStore()
const { behaviorSettings } = storeToRefs(settingsStore)

const localData = ref(deepClone(behaviorSettings.value))

watch(behaviorSettings, (newVal) => {
  localData.value = deepClone(newVal)
}, { deep: true })

const getContrastColor = (hex) => getContrastTextColor(hex)

const resetToDefaults = () => {
  localData.value = deepClone(I18N_SETTINGS_DEFAULTS_CONFIG.behavior)
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

.highlight-color-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.highlight-preview {
  padding: 2px 4px;
  background: #f5f7fa;
  border-radius: 3px;
}

.highlight-preview-text {
  padding: 0 1px;
  border-radius: 1px;
  font-weight: 600;
  font-size: 11px;
}
</style>
