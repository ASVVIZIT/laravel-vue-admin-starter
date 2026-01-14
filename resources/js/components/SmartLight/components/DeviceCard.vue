<template>
  <div
      class="device-card"
      :class="{
      'device-card--selected': isSelected
    }"
  >
    <div class="device-card-content">
      <!-- Вертикальная лампочка слева -->
      <div class="bulb-container">
        <Bulb
            :status="device.status"
            :intensity="device.intensity"
            :device-id="device.device_id"
            v-if="device"
        />
      </div>

      <!-- Основное содержимое карточки -->
      <div class="content-container" v-if="device">
        <div class="device-header">
          <h3 class="device-name">{{ device.name }}</h3>
          <div class="status-container">
            <el-tag :type="statusType" size="small" class="status-tag">
              <CircleCheckFilled class="status-icon" v-if="device.status === 'ON'" />
              <CircleCloseFilled class="status-icon" v-else-if="device.status === 'OFF'" />
              <Moon class="status-icon" v-else-if="device.status === 'SLEEPING'" />
              <span>{{ device.status }}</span>
            </el-tag>
            <div v-if="device.is_fake" class="fake-warning">
              <Warning class="warning-icon" />
              <span>Тестовое устройство</span>
            </div>
          </div>
        </div>

        <div class="device-info">
          <div class="voltage-info">
            <div class="battery-container">
              <BatteryRenderer
                  :device-id="device.device_id"
                  :voltage="device.voltage"
                  :critical-voltage="device.critical_voltage"
                  :show3D="show3D"
              />
            </div>
            <span class="voltage-value">{{ device.voltage?.toFixed(2) || '3.70' }} В</span>
            <span class="runtime-info">
              <Timer class="runtime-icon" />
              {{ deviceRuntime }}
            </span>
          </div>
        </div>

        <div class="device-controls">
          <!-- Исправленный переключатель -->
          <div class="switch-container">
            <el-switch
                v-model="isDeviceOn"
                @change="handleSwitchChange"
                :loading="loading"
                :disabled="device.is_fake || device.status === 'SLEEPING'"
                class="status-switch"
            >
              <template #active>
                <CircleCheckFilled class="switch-icon" />
                Вкл
              </template>
              <template #inactive>
                <CircleCloseFilled class="switch-icon" />
                Выкл
              </template>
            </el-switch>
            <div class="switch-label">
              {{ isDeviceOn ? 'Включено' : 'Выключено' }}
            </div>
          </div>

          <!-- Исправленный слайдер интенсивности -->
          <el-slider
              v-model="device.intensity"
              :min="safeIntensity.min"
              :max="safeIntensity.max"
              @change="updateIntensity"
              class="intensity-slider"
              :disabled="!isDeviceOn || device.is_fake || device.status === 'SLEEPING'"
          />

          <div class="control-buttons">
            <el-button
                v-if="device.status !== 'SLEEPING'"
                size="small"
                @click="sendEmergencySleep"
                type="info"
            >
              <Moon class="control-icon" />
              Сон
            </el-button>
            <el-button
                v-else
                size="small"
                @click="wakeDevice"
                type="success"
            >
              <Sunny class="control-icon" />
              Разбудить
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElNotification } from 'element-plus';
import {
  Moon,
  Sunny,
  Warning,
  Setting,
  CircleCheckFilled,
  CircleCloseFilled,
  Timer
} from '@element-plus/icons-vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import Bulb from '@/components/SmartLight/components/Bulb.vue';
import BatteryRenderer from '@/components/SmartLight/components/BatteryRenderer.vue';

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
const show3D = ref(true);

// Вычисляемое свойство для переключателя
const isDeviceOn = computed({
  get: () => props.device.status === 'ON',
  set: (value) => {
    // Ничего не делаем здесь
  }
});

// Тип статуса
const statusType = computed(() => {
  switch (props.device.status) {
    case 'ON': return 'success';
    case 'OFF': return 'info';
    case 'SLEEPING': return 'warning';
    default: return 'danger';
  }
});

// Прогресс батареи
const batteryProgress = computed(() => {
  return store.deviceBatteryProgress(props.device.device_id);
});

// Цвет батареи
const batteryColor = computed(() => {
  return store.deviceBatteryColor(props.device.device_id);
});

// Расчет времени работы
const deviceRuntime = computed(() => {
  return store.deviceRuntime(props.device.device_id);
});

// Безопасный диапазон интенсивности
const safeIntensity = computed(() => {
  return store.deviceSafeIntensityRange(props.device.device_id);
});

