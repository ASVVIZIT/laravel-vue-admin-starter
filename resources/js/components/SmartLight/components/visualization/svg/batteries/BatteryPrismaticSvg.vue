<template>
  <div class="battery-prismatic-svg">
    <BatteryFullIcon
        :voltage="voltage"
        :critical-voltage="criticalVoltage"
        :min-voltage="minVoltage"
        :max-voltage="maxVoltage"
        size="40px"
        :icon-size="28"
        :show-label="false"
        :show-status-badge="false"
        status="normal"
    />
    <div class="battery-info">
      <span class="battery-type-label">Li-Po</span>
      <span class="battery-value">{{ voltage }}В</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BatteryFullIcon from '@/components/SmartLight/components/visualization/svg/icons/BatteryFullIcon.vue';

const props = defineProps({
  voltage: { type: Number, default: 3.7 },
  criticalVoltage: { type: Number, default: 3.2 },
  minVoltage: { type: Number, default: 3.0 },
  maxVoltage: { type: Number, default: 4.2 }
});
</script>

<style scoped>
.battery-prismatic-svg {
  width: 100px;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.battery-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.battery-type-label {
  font-size: 9px;
  font-weight: 600;
  color: #606266;
}

.battery-value {
  font-size: 8px;
  color: #909399;
  font-weight: 500;
}
</style>
