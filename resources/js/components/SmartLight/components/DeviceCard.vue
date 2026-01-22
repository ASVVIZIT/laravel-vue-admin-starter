<template>
  <div
      class="device-card"
      :class="{
      'device-card--selected': isSelected,
      'device-card--3d': show3D
    }"
      :data-device-id="device.device_id"
  >
    <!-- Шапка -->
    <div class="device-header">
      <h3 class="device-name">{{ device.name }}</h3>
      <div class="header-actions">
        <el-switch
            v-model="show3D"
            size="small"
            active-text="3D"
            inactive-text="2D"
        >
          <template #active>
            <Eleme class="mode-icon" />
          </template>
          <template #inactive>
            <Grid class="mode-icon" />
          </template>
        </el-switch>
      </div>
    </div>

    <!-- Тело карточки -->
    <div class="device-content">
      <!-- Линия 1: Визуализация и информация -->
      <div class="device-main">
        <!-- Блок с лампочкой -->
        <div class="bulb-block">
          <div class="bulb-container">
            <Bulb
                :device-id="device.device_id"
                :show-3d="show3D"
                @init-complete="handleInitComplete"
                @visibility-change="force3DInit"
            />
          </div>
        </div>

        <!-- Блок с информацией об аккумуляторе -->
        <div class="battery-block">
          <div class="battery-info">
            <BatteryRenderer
                :device-id="device.device_id"
                :show-3d="show3D"
                @init-complete="handleInitComplete"
                @visibility-change="force3DInit"
            />
            <div class="voltage-value">{{ device.voltage?.toFixed(2) || '3.70' }} В</div>
            <div class="runtime-info">
              <Timer class="runtime-icon" />
              {{ deviceRuntime }}
            </div>
          </div>
        </div>
      </div>

      <!-- Линия 2: Кнопки управления -->
      <div class="device-controls">
        <!-- Переключатель состояния -->
        <div class="status-control">
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
        </div>

        <!-- Слайдер интенсивности -->
        <div class="intensity-control">
          <el-slider
              v-model="device.intensity"
              :min="0"
              :max="100"
              @change="updateIntensity"
              class="intensity-slider"
              :disabled="!isDeviceOn || device.is_fake || device.status === 'SLEEPING'"
          />
        </div>

        <!-- Основные кнопки управления -->
        <div class="action-buttons">
          <el-button
              v-if="device.status !== 'SLEEPING'"
              size="small"
              @click="sendEmergencySleep"
              type="info"
              class="full-width"
          >
            <Moon class="control-icon" />
            <span>Сон</span>
          </el-button>
          <el-button
              v-else
              size="small"
              @click="wakeDevice"
              type="success"
              class="full-width"
          >
            <Sunny class="control-icon" />
            <span>Разбудить</span>
          </el-button>

          <el-button
              size="small"
              @click="openDeviceSettings"
              type="primary"
              class="full-width"
          >
            <Setting class="control-icon" />
            <span>Настройки</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- Футер -->
    <div v-if="device.is_fake" class="device-footer">
      <Warning class="footer-icon" />
      <span>Тестовое устройство</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { ElNotification } from 'element-plus';
import {
  CircleCheckFilled,
  CircleCloseFilled,
  Sunny,
  Moon,
  Warning,
  Setting,
  Timer,
  Eleme,
  Grid
} from '@element-plus/icons-vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import Bulb from '@/components/SmartLight/components/Bulb.vue';
import BatteryRenderer from '@/components/SmartLight/components/BatteryRenderer.vue';
import { logDebug, checkWebGLSupport } from '@/components/SmartLight/api/utils/webglSupport.js';

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

const emit = defineEmits(['command-sent', 'emergency-sleep', 'open-settings', 'init-3d']);

const store = useSmartLightStore();
const loading = ref(false);
const webGLCheck = checkWebGLSupport();
const webGLSupported = webGLCheck.isSupported;

logDebug('DeviceCard', 'Компонент создан', {
  deviceId: props.device.device_id,
  name: props.device.name,
  isFake: props.device.is_fake,
  status: props.device.status,
  webGLSupported
});

// Определяем режим отображения для этого устройства
const show3D = computed({
  get: () => {
    const mode = store.getDevice3DMode(props.device.device_id);
    logDebug('DeviceCard', 'Получение режима отображения', {
      deviceId: props.device.device_id,
      mode
    });
    return mode;
  },
  set: (value) => {
    logDebug('DeviceCard', 'Установка режима отображения', {
      deviceId: props.device.device_id,
      value
    });
    store.setDevice3DMode(props.device.device_id, value);
  }
});

// Вычисляемое свойство для переключателя
const isDeviceOn = computed({
  get: () => props.device.status === 'ON',
  set: (value) => {
    const status = value ? 'ON' : 'OFF';
    store.updateDeviceStatus(props.device.device_id, status);
  }
});

