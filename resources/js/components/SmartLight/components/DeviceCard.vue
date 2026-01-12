<template>
  <div
      class="device-card"
      :class="{
      'device-card--selected': isSelected
    }"
  >
    <div class="device-header">
      <h3 class="device-name">{{ device.name }}</h3>
      <div class="status-container">
        <el-tag :type="statusType" size="small" class="status-tag">
          <CircleCheckFilled class="status-icon" v-if="device.status === 'ON'" />
          <CircleClose class="status-icon" v-else />
          {{ device.status }}
        </el-tag>
        <el-tag v-if="device.is_fake" type="warning" size="small" class="fake-tag">
          <Handbag class="fake-icon" />
          Тест
        </el-tag>
      </div>
    </div>

    <div class="device-info">
      <div class="voltage-info">
        <span class="voltage-value">{{ device.voltage?.toFixed(2) || '3.70' }} В</span>
        <div class="battery-container">
          <div class="battery">
            <div
                class="battery-normal"
                :style="{
                width: batteryNormalProgress + '%',
                backgroundColor: batteryColor
              }"
            ></div>
            <div
                class="battery-critical"
                :style="{
                width: batteryCriticalProgress + '%',
                backgroundColor: criticalColor
              }"
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
            <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">{{ device.critical_voltage.toFixed(2) }} В</span>
            <span class="battery-level" :style="{ left: '100%' }">4.3 В</span>
          </div>
        </div>
      </div>

      <div class="runtime-info">
        <Timer class="runtime-icon" />
        {{ estimatedRuntime }}
      </div>
    </div>

    <div class="device-controls">
      <el-switch
          v-model="device.status"
          active-value="ON"
          inactive-value="OFF"
          @change="toggleDevice"
          :loading="loading"
          :disabled="device.is_fake"
      >
        <template #active>
          <CircleCheckFilled class="switch-icon" />
          Вкл
        </template>
        <template #inactive>
          <CircleClose class="switch-icon" />
          Выкл
        </template>
      </el-switch>

      <el-slider
          v-if="device.status === 'ON'"
          v-model="device.intensity"
          :min="0"
          :max="100"
          @change="updateIntensity"
          class="intensity-slider"
          :disabled="device.is_fake"
      />

      <div class="control-buttons">
        <el-button
            size="small"
            @click="sendEmergencySleep"
            type="info"
        >
          <Moon class="control-icon" />
          Сон
        </el-button>
        <el-button
            size="small"
            @click="openDeviceSettings"
            type="primary"
        >
          <Setting class="control-icon" />
          Настройки
        </el-button>
      </div>
    </div>

    <div v-if="device.is_fake" class="fake-warning">
      <Warning class="warning-icon" />
      <span>Тестовое устройство</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElNotification } from 'element-plus';
import {
  Handbag,
  Moon,
  Warning,
  Setting,
  CircleCheckFilled,
  CircleClose,
  Timer
} from '@element-plus/icons-vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';

const props = defineProps({
  device: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['command-sent', 'emergency-sleep', 'open-settings']);

const store = useSmartLightStore();
const loading = ref(false);

// Инициализация значений, если их нет
if (!props.device.intensity) {
  props.device.intensity = 100;
}

if (!props.device.voltage) {
  props.device.voltage = 3.7;
}

if (!props.device.critical_voltage) {
  props.device.critical_voltage = 3.2;
}

const statusType = computed(() => {
  switch (props.device.status) {
    case 'ON': return 'success';
    case 'OFF': return 'info';
    case 'SLEEPING': return 'warning';
    default: return 'danger';
  }
});

// Вычисляем позицию критического порога в процентах
const criticalThresholdPosition = computed(() => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;
  const criticalVoltage = props.device.critical_voltage;

  return ((criticalVoltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
});

// Нормальный прогресс (от критического порога до max)
const batteryNormalProgress = computed(() => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;

  if (props.device.voltage <= props.device.critical_voltage) {
    return 0;
  }

  const normalVoltage = props.device.voltage - props.device.critical_voltage;
  const maxNormalVoltage = maxVoltage - props.device.critical_voltage;

  return Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));
});

// Критический прогресс (от min до критического порога)
const batteryCriticalProgress = computed(() => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;

  if (props.device.voltage >= props.device.critical_voltage) {
    return 0;
  }

  const criticalVoltage = props.device.critical_voltage - props.device.voltage;
  const criticalVoltageRange = props.device.critical_voltage - minVoltage;

  return Math.min(100, Math.max(0, (criticalVoltage / criticalVoltageRange) * 100));
});

// Цвет критического уровня
const criticalColor = computed(() => {
  const voltage = props.device.voltage || 3.7;
  if (voltage < 2.7) return '#f56c6c';
  if (voltage < 3.0) return '#faa7a7';
  return '#ffcccb';
});

// Цвет нормального уровня
const batteryColor = computed(() => {
  const voltage = props.device.voltage || 3.7;
  if (voltage < 3.0) return '#f56c6c';
  if (voltage < 3.4) return '#e6a23c';
  return '#67c23a';
});

