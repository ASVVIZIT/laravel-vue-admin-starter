<template>
  <div class="controls-slider-container">
    <div class="controls-display" v-if="showDisplay">
      <div class="controls-icon" :style="{ color: iconColor }">
        <el-icon :size="18"><Lightning /></el-icon>
      </div>
      <span class="controls-value">{{ formattedValue }}</span>
    </div>

    <div class="controls-input-group">
      <el-slider v-model="localValue" :min="min" :max="max" :step="step" :format-tooltip="formatTooltip" :disabled="disabled" class="controls-slider" @change="handleChange" />
      <div class="controls-number-input">
        <el-input-number v-model="localValue" :min="min" :max="max" :step="step" :precision="precision" :controls="showControls" :disabled="disabled" size="small" @change="handleChange" />
        <span v-if="unit" class="controls-unit">{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Lightning } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: { type: [Number, String], required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  unit: { type: String, default: '%' },
  showControls: { type: Boolean, default: true },
  showDisplay: { type: Boolean, default: true },
  precision: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);
const localValue = ref(Number(props.modelValue));

const iconColor = computed(() => localValue.value < 20 ? '#909399' : localValue.value < 50 ? '#e6a23c' : '#409eff');
const formattedValue = computed(() => localValue.value.toFixed(props.precision) + (props.unit ? ` ${props.unit}` : ''));
const formatTooltip = (v) => v.toFixed(props.precision) + (props.unit ? ` ${props.unit}` : '');
const handleChange = () => emit('update:modelValue', localValue.value);

watch(() => props.modelValue, (n) => { const nv = Number(n); if (!isNaN(nv) && nv !== localValue.value) localValue.value = nv; });
</script>

<style scoped>
.controls-slider-container { width: 100%; display: flex; flex-direction: column; gap: 6px; }
.controls-display { display: flex; align-items: center; gap: 6px; }
.controls-icon { color: #409eff; display: flex; align-items: center; }
.controls-value { font-weight: 600; color: #303133; font-size: 13px; min-width: 50px; text-align: center; }
.controls-input-group { display: flex; flex-direction: column; gap: 6px; }
.controls-slider { width: 100%; }
.controls-number-input { display: flex; align-items: center; gap: 3px; }
.controls-unit { color: #909399; font-size: 11px; min-width: 18px; }
:deep(.el-input-number) { width: 100%; }
:deep(.el-slider) { --el-slider-main-bg-color: #409eff; }
</style>
