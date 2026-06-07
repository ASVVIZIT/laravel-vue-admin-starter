<template>
  <div class="settings-panel">
    <el-form label-position="top" size="small" class="compact-form">
      <el-form-item label="Вкладка по умолчанию" class="compact-item">
        <el-select v-model="localData.frontend.default_tab" class="full-width compact-select" size="small">
          <el-option label="Мои тренировки" value="mine" />
          <el-option label="Доступные мне" value="shared-with-me" />
          <el-option label="Я поделился" value="shared-by-me" />
        </el-select>
      </el-form-item>
      <el-form-item label="Показывать кнопку переключения группировки" class="compact-item">
        <el-switch v-model="localData.frontend.show_grouping_toggle" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item label="Сворачивать фильтры на мобильном" class="compact-item">
        <el-switch v-model="localData.frontend.filters_collapsed_mobile" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item label="Компактный вид таблицы" class="compact-item">
        <el-switch v-model="localData.frontend.compact_view" :active-value="true" :inactive-value="false" />
      </el-form-item>

      <el-divider content-position="left" class="compact-divider"><el-icon><Grid /></el-icon> Колонки таблицы</el-divider>
      <el-tabs v-model="columnsTab" type="border-card" class="columns-tabs">
        <el-tab-pane v-for="tabKey in ['mine', 'shared-with-me', 'shared-by-me']" :key="tabKey" :label="tabLabels[tabKey]" :name="tabKey">
          <div class="columns-grid">
            <el-checkbox v-for="(label, key) in columnLabels" :key="key" v-model="localData.columns[tabKey][key]" :label="label" class="column-checkbox" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Grid } from '@element-plus/icons-vue'
import { SETTINGS_DEFAULTS_CONFIG } from '@/components/Training/config/settingsDefaultsConfig.js'
import { deepClone, deepMerge } from '@/components/Training/utils/appSettingsHelpersUtils.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])

const localData = ref(deepClone(SETTINGS_DEFAULTS_CONFIG.interface))

const columnsTab = ref('mine')
const tabLabels = { 'mine': 'Мои тренировки', 'shared-with-me': 'Доступные мне', 'shared-by-me': 'Я поделился' }
const columnLabels = { date: '📅 Дата', time: '🕐 Время', exercise: '💪 Упражнение', sharing: '🔗 Шеринг', sets: '📊 Подходы', reps: '🔢 Повторы', volume: '📈 Объём', rating: '⭐ Оценка', actions: '⚙️ Действия' }

let isUpdatingFromProps = false

watch(() => props.modelValue, (val) => {
  if (isUpdatingFromProps) return
  isUpdatingFromProps = true
  try {
    if (val?.frontend) localData.value.frontend = deepMerge(localData.value.frontend, val.frontend)
    if (val?.columns) {
      Object.keys(SETTINGS_DEFAULTS_CONFIG.interface.columns).forEach(tab => {
        localData.value.columns[tab] = deepMerge(SETTINGS_DEFAULTS_CONFIG.interface.columns[tab], val.columns[tab] || {})
      })
    }
  } finally {
    nextTick(() => { isUpdatingFromProps = false })
  }
}, { immediate: true })

watch(() => localData.value, (newVal, oldVal) => {
  if (isUpdatingFromProps) return
  if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
  emit('update:modelValue', deepClone(newVal))
}, { deep: true })

const resetToDefaults = () => { localData.value = deepClone(SETTINGS_DEFAULTS_CONFIG.interface) }
defineExpose({ localData, resetToDefaults })
</script>

<style scoped>
.settings-panel { padding: 4px; }
:deep(.compact-divider) { margin: 12px 0 8px; }
:deep(.compact-divider .el-divider__text) { font-size: 11px; font-weight: 600; color: #303133; padding: 0 6px; background: #fff; }
:deep(.compact-item) { margin-bottom: 10px; }
:deep(.compact-item .el-form-item__label) { font-size: 11px; font-weight: 600; color: #606266; margin-bottom: 4px; }
:deep(.compact-input), :deep(.compact-select) { width: 100%; --el-input-height: 28px; --el-input-font-size: 12px; }
.columns-tabs { margin-top: 8px; }
.columns-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 8px 0; }
.column-checkbox { font-size: 12px; }
.full-width { width: 100%; }
</style>
