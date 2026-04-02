<template>
  <div class="power-monitoring">
    <h3 class="section-title">Мониторинг</h3>

    <div v-if="!selectedDevice" class="no-device">
      <i class="el-icon-connection"></i>
      <p>Выберите устройство</p>
    </div>

    <div v-else class="monitoring-content">
      <!-- Напряжение -->
      <div class="metric-card">
        <div class="metric-header">
          <i class="el-icon-connection"></i>
          <span class="metric-title">Напряжение</span>
        </div>
        <div class="metric-value" :style="{ color: voltageColor }">
          {{ selectedDevice.voltage?.toFixed(2) || '0.00' }} В
        </div>
        <el-progress
            :percentage="voltagePercentage"
            :color="voltageColor"
            :show-text="false"
            :stroke-width="8"
        />
      </div>

      <!-- Интенсивность -->
      <div class="metric-card">
        <div class="metric-header">
          <i class="el-icon-light-rain"></i>
          <span class="metric-title">Интенсивность</span>
        </div>
        <div class="metric-value">{{ selectedDevice.intensity || 0 }}%</div>
        <el-slider
            v-model="intensity"
            :min="0"
            :max="100"
            @change="updateIntensity"
            :disabled="selectedDevice.status === 'OFF'"
        />
      </div>

      <!-- Тип батареи -->
      <div class="metric-card">
        <div class="metric-header">
          <i class="el-icon-battery-full"></i>
          <span class="metric-title">Батарея</span>
        </div>
        <div class="metric-value">{{ batteryType?.name || 'N/A' }}</div>
        <div class="metric-subtitle">{{ batteryType?.chemistry || 'N/A' }}</div>
      </div>

      <!-- Время работы -->
      <div class="metric-card">
        <div class="metric-header">
          <i class="el-icon-time"></i>
          <span class="metric-title">Время работы</span>
        </div>
        <div class="metric-value">{{ deviceRuntime }}</div>
        <div class="metric-subtitle">Осталось</div>
      </div>

      <!-- Источник питания -->
      <div class="metric-card">
        <div class="metric-header">
          <i class="el-icon-plug"></i>
          <span class="metric-title">Питание</span>
        </div>
        <div class="metric-value">{{ powerSupply?.name || 'Стандартный' }}</div>
        <div class="metric-subtitle">{{ powerSupply?.category || 'standard' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useSmartlightStore } from '@components/SmartLight/stores/index.js';
import {
  calculateBatteryNormalProgress,
  calculateBatteryCriticalProgress,
  calculateBatteryColor,
  calculateDeviceRuntime
} from '@components/SmartLight/utils/appDeviceUtils.js';

const store = useSmartlightStore();

const selectedDevice = computed(() => store.selectedDevice?.value || store.selectedDevice);

const batteryType = computed(() => {
  if (!selectedDevice.value) return null;
  return store.typesGetBatteryTypeById(selectedDevice.value.battery_type_id);
});

const powerSupply = computed(() => {
  if (!selectedDevice.value) return null;
  return store.typesGetPowerSupplyById(selectedDevice.value.power_supply_id || 'standard');
});

const voltagePercentage = computed(() => {
  if (!selectedDevice.value) return 0;
  const normal = calculateBatteryNormalProgress(selectedDevice.value) || 0;
  const critical = calculateBatteryCriticalProgress(selectedDevice.value) || 0;
  return Math.min(100, normal + critical);
});

const voltageColor = computed(() => {
  if (!selectedDevice.value) return '#67c23a';
  return calculateBatteryColor(selectedDevice.value);
});

const intensity = ref(0);
watch(() => selectedDevice.value?.intensity, (val) => {
  if (val !== undefined) intensity.value = val;
}, { immediate: true });

const deviceRuntime = computed(() => {
  if (!selectedDevice.value) return 'N/A';
  return calculateDeviceRuntime(selectedDevice.value);
});

const updateIntensity = (newIntensity) => {
  if (selectedDevice.value) {
    store.deviceUpdateDeviceIntensity(selectedDevice.value.device_id, newIntensity);
  }
};
</script>

<style scoped>
.power-monitoring {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.no-device {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.no-device i {
  font-size: 48px;
  margin-bottom: 10px;
}

.monitoring-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
}

.metric-card {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e4e7ed;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.metric-header i {
  color: #409EFF;
  font-size: 16px;
}

.metric-title {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.metric-subtitle {
  font-size: 12px;
  color: #909399;
}

:deep(.el-slider) {
  margin: 10px 0;
}
</style>