// Обработчик изменения переключателя
const handleSwitchChange = async (value) => {
  loading.value = true;
  const command = value ? 'ON' : 'OFF';

  try {
    if (props.device.is_fake) {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Используем стор для обновления
      store.updateDeviceStatus(props.device.device_id, command);
      store.updateDeviceIntensity(props.device.device_id, command === 'ON' ? 100 : 0);

      if (command === 'ON') {
        store.updateDeviceVoltage(
            props.device.device_id,
            Math.min(4.3, props.device.voltage + 0.05)
        );
      } else {
        store.updateDeviceVoltage(
            props.device.device_id,
            Math.max(2.5, props.device.voltage - 0.05)
        );
      }

      ElNotification({
        title: 'Эмуляция',
        message: `Команда "${command}" отправлена`,
        type: 'info',
        duration: 2000
      });
    } else {
      const response = await store.sendCommand(
          props.device.device_id,
          command,
          props.device.intensity
      );

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
    ElNotification({
      title: 'Ошибка',
      message: 'Ошибка управления светильником',
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};

// Изменение интенсивности
const updateIntensity = async () => {
  if (props.device.status === 'ON') {
    if (props.device.is_fake) {
      await new Promise(resolve => setTimeout(resolve, 300));
      ElNotification({
        title: 'Эмуляция',
        message: 'Изменение интенсивности',
        type: 'info',
        duration: 2000
      });
    } else {
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

// Перевод в спящий режим
const sendEmergencySleep = async () => {
  if (props.device.is_fake) {
    await new Promise(resolve => setTimeout(resolve, 300));
    ElNotification({
      title: 'Эмуляция',
      message: 'Команда сна отправлена',
      type: 'info',
      duration: 2000
    });
    // Используем стор для обновления
    store.updateDeviceStatus(props.device.device_id, 'SLEEPING');
  } else {
    const response = await store.forceSleep(props.device.device_id);

    if (response.success) {
      emit('emergency-sleep', props.device.device_id);
    } else {
      throw new Error(response.message || 'Ошибка отправки команды сна');
    }
  }
};

// Пробуждение устройства
const wakeDevice = async () => {
  if (props.device.is_fake) {
    await new Promise(resolve => setTimeout(resolve, 300));
    ElNotification({
      title: 'Эмуляция',
      message: 'Устройство пробуждено',
      type: 'success',
      duration: 2000
    });
    // Используем стор для обновления
    store.wakeDevice(props.device.device_id);
  } else {
    const response = await store.wakeDevice(props.device.device_id);

    if (response.success) {
      emit('command-sent', props.device.device_id);
    } else {
      throw new Error(response.message || 'Ошибка пробуждения устройства');
    }
  }
};

const openDeviceSettings = () => {
  emit('open-settings', props.device);
};

// Следим за изменениями в сторе
watch(() => store.devices, (newDevices) => {
  const device = newDevices.find(d => d.device_id === props.device.device_id);
  if (device) {
    props.device = { ...device };
  }
}, { deep: true });
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

.device-card-content {
  display: flex;
  height: 100%;
}

.bulb-container {
  width: 80px;
  height: 120px;
  display: flex;
  justify-content: center;
  margin-right: 0.75rem;
  min-width: 80px;
  min-height: 120px;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
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
  display: inline-flex;
  font-weight: 500;
  font-size: 1rem;
  height: 1.5rem;
  line-height: 1.2rem;
  padding: 0.5rem 0.5rem;
}

.voltage-info {
  margin-bottom: 0.5rem;
}

.voltage-value {
  position: relative;
  top: -35px;
  z-index: 2;
  font-weight: 600;
  display: block;
  font-size: 1.25rem;
  white-space: nowrap;
  text-align: center;
}

.battery-container {
  height: 50px;
  border-radius: 3px;
  background: #f5f7fa;
  overflow: hidden;
  position: relative;
}

.battery {
  position: relative;
  height: 46px;
  border: 2px solid rgba(66, 154, 220, 0.71);
  border-radius: 3px;
  background: #f5f7fa;
  overflow: hidden;
}

.battery-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.battery-cap {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 2px;
  height: 50px;
  background: #ffa640;
  border-radius: 1px;
}

.runtime-info {
  position: relative;
  top: -53px;
  right: -10px;
  z-index: 1;
  font-size: 0.95rem;
  color: #545864;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.device-controls {
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid #f5f7fa;
}

/* Исправленный переключатель */
.switch-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.switch-label {
  font-size: 0.85rem;
  color: #606266;
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
