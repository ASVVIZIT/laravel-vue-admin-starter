<template>
  <div class="debug-panel">
    <el-card class="debug-card">
      <template #header>
        <div class="debug-header">
          <h3>
            <el-icon name="bug" class="mr-1" />
            Отладка
          </h3>
          <el-tag type="warning">Тест</el-tag>
        </div>
      </template>

      <div v-if="selectedDevice" class="debug-content">
        <div class="device-info">
          <div class="device-name">
            <h4>{{ selectedDevice.name }}</h4>
            <el-tag :type="statusType" size="small">
              {{ selectedDevice.status }}
            </el-tag>
          </div>
          <div class="device-id">
            <small>{{ selectedDevice.device_id }}</small>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">Статус</label>
          <el-radio-group v-model="deviceStatus" @change="updateStatus">
            <el-radio-button label="ON" size="mini">
              <el-icon name="light-on" class="mr-1" />
              Вкл
            </el-radio-button>
            <el-radio-button label="OFF" size="mini">
              <el-icon name="light-off" class="mr-1" />
              Выкл
            </el-radio-button>
            <el-radio-button label="SLEEPING" size="mini">
              <el-icon name="moon" class="mr-1" />
              Сон
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="control-group">
          <label class="control-label">Напряжение ({{ deviceVoltage.toFixed(2) }} В)</label>
          <BatterySlider
              v-model="deviceVoltage"
              :min="2.5"
              :max="4.3"
              :step="0.01"
              :critical-threshold="selectedDevice.critical_voltage"
          />
        </div>

        <div class="control-group">
          <label class="control-label">Интенсивность</label>
          <el-slider
              v-model="deviceIntensity"
              :min="0"
              :max="100"
              :disabled="deviceStatus !== 'ON'"
              class="intensity-slider"
          />
        </div>

        <!-- Только для фейковых устройств -->
        <div v-if="selectedDevice.is_fake" class="control-group">
          <label class="control-label">Крит. напряжение</label>
          <el-slider
              v-model="criticalVoltage"
              :min="2.5"
              :max="4.3"
              :step="0.01"
              :format-tooltip="formatVoltageTooltip"
              class="critical-slider"
          />
        </div>

        <div class="control-group">
          <label class="control-label">Эмуляция</label>
          <div class="event-buttons">
            <el-button size="small" @click="simulateLowVoltage" class="full-width">
              <el-icon name="warning" class="mr-1" />
              Напряжение
            </el-button>
            <el-button size="small" @click="simulateEmergency" class="full-width">
              <el-icon name="bell" class="mr-1" />
              Авария
            </el-button>
            <el-button size="small" @click="simulateCommand" class="full-width">
              <el-icon name="command" class="mr-1" />
              Команда
            </el-button>
          </div>
        </div>
      </div>

      <div v-else class="no-device">
        <el-empty description="Выберите устройство" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ElNotification } from 'element-plus';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import BatterySlider from '@/components/SmartLight/components/BatterySlider.vue';

const store = useSmartLightStore();
const selectedDevice = computed(() => store.selectedDevice);

// Вычисляемые свойства для выбранных устройств
const deviceStatus = computed({
  get: () => selectedDevice.value?.status || 'OFF',
  set: (value) => {
    if (selectedDevice.value) {
      store.updateDeviceStatus(selectedDevice.value.device_id, value);
    }
  }
});

const deviceVoltage = computed({
  get: () => selectedDevice.value?.voltage || 3.7,
  set: (value) => {
    if (selectedDevice.value) {
      store.updateDeviceVoltage(selectedDevice.value.device_id, value);
    }
  }
});

const deviceIntensity = computed({
  get: () => selectedDevice.value?.intensity || 100,
  set: (value) => {
    if (selectedDevice.value) {
      store.updateDeviceIntensity(selectedDevice.value.device_id, value);
    }
  }
});

const criticalVoltage = computed({
  get: () => selectedDevice.value?.critical_voltage || 3.2,
  set: (value) => {
    if (selectedDevice.value) {
      store.updateDeviceCriticalVoltage(selectedDevice.value.device_id, value);
    }
  }
});

// Вычисляем тип статуса
const statusType = computed(() => {
  if (!selectedDevice.value) return 'info';

  switch (selectedDevice.value.status) {
    case 'ON': return 'success';
    case 'OFF': return 'info';
    case 'SLEEPING': return 'warning';
    default: return 'danger';
  }
});

const formatVoltageTooltip = (value) => {
  return Number(value).toFixed(2) + ' В';
};

// Эмуляция низкого напряжения
const simulateLowVoltage = () => {
  if (selectedDevice.value) {
    const criticalVoltage = selectedDevice.value.critical_voltage;
    store.updateDeviceVoltage(
        selectedDevice.value.device_id,
        criticalVoltage - 0.1
    );

    ElNotification({
      title: 'Эмуляция',
      message: `Низкое напряжение`,
      type: 'warning',
      duration: 2000
    });
  }
};

// Эмуляция аварийного события
const simulateEmergency = () => {
  if (selectedDevice.value) {
    store.updateDeviceVoltage(
        selectedDevice.value.device_id,
        2.7
    );

    store.updateDeviceStatus(
        selectedDevice.value.device_id,
        'SLEEPING'
    );

    ElNotification({
      title: 'Эмуляция',
      message: 'Аварийное событие',
      type: 'error',
      duration: 2000
    });
  }
};

// Эмуляция отправки команды
const simulateCommand = () => {
  if (selectedDevice.value) {
    const newStatus = deviceStatus.value === 'ON' ? 'OFF' : 'ON';
    const newVoltage = newStatus === 'ON'
        ? Math.min(4.3, deviceVoltage.value + 0.05)
        : Math.max(2.5, deviceVoltage.value - 0.05);

    store.updateDeviceStatus(
        selectedDevice.value.device_id,
        newStatus
    );

    store.updateDeviceVoltage(
        selectedDevice.value.device_id,
        newVoltage
    );

    ElNotification({
      title: 'Эмуляция',
      message: `Команда "${newStatus}" отправлена`,
      type: 'success',
      duration: 2000
    });
  }
};
</script>

<style scoped>
.debug-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.debug-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;
}

.debug-content {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  flex: 1;
  overflow-y: auto;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f5f7fa;
}

.device-name {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.device-id {
  font-size: 0.75rem;
  color: #909399;
  margin-left: 1.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.control-label {
  font-size: 0.8rem;
  color: #606266;
  margin-bottom: 0.15rem;
}

.intensity-slider {
  width: 100%;
}

.critical-slider {
  width: 100%;
}

.event-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.full-width {
  width: 100%;
}

.no-device {
  padding: 1.5rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 0.85rem;
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

:deep(.el-radio-button__inner) {
  padding: 0.3rem;
  width: auto;
  min-width: 65px;
  font-size: 0.75rem;
  height: 1.2rem;
  line-height: 1.2rem;
}

:deep(.el-slider__runway) {
  height: 2px;
  margin: 2px 0;
}

:deep(.el-slider__button) {
  width: 10px;
  height: 10px;
}

:deep(.el-button) {
  padding: 4px 8px;
  height: 1.6rem;
  font-size: 0.8rem;
}
</style>
