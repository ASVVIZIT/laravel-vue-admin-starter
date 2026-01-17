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
/* Специфичные стили для аккумулятора 18650 */
.battery-container {
  height: 40px;
}

.battery {
  height: 30px;
  border-radius: 8px;
}

.battery-normal {
  border-radius: 8px;
}

.battery-critical {
  border-radius: 8px;
}

.battery-cap {
  width: 2px;
  height: 6px;
  background: #409eff;
  border-radius: 2px;
  top: -2px;
  right: -2px;
}

.battery-plus {
  width: 10px;
  height: 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  left: -15px;
}

.battery-minus {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  font-size: 0.7rem;
  right: -15px;
}

.battery-levels {
  font-size: 0.65rem;
}
</style>
