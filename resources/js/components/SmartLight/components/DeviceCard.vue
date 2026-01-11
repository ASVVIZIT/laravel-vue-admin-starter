<template>
  <div class="device-card">
    <div class="device-header">
      <h3 class="device-name">{{ device.name }}</h3>
      <div class="status-container">
        <el-tag :type="statusType" size="small" class="status-tag">
          <el-icon v-if="device.status === 'ON'" name="light-on" class="status-icon" />
          <el-icon v-else name="light-off" class="status-icon" />
          {{ device.status }}
        </el-tag>
        <el-tag v-if="device.is_fake" type="warning" size="small" class="fake-tag">
          <el-icon name="bug" class="fake-icon" />
          Демо
        </el-tag>
      </div>
    </div>

    <div class="device-info">
      <div class="voltage-info">
        <span class="voltage-value">{{ device.voltage?.toFixed(2) || '3.70' }} В</span>
        <div class="battery-container">
          <div class="battery">
            <div
                class="battery-fill"
                :style="{
                width: batteryProgress + '%',
                backgroundColor: batteryColor
              }"
            ></div>
            <div class="battery-cap"></div>
          </div>
        </div>
      </div>

      <div class="runtime-info">
        <el-icon name="timer" class="mr-1" />
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
          <el-icon name="light-on" class="mr-1" />
          Вкл
        </template>
        <template #inactive>
          <el-icon name="light-off" class="mr-1" />
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
          <el-icon name="moon" class="mr-1" />
          Сон
        </el-button>
        <el-button
            size="small"
            @click="openDeviceSettings"
            type="primary"
        >
          <el-icon name="setting" class="mr-1" />
          Настройки
        </el-button>
      </div>
    </div>

    <div v-if="device.is_fake" class="fake-warning">
      <el-icon name="warning" class="mr-1" />
      <span>Тестовое устройство</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElNotification } from 'element-plus';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';

const props = defineProps({
  device: {
    type: Object,
    required: true
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

const statusType = computed(() => {
  switch (props.device.status) {
    case 'ON': return 'success';
    case 'OFF': return 'info';
    case 'SLEEPING': return 'warning';
    default: return 'danger';
  }
});

const batteryProgress = computed(() => {
  const voltage = props.device.voltage || 3.7;
  const minVoltage = 2.5;
  const maxVoltage = 4.3;

  return Math.min(100, Math.max(0, ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100));
});

const batteryColor = computed(() => {
  const voltage = props.device.voltage || 3.7;
  if (voltage < 3.0) return '#f56c6c';
  if (voltage < 3.4) return '#e6a23c';
  return '#67c23a';
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
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  overflow: hidden;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.device-name {
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.status-container {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.status-tag {
  font-weight: 500;
  font-size: 0.8rem;
  height: 1.4rem;
  line-height: 1.4rem;
  padding: 0 0.4rem;
}

.status-icon {
  margin-right: 2px;
  font-size: 0.9rem;
}

.fake-tag {
  background-color: #fff7e6;
  border-color: #fffae6;
  color: #e6a23c;
  font-size: 0.8rem;
  height: 1.4rem;
  line-height: 1.4rem;
  padding: 0 0.4rem;
}

.fake-icon {
  margin-right: 2px;
  font-size: 0.9rem;
}

.voltage-info {
  margin-bottom: 0.75rem;
}

.voltage-value {
  font-weight: 600;
  margin-bottom: 0.25rem;
  display: block;
  font-size: 0.95rem;
  white-space: nowrap;
}

.battery-container {
  height: 6px;
  border-radius: 3px;
  background: #f5f7fa;
  overflow: hidden;
}

.battery {
  position: relative;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #f5f7fa;
  overflow: hidden;
}

.battery-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.battery-cap {
  position: absolute;
  top: -1px;
  right: -2px;
  width: 2px;
  height: 6px;
  background: #409eff;
  border-radius: 1px;
}

.runtime-info {
  font-size: 0.8rem;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.device-controls {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid #f2f2f2;
}

.intensity-slider {
  margin: 0.5rem 0;
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.fake-warning {
  margin-top: 0.75rem;
  padding: 0.25rem;
  background: #fff7e6;
  border: 1px solid #fffae6;
  border-radius: 2px;
  font-size: 0.8rem;
  color: #e6a23c;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

:deep(.el-switch) {
  height: 1.5rem;
  font-size: 0.85rem;
}

:deep(.el-switch.is-disabled) {
  opacity: 0.7;
}

:deep(.el-button) {
  padding: 4px 8px;
  height: 1.6rem;
  font-size: 0.8rem;
}

:deep(.el-button.is-disabled) {
  opacity: 0.7;
}

:deep(.el-slider__runway) {
  margin: 4px 0;
  height: 2px;
}

:deep(.el-slider__button) {
  width: 10px;
  height: 10px;
}
</style>
