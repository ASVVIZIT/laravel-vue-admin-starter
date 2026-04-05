<template>
  <BatteryFullIcon
      :voltage="2.6"
      :critical-voltage="criticalVoltage"
      :min-voltage="minVoltage"
      :max-voltage="maxVoltage"
      :size="size"
      :icon-size="iconSize"
      :show-label="showLabel"
      status="critical"
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
