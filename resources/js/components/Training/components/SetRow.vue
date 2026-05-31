<template>
  <div class="set-row">
    <span class="set-index">#{{ index + 1 }}</span>

    <!-- Bodyweight / Weighted / Other -->
    <template v-if="['bodyweight', 'weighted', 'other'].includes(exerciseType)">
      <el-input-number
          v-model="localSet.reps"
          :min="0"
          :max="1000"
          :placeholder="'Повторы'"
          size="small"
          controls-position="right"
          @change="emitChange"
      />
    </template>

    <!-- Weighted: поле веса -->
    <template v-if="exerciseType === 'weighted'">
      <el-input-number
          v-model="localSet.weight"
          :min="0"
          :max="1000"
          :step="0.5"
          placeholder="кг"
          size="small"
          controls-position="right"
          @change="emitChange"
      >
        <template #suffix><span class="unit">кг</span></template>
      </el-input-number>
    </template>

    <!-- Cardio: длительность + дистанция -->
    <template v-if="exerciseType === 'cardio'">
      <el-input-number
          v-model="localSet.duration"
          :min="0"
          :max="86400"
          placeholder="сек"
          size="small"
          controls-position="right"
          @change="emitChange"
      >
        <template #suffix><span class="unit">сек</span></template>
      </el-input-number>
      <el-input-number
          v-model="localSet.distance"
          :min="0"
          :max="42195"
          :step="0.1"
          placeholder="м"
          size="small"
          controls-position="right"
          @change="emitChange"
      >
        <template #suffix><span class="unit">м</span></template>
      </el-input-number>
    </template>

    <!-- Заметки к подходу (опционально) -->
    <el-input
        v-model="localSet.notes"
        placeholder="Заметки"
        size="small"
        maxlength="50"
        show-word-limit
        @input="emitChange"
    />

    <!-- Удалить подход -->
    <el-button
        v-if="removable"
        type="danger"
        link
        size="small"
        @click="$emit('remove', index)"
        title="Удалить подход"
    >
      <el-icon><Delete /></el-icon>
    </el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import { useExerciseFields } from '../composables/useExerciseFields.js';

const props = defineProps({
  modelValue: { type: Object, required: true },
  index: { type: Number, required: true },
  exerciseType: { type: String, default: 'bodyweight' },
  removable: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'remove']);

const { visibleFields } = useExerciseFields(props.exerciseType);

const localSet = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const emitChange = () => {
  emit('update:modelValue', { ...localSet.value });
};
</script>

<style scoped>
.set-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  font-size: 12px;
}
.set-index {
  width: 24px;
  font-weight: 600;
  color: #606266;
  text-align: center;
}
:deep(.el-input-number),
:deep(.el-input) {
  width: 80px;
}
:deep(.el-input-number .el-input__suffix) {
  padding-right: 4px;
}
.unit {
  font-size: 10px;
  color: #909399;
}
:deep(.el-button.is-link) {
  padding: 0;
  margin-left: 2px;
}
</style>
