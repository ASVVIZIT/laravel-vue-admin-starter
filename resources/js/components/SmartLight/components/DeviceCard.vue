<template>
  <div class="device-card" :class="{ 'device-card--selected': isSelected }" @click="selectDevice">
    <div class="device-card__header">
      <h3 class="device-card__name">{{ device.name }}</h3>
      <div class="device-card__status" :class="statusClass">
        {{ statusText }}
      </div>
    </div>

    <div class="device-card__content">
      <!-- Отображение батареи -->
      <battery-renderer
          :device="device"
          :battery-type="batteryType"
          :is-3d="is3DMode"
      />

      <!-- Отображение лампы -->
      <bulb-renderer
          :device="device"
          :bulb-type="bulbType"
          :is-3d="is3DMode"
      />

      <div class="device-card__metrics">
        <div class="metric">
          <div class="metric-label">Напряжение</div>
          <div class="metric-value" :style="{ color: voltageColor }">
            {{ device.voltage.toFixed(2) }} В
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">Интенсивность</div>
          <div class="metric-value" :style="{ color: intensityColor }">
            {{ device.intensity }}%
          </div>
        </div>

        <div class="metric">
          <div class="metric-label">Время работы</div>
          <div class="metric-value" :style="{ color: runtimeColor }">
            {{ deviceRuntime }}
          </div>
        </div>
      </div>

      <div class="device-card__controls">
        <el-button
            size="small"
            :type="sleepButton.type"
            @click.stop="toggleSleep"
        >
          {{ sleepButton.text }}
        </el-button>

        <el-button
            size="small"
            icon="el-icon-setting"
            @click.stop="openSettings"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useSmartlightStore } from '@/components/SmartLight/stores';
import {
  calculateBatteryColor,
  calculateBatteryCriticalProgress,
  calculateDeviceRuntime,
  calculateSafeIntensityRange
} from '@/components/SmartLight/utils/deviceUtils';

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['select']);

const store = useSmartlightStore();
const is3DMode = computed(() => store.deviceGetDevice3DMode(props.device.device_id));
const selectedDevice = computed(() => store.deviceSelectedDevice);
const isSelected = computed(() => {
  return selectedDevice.value && selectedDevice.value.device_id === props.device.device_id;
});

// Вычисляемые свойства
const batteryType = computed(() => {
  return store.typesGetBatteryTypeById(props.device.battery_type_id);
});

const bulbType = computed(() => {
  return store.typesGetBulbTypeById(props.device.bulb_type_id);
});

const statusClass = computed(() => {
  return {
    'status--on': props.device.status === 'ON',
    'status--off': props.device.status === 'OFF',
    'status--sleeping': props.device.status === 'SLEEPING',
    'status--error': props.device.status === 'ERROR'
  };
});

const statusText = computed(() => {
  switch (props.device.status) {
    case 'ON': return 'Включено';
    case 'OFF': return 'Выключено';
    case 'SLEEPING': return 'Спит';
    case 'ERROR': return 'Ошибка';
    default: return 'Неизвестно';
  }
});

const voltageColor = computed(() => {
  return calculateBatteryColor(props.device);
});

const intensityColor = computed(() => {
  return props.device.intensity > 50 ? '#409eff' : '#909399';
});

const runtimeColor = computed(() => {
  const progress = calculateBatteryCriticalProgress(props.device);
  if (progress > 70) return '#f56c6c';
  if (progress > 40) return '#e6a23c';
  return '#67c23a';
});

const deviceRuntime = computed(() => {
  return calculateDeviceRuntime(props.device);
});

const sleepButton = computed(() => {
  return props.device.status === 'SLEEPING'
      ? { text: 'Пробудить', type: 'success' }
      : { text: 'Спящий режим', type: 'info' };
});

// Методы
const selectDevice = () => {
  store.deviceSelectDevice(props.device.device_id);
  emit('select', props.device);
};

const toggleSleep = () => {
  if (props.device.status === 'SLEEPING') {
    store.deviceWakeDevice(props.device.device_id);
  } else {
    store.deviceForceSleep(props.device.device_id);
  }
};

const openSettings = () => {
  // Открываем панель настроек
  store.interfaceSetGlobalSettingsVisible(true);
};
</script>

<style scoped>
.device-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #ebeef5;
}

.device-card--selected {
  border-color: #409eff;
  box-shadow: 0 0 10px 0 #409eff;
}

.device-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.device-card__name {
  font-size: 16px;
  margin: 0;
  font-weight: 500;
  color: #303133;
}

.device-card__status {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status--on {
  background-color: #f0f9ec;
  color: #67c23a;
}

.status--off {
  background-color: #f5f7fa;
  color: #909399;
}

.status--sleeping {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.status--error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.device-card__content {
  padding: 15px;
}

.device-card__metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 15px;
  border-top: 1px dashed #ebeef5;
  padding-top: 10px;
}

.metric {
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: #909399;
}

.metric-value {
  font-size: 16px;
  font-weight: bold;
  margin-top: 3px;
}

.device-card__controls {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
}
</style>
