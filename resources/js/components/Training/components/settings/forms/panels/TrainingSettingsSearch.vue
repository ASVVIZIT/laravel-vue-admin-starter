<template>
  <div class="settings-panel">
    <el-form label-position="top" size="small" class="compact-form">
      <el-form-item label="Мин. длина поискового запроса" class="compact-item">
        <el-input-number v-model="localData.limits.search_min_length" :min="1" :max="10" :step="1" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">Минимум символов для начала поиска пользователей</div>
      </el-form-item>
      <el-form-item label="Макс. результатов поиска" class="compact-item">
        <el-input-number v-model="localData.limits.search_results_limit" :min="10" :max="500" :step="10" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">Сколько пользователей показывать в результатах поиска</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { SETTINGS_DEFAULTS_CONFIG } from '@/components/Training/config/settingsDefaultsConfig.js'
import { deepClone, deepMerge } from '@/components/Training/utils/appSettingsHelpersUtils.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])

const localData = ref(deepClone(SETTINGS_DEFAULTS_CONFIG.search))
let isUpdatingFromProps = false

watch(() => props.modelValue, (val) => {
  if (isUpdatingFromProps) return
  isUpdatingFromProps = true
  try {
    if (val?.limits) localData.value.limits = deepMerge(localData.value.limits, val.limits)
  } finally {
    nextTick(() => { isUpdatingFromProps = false })
  }
}, { immediate: true })

watch(() => localData.value, (newVal, oldVal) => {
  if (isUpdatingFromProps) return
  if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
  emit('update:modelValue', deepClone(newVal))
}, { deep: true })

const resetToDefaults = () => { localData.value = deepClone(SETTINGS_DEFAULTS_CONFIG.search) }
defineExpose({ localData, resetToDefaults })
</script>

<style scoped>
.settings-panel { padding: 4px; }
:deep(.compact-item) { margin-bottom: 10px; }
:deep(.compact-item .el-form-item__label) { font-size: 11px; font-weight: 600; color: #606266; margin-bottom: 4px; }
:deep(.compact-input) { width: 100%; --el-input-height: 28px; --el-input-font-size: 12px; }
.form-tip { font-size: 10px; color: #909399; margin-top: 4px; line-height: 1.3; }
.full-width { width: 100%; }
</style>
