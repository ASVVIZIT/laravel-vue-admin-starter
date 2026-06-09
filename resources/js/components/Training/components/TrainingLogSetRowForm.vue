<template>
  <div :class="['set-row', status ? `set-${status}` : '', { 'set-frozen': frozen }]">
    <!-- Статус -->
    <div class="set-status">
      <Check v-if="status === 'success'" class="icon valid" />
      <WarningFilled v-else-if="status === 'warning'" class="icon warning" />
      <WarningFilled v-else-if="status === 'error'" class="icon invalid" />
      <span>#{{ index + 1 }}</span>
    </div>

    <!-- Повторы -->
    <div class="field-wrapper" v-if="isFieldVisible('reps')">
      <el-input-number v-model="localSet.reps" :min="0" :max="1000"
                       :placeholder="placeholderMap.reps" size="small" controls-position="right"
                       :disabled="frozen" :class="{ 'field-error': status === 'error' && errors.reps }" ref="repsInput" />
      <span v-if="status === 'error' && errors.reps" class="field-hint">{{ errors.reps }}</span>
    </div>

    <!-- Вес -->
    <div class="field-wrapper" v-if="isFieldVisible('weight')">
      <el-input-number v-model="localSet.weight" :min="0" :max="1000" :step="0.5"
                       :placeholder="placeholderMap.weight" size="small" controls-position="right"
                       :disabled="frozen" :class="{ 'field-error': status === 'error' && errors.weight }" ref="weightInput" >
        <template #suffix><span class="unit">{{ unitMap.weight }}</span></template>
      </el-input-number>
      <span v-if="status === 'error' && errors.weight" class="field-hint">{{ errors.weight }}</span>
    </div>

    <!-- Длительность -->
    <div class="field-wrapper" v-if="isFieldVisible('duration')">
      <el-input-number v-model="localSet.duration" :min="0" :max="86400"
                       :placeholder="placeholderMap.duration" size="small" controls-position="right"
                       :disabled="frozen" :class="{ 'field-error': status === 'error' && errors.duration }" ref="durationInput" >
        <template #suffix><span class="unit">{{ unitMap.duration }}</span></template>
      </el-input-number>
      <span v-if="status === 'error' && errors.duration" class="field-hint">{{ errors.duration }}</span>
    </div>

    <!-- Дистанция -->
    <div class="field-wrapper" v-if="isFieldVisible('distance')">
      <el-input-number v-model="localSet.distance" :min="0" :max="42195" :step="0.1"
                       :placeholder="placeholderMap.distance" size="small" controls-position="right"
                       :disabled="frozen" :class="{ 'field-error': status === 'error' && errors.distance }" ref="distanceInput" >
        <template #suffix><span class="unit">{{ unitMap.distance }}</span></template>
      </el-input-number>
      <span v-if="status === 'error' && errors.distance" class="field-hint">{{ errors.distance }}</span>
    </div>

    <!-- Заметки -->
    <div class="field-wrapper field-notes">
      <el-input v-model="localSet.notes" :placeholder="placeholderMap.notes || 'Заметка'" size="small"
                maxlength="100" show-word-limit
                :disabled="frozen" :class="{ 'field-error': status === 'error' && errors.notes }" ref="notesInput" />
      <span v-if="status === 'error' && errors.notes" class="field-hint">{{ errors.notes }}</span>
    </div>

    <!-- Удалить -->
    <el-button v-if="removable && !frozen" type="danger" link class="btn-remove" @click="$emit('remove', index)">
      <el-icon><Delete /></el-icon>
    </el-button>
  </div>
</template>

<script setup>
import { computed, shallowRef } from 'vue'
import { Delete, Check, WarningFilled } from '@element-plus/icons-vue'
import { useTrainingExerciseFields } from '@components/Training/composables/useTrainingExerciseFields.js'

const props = defineProps({
  modelValue: { type: Object, required: true },
  index: { type: Number, required: true },
  exerciseType: { type: String, default: 'bodyweight' },
  removable: { type: Boolean, default: true },
  frozen: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
  status: { type: String, default: 'warning' }
})

const emit = defineEmits(['update:modelValue', 'remove'])

const exerciseConfig = computed(() => useTrainingExerciseFields(props.exerciseType))
const isFieldVisible = (field) => exerciseConfig.value.isFieldVisible(field)
const placeholderMap = computed(() => exerciseConfig.value.placeholderMap)
const unitMap = computed(() => exerciseConfig.value.unitMap)

