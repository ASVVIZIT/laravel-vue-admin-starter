<template>
  <div class="settings-panel">
    <el-form label-position="top" size="small" class="compact-form">
      <el-form-item label="Режим группировки" class="compact-item">
        <el-select v-model="localData.server.grouping_mode" class="full-width compact-select" size="small">
          <el-option label="🔄 Авто (по порогу)" value="auto" />
          <el-option label="📱 Фронтенд" value="frontend" />
          <el-option label="🖥 Сервер" value="server" />
        </el-select>
        <div class="form-tip">Как группировать записи при большом количестве</div>
      </el-form-item>

      <el-form-item v-if="localData.server.grouping_mode === 'auto'" label="Порог авто-переключения (записей)" class="compact-item">
        <el-input-number v-model="localData.server.grouping_auto_threshold" :min="50" :max="10000" :step="100" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">При превышении переключается на серверную группировку</div>
      </el-form-item>

      <el-form-item v-if="localData.server.grouping_mode === 'auto'" class="compact-item">
        <template #label><span>Минимум групп для группировки</span></template>
        <el-checkbox v-model="localData.server.enable_min_groups_check" style="margin-bottom: 6px; font-size: 11px;">Включить проверку осмысленности</el-checkbox>
        <el-input-number v-if="localData.server.enable_min_groups_check" v-model="localData.server.grouping_min_groups" :min="1" :max="100" :step="1" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">Группировка сработает, только если получится ≥ этого числа групп.</div>
      </el-form-item>

      <el-form-item label="Группировать по (серверный режим)" class="compact-item">
        <el-select v-model="localData.server.grouping_by" class="full-width compact-select" size="small">
          <el-option label="По пользователю" value="user" />
          <el-option label="По упражнению" value="exercise" />
          <el-option label="По месяцу" value="date" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { TRAINING_SETTINGS_DEFAULTS_CONFIG } from '@components/Training/config/trainingSettingsDefaultsConfig.js'
import { deepClone, deepMerge } from '@components/Training/utils/trainingSettingsHelpersUtils.js'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])

const localData = ref(deepClone(TRAINING_SETTINGS_DEFAULTS_CONFIG.grouping))
let isUpdatingFromProps = false

watch(() => props.modelValue, (val) => {
  if (isUpdatingFromProps) return
  isUpdatingFromProps = true
  try {
    if (val?.server) localData.value.server = deepMerge(localData.value.server, val.server)
  } finally {
    nextTick(() => { isUpdatingFromProps = false })
  }
}, { immediate: true })

watch(() => localData.value, (newVal, oldVal) => {
  if (isUpdatingFromProps) return
  if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
  emit('update:modelValue', deepClone(newVal))
}, { deep: true })

const resetToDefaults = () => { localData.value = deepClone(TRAINING_SETTINGS_DEFAULTS_CONFIG.grouping) }
defineExpose({ localData, resetToDefaults })
</script>

<style scoped>
.settings-panel { padding: 4px; }
:deep(.compact-item) { margin-bottom: 10px; }
:deep(.compact-item .el-form-item__label) { font-size: 11px; font-weight: 600; color: #606266; margin-bottom: 4px; }
:deep(.compact-input), :deep(.compact-select) { width: 100%; --el-input-height: 28px; --el-input-font-size: 12px; }
.form-tip { font-size: 10px; color: #909399; margin-top: 4px; line-height: 1.3; }
.full-width { width: 100%; }
</style>
