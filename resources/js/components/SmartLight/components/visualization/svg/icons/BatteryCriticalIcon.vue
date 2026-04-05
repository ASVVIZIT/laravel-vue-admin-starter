<template>
  <BatteryFullIcon
      :voltage="displayVoltage"
      :critical-voltage="criticalVoltage"
      :min-voltage="minVoltage"
      :max-voltage="maxVoltage"
      :size="size"
      :icon-size="iconSize"
      :show-label="showLabel"
      status="charging"
  />
</template>

<script setup>
import { computed } from 'vue';
import BatteryFullIcon from './BatteryFullIcon.vue';

const props = defineProps({
  voltage: { type: Number, default: 4.0 },
  criticalVoltage: { type: Number, default: 3.2 },
  minVoltage: { type: Number, default: 2.5 },
  maxVoltage: { type: Number, default: 4.2 },
  size: { type: String, default: '32px' },
  iconSize: { type: Number, default: 24 },
  showLabel: { type: Boolean, default: true },
  chargingProgress: { type: Number, default: 50 }
});

const displayVoltage = computed(() => {
  // Имитация напряжения во время зарядки
  return props.minVoltage + (props.chargingProgress / 100) * (props.maxVoltage - props.minVoltage);
});
</script>
