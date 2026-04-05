<template>
  <div class="voltage-indicator-monitoring" :class="{ 'indicator-critical': isCritical }">
    <div class="indicator-value">{{ voltage }} В</div>
    <div class="indicator-bar">
      <div class="indicator-fill" :style="{ height: `${progress}%` }"></div>
      <div class="indicator-mark indicator-mark--critical" :style="{ top: `${criticalPosition}%` }"></div>
      <div class="indicator-mark indicator-mark--min" :style="{ top: `${minPosition}%` }"></div>
      <div class="indicator-mark indicator-mark--max" :style="{ top: `${maxPosition}%` }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  voltage: { type: Number, required: true },
  minVoltage: { type: Number, required: true, default: 2.5 },
  maxVoltage: { type: Number, required: true, default: 4.3 },
  criticalVoltage: { type: Number, required: true, default: 3.2 }
});

const isCritical = computed(() => props.voltage < props.criticalVoltage);

const progress = computed(() => {
  return Math.min(100, Math.max(0, ((props.voltage - props.minVoltage) / (props.maxVoltage - props.minVoltage)) * 100));
});

const criticalPosition = computed(() => {
  return ((props.criticalVoltage - props.minVoltage) / (props.maxVoltage - props.minVoltage)) * 100;
});

const minPosition = computed(() => 0);
const maxPosition = computed(() => 100);
</script>

<style scoped>
.voltage-indicator-monitoring {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.indicator-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.indicator-bar {
  position: relative;
  width: 100%;
  height: 120px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.indicator-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, #67c23a 0%, #95d97b 100%);
  transition: height 0.3s ease;
}

.indicator-mark {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #e6a23c;
  z-index: 10;
}

.indicator-mark--critical {
  background: #f56c6c;
  border-top: 1px dashed #f56c6c;
}

.indicator-mark--min,
.indicator-mark--max {
  background: #909399;
}

.indicator-critical .indicator-fill {
  background: linear-gradient(to top, #f56c6c 0%, #faa7a7 100%);
}
</style>
