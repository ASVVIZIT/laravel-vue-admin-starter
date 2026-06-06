<template>
  <div class="set-row">
    <span class="set-index">#{{ index + 1 }}</span>

    <el-input-number v-if="isFieldVisible('reps')"
                     v-model="localSet.reps" :min="0" :max="1000" placeholder="Повторы" size="small" controls-position="right" @change="emitChange" />

    <el-input-number v-if="isFieldVisible('weight')"
                     v-model="localSet.weight" :min="0" :max="1000" :step="0.5" placeholder="кг" size="small" controls-position="right" @change="emitChange">
      <template #suffix><span class="unit">кг</span></template>
    </el-input-number>

    <el-input-number v-if="isFieldVisible('duration')"
                     v-model="localSet.duration" :min="0" :max="86400" placeholder="сек" size="small" controls-position="right" @change="emitChange">
      <template #suffix><span class="unit">сек</span></template>
    </el-input-number>

    <el-input-number v-if="isFieldVisible('distance')"
                     v-model="localSet.distance" :min="0" :max="42195" :step="0.1" placeholder="м" size="small" controls-position="right" @change="emitChange">
      <template #suffix><span class="unit">м</span></template>
    </el-input-number>

    <el-input v-model="localSet.notes" placeholder="Заметки" size="small" maxlength="50" show-word-limit @input="emitChange" />

    <el-button v-if="removable" type="danger" link size="small" @click="$emit('remove', index)" title="Удалить подход">
      <el-icon><Delete /></el-icon>
    </el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Delete } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: { type: Object, required: true },
  index: { type: Number, required: true },
  exerciseType: { type: String, default: 'bodyweight' },
  removable: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'remove']);

// 🔥 РЕАКТИВНАЯ проверка видимости полей
const visibleFields = computed(() => {
  const config = {
    bodyweight: ['reps'],
    weighted: ['reps', 'weight'],
    cardio: ['duration', 'distance'],
    other: ['duration']
  };
  return config[props.exerciseType] || config.bodyweight;
});

const isFieldVisible = (field) => visibleFields.value.includes(field);

const localSet = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const emitChange = () => {
  emit('update:modelValue', { ...localSet.value });
};
</script>

<style scoped>
.set-row { display: flex; align-items: center; gap: 6px; padding: 8px 0; border-bottom: 1px dashed #f0f0f0; }
.set-row:last-child { border-bottom: none; }
.set-index { width: 28px; font-weight: 600; color: #606266; text-align: center; font-size: 11px; }
:deep(.el-input-number) { width: 95px; }
:deep(.el-input) { width: 130px; }
.unit { font-size: 10px; color: #909399; padding-right: 4px; }
:deep(.el-button.is-link) { padding: 0; margin-left: 4px; color: #f56c6c; }
:deep(.el-button.is-link:hover) { color: #f89898; }
</style>