// Расчет времени работы
const deviceRuntime = computed(() => {
  const runtime = store.deviceRuntime(props.device.device_id);
  logDebug('DeviceCard', 'Вычисление времени работы', {
    deviceId: props.device.device_id,
    runtime
  });
  return runtime;
});

// Безопасный диапазон интенсивности
const safeIntensity = computed(() => {
  const range = store.deviceSafeIntensityRange(props.device.device_id);
  logDebug('DeviceCard', 'Получение безопасного диапазона', {
    deviceId: props.device.device_id,
    range
  });
  return range;
});

// Обработчик изменения переключателя
const handleSwitchChange = async (value) => {
  logDebug('DeviceCard', 'Обработчик изменения переключателя', {
    deviceId: props.device.device_id,
    value,
    status: props.device.status
  });

  loading.value = true;
  const command = value ? 'ON' : 'OFF';

  try {
    if (props.device.is_fake) {
      logDebug('DeviceCard', 'Эмуляция команды для фейкового устройства', {
        deviceId: props.device.device_id,
        command
      });

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
      logDebug('DeviceCard', 'Отправка команды на сервер', {
        deviceId: props.device.device_id,
        command,
        intensity: props.device.intensity
      });

      const response = await store.sendCommand(
          props.device.device_id,
          command,
          props.device.intensity
      );

      if (response.success) {
        logDebug('DeviceCard', 'Команда успешно обработана', {
          deviceId: props.device.device_id,
          response
        });

        ElNotification({
          title: 'Устройство',
          message: `Светильник ${command.toLowerCase()}`,
          type: 'success'
        });
      } else {
        logDebug('DeviceCard', 'Ошибка обработки команды', {
          deviceId: props.device.device_id,
          error: response.error
        });
        throw new Error(response.message || 'Ошибка управления');
      }
    }

    emit('command-sent', props.device.device_id);
  } catch (error) {
    logDebug('DeviceCard', 'Ошибка управления светильником', {
      deviceId: props.device.device_id,
      error: error.message
    });

    ElNotification({
      title: 'Ошибка',
      message: 'Ошибка управления светильником',
      type: 'error'
    });
  } finally {
    logDebug('DeviceCard', 'Завершение обработки команды', {
      deviceId: props.device.device_id
    });
    loading.value = false;
  }
};

// Изменение интенсивности
const updateIntensity = async () => {
  logDebug('DeviceCard', 'Изменение интенсивности', {
    deviceId: props.device.device_id,
    intensity: props.device.intensity,
    status: props.device.status
  });

  if (props.device.status === 'ON') {
    if (props.device.is_fake) {
      logDebug('DeviceCard', 'Эмуляция изменения интенсивности', {
        deviceId: props.device.device_id,
        intensity: props.device.intensity
      });

      await new Promise(resolve => setTimeout(resolve, 300));
      ElNotification({
        title: 'Эмуляция',
        message: 'Изменение интенсивности',
        type: 'info',
        duration: 2000
      });
    } else {
      logDebug('DeviceCard', 'Отправка изменения интенсивности на сервер', {
        deviceId: props.device.device_id,
        intensity: props.device.intensity
      });

      const response = await store.sendCommand(
          props.device.device_id,
          props.device.status,
          props.device.intensity
      );

      if (!response.success) {
        logDebug('DeviceCard', 'Ошибка изменения интенсивности', {
          deviceId: props.device.device_id,
          error: response.error
        });
        throw new Error(response.message || 'Ошибка изменения интенсивности');
      }
    }
  }
};

// Перевод в спящий режим
const sendEmergencySleep = async () => {
  logDebug('DeviceCard', 'Перевод в спящий режим', {
    deviceId: props.device.device_id,
    isFake: props.device.is_fake
  });

  if (props.device.is_fake) {
    logDebug('DeviceCard', 'Эмуляция перевода в сон', { deviceId: props.device.device_id });

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
    logDebug('DeviceCard', 'Отправка команды сна на сервер', {
      deviceId: props.device.device_id
    });

    const response = await store.forceSleep(props.device.device_id);

    if (response.success) {
      logDebug('DeviceCard', 'Команда сна успешно обработана', {
        deviceId: props.device.device_id,
        response
      });
      emit('emergency-sleep', props.device.device_id);
    } else {
      logDebug('DeviceCard', 'Ошибка отправки команды сна', {
        deviceId: props.device.device_id,
        error: response.error
      });
      throw new Error(response.message || 'Ошибка отправки команды сна');
    }
  }
};

