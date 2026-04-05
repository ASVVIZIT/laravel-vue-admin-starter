<template>
  <div
      class="device-card"
      :class="{ 'device-card--selected': isSelected }"
      @click="selectDevice"
  >
    <div class="device-card__header">
      <h3 class="device-card__name" :title="device.name">
        {{ device.name }}
      </h3>
      <div class="device-card__status" :class="statusClass">
        {{ statusText }}
      </div>
    </div>

    <div class="device-card__visualization">
      <div class="viz-item">
        <BulbRenderer
            :device-id="device.device_id"
            :status="device.status"
            :intensity="device.intensity ?? 0"
            :debug-mode="false"
        />
        <div class="viz-label">
          {{ bulbDisplayName }}
        </div>
      </div>
      <div class="viz-item">
        <BatteryRenderer
            :device-id="device.device_id"
            :voltage="device.voltage ?? 0"
            :critical-voltage="device.critical_voltage ?? 3.2"
            :debug-mode="false"
        />
        <div class="viz-label">
          {{ batteryDisplayName }} ({{ batteryCapacityDisplay }})
        </div>
      </div>
    </div>

    <div class="device-card__metrics">
      <div class="metric">
        <div class="metric-label">Интенсивность</div>
        <div class="metric-value" :style="{ color: intensityColor }">
          {{ intensityDisplay }}%
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">Напряжение</div>
        <div class="metric-value" :style="{ color: voltageColor }">
          {{ (device.voltage ?? 0).toFixed(1) }}В
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">Время ост.</div>
        <div class="metric-value" :style="{ color: runtimeColor }">
          {{ deviceRuntime }}
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">Ток потреб.</div>
        <div class="metric-value">
          {{ deviceCurrent }}мА
        </div>
      </div>
    </div>

    <div class="device-card__controls">
      <el-tooltip content="Питание" placement="top">
        <el-button
            size="small"
            :type="powerButtonType"
            @click.stop="handlePowerClick"
        >
          ⚡
        </el-button>
      </el-tooltip>
      <el-tooltip :content="sleepButtonText" placement="top">
        <el-button
            size="small"
            :type="sleepButtonType"
            @click.stop="handleSleepClick"
        >
          <el-icon>
            <component :is="sleepButtonIcon" />
          </el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip :content="is3DMode ? '2D' : '3D'" placement="top">
        <el-button
            size="small"
            :type="is3DMode ? 'success' : 'info'"
            @click.stop="toggle3DMode"
        >
          🌐
        </el-button>
      </el-tooltip>
      <el-tooltip content="Настройки" placement="top">
        <el-button
            size="small"
            @click.stop="openSettings"
        >
          ⚙️
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  Grid,
  Menu,
  Setting,
  Switch,
  Moon,
  Sunny
} from '@element-plus/icons-vue';
import {
  useDeviceStore,
  useInterfaceStore,
  useTypesStore
} from '@/components/SmartLight/stores/index.js';
import { PowerManagementController } from '@/components/SmartLight/controllers/PowerManagementController.js';
import {
  calculateBatteryColor,
  calculateBatteryCriticalProgress
} from '@/components/SmartLight/utils/appDeviceUtils.js';
import BulbRenderer from '../visualization/renderers/BulbRenderer.vue';
import BatteryRenderer from '../visualization/renderers/BatteryRenderer.vue';

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
});

const emit = defineEmits([
  'select',
  'open-settings',
  'sleep-click',
  'wake-click',
  'power-click'
]);

// === STORES ===
const deviceStore = useDeviceStore();
const interfaceStore = useInterfaceStore();
const typesStore = useTypesStore();
const powerController = new PowerManagementController();

// === COMPUTED ===
const is3DMode = computed(() =>
    interfaceStore.getDevice3DModeStore(props.device.device_id)
);

const selectedDevice = computed(() => deviceStore.selectedDevice);

const isSelected = computed(() =>
    selectedDevice.value?.device_id === props.device.device_id
);

const statusClass = computed(() => ({
  'status--on': props.device.status === 'ON',
  'status--off': props.device.status === 'OFF',
  'status--sleeping': props.device.status === 'SLEEPING',
  'status--error': props.device.status === 'ERROR'
}));

const statusText = computed(() => ({
  ON: 'Вкл',
  OFF: 'Выкл',
  SLEEPING: 'Сон',
  ERROR: 'Ошб'
}[props.device.status] || 'N/A'));

const bulbDisplayName = computed(() => {
  if (props.device.bulb_type?.name) {
    return props.device.bulb_type.name;
  }
  if (props.device.bulb_type?.short_name) {
    return props.device.bulb_type.short_name;
  }
  const fromStore = typesStore.getBulbTypeByIdStore(props.device.bulb_type_id);
  if (fromStore?.name) {
    return fromStore.name;
  }
  if (fromStore?.short_name) {
    return fromStore.short_name;
  }
  return props.device.bulb_type_id || 'N/A';
});

