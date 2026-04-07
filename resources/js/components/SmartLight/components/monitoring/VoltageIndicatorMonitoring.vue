<template>
  <div
      class="voltage-indicator-monitoring"
      :class="{ 'indicator-critical': isCritical }"
      :title="indicatorTitle"
  >
    <div class="indicator-value">{{ formattedVoltage }} В</div>
    <div class="indicator-bar">
      <div class="indicator-fill" :style="{ height: progress + '%' }"></div>
      <div
          class="indicator-mark indicator-mark--critical"
          :style="{ bottom: criticalPosition + '%' }"
          title="Критический порог"
      ></div>
      <div
          class="indicator-mark indicator-mark--current"
          :style="{ bottom: currentLevelPosition + '%' }"
          title="Текущий уровень"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  voltage: { type: Number, required: true },
  minVoltage: { type: Number, default: 2.5 },
  maxVoltage: { type: Number, default: 4.3 },
  criticalVoltage: { type: Number, default: 3.2 }
});

// === COMPUTED ===

const isCritical = computed(() => props.voltage < props.criticalVoltage);

const formattedVoltage = computed(() => {
  if (props.voltage == null || isNaN(props.voltage)) return '—';
  return props.voltage.toFixed(2);
});

const indicatorTitle = computed(() => {
  if (isCritical.value) {
    return `⚠️ Критический разряд: ${formattedVoltage.value}В < ${props.criticalVoltage}В`;
  }
  return `Напряжение: ${formattedVoltage.value}В`;
});

const progress = computed(() => {
  const range = props.maxVoltage - props.minVoltage;
  if (range <= 0) return 0;
  const value = Math.max(props.minVoltage, Math.min(props.maxVoltage, props.voltage));
  return ((value - props.minVoltage) / range) * 100;
});

const criticalPosition = computed(() => {
  const range = props.maxVoltage - props.minVoltage;
  if (range <= 0) return 0;
  return ((props.criticalVoltage - props.minVoltage) / range) * 100;
});

const currentLevelPosition = computed(() => {
  const range = props.maxVoltage - props.minVoltage;
  if (range <= 0) return 0;
  const value = Math.max(props.minVoltage, Math.min(props.maxVoltage, props.voltage));
  return ((value - props.minVoltage) / range) * 100;
});
</script>

<style scoped>
.voltage-indicator-monitoring {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 2px;
}

.indicator-value {
  font-size: 9px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.indicator-bar {
  position: relative;
  width: 100%;
  height: 40px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 2px;
  overflow: hidden;
}

.indicator-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, #67c23a 0%, #95d97b 50%, #67c23a 100%);
  transition: height 0.3s ease;
}

.indicator-critical .indicator-fill {
  background: linear-gradient(to top, #f56c6c 0%, #ff9999 50%, #f56c6c 100%);
  animation: critical-pulse 2s infinite;
}

.indicator-mark {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  z-index: 10;
  pointer-events: none;
}

.indicator-mark--critical {
  background: #f56c6c;
  border-top: 1px dashed #f56c6c;
}

.indicator-mark--current {
  background: #409eff;
  border-top: 1px solid #409eff;
}

@keyframes critical-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
