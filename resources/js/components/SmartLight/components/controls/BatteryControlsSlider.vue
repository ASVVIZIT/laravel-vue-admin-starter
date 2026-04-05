<template>
  <div class="controls-slider-container">
    <div class="controls-display" v-if="showDisplay">
      <div class="controls-battery" :class="`battery-type-${batteryType}`">
        <div class="battery-cylinder">
          <div class="battery-fill" :style="{ width: batteryProgress + '%', backgroundColor: batteryColor }"></div>
          <div class="battery-cap" :style="{ backgroundColor: capColor }"></div>
        </div>
        <div class="battery-levels">
          <span class="battery-level" :style="{ left: '0%' }">2.5В</span>
          <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">{{ criticalThreshold }}В</span>
          <span class="battery-level" :style="{ left: '100%' }">4.3В</span>
        </div>
      </div>
      <span class="controls-value">{{ formattedValue }}</span>
    </div>

    <div class="controls-input-group">
      <el-slider v-model="localValue" :min="min" :max="max" :step="step" :format-tooltip="formatTooltip" class="controls-slider" @change="handleChange" />
      <div class="controls-number-input">
        <el-input-number v-model="localValue" :min="min" :max="max" :step="step" :precision="precision" :controls="showControls" size="small" @change="handleChange" />
        <span v-if="unit" class="controls-unit">{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: { type: [Number, String], required: true },
  min: { type: Number, default: 2.5 },
  max: { type: Number, default: 4.3 },
  step: { type: Number, default: 0.01 },
  unit: { type: String, default: 'В' },
  showControls: { type: Boolean, default: true },
  showDisplay: { type: Boolean, default: true },
  precision: { type: Number, default: 2 },
  criticalThreshold: { type: Number, required: true },
  batteryType: { type: String, default: 'li-ion', validator: v => ['li-ion', 'li-poly', 'ni-mh'].includes(v) }
});

const emit = defineEmits(['update:modelValue']);
const localValue = ref(Number(props.modelValue));

const criticalThresholdPosition = computed(() => ((props.criticalThreshold - props.min) / (props.max - props.min)) * 100);
const batteryProgress = computed(() => Math.min(100, Math.max(0, ((localValue.value - props.min) / (props.max - props.min)) * 100)));
const batteryColor = computed(() => {
  const v = localValue.value;
  if (v < 2.8) return '#f56c6c';
  if (v < 3.0) return '#faa7a7';
  if (v < 3.4) return '#e6a23c';
  if (v < 3.8) return '#67c23a';
  return '#50d776';
});
const capColor = computed(() => localValue.value < 2.8 ? '#d32f2f' : localValue.value < 3.0 ? '#f56c6c' : '#409eff');
const formattedValue = computed(() => localValue.value.toFixed(props.precision) + (props.unit ? ` ${props.unit}` : ''));
const formatTooltip = (v) => v.toFixed(props.precision) + (props.unit ? ` ${props.unit}` : '');
const handleChange = () => emit('update:modelValue', localValue.value);

watch(() => props.modelValue, (n) => { const nv = Number(n); if (!isNaN(nv) && nv !== localValue.value) localValue.value = nv; });
</script>

<style scoped>
.controls-slider-container { width: 100%; display: flex; flex-direction: column; gap: 6px; }
.controls-display { display: flex; align-items: center; gap: 8px; }
.controls-battery { position: relative; width: 100px; height: 24px; }
.battery-cylinder { position: relative; width: 100%; height: 14px; border-radius: 7px; background: #f0f0f0; border: 1px solid #e0e0e0; overflow: hidden; }
.battery-fill { position: absolute; top: 0; left: 0; height: 100%; border-radius: 7px 0 0 7px; transition: width 0.3s; }
.battery-cap { position: absolute; top: 0; right: 0; width: 10px; height: 100%; border-radius: 0 7px 7px 0; background: #409eff; }
.battery-levels { position: absolute; width: 100%; display: flex; justify-content: space-between; margin-top: 6px; }
.battery-level { position: absolute; font-size: 9px; color: #909399; }
.controls-value { font-weight: 600; color: #409eff; font-size: 13px; min-width: 70px; text-align: center; }
.controls-input-group { display: flex; flex-direction: column; gap: 6px; }
.controls-slider { width: 100%; }
.controls-number-input { display: flex; align-items: center; gap: 3px; }
.controls-unit { color: #909399; font-size: 11px; min-width: 18px; }
:deep(.el-input-number) { width: 100%; }
:deep(.el-slider) { --el-slider-main-bg-color: #409eff; }
</style>
