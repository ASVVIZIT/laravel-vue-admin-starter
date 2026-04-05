<template>
  <div class="battery-cylindrical-svg">
    <svg viewBox="0 0 80 140" class="battery-svg">
      <!-- Корпус -->
      <rect x="15" y="15" width="50" height="110" rx="8" class="battery-body" />

      <!-- Заполнение -->
      <rect
          x="18"
          :y="122 - fillHeight"
          width="44"
          :height="fillHeight"
          rx="5"
          class="battery-fill"
          :style="{ fill: fillColor }"
      />

      <!-- Крышка -->
      <ellipse cx="40" cy="15" rx="25" ry="8" class="battery-top" />
      <rect x="35" y="8" width="10" height="7" class="battery-cap" />

      <!-- Дно -->
      <ellipse cx="40" cy="125" rx="25" ry="8" class="battery-bottom" />

      <!-- Уровень -->
      <text x="40" y="138" class="battery-text">{{ voltage }}В ({{ fillPercentage.toFixed(0) }}%)</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  voltage: { type: Number, default: 3.7 },
  minVoltage: { type: Number, default: 2.5 },
  maxVoltage: { type: Number, default: 4.2 }
});

const fillPercentage = computed(() => {
  return Math.min(100, Math.max(0, ((props.voltage - props.minVoltage) / (props.maxVoltage - props.minVoltage)) * 100));
});

const fillHeight = computed(() => {
  return (fillPercentage.value / 100) * 104;
});

const fillColor = computed(() => {
  if (props.voltage < 2.8) return '#f56c6c';
  if (props.voltage < 3.2) return '#e6a23c';
  return '#67c23a';
});
</script>

<style scoped>
.battery-cylindrical-svg {
  width: 80px;
  height: 140px;
}

.battery-svg {
  width: 100%;
  height: 100%;
}

.battery-body {
  fill: #f0f0f0;
  stroke: #d0d0d0;
  stroke-width: 1;
}

.battery-fill {
  transition: height 0.3s ease, fill 0.3s ease;
}

.battery-top {
  fill: #e0e0e0;
  stroke: #d0d0d0;
}

.battery-cap {
  fill: #409eff;
}

.battery-bottom {
  fill: #c0c0c0;
  stroke: #d0d0d0;
}

.battery-text {
  font-size: 11px;
  fill: #606266;
  text-anchor: middle;
}
</style>
