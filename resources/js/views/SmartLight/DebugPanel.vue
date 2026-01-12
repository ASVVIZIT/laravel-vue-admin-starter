<template>
  <div class="debug-panel">
    <el-card class="debug-card">
      <template #header>
        <div class="debug-header">
          <h3>
            <Handbag class="header-icon" />
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
              <CircleCheckFilled class="status-icon" v-if="selectedDevice.status === 'ON'" />
              <CircleClose class="status-icon" v-else-if="selectedDevice.status === 'OFF'" />
              <Moon class="status-icon" v-else />
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
              <CircleCheckFilled class="control-icon" />
              Вкл
            </el-radio-button>
            <el-radio-button label="OFF" size="mini">
              <CircleClose class="control-icon" />
              Выкл
            </el-radio-button>
            <el-radio-button label="SLEEPING" size="mini">
              <Moon class="control-icon" />
              Сон
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="control-group">
          <label class="control-label">Напряжение</label>
          <div class="voltage-control">
            <div class="battery-visualization">
              <div class="battery-container">
                <div class="battery">
                  <div
                      class="battery-normal"
                      :style="{ width: batteryNormalProgress + '%' }"
                  ></div>
                  <div
                      class="battery-critical"
                      :style="{ width: batteryCriticalProgress + '%', backgroundColor: criticalColor }"
                  >
                    <div class="battery-critical-pattern"></div>
                  </div>
                  <div class="battery-mark critical-threshold" :style="{ left: criticalThresholdPosition + '%' }"></div>
                  <div class="battery-mark current-level" :style="{ left: currentLevelPosition + '%' }"></div>
                  <div class="battery-cap"></div>
                  <div class="battery-plus">+</div>
                  <div class="battery-minus">-</div>
                </div>
                <div class="battery-levels">
                  <span class="battery-level" :style="{ left: '0%' }">2.5 В</span>
                  <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">{{ formattedCriticalThreshold }}</span>
                  <span class="battery-level" :style="{ left: '100%' }">4.3 В</span>
                </div>
                <div class="voltage-value">{{ deviceVoltage.toFixed(2) }} В</div>
              </div>
            </div>

            <div class="voltage-input-container">
              <div class="voltage-input">
                <el-input-number
                    v-model="deviceVoltage"
                    :min="2.5"
                    :max="4.3"
                    :step="0.01"
                    :precision="2"
                    :controls="true"
                    class="voltage-input-field"
                />
                <span class="voltage-unit">В</span>
              </div>

              <el-slider
                  v-model="deviceVoltage"
                  :min="2.5"
                  :max="4.3"
                  :step="0.01"
                  :format-tooltip="formatVoltageTooltip"
                  class="voltage-slider"
              />
            </div>
          </div>
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
          <div class="critical-voltage-control">
            <div class="voltage-input">
              <el-input-number
                  v-model="criticalVoltage"
                  :min="2.5"
                  :max="4.3"
                  :step="0.01"
                  :precision="2"
                  :controls="true"
                  class="critical-input"
              />
              <span class="voltage-unit">В</span>
            </div>
            <el-slider
                v-model="criticalVoltage"
                :min="2.5"
                :max="4.3"
                :step="0.01"
                :format-tooltip="formatVoltageTooltip"
                class="critical-slider"
            />
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">Эмуляция</label>
          <div class="event-buttons">
            <el-button size="small" @click="simulateLowVoltage" class="full-width">
              <Warning class="control-icon" />
              Напряжение
            </el-button>
            <el-button size="small" @click="simulateEmergency" class="full-width">
              <Bell class="control-icon" />
              Авария
            </el-button>
            <el-button size="small" @click="simulateCommand" class="full-width">
              <CircleCheck class="control-icon" />
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
import {
  Handbag,
  Moon,
  Warning,
  Bell,
  CircleCheck,
  CircleCheckFilled,
  CircleClose
} from '@element-plus/icons-vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';

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

const formattedCriticalThreshold = computed(() => {
  return criticalVoltage.value.toFixed(2) + ' В';
});

// Вычисляем позицию критического порога в процентах
const criticalThresholdPosition = computed(() => {
  if (!selectedDevice.value) return 0;

  const min = 2.5;
  const max = 4.3;
  const criticalVoltageValue = selectedDevice.value.critical_voltage || 3.2;

  return ((criticalVoltageValue - min) / (max - min)) * 100;
});