// Пробуждение устройства
const wakeDevice = async () => {
  logDebug('DeviceCard', 'Пробуждение устройства', {
    deviceId: props.device.device_id,
    isFake: props.device.is_fake
  });

  if (props.device.is_fake) {
    logDebug('DeviceCard', 'Эмуляция пробуждения', { deviceId: props.device.device_id });

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
    logDebug('DeviceCard', 'Отправка команды пробуждения на сервер', {
      deviceId: props.device.device_id
    });

    const response = await store.wakeDevice(props.device.device_id);

    if (response.success) {
      logDebug('DeviceCard', 'Команда пробуждения успешно обработана', {
        deviceId: props.device.device_id,
        response
      });
      emit('command-sent', props.device.device_id);
    } else {
      logDebug('DeviceCard', 'Ошибка пробуждения устройства', {
        deviceId: props.device.device_id,
        error: response.error
      });
      throw new Error(response.message || 'Ошибка пробуждения устройства');
    }
  }
};

const openDeviceSettings = () => {
  logDebug('DeviceCard', 'Открытие настроек устройства', { deviceId: props.device.device_id });
  emit('open-settings', props.device);
};

// Обработчик завершения инициализации 3D
const handleInitComplete = (success) => {
  logDebug('DeviceCard', 'Инициализация 3D завершена', {
    deviceId: props.device.device_id,
    success
  });
};

// Принудительная инициализация 3D
const force3DInit = () => {
  logDebug('DeviceCard', 'Принудительная инициализация 3D', {
    deviceId: props.device.device_id,
    show3D: show3D.value
  });

  if (webGLSupported && show3D.value) {
    // Инициируем событие для принудительной инициализации
    emit('init-3d', props.device.device_id);
  }
};

// Инициализация при монтировании
onMounted(() => {
  logDebug('DeviceCard', 'Инициализация компонента', { deviceId: props.device.device_id });

  store.initInterfaceSettings();

  // Даем время для полной загрузки
  setTimeout(() => {
    logDebug('DeviceCard', 'Проверка контейнера после монтирования', {
      deviceId: props.device.device_id
    });
  }, 100);
});

// Очистка при размонтировании
onUnmounted(() => {
  logDebug('DeviceCard', 'Очистка компонента', { deviceId: props.device.device_id });
});

// Следим за изменениями в сторе
watch(() => store.devices, (newDevices, oldDevices) => {
  logDebug('DeviceCard', 'Обновление списка устройств', {
    deviceId: props.device.device_id,
    newDevicesCount: newDevices.length,
    oldDevicesCount: oldDevices ? oldDevices.length : 0
  });

  const device = newDevices.find(d => d.device_id === props.device.device_id);
  if (device) {
    logDebug('DeviceCard', 'Обновление данных устройства', {
      deviceId: props.device.device_id,
      device
    });
    props.device = { ...device };
  }
}, { deep: true });

// Следим за выбранным устройством
watch(() => store.selectedDevice, (newDevice, oldDevice) => {
  logDebug('DeviceCard', 'Изменение выбранного устройства', {
    oldDeviceId: oldDevice ? oldDevice.device_id : null,
    newDeviceId: newDevice ? newDevice.device_id : null
  });

  // Если это наше устройство было выбрано
  if (newDevice && newDevice.device_id === props.device.device_id) {
    logDebug('DeviceCard', 'Наше устройство выбрано', {
      deviceId: props.device.device_id
    });

    // Принудительно инициализируем 3D
    setTimeout(() => {
      force3DInit();
    }, 200);
  }
});
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

.device-card--3d {
  box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.08),
      0 0 0 2px #ff9800;
}

/* Шапка */
.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f5f7fa;
}

.device-name {
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.header-actions {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}

/* Тело карточки */
.device-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Основной блок с лампочкой и аккумулятором */
.device-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.bulb-block {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  border-radius: 4px;
  background: #f9fafb;
  border: 1px solid #f5f7fa;
}

.bulb-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Блок информации об аккумуляторе */
.battery-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
}

.battery-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  width: 100%;
}

.voltage-value {
  font-weight: bold;
  color: #409eff;
  font-size: 1.1rem;
  margin-top: 0.2rem;
}

.runtime-info {
  font-size: 0.9rem;
  color: #545864;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

/* Блок управления */
.device-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-control {
  display: flex;
  justify-content: center;
  margin-bottom: 0.2rem;
}

.intensity-control {
  margin-bottom: 0.3rem;
}

.intensity-slider {
  width: 100%;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 0.3rem;
}

/* Футер */
.device-footer {
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid #f5f7fa;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: #e6a23c;
  font-size: 0.75rem;
}

.footer-icon {
  width: 0.9rem;
  height: 0.9rem;
}

/* Размеры иконок */
:deep(.mode-icon) {
  width: 0.8rem;
  height: 0.8rem;
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

:deep(.runtime-icon) {
  width: 0.8rem;
  height: 0.8rem;
}

/* Стили для компонентов Element Plus */
:deep(.status-switch) {
  width: 100%;
}

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
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-button.is-disabled) {
  opacity: 0.7;
}

:deep(.el-slider__runway) {
  height: 1px;
  margin: 2px 0;
}

:deep(.el-slider__button) {
  width: 8px;
  height: 8px;
}
</style>
