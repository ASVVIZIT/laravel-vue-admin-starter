<template>
  <div class="settings-panel">
    <el-form label-position="top" size="small" class="compact-form">
      <el-divider content-position="left" class="compact-divider">Пагинация</el-divider>
      <el-form-item label="Записей на странице" class="compact-item">
        <el-input-number v-model="localData.server.logs_per_page" :min="10" :max="200" :step="10" controls-position="right" class="full-width compact-input" />
      </el-form-item>
      <el-form-item label="Групп на странице" class="compact-item">
        <el-input-number v-model="localData.server.grouping_per_page" :min="5" :max="50" :step="5" controls-position="right" class="full-width compact-input" />
      </el-form-item>

      <el-divider content-position="left" class="compact-divider">Функции</el-divider>
      <el-form-item label="Показывать статистику" class="compact-item">
        <el-switch v-model="localData.server.enable_stats" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item label="Разрешить шеринг" class="compact-item">
        <el-switch v-model="localData.server.enable_sharing" :active-value="true" :inactive-value="false" />
      </el-form-item>

      <el-divider content-position="left" class="compact-divider">Лимиты</el-divider>
      <el-form-item label="Макс. пользователей в шаринге" class="compact-item">
        <el-input-number v-model="localData.limits.max_shared_with" :min="1" :max="500" :step="10" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">Сколько пользователей можно добавить в "Поделиться с" одной записи</div>
      </el-form-item>
      <el-form-item label="Макс. подходов в записи" class="compact-item">
        <el-input-number v-model="localData.limits.max_sets" :min="1" :max="200" :step="5" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">Ограничение на количество подходов в одной тренировке</div>
      </el-form-item>
      <el-form-item label="Макс. длина заметки" class="compact-item">
        <el-input-number v-model="localData.limits.max_notes_length" :min="50" :max="5000" :step="100" controls-position="right" class="full-width compact-input" />
        <div class="form-tip">Максимальное количество символов в заметке</div>
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

const localData = ref(deepClone(SETTINGS_DEFAULTS_CONFIG.display))
let isUpdatingFromProps = false

watch(() => props.modelValue, (val) => {
  if (isUpdatingFromProps) return
  isUpdatingFromProps = true
  try {
    if (val?.server) localData.value.server = deepMerge(localData.value.server, val.server)
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

const resetToDefaults = () => { localData.value = deepClone(SETTINGS_DEFAULTS_CONFIG.display) }
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
