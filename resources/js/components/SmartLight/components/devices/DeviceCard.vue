<template>
  <div class="device-card" :class="{ 'device-card--selected': isSelected }" @click="selectDevice">
    <!-- HEADER: Имя + Статус -->
    <div class="device-card__header">
      <h3 class="device-card__name">{{ device.name }}</h3>
      <div class="device-card__status" :class="statusClass">{{ statusText }}</div>
    </div>

    <!-- ВИЗУАЛИЗАЦИЯ: Лампа + АКБ -->
    <div class="device-card__visualization">
      <div class="viz-item">
        <BulbRenderer
            :device-id="device.device_id"
            :status="device.status"
            :intensity="device.intensity"
            :debug-mode="false"
        />
        <div class="viz-label">{{ bulbTypeName }}</div>
      </div>
      <div class="viz-item">
        <BatteryRenderer
            :device-id="device.device_id"
            :voltage="device.voltage"
            :critical-voltage="device.critical_voltage"
            :debug-mode="false"
        />
        <div class="viz-label">{{ batteryTypeName }} ({{ batteryCapacity }})</div>
      </div>
    </div>

    <!-- МЕТРИКИ: 4 показателя -->
    <div class="device-card__metrics">
      <div class="metric">
        <div class="metric-label">Интенсивность</div>
        <div class="metric-value" :style="{ color: intensityColor }">{{ device.intensity }}%</div>
      </div>
      <div class="metric">
        <div class="metric-label">Напряжение</div>
        <div class="metric-value" :style="{ color: voltageColor }">{{ device.voltage.toFixed(1) }}В</div>
      </div>
      <div class="metric">
        <div class="metric-label">Время ост.</div>
        <div class="metric-value" :style="{ color: runtimeColor }">{{ deviceRuntime }}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Ток потреб.</div>
        <div class="metric-value">{{ deviceCurrent }}мА</div>
      </div>
    </div>

    <!-- КНОПКИ: 4 кнопки в ряд -->
    <div class="device-card__controls">
      <!-- ВКЛ/ВЫКЛ -->
      <el-button
          size="small"
          :type="powerButtonType"
          @click.stop="handlePowerClick"
          :title="powerButtonText"
      >
        <el-icon><Switch /></el-icon>
      </el-button>

      <!-- СОН/ПРОБУДИТЬ -->
      <el-button
          size="small"
          :type="sleepButtonType"
          @click.stop="handleSleepClick"
          :title="sleepButtonText"
      >
        <el-icon><component :is="sleepButtonIcon" /></el-icon>
      </el-button>

      <!-- 3D/2D РЕЖИМ -->
      <el-button
          size="small"
          :type="is3DMode ? 'success' : 'info'"
          @click.stop="toggle3DMode"
          title="3D/2D режим"
      >
        <el-icon><Grid v-if="is3DMode" /><Menu v-else /></el-icon>
      </el-button>

      <!-- НАСТРОЙКИ -->
      <el-button
          size="small"
          @click.stop="openSettings"
          title="Настройки"
      >
        <el-icon><Setting /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Grid, Menu, Setting, Switch, Moon, Sunny } from '@element-plus/icons-vue';
import { useDeviceStore, useInterfaceStore, useTypesStore } from '@components/SmartLight/stores/index.js';
import { PowerManagementController } from '@components/SmartLight/controllers/PowerManagementController.js';
import { calculateBatteryColor, calculateBatteryCriticalProgress } from '@components/SmartLight/utils/appDeviceUtils.js';
import BulbRenderer from '../visualization/renderers/BulbRenderer.vue';
import BatteryRenderer from '../visualization/renderers/BatteryRenderer.vue';

const props = defineProps({
  device: {
    type: Object,
    required: true,
    validator: (device) => {
      const isValid = device && device.device_id && device.name;
      if (!isValid) console.warn('[DeviceCard] Invalid device prop:', device);
      return isValid;
    }
  }
});

const emit = defineEmits(['select', 'open-settings', 'sleep-click', 'wake-click', 'power-click']);

const deviceStore = useDeviceStore();
const interfaceStore = useInterfaceStore();
const typesStore = useTypesStore();
const powerController = new PowerManagementController();

const is3DMode = computed(() => interfaceStore.getDevice3DMode(props.device.device_id));
const selectedDevice = computed(() => deviceStore.selectedDevice);
const isSelected = computed(() => selectedDevice.value?.device_id === props.device.device_id);

// Статус
const statusClass = computed(() => ({
  'status--on': props.device.status === 'ON',
  'status--off': props.device.status === 'OFF',
  'status--sleeping': props.device.status === 'SLEEPING',
  'status--error': props.device.status === 'ERROR'
}));

