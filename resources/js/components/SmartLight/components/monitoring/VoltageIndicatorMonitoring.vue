<template>
  <div class="voltage-indicator" :class="{ 'critical': isCritical }">
    <div class="voltage-value">{{ voltage }} В</div>
    <div class="voltage-bar">
      <div class="voltage-fill" :style="{ height: `${progress}%` }"></div>
      <div class="voltage-mark critical" :style="{ top: `${criticalPosition}%` }"></div>
      <div class="voltage-mark min" :style="{ top: `${minPosition}%` }"></div>
      <div class="voltage-mark max" :style="{ top: `${maxPosition}%` }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  voltage: {
    type: Number,
    required: true
  },
  minVoltage: {
    type: Number,
    required: true,
    default: 2.5
  },
  maxVoltage: {
    type: Number,
    required: true,
    default: 4.3
  },
  criticalVoltage: {
    type: Number,
    required: true,
    default: 3.2
  }
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
.voltage-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.voltage-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.voltage-bar {
  position: relative;
  width: 100%;
  height: 150px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.voltage-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, #67c23a 0%, #95d97b 100%);
  transition: height 0.3s ease;
}

.voltage-mark {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #e6a23c;
  z-index: 10;
}

.voltage-mark.critical {
  background: #f56c6c;
  border: 1px dashed #f56c6c;
}

.voltage-mark.min, .voltage-mark.max {
  background: #909399;
  border: 1px solid #909399;
}
</style>
