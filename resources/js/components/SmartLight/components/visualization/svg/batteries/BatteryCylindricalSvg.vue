<template>
  <BaseBattery
      :device-id="deviceId"
      :voltage="voltage"
      :critical-voltage="criticalVoltage"
      :height="height"
  />
</template>

<script setup>
import BaseBattery from './BaseBattery.vue';

const props = defineProps({
  deviceId: {
    type: String,
    required: true
  },
  voltage: {
    type: Number,
    default: 3.7
  },
  criticalVoltage: {
    type: Number,
    default: 3.2
  },
  height: {
    type: String,
    default: '40px'
  }
});
</script>

<style scoped>
/* Специфичные стили для цилиндрического аккумулятора */
.battery-container {
  border-radius: 12px;
}

.battery {
  border-radius: 12px;
}

.battery-cap {
  border-radius: 0 0 0 1px;
}
</style>