const statusText = computed(() => ({
  'ON': 'Вкл',
  'OFF': 'Выкл',
  'SLEEPING': 'Сон',
  'ERROR': 'Ошб'
}[props.device.status] || 'N/A'));

// Типы устройств
const bulbTypeName = computed(() => {
  const type = typesStore.getBulbTypeById(props.device.bulb_type_id);
  return type?.shortName || type?.name || 'N/A';
});

const batteryTypeName = computed(() => {
  const type = typesStore.getBatteryTypeById(props.device.battery_type_id);
  return type?.shortName || type?.name || 'N/A';
});

const batteryCapacity = computed(() => {
  return props.device.capacity ? `${Math.round(props.device.capacity)}мАч` : 'N/A';
});

// Метрики
const intensityColor = computed(() => props.device.intensity > 50 ? '#409eff' : '#909399');
const voltageColor = computed(() => calculateBatteryColor(props.device));

const runtimeColor = computed(() => {
  const progress = calculateBatteryCriticalProgress(props.device);
  if (progress > 70) return '#f56c6c';
  if (progress > 40) return '#e6a23c';
  return '#67c23a';
});

const deviceRuntime = computed(() => {
  if (!props.device) return 'N/A';
  return powerController.getDeviceRuntime(props.device.device_id) || 'N/A';
});

const deviceCurrent = computed(() => {
  if (!props.device) return 0;
  const consumption = props.device.power_config?.custom_consumption_mA || props.device.power_config?.base_consumption_mA;
  return consumption ? Math.round(consumption) : 0;
});

// Кнопки
const powerButtonType = computed(() => props.device.status === 'ON' ? 'success' : 'info');
const powerButtonText = computed(() => props.device.status === 'ON' ? 'Выключить' : 'Включить');

const sleepButtonType = computed(() => props.device.status === 'SLEEPING' ? 'warning' : 'info');
const sleepButtonIcon = computed(() => props.device.status === 'SLEEPING' ? Sunny : Moon);
const sleepButtonText = computed(() => props.device.status === 'SLEEPING' ? 'Пробудить' : 'Сон');

// Действия
const selectDevice = () => {
  deviceStore.selectDevice(props.device.device_id);
  emit('select', props.device);
};

const handlePowerClick = () => {
  emit('power-click', props.device);
};

const handleSleepClick = () => {
  if (props.device.status === 'SLEEPING') {
    emit('wake-click', props.device);
  } else {
    emit('sleep-click', props.device);
  }
};

const toggle3DMode = () => {
  interfaceStore.toggleDevice3DMode(props.device.device_id);
};

const openSettings = () => {
  emit('open-settings', props.device);
};
</script>

<style scoped>
.device-card {
  width: 200px;
  height: 200px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
}

.device-card--selected {
  border-color: #409eff;
  box-shadow: 0 0 8px 0 rgba(64, 158, 255, 0.4);
}

/* HEADER */
.device-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 5px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.device-card__name {
  font-size: 10px;
  margin: 0;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
}

.device-card__status {
  padding: 1px 3px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 600;
  flex-shrink: 0;
}

.status--on { background-color: #f0f9ec; color: #67c23a; }
.status--off { background-color: #f5f7fa; color: #909399; }
.status--sleeping { background-color: #fdf6ec; color: #e6a23c; }
.status--error { background-color: #fef0f0; color: #f56c6c; }

/* ВИЗУАЛИЗАЦИЯ */
.device-card__visualization {
  display: flex;
  gap: 3px;
  justify-content: center;
  align-items: flex-start;
  padding: 3px 4px;
  border-bottom: 1px dashed #ebeef5;
  flex-shrink: 0;
}

.viz-item {
  flex: 0 0 50%;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.viz-label {
  font-size: 7px;
  color: #606266;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  font-weight: 500;
}

/* МЕТРИКИ */
.device-card__metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  padding: 3px 4px;
  flex-shrink: 0;
}

.metric {
  text-align: center;
}

.metric-label {
  font-size: 6px;
  color: #909399;
  white-space: nowrap;
}

.metric-value {
  font-size: 8px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  margin-top: 1px;
}

/* КНОПКИ */
.device-card__controls {
  display: flex;
  justify-content: space-between;
  gap: 2px;
  padding: 3px 4px;
  border-top: 1px dashed #ebeef5;
  flex-shrink: 0;
  margin-top: auto;
}

.device-card__controls .el-button {
  flex: 1;
  font-size: 9px;
  padding: 3px 2px;
  min-width: auto;
  height: 22px;
}

:deep(.el-button .el-icon) {
  font-size: 11px;
}
</style>
