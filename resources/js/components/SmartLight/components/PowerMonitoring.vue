<template>
  <div class="power-monitoring">
    <div class="power-header">
      <h3>Мониторинг питания</h3>
      <el-select v-model="selectedDeviceId" @change="handleDeviceChange" size="small">
        <el-option
            v-for="device in realDevices"
            :key="device.device_id"
            :label="device.name"
            :value="device.device_id"
        />
      </el-select>
    </div>

    <div class="power-metrics" v-if="selectedDevice">
      <div class="metric-card">
        <div class="metric-title">Напряжение</div>
        <div class="metric-value">{{ selectedDevice.voltage.toFixed(2) }} В</div>
        <div class="metric-progress">
          <el-progress
              :percentage="voltagePercentage"
              :color="voltageColor"
              :show-text="false"
          />
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-title">Интенсивность</div>
        <div class="metric-value">{{ selectedDevice.intensity }}%</div>
        <div class="metric-progress">
          <el-slider v-model="intensity" @change="updateIntensity" :min="minIntensity" :max="maxIntensity" />
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-title">Тип батареи</div>
        <div class="metric-value">{{ batteryType.name }}</div>
        <div class="metric-subtitle">{{ batteryType.chemistry }}</div>
      </div>

      <div class="metric-card">
        <div class="metric-title">Время работы</div>
        <div class="metric-value">{{ deviceRuntime }}</div>
        <div class="metric-subtitle">Оценка оставшегося времени</div>
      </div>

      <div class="metric-card">
        <div class="metric-title">Текущий источник питания</div>
        <div class="metric-value">{{ powerSupply.name }}</div>
        <div class="metric-subtitle">{{ powerSupply.category }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useSmartlightStore } from '@/components/SmartLight/stores';
import {
  calculateMinVoltage,
  calculateMaxVoltage,
  calculateCriticalVoltage,
  calculateBatteryNormalProgress,
  calculateBatteryCriticalProgress,
  calculateBatteryColor,
  calculateCriticalColor,
  calculateDeviceRuntime,
  calculateSafeIntensityRange
} from '@/components/SmartLight/utils/deviceUtils';
import { calculateControllerRuntime } from '@/components/SmartLight/utils/powerUtils';

const store = useSmartlightStore();
const selectedDeviceId = ref(null);

// Вычисляемые свойства
const selectedDevice = computed(() => {
  if (!selectedDeviceId.value) return null;
  return store.deviceGetDevice(selectedDeviceId.value);
});

const batteryType = computed(() => {
  if (!selectedDevice.value) return { name: 'N/A', chemistry: 'N/A' };
  return store.typesGetBatteryTypeById(selectedDevice.value.battery_type_id);
});

const powerSupply = computed(() => {
  if (!selectedDevice.value) return { name: 'N/A', category: 'N/A' };
  return store.typesGetPowerSupplyById(selectedDevice.value.power_supply_id || 'standard');
});

const voltagePercentage = computed(() => {
  if (!selectedDevice.value) return 0;

  const normalProgress = calculateBatteryNormalProgress(selectedDevice.value);
  const criticalProgress = calculateBatteryCriticalProgress(selectedDevice.value);

  return normalProgress + criticalProgress;
});

const voltageColor = computed(() => {
  if (!selectedDevice.value) return '#67c23a';
  return calculateBatteryColor(selectedDevice.value);
});

const intensity = computed({
  get: () => selectedDevice.value ? selectedDevice.value.intensity : 0,
  set: (value) => {
    if (selectedDevice.value) {
      store.deviceUpdateDeviceIntensity(selectedDevice.value.device_id, value);
    }
  }
});

const minIntensity = computed(() => {
  if (!selectedDevice.value) return 0;
  const range = calculateSafeIntensityRange(selectedDevice.value);
  return range.min;
});

const maxIntensity = computed(() => {
  if (!selectedDevice.value) return 100;
  const range = calculateSafeIntensityRange(selectedDevice.value);
  return range.max;
});

const deviceRuntime = computed(() => {
  if (!selectedDevice.value) return 'N/A';
  return calculateDeviceRuntime(selectedDevice.value);
});

// Методы
const handleDeviceChange = (deviceId) => {
  selectedDeviceId.value = deviceId;
};

const updateIntensity = (newIntensity) => {
  if (selectedDevice.value) {
    store.deviceUpdateDeviceIntensity(selectedDevice.value.device_id, newIntensity);
  }
};

// Инициализация при монтировании
onMounted(() => {
  if (store.deviceRealDevices.length > 0) {
    selectedDeviceId.value = store.deviceRealDevices[0].device_id;
  }

  // Наблюдение за изменениями в сторе
  watch(
      () => store.deviceRealDevices,
      (newDevices) => {
        if (newDevices.length > 0 && !selectedDeviceId.value) {
          selectedDeviceId.value = newDevices[0].device_id;
        }
      }
  );
});
</script>

<style scoped>
.power-monitoring {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.power-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.power-metrics {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
}

@media (max-width: 1200px) {
  .power-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .power-metrics {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .power-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .power-metrics {
    grid-template-columns: 1fr;
  }
}

.metric-card {
  background-color: #fff;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.metric-card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.metric-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.metric-subtitle {
  font-size: 13px;
  color: #909399;
  margin-top: 5px;
}

.metric-progress {
  margin-top: 10px;
}
</style>
