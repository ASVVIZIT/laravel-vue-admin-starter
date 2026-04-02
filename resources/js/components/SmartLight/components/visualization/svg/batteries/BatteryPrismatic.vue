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
/* Специфичные стили для призматического аккумулятора */
.battery-container {
  height: 50px;
}

.battery {
  height: 40px;
  border-radius: 4px;
}

.battery-normal {
  border-radius: 4px 0 0 4px;
}

.battery-critical {
  border-radius: 4px 0 0 4px;
}
</style>
