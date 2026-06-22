<template>
  <div class="settings-panel">
    <el-form label-position="top" size="small" class="compact-form">
      <el-divider content-position="left" class="compact-divider">Автозапуск</el-divider>
      <el-form-item label="Автозапуск сканера" class="compact-item">
        <el-switch v-model="localData.autoRunScanner" :active-value="true" :inactive-value="false" />
        <div class="form-tip">Автоматически запускать сканер при переключении в режим</div>
      </el-form-item>
      <el-form-item label="Автозапуск валидатора" class="compact-item">
        <el-switch v-model="localData.autoRunValidator" :active-value="true" :inactive-value="false" />
        <div class="form-tip">Автоматически запускать валидатор при переключении в режим</div>
      </el-form-item>

      <el-divider content-position="left" class="compact-divider">Кэширование</el-divider>
      <el-form-item label="Кэшировать результаты" class="compact-item">
        <el-switch v-model="localData.cacheResults" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item v-if="localData.cacheResults" label="Время жизни кэша (сек)" class="compact-item">
        <el-input-number v-model="localData.cacheTTL" :min="60" :max="3600" :step="60" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">Через сколько секунд кэш будет считаться устаревшим</div>
      </el-form-item>

      <el-divider content-position="left" class="compact-divider">Интерфейс</el-divider>
      <el-form-item label="Подтверждение перед экспортом" class="compact-item">
        <el-switch v-model="localData.confirmBeforeExport" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item label="Подсвечивать результаты поиска" class="compact-item">
        <el-switch v-model="localData.highlightSearch" :active-value="true" :inactive-value="false" />
        <div class="form-tip">Подсвечивать найденный текст в таблицах жёлтым</div>
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
const { behaviorSettings } = storeToRefs(settingsStore)

const localData = ref(deepClone(behaviorSettings.value))

watch(behaviorSettings, (newVal) => {
  localData.value = deepClone(newVal)
}, { deep: true })

// 🔥 ИСПРАВЛЕНО: используем I18N_SETTINGS_DEFAULTS_CONFIG вместо $state()
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
</style>