const localSet = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const repsInput = shallowRef(null)
const weightInput = shallowRef(null)
const durationInput = shallowRef(null)
const distanceInput = shallowRef(null)
const notesInput = shallowRef(null)

const focusField = (field) => {
  const map = { reps: repsInput, weight: weightInput, duration: durationInput, distance: distanceInput, notes: notesInput }
  map[field]?.value?.focus()
}

defineExpose({ focusField })
</script>

<style scoped>
/*  Жёсткая фиксация размеров: минимализм */
.set-row {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 4px;
  border-bottom: 1px solid #ebeef5;
  background: transparent;
  box-sizing: border-box;
  width: 100%;
  transition: background 0.2s;
}
.set-row:last-child { border-bottom: none; }

/* Состояния */
.set-warning { background: #fdf6ec; }
.set-warning .set-status { color: #e6a23c; }
.set-success { background: #f0f9eb; }
.set-success .set-status { color: #67c23a; }
.set-error { background: #fef0f0; }
.set-error .set-status { color: #f56c6c; }
.set-frozen { background: #f8f9fa; opacity: 0.9; }

/* Статус */
.set-status {
  display: flex; align-items: center; gap: 2px;
  width: 30px; flex-shrink: 0; height: 100%; justify-content: center;
}
.set-status .icon { font-size: 11px; }
.set-status span { font-size: 9px; font-weight: 600; }

/* Обертки полей */
.field-wrapper { position: relative; display: block; min-height: 0; flex-shrink: 0; }
.field-notes { flex: 1 1 auto; min-width: 0; max-width: 100%; }

/* ХИНТ: виден, не меняет высоту строки, белый фон + тень */
.field-hint {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 2px;
  font-size: 8px;
  line-height: 1;
  color: #f56c6c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  z-index: 5;
  pointer-events: none;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  border-radius: 2px;
  padding: 1px 2px;
}

/* Инпуты: базовые размеры */
.set-row :deep(.el-input-number),
.set-row :deep(.el-input) {
  height: 20px !important;
  line-height: 20px !important;
  box-sizing: border-box !important;
}

.set-row :deep(.el-input__wrapper),
.set-row :deep(.el-input-number__wrapper) {
  height: 20px !important;
  padding: 0 4px !important;
  border: none !important;
  box-shadow: 0 0 0 1px #dcdfe6 inset !important;
  border-radius: 2px !important;
}

/* 🔥 ТВОЕ РЕШЕНИЕ + СТРАХОВКА ОТ ОБРЕЗАНИЯ */
.set-row :deep(input) {
  font-size: 11px !important;
  text-align: left !important;
  padding-left: 1px !important;
  padding-right: 1px !important;

  /* 🛡️ Добавлено для безопасности 1px: */
  box-sizing: border-box !important;
  -webkit-font-smoothing: antialiased; /* Делает шрифт четче на малых размерах */
  text-rendering: optimizeLegibility;  /* Улучшает рендеринг цифр, предотвращая "слипание" */
}

/* Ширины */
.field-wrapper:nth-child(2) :deep(.el-input-number) { width: 80px; min-width: 80px; }
.field-wrapper:nth-child(n+3) :deep(.el-input-number) { width: 90px; min-width: 90px; }

/* Счётчик символов в заметках */
.field-notes :deep(.el-input__count) {
  position: absolute; bottom: 1px; right: 3px;
  font-size: 7px; line-height: 1; padding: 0; color: #b4bccc;
}
.field-notes :deep(.el-input__wrapper) { padding-right: 24px !important; }

/* Стрелки: строго 9px */
.set-row :deep(.el-input-number.is-controls-right.el-input-number--small) {
  --el-input-number-controls-height: 9px;
}
.set-row :deep(.el-input-number.is-controls-right.el-input-number--small .el-input-number__increase),
.set-row :deep(.el-input-number.is-controls-right.el-input-number--small .el-input-number__decrease) {
  height: 9px !important;
  line-height: 9px !important;
  font-size: 8px !important;
  padding: 0 !important;
  margin: 0 !important;
  width: auto !important;
  min-width: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 !important;
  border: 1px solid #dcdfe6 !important;
  background: #f5f7fa !important;
}

/* Ошибки */
.field-error :deep(.el-input__wrapper),
.field-error :deep(.el-input-number__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset !important;
}

/* Единицы и кнопка */
.unit { font-size: 8px; color: #909399; user-select: none; margin-right: 14px; line-height: 1; }
.btn-remove { flex-shrink: 0; padding: 0 2px; align-self: center; font-size: 10px; }
</style>