// Позиция текущего уровня
const currentLevelPosition = computed(() => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;
  return ((props.device.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
});

const estimatedRuntime = computed(() => {
  const voltage = props.device.voltage || 3.7;
  const minVoltage = 2.8;
  const maxVoltage = 4.2;

  if (voltage <= minVoltage) return 'КРИТ';

  const percentage = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
  const hours = Math.round(percentage * 10);

  if (hours < 1) return `${hours * 60} мин`;
  if (hours < 24) return `${hours} ч`;
  return `${Math.floor(hours / 24)}дн`;
});

const toggleDevice = async () => {
  loading.value = true;

  try {
    const command = props.device.status === 'ON' ? 'OFF' : 'ON';

    // Для фейковых устройств эмулируем ответ
    if (props.device.is_fake) {
      await new Promise(resolve => setTimeout(resolve, 300));

      props.device.status = command;
      props.device.intensity = command === 'ON' ? 100 : 0;

      if (command === 'ON') {
        props.device.voltage = Math.min(4.3, props.device.voltage + 0.05);
      } else {
        props.device.voltage = Math.max(2.5, props.device.voltage - 0.05);
      }

      ElNotification({
        title: 'Эмуляция',
        message: `Команда "${command}" отправлена`,
        type: 'info',
        duration: 2000
      });
    } else {
      // Для реальных устройств
      const response = await store.sendCommand(props.device.device_id, command, props.device.intensity);

      if (response.success) {
        ElNotification({
          title: 'Устройство',
          message: `Светильник ${command.toLowerCase()}`,
          type: 'success'
        });
      } else {
        throw new Error(response.message || 'Ошибка управления');
      }
    }

    emit('command-sent', props.device.device_id);
  } catch (error) {
    // Откат статуса при ошибке
    props.device.status = props.device.status === 'ON' ? 'OFF' : 'ON';
    props.device.intensity = props.device.status === 'ON' ? 100 : 0;

    ElNotification({
      title: 'Ошибка',
      message: 'Ошибка управления светильником',
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};

const updateIntensity = async () => {
  if (props.device.status === 'ON') {
    if (props.device.is_fake) {
      // Для фейковых устройств эмуляция
      await new Promise(resolve => setTimeout(resolve, 300));

      ElNotification({
        title: 'Эмуляция',
        message: 'Изменение интенсивности',
        type: 'info',
        duration: 2000
      });
    } else {
      // Для реальных устройств
      const response = await store.sendCommand(
          props.device.device_id,
          props.device.status,
          props.device.intensity
      );

      if (!response.success) {
        throw new Error(response.message || 'Ошибка изменения интенсивности');
      }
    }
  }
};

const sendEmergencySleep = async () => {
  if (props.device.is_fake) {
    // Эмуляция для фейковых устройств
    await new Promise(resolve => setTimeout(resolve, 300));

    ElNotification({
      title: 'Эмуляция',
      message: 'Команда сна отправлена',
      type: 'info',
      duration: 2000
    });

    // Эмулируем изменение статуса
    props.device.status = 'SLEEPING';
    props.device.voltage = 2.9;
  } else {
    // Для реальных устройств
    const response = await store.forceSleep(props.device.device_id);

    if (response.success) {
      emit('emergency-sleep', props.device.device_id);
    } else {
      throw new Error(response.message || 'Ошибка отправки команды сна');
    }
  }
};

const openDeviceSettings = () => {
  emit('open-settings', props.device);
};
</script>

<style scoped>
.device-card {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  overflow: hidden;
}

.device-card--selected {
  box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.08),
      0 0 0 2px #409eff;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.device-name {
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.status-container {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}

.status-tag {
  font-weight: 500;
  font-size: 0.75rem;
  height: 1.2rem;
  line-height: 1.2rem;
  padding: 0 0.3rem;
}

.fake-tag {
  background-color: #fff7e6;
  border-color: #fffae6;
  color: #e6a23c;
  font-size: 0.75rem;
  height: 1.2rem;
  line-height: 1.2rem;
  padding: 0 0.3rem;
}

.voltage-info {
  margin-bottom: 0.5rem;
}

.voltage-value {
  font-weight: 600;
  margin-bottom: 0.15rem;
  display: block;
  font-size: 0.85rem;
  white-space: nowrap;
  text-align: center;
}

.battery-container {
  height: 20px;
  border-radius: 10px;
  background: #f5f7fa;
  overflow: hidden;
}

.battery {
  position: relative;
  width: 100%;
  height: 100%;
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
  border-radius: 8px 0 0 8px;
  background: linear-gradient(90deg, #67c23a 0%, #95d97b 100%);
}

.battery-critical {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 8px 0 0 8px;
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

.runtime-info {
  font-size: 0.75rem;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.device-controls {
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid #f5f7fa;
}

.intensity-slider {
  margin: 0.3rem 0;
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  gap: 0.3rem;
  margin-top: 0.5rem;
}

.fake-warning {
  margin-top: 0.5rem;
  padding: 0.2rem;
  background: #fff7e6;
  border: 1px solid #fffae6;
  border-radius: 2px;
  font-size: 0.75rem;
  color: #e6a23c;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

/* РАЗМЕРЫ ИКОНОК */
:deep(.status-icon) {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}

:deep(.fake-icon) {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}

:deep(.runtime-icon) {
  width: 0.9rem;
  height: 0.9rem;
}

:deep(.switch-icon) {
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.25rem;
}

:deep(.control-icon) {
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.25rem;
}

:deep(.warning-icon) {
  width: 0.9rem;
  height: 0.9rem;
}

/* Стили для компонентов Element Plus */
:deep(.el-switch) {
  height: 1.3rem;
  font-size: 0.8rem;
}

:deep(.el-switch.is-disabled) {
  opacity: 0.7;
}

:deep(.el-button) {
  padding: 2px 6px;
  height: 1.4rem;
  font-size: 0.75rem;
}

:deep(.el-button.is-disabled) {
  opacity: 0.7;
}

:deep(.el-slider__runway) {
  margin: 2px 0;
  height: 1px;
}

:deep(.el-slider__button) {
  width: 8px;
  height: 8px;
}
</style>
