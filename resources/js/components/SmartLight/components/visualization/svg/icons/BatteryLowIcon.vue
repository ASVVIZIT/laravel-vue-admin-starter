<template>
  <BatteryFullIcon
      :voltage="2.8"
      :critical-voltage="criticalVoltage"
      :min-voltage="minVoltage"
      :max-voltage="maxVoltage"
      :size="size"
      :icon-size="iconSize"
      :show-label="showLabel"
      status="low"
  />
</template>

<script setup>
import BatteryFullIcon from './BatteryFullIcon.vue';

const props = defineProps({
  criticalVoltage: { type: Number, default: 3.2 },
  minVoltage: { type: Number, default: 2.5 },
  maxVoltage: { type: Number, default: 4.2 },
  size: { type: String, default: '32px' },
  iconSize: { type: Number, default: 24 },
  showLabel: { type: Boolean, default: true }
});
</script>

<style scoped>
.battery-low-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.battery-base-svg) {
  width: 100%;
  height: 100%;
}

:deep(.battery-fill) {
  background: linear-gradient(90deg, #e6a23c 0%, #f56c6c 100%) !important;
}

.low-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border: 2px solid;
  border-radius: 50%;
  animation: low-pulse 1s infinite;
}

@keyframes low-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}
</style>