// Нормальный прогресс (от критического порога до max)
const batteryNormalProgress = computed(() => {
  if (!selectedDevice.value) return 0;

  const min = 2.5;
  const max = 4.3;

  if (deviceVoltage.value <= criticalVoltage.value) {
    return 0;
  }

  const normalVoltage = deviceVoltage.value - criticalVoltage.value;
  const maxNormalVoltage = max - criticalVoltage.value;

  return Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));
});

// Критический прогресс (от min до критического порога)
const batteryCriticalProgress = computed(() => {
  if (!selectedDevice.value) return 0;

  const min = 2.5;
  const max = 4.3;

  if (deviceVoltage.value >= criticalVoltage.value) {
    return 0;
  }

  const criticalVoltageValue = criticalVoltage.value - deviceVoltage.value;
  const criticalVoltageRange = criticalVoltage.value - min;

  return Math.min(100, Math.max(0, (criticalVoltageValue / criticalVoltageRange) * 100));
});

// Позиция текущего уровня
const currentLevelPosition = computed(() => {
  if (!selectedDevice.value) return 0;

  const min = 2.5;
  const max = 4.3;
  return ((deviceVoltage.value - min) / (max - min)) * 100;
});

// Цвет критического уровня
const criticalColor = computed(() => {
  const voltage = deviceVoltage.value;
  if (voltage < 2.7) return '#f56c6c';
  if (voltage < 3.0) return '#faa7a7';
  return '#ffcccb';
});

// Эмуляция низкого напряжения
const simulateLowVoltage = () => {
  if (selectedDevice.value) {
    const criticalVoltageValue = criticalVoltage.value;
    store.updateDeviceVoltage(
        selectedDevice.value.device_id,
        criticalVoltageValue - 0.1
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
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  overflow-y: auto;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #f5f7fa;
}

.device-name {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
}

.device-id {
  font-size: 0.7rem;
  color: #909399;
  margin-left: 1.2rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.control-label {
  font-size: 0.75rem;
  color: #606266;
  margin-bottom: 0.1rem;
}

.voltage-control {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.battery-visualization {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.battery-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  position: relative;
}

.battery {
  position: relative;
  width: 100%;
  height: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #f5f7fa;
  overflow: hidden;
}

.battery-normal {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #67c23a 0%, #95d97b 100%);
}

.battery-critical {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #f56c6c 0%, #ff9999 100%);
}

.battery-critical-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 3px,
      rgba(255, 255, 255, 0.3) 3px,
      rgba(255, 255, 255, 0.3) 6px
  );
}

.battery-mark {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 1px;
  background-color: #e6a23c;
  z-index: 10;
}

.battery-mark.critical-threshold {
  border-left: 1px dashed #e6a23c;
}

.battery-mark.current-level {
  border-left: 1px solid #409eff;
}

.battery-cap {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 1px;
  height: 4px;
  background: #409eff;
  border-radius: 1px;
}

.battery-plus {
  position: absolute;
  top: 50%;
  left: -10px;
  transform: translateY(-50%);
  font-weight: bold;
  color: #409eff;
  font-size: 0.8rem;
  z-index: 10;
}

.battery-minus {
  position: absolute;
  top: 50%;
  right: -10px;
  transform: translateY(-50%);
  font-weight: bold;
  color: #409eff;
  font-size: 0.8rem;
  z-index: 10;
}

.battery-levels {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 1px;
}

.battery-level {
  position: absolute;
  font-size: 0.7rem;
  color: #909399;
}

.voltage-value {
  text-align: center;
  font-weight: bold;
  color: #409eff;
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

.voltage-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.voltage-input {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.voltage-input-field {
  width: 100%;
}

.voltage-unit {
  color: #909399;
  font-size: 0.85rem;
  min-width: 20px;
  text-align: center;
}

.critical-voltage-control {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.critical-input {
  width: 100%;
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
  gap: 0.3rem;
}

.full-width {
  width: 100%;
}

.no-device {
  padding: 1rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
}

:deep(.header-icon) {
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.25rem;
}

:deep(.status-icon) {
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.25rem;
}

:deep(.control-icon) {
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.25rem;
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
}

:deep(.el-radio-button__inner) {
  padding: 0.2rem;
  width: auto;
  min-width: 60px;
  font-size: 0.7rem;
  height: 1.1rem;
  line-height: 1.1rem;
}

:deep(.voltage-slider) {
  margin: 0;
}

:deep(.critical-slider) {
  margin: 0;
}

:deep(.el-slider__runway) {
  height: 1px;
  margin: 1px 0;
}

:deep(.el-slider__button) {
  width: 8px;
  height: 8px;
}

:deep(.el-button) {
  padding: 3px 6px;
  height: 1.4rem;
  font-size: 0.75rem;
}
</style>
