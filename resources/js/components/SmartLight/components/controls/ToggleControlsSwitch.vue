<template>
  <div class="controls-switch-container">
    <div class="controls-display" v-if="showDisplay">
      <div class="controls-icon" :style="{ color: iconColor }">
        <el-icon :size="16"><component :is="icon" /></el-icon>
      </div>
      <span class="controls-label">{{ label }}</span>
      <span class="controls-status" :class="{ 'controls-status--active': localValue }">{{ localValue ? activeText : inactiveText }}</span>
    </div>

    <el-switch v-model="localValue" :disabled="disabled" :active-text="activeText" :inactive-text="inactiveText" :inline-prompt="inlinePrompt" size="small" @change="handleChange" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Switch, CircleCheck, CircleClose } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  label: { type: String, default: '' },
  activeText: { type: String, default: 'Вкл' },
  inactiveText: { type: String, default: 'Выкл' },
  icon: { type: Object, default: () => Switch },
  showDisplay: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  inlinePrompt: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue']);
const localValue = ref(props.modelValue);
const iconColor = computed(() => localValue.value ? '#67c23a' : '#909399');
const handleChange = (v) => emit('update:modelValue', v);
watch(() => props.modelValue, (n) => { if (n !== localValue.value) localValue.value = n; });
</script>

<style scoped>
.controls-switch-container { width: 100%; display: flex; flex-direction: column; gap: 6px; }
.controls-display { display: flex; align-items: center; gap: 6px; }
.controls-icon { color: #409eff; display: flex; align-items: center; }
.controls-label { font-size: 12px; color: #606266; font-weight: 500; flex: 1; }
.controls-status { font-size: 11px; color: #909399; font-weight: 500; }
.controls-status--active { color: #67c23a; font-weight: 600; }
:deep(.el-switch) { --el-switch-on-color: #67c23a; --el-switch-off-color: #dcdfe6; }
:deep(.el-switch__label) { font-size: 10px; }
</style>