const batteryDisplayName = computed(() => {
  if (props.device.battery_type?.name) {
    return props.device.battery_type.name;
  }
  if (props.device.battery_type?.short_name) {
    return props.device.battery_type.short_name;
  }
  const fromStore = typesStore.getBatteryTypeByIdStore(props.device.battery_type_id);
  if (fromStore?.name) {
    return fromStore.name;
  }
  if (fromStore?.short_name) {
    return fromStore.short_name;
  }
  return props.device.battery_type_id || 'N/A';
});

const batteryCapacityDisplay = computed(() => {
  const cap = props.device.capacity || props.device.battery_capacity;
  if (!cap) {
    return 'N/A';
  }
  return cap >= 1000
      ? `${(cap / 1000).toFixed(1)}Ач`
      : `${Math.round(cap)}мАч`;
});

const intensityDisplay = computed(() => {
  const v = props.device.intensity;
  return (v != null && !isNaN(v)) ? Math.round(v) : 0;
});

const intensityColor = computed(() =>
    intensityDisplay.value > 50 ? '#409eff' : '#909399'
);

const voltageColor = computed(() =>
    calculateBatteryColor(props.device)
);

const runtimeColor = computed(() => {
  const p = calculateBatteryCriticalProgress(props.device);
  return p > 70
      ? '#f56c6c'
      : p > 40
          ? '#e6a23c'
          : '#67c23a';
});

const deviceRuntime = computed(() => {
  if (!props.device) {
    return 'N/A';
  }
  const r = powerController.getDeviceRuntimeController(props.device.device_id);
  return typeof r === 'string'
      ? r
      : r?.runtimeText || 'N/A';
});

const deviceCurrent = computed(() => {
  const c = props.device.power_config?.custom_consumption_mA
      || props.device.power_config?.base_consumption_mA;
  return c ? Math.round(c) : 0;
});

const powerButtonType = computed(() =>
    props.device.status === 'ON' ? 'success' : 'info'
);

const sleepButtonType = computed(() =>
    props.device.status === 'SLEEPING' ? 'warning' : 'info'
);

const sleepButtonIcon = computed(() =>
    props.device.status === 'SLEEPING' ? Sunny : Moon
);

const sleepButtonText = computed(() =>
    props.device.status === 'SLEEPING' ? 'Пробудить' : 'Сон'
);

// === ЛОГИРОВАНИЕ: единая функция для всех действий ===
const logAction = (message, extraData = {}) => {
  const intensity = props.device?.intensity
      ?? props.device?.power_config?.intensity
      ?? 0;

  const safeIntensity = Number.isFinite(intensity)
      ? Math.round(intensity)
      : 0;

  interfaceStore.addLog?.({
    level: 'info',
    component: 'DeviceCard',
    message: message,
    data: {
      deviceId: props.device?.device_id,
      deviceName: props.device?.name,
      status: props.device?.status,
      intensity: safeIntensity,
      voltage: props.device?.voltage,
      ...extraData
    }
  });
};

// === ОБРАБОТЧИКИ СОБЫТИЙ ===

const selectDevice = () => {
  logAction('Выбрано устройство', {
    action: 'device_selected'
  });
  deviceStore.selectDeviceStore(props.device.device_id);
  emit('select', props.device);
};

const handlePowerClick = () => {
  const newStatus = props.device.status === 'ON' ? 'OFF' : 'ON';

  logAction(`Питание: ${newStatus === 'ON' ? 'ВКЛ' : 'ВЫКЛ'}`, {
    action: 'power_toggle',
    newStatus: newStatus
  });

  emit('power-click', props.device);
};

const handleSleepClick = () => {
  const action = props.device.status === 'SLEEPING' ? 'wake' : 'sleep';
  const message = action === 'wake'
      ? 'Пробудить устройство'
      : 'Перевести в сон';

  logAction(message, {
    action: `${action}_click`,
    fromStatus: props.device.status
  });

  emit(
      action === 'wake' ? 'wake-click' : 'sleep-click',
      props.device
  );
};

const toggle3DMode = () => {
  const newMode = !is3DMode.value;

  logAction(`3D режим: ${newMode ? 'ВКЛ' : 'ВЫКЛ'}`, {
    action: 'toggle_3d',
    newMode: newMode ? '3d' : 'svg'
  });

  interfaceStore.toggleDevice3DMode?.(props.device.device_id);
};

const openSettings = () => {
  logAction('Открыты настройки устройства', {
    action: 'open_settings'
  });
  emit('open-settings', props.device);
};
</script>

<style scoped>
.device-card {
  width: 200px;
  height: 200px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  background: #fff;
  border: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
}

.device-card--selected {
  border-color: #409eff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.4);
}

.device-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 5px;
  background: #f5f7fa;
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

.status--on {
  background: #f0f9ec;
  color: #67c23a;
}

.status--off {
  background: #f5f7fa;
  color: #909399;
}

.status--sleeping {
  background: #fdf6ec;
  color: #e6a23c;
}

.status--error {
  background: #fef0f0;
  color: #f56c6c;
}

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
