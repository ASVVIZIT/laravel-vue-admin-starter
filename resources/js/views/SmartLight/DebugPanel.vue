<template>
  <div class="debug-panel">
    <el-card class="debug-card">
      <template #header>
        <div class="debug-header">
          <div class="debug-header-content">
            <Bulb
                :device-id="selectedDevice?.device_id"
                :show-3d="show3D"
                @init-complete="handleInitComplete"
                @visibility-change="force3DInit"
            />
          </div>
          <div class="device-info" v-if="selectedDevice">
            <div class="device-name">
              <h3>{{ selectedDevice.name }}</h3>
              <el-tag :type="statusType" size="small">
                <CircleCheckFilled class="status-icon" v-if="deviceStatus === 'ON'" />
                <CircleCloseFilled class="status-icon" v-else-if="deviceStatus === 'OFF'" />
                <Moon class="status-icon" v-else-if="deviceStatus === 'SLEEPING'" />
                <span>{{ selectedDevice.status }}</span>
              </el-tag>
            </div>
            <div class="device-id">
              <small>{{ selectedDevice.device_id }}</small>
            </div>
          </div>
        </div>
        <div class="control-group">
          <label class="control-label">Статус</label>
          <el-radio-group v-model="deviceStatus" @change="updateStatus">
            <el-radio-button label="ON" size="mini">
              <CircleCheckFilled class="control-icon" />
              <span>Вкл</span>
            </el-radio-button>
            <el-radio-button label="OFF" size="mini">
              <CircleCloseFilled class="control-icon" />
              <span>Выкл</span>
            </el-radio-button>
            <el-radio-button label="SLEEPING" size="mini">
              <Moon class="control-icon" />
              <span>Сон</span>
            </el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-alert
          v-if="error"
          :title="error"
          type="error"
          show-icon
          class="mb-1"
          closable
      />

      <el-skeleton v-if="loading" :rows="6" animated class="skeleton-container" />

      <div v-if="selectedDevice" class="scrollable-content">
        <div class="control-group">
          <label class="control-label">Напряжение</label>
          <div class="voltage-control">
            <div class="battery-visualization">
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
                  <span class="battery-level" :style="{ left: '0%' }">{{ formattedMinVoltage }} В</span>
                  <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">{{ formattedCriticalThreshold }} В</span>
                  <span class="battery-level" :style="{ left: '100%' }">{{ formattedMaxVoltage }} В</span>
                </div>
              </div>
              <div class="battery-type-info">
                <span class="battery-type-label">Тип:</span>
                <span class="battery-type-value">{{ batteryTypeName }}</span>
              </div>
              <div class="voltage-value">{{ formattedVoltage }}</div>
            </div>
            <div class="voltage-input-container">
              <div class="voltage-input">
                <el-input-number
                    v-model="deviceVoltage"
                    :min="minVoltage"
                    :max="maxVoltage"
                    :step="0.01"
                    :precision="2"
                    :controls="true"
                    class="voltage-input-field"
                />
                <span class="voltage-unit">В</span>
              </div>
              <el-slider
                  v-model="deviceVoltage"
                  :min="minVoltage"
                  :max="maxVoltage"
                  :step="0.01"
                  :format-tooltip="formatVoltageTooltip"
                  class="voltage-slider"
              />
            </div>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">Интенсивность</label>
          <div class="intensity-control">
            <el-input-number
                v-model="deviceIntensity"
                :min="0"
                :max="100"
                :disabled="deviceStatus !== 'ON'"
                class="compact-number-input"
            />
            <el-slider
                v-model="deviceIntensity"
                :min="0"
                :max="100"
                :disabled="deviceStatus !== 'ON'"
                class="intensity-slider"
            />
          </div>
        </div>

        <!-- Только для фейковых устройств -->
        <div v-if="selectedDevice?.is_fake" class="control-group">
          <label class="control-label">Крит. напряжение</label>
          <div class="critical-input">
            <el-input-number
                v-model="criticalVoltage"
                :min="minVoltage"
                :max="maxVoltage"
                :step="0.01"
                :precision="2"
                :controls="true"
                class="critical-input"
            />
          </div>
          <el-slider
              v-model="criticalVoltage"
              :min="minVoltage"
              :max="maxVoltage"
              :step="0.01"
              :format-tooltip="formatVoltageTooltip"
              class="critical-slider"
          />
        </div>

        <div class="control-group">
          <label class="control-label">Управление</label>
          <div class="event-buttons">
            <el-button
                v-if="deviceStatus !== 'SLEEPING'"
                size="small"
                @click="sendEmergencySleep"
                type="info"
                class="full-width"
            >
              <Moon class="control-icon" />
              <span>Перевести в сон</span>
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

        <!-- Кнопки эмуляции событий (только для фейковых устройств) -->
        <div v-if="selectedDevice?.is_fake" class="control-group">
          <label class="control-label">Эмуляция событий</label>
          <div class="event-buttons">
            <el-button size="small" @click="simulateLowVoltage" class="full-width">
              <Warning class="control-icon" />
              <span>Низкое напряжение</span>
            </el-button>
            <el-button size="small" @click="simulateEmergency" class="full-width">
              <Bell class="control-icon" />
              <span>Аварийное событие</span>
            </el-button>
            <el-button size="small" @click="simulateCommand" class="full-width">
              <CircleCheck class="control-icon" />
              <span>Сменить статус</span>
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
import { computed, defineEmits, watch, onMounted, onUnmounted, ref, nextTick } from 'vue';
import { ElNotification } from 'element-plus';
import {
  CircleCheckFilled,
  CircleCloseFilled,
  Sunny,
  Moon,
  Warning,
  Bell,
  CircleCheck,
  Setting
} from '@element-plus/icons-vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import { logDebug, checkWebGLSupport } from '@/components/SmartLight/api/utils/webglSupport.js';
import {
  calculateMinVoltage,
  calculateMaxVoltage,
  calculateCriticalVoltage,
  calculateCriticalThresholdPosition,
  calculateBatteryNormalProgress,
  calculateBatteryCriticalProgress,
  calculateCurrentLevelPosition
} from '@/components/SmartLight/api/utils/deviceUtils.js';

const emit = defineEmits(['open-settings']);

const store = useSmartLightStore();
const webGLCheck = checkWebGLSupport();
const webGLSupported = webGLCheck.isSupported;

// Добавляем переменные для отслеживания состояния
const loading = ref(false);
const error = ref(null);
const containerCheckAttempts = ref(0);
const maxContainerCheckAttempts = 30;

const selectedDevice = computed(() => {
  const dev = store.selectedDevice;
  logDebug('DebugPanel', 'Получение выбранного устройства', {
    selectedDevice: dev ? dev.device_id : null
  });
  return dev;
});

const show3D = computed(() => {
  const mode = store.getDevice3DMode(selectedDevice.value?.device_id);
  logDebug('DebugPanel', 'Получение режима отображения', {
    deviceId: selectedDevice.value?.device_id,
    mode
  });
  return mode;
});

logDebug('DebugPanel', 'Компонент DebugPanel создан', {
  selectedDeviceId: store.selectedDeviceId,
  interfaceSettings: store.interfaceSettings,
  webGLSupported
});

// Вычисляемые свойства для выбранных устройств
const deviceStatus = computed({
  get: () => {
    const status = selectedDevice.value?.status || 'OFF';
    logDebug('DebugPanel', 'Получение статуса', {
      deviceId: selectedDevice.value?.device_id,
      status
    });
    return status;
  },
  set: (value) => {
    logDebug('DebugPanel', 'Установка статуса', {
      deviceId: selectedDevice.value?.device_id,
      value
    });
    if (selectedDevice.value) {
      store.updateDeviceStatus(selectedDevice.value.device_id, value);
    }
  }
});

const deviceVoltage = computed({
  get: () => {
    const voltage = selectedDevice.value?.voltage || 3.7;
    logDebug('DebugPanel', 'Получение напряжения', {
      deviceId: selectedDevice.value?.device_id,
      voltage
    });
    return voltage;
  },
  set: (value) => {
    logDebug('DebugPanel', 'Установка напряжения', {
      deviceId: selectedDevice.value?.device_id,
      value
    });
    if (selectedDevice.value) {
      store.updateDeviceVoltage(selectedDevice.value.device_id, value);
    }
  }
});

const deviceIntensity = computed({
  get: () => {
    const intensity = selectedDevice.value?.intensity || 100;
    logDebug('DebugPanel', 'Получение интенсивности', {
      deviceId: selectedDevice.value?.device_id,
      intensity
    });
    return intensity;
  },
  set: (value) => {
    logDebug('DebugPanel', 'Установка интенсивности', {
      deviceId: selectedDevice.value?.device_id,
      value
    });
    if (selectedDevice.value) {
      store.updateDeviceIntensity(selectedDevice.value.device_id, value);
    }
  }
});

const criticalVoltage = computed({
  get: () => {
    const critical = selectedDevice.value?.critical_voltage || calculateCriticalVoltage(selectedDevice.value?.device_id);
    logDebug('DebugPanel', 'Получение критического напряжения', {
      deviceId: selectedDevice.value?.device_id,
      critical
    });
    return critical;
  },
  set: (value) => {
    logDebug('DebugPanel', 'Установка критического напряжения', {
      deviceId: selectedDevice.value?.device_id,
      value
    });
    if (selectedDevice.value) {
      store.updateDeviceCriticalVoltage(selectedDevice.value.device_id, value);
    }
  }
});

// Вычисляем тип статуса
const statusType = computed(() => {
  const type = !selectedDevice.value ? 'info' : {
    'ON': 'success',
    'OFF': 'info',
    'SLEEPING': 'warning'
  }[selectedDevice.value.status] || 'danger';

  logDebug('DebugPanel', 'Получение типа статуса', {
    deviceId: selectedDevice.value?.device_id,
    status: selectedDevice.value?.status,
    type
  });

  return type;
});

const formatVoltageTooltip = (value) => {
  const formatted = Number(value).toFixed(2) + ' В';
  logDebug('DebugPanel', 'Форматирование тултипа напряжения', {
    value,
    formatted
  });
  return formatted;
};

// Вычисляем позицию критического порога в процентах
const criticalThresholdPosition = computed(() => {
  if (!selectedDevice.value) return 0;

  const min = calculateMinVoltage(selectedDevice.value.device_id);
  const max = calculateMaxVoltage(selectedDevice.value.device_id);
  const critical = calculateCriticalVoltage(selectedDevice.value.device_id);

  const position = ((critical - min) / (max - min)) * 100;

  logDebug('DebugPanel', 'Вычисление позиции критического порога', {
    deviceId: selectedDevice.value.device_id,
    min,
    max,
    critical,
    position
  });

  return position;
});

// Нормальный прогресс (от критического порога до max)
const batteryNormalProgress = computed(() => {
  if (!selectedDevice.value) return 0;

  const min = calculateMinVoltage(selectedDevice.value.device_id);
  const max = calculateMaxVoltage(selectedDevice.value.device_id);
  const critical = calculateCriticalVoltage(selectedDevice.value.device_id);

  logDebug('DebugPanel', 'Вычисление нормального прогресса', {
    deviceId: selectedDevice.value.device_id,
    min,
    max,
    critical,
    voltage: deviceVoltage.value
  });

  if (deviceVoltage.value <= critical) {
    return 0;
  }

  const normalVoltage = deviceVoltage.value - critical;
  const maxNormalVoltage = max - critical;
  return Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));
});

// Критический прогресс (от min до критического порога)
const batteryCriticalProgress = computed(() => {
  if (!selectedDevice.value) return 0;

  const min = calculateMinVoltage(selectedDevice.value.device_id);
  const max = calculateMaxVoltage(selectedDevice.value.device_id);
  const critical = calculateCriticalVoltage(selectedDevice.value.device_id);

  logDebug('DebugPanel', 'Вычисление критического прогресса', {
    deviceId: selectedDevice.value.device_id,
    min,
    max,
    critical,
    voltage: deviceVoltage.value
  });

  if (deviceVoltage.value >= critical) {
    return 0;
  }

  const criticalVoltageValue = critical - deviceVoltage.value;
  const criticalVoltageRange = critical - min;
  return Math.min(100, Math.max(0, (criticalVoltageValue / criticalVoltageRange) * 100));
});

// Позиция текущего уровня
const currentLevelPosition = computed(() => {
  if (!selectedDevice.value) return 0;

  const min = calculateMinVoltage(selectedDevice.value.device_id);
  const max = calculateMaxVoltage(selectedDevice.value.device_id);

  const position = ((deviceVoltage.value - min) / (max - min)) * 100;

  logDebug('DebugPanel', 'Вычисление позиции текущего уровня', {
    deviceId: selectedDevice.value.device_id,
    min,
    max,
    voltage: deviceVoltage.value,
    position
  });

  return position;
});

// Минимальное напряжение
const minVoltage = computed(() => {
  if (!selectedDevice.value) return 2.5;

  const min = calculateMinVoltage(selectedDevice.value.device_id);
  logDebug('DebugPanel', 'Получение минимального напряжения', {
    deviceId: selectedDevice.value.device_id,
    minVoltage: min
  });
  return min;
});

// Максимальное напряжение
const maxVoltage = computed(() => {
  if (!selectedDevice.value) return 4.3;

  const max = calculateMaxVoltage(selectedDevice.value.device_id);
  logDebug('DebugPanel', 'Получение максимального напряжения', {
    deviceId: selectedDevice.value.device_id,
    maxVoltage: max
  });
  return max;
});

// Цвет критического уровня
const criticalColor = computed(() => {
  if (!selectedDevice.value) return '#ffcccb';

  const color = store.deviceCriticalColor(selectedDevice.value.device_id);
  logDebug('DebugPanel', 'Получение цвета критического уровня', {
    deviceId: selectedDevice.value.device_id,
    color
  });
  return color;
});

// Цвет нормального уровня
const batteryColor = computed(() => {
  if (!selectedDevice.value) return '#67c23a';

  const color = store.deviceBatteryColor(selectedDevice.value.device_id);
  logDebug('DebugPanel', 'Получение цвета нормального уровня', {
    deviceId: selectedDevice.value.device_id,
    color
  });
  return color;
});

const batteryTypeName = computed(() => {
  if (!selectedDevice.value) return 'Нормальный режим';

  const voltage = deviceVoltage.value;
  let name;
  if (voltage < 3.0) name = 'Критический режим';
  else if (voltage < 3.4) name = 'Внимание';
  else name = 'Нормальный режим';

  logDebug('DebugPanel', 'Определение типа аккумулятора', {
    deviceId: selectedDevice.value?.device_id,
    voltage,
    name
  });

  return name;
});

// Форматированное минимальное напряжение
const formattedMinVoltage = computed(() => {
  if (!selectedDevice.value) return '2.5';

  const value = calculateMinVoltage(selectedDevice.value.device_id).toFixed(1);
  logDebug('DebugPanel', 'Форматирование минимального напряжения', {
    deviceId: selectedDevice.value.device_id,
    value
  });
  return value;
});

// Форматированное максимальное напряжение
const formattedMaxVoltage = computed(() => {
  if (!selectedDevice.value) return '4.3';

  const value = calculateMaxVoltage(selectedDevice.value.device_id).toFixed(1);
  logDebug('DebugPanel', 'Форматирование максимального напряжения', {
    deviceId: selectedDevice.value.device_id,
    value
  });
  return value;
});

// Форматированное критическое напряжение
const formattedCriticalThreshold = computed(() => {
  if (!selectedDevice.value) return '3.00';

  const value = calculateCriticalVoltage(selectedDevice.value.device_id).toFixed(2);
  logDebug('DebugPanel', 'Форматирование критического напряжения', {
    deviceId: selectedDevice.value.device_id,
    value
  });
  return value;
});

// Форматированное значение напряжения
const formattedVoltage = computed(() => {
  if (!selectedDevice.value) return '3.70 В';

  const value = deviceVoltage.value.toFixed(2) + ' В';
  logDebug('DebugPanel', 'Форматирование текущего напряжения', {
    deviceId: selectedDevice.value?.device_id,
    value
  });
  return value;
});

// Обработчик изменения статуса
const updateStatus = (value) => {
  logDebug('DebugPanel', 'Обновление статуса', {
    deviceId: selectedDevice.value?.device_id,
    value
  });

  if (selectedDevice.value) {
    store.updateDeviceStatus(selectedDevice.value.device_id, value);
  }
};

// Перевод в спящий режим
const sendEmergencySleep = async () => {
  logDebug('DebugPanel', 'Перевод в спящий режим', {
    deviceId: selectedDevice.value?.device_id,
    isFake: selectedDevice.value?.is_fake
  });

  if (selectedDevice.value) {
    if (selectedDevice.value.is_fake) {
      logDebug('DebugPanel', 'Эмуляция перевода в сон', { deviceId: selectedDevice.value.device_id });

      await new Promise(resolve => setTimeout(resolve, 300));
      store.updateDeviceStatus(selectedDevice.value.device_id, 'SLEEPING');
      ElNotification({
        title: 'Эмуляция',
        message: 'Устройство переведено в сон',
        type: 'info',
        duration: 2000
      });
    } else {
      logDebug('DebugPanel', 'Отправка команды перевода в сон', { deviceId: selectedDevice.value.device_id });

      const response = await store.forceSleep(selectedDevice.value.device_id);
      if (response.success) {
        logDebug('DebugPanel', 'Устройство переведено в сон', { deviceId: selectedDevice.value.device_id });

        ElNotification({
          title: 'Устройство',
          message: 'Устройство переведено в спящий режим',
          type: 'success',
          duration: 2000
        });
      } else {
        logDebug('DebugPanel', 'Ошибка отправки команды сна', {
          deviceId: selectedDevice.value.device_id,
          error: response.message
        });

        ElNotification({
          title: 'Ошибка',
          message: 'Не удалось перевести устройство в спящий режим',
          type: 'error',
          duration: 2000
        });
      }
    }
  }
};

// Пробуждение устройства
const wakeDevice = async () => {
  logDebug('DebugPanel', 'Пробуждение устройства', {
    deviceId: selectedDevice.value?.device_id,
    isFake: selectedDevice.value?.is_fake
  });

  if (selectedDevice.value) {
    if (selectedDevice.value.is_fake) {
      logDebug('DebugPanel', 'Эмуляция пробуждения', { deviceId: selectedDevice.value.device_id });

      await new Promise(resolve => setTimeout(resolve, 300));
      store.wakeDevice(selectedDevice.value.device_id);
      ElNotification({
        title: 'Эмуляция',
        message: 'Устройство пробуждено',
        type: 'success',
        duration: 2000
      });
    } else {
      logDebug('DebugPanel', 'Отправка команды пробуждения', { deviceId: selectedDevice.value.device_id });

      const response = await store.wakeDevice(selectedDevice.value.device_id);
      if (response.success) {
        logDebug('DebugPanel', 'Устройство пробуждено', { deviceId: selectedDevice.value.device_id });

        ElNotification({
          title: 'Устройство',
          message: 'Устройство пробуждено',
          type: 'success',
          duration: 2000
        });
      } else {
        logDebug('DebugPanel', 'Ошибка пробуждения устройства', {
          deviceId: selectedDevice.value.device_id,
          error: response.message
        });

        ElNotification({
          title: 'Ошибка',
          message: 'Не удалось пробудить устройство',
          type: 'error',
          duration: 2000
        });
      }
    }
  }
};

// Эмуляция низкого напряжения
const simulateLowVoltage = () => {
  logDebug('DebugPanel', 'Эмуляция низкого напряжения', { deviceId: selectedDevice.value?.device_id });

  if (selectedDevice.value) {
    store.updateDeviceVoltage(
        selectedDevice.value.device_id,
        criticalVoltage.value - 0.1
    );
    store.updateDeviceStatus(
        selectedDevice.value.device_id,
        'SLEEPING'
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
  logDebug('DebugPanel', 'Эмуляция аварийного события', { deviceId: selectedDevice.value?.device_id });

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
  logDebug('DebugPanel', 'Эмуляция отправки команды', { deviceId: selectedDevice.value?.device_id });

  if (selectedDevice.value) {
    const newStatus = deviceStatus.value === 'ON' ? 'OFF' : 'ON';
    const newVoltage = newStatus === 'ON'
        ? Math.min(4.3, deviceVoltage.value + 0.05)
        : Math.max(2.5, deviceVoltage.value - 0.05);

    logDebug('DebugPanel', 'Эмуляция команды', {
      deviceId: selectedDevice.value.device_id,
      newStatus,
      newVoltage
    });

    store.updateDeviceStatus(
        selectedDevice.value.device_id,
        newStatus
    );
    store.updateDeviceVoltage(
        selectedDevice.value.device_id,
        newVoltage
    );
    store.updateDeviceIntensity(
        selectedDevice.value.device_id,
        newStatus === 'ON' ? 100 : 0
    );
    ElNotification({
      title: 'Эмуляция',
      message: `Команда "${newStatus}" отправлена`,
      type: 'success',
      duration: 2000
    });
  }
};

const openDeviceSettings = () => {
  logDebug('DebugPanel', 'Открытие настроек устройства', { deviceId: selectedDevice.value?.device_id });
  emit('open-settings', selectedDevice.value);
};

// Обработчик завершения инициализации 3D
const handleInitComplete = (success) => {
  logDebug('DebugPanel', 'Инициализация 3D завершена', {
    deviceId: selectedDevice.value?.device_id,
    success
  });
};

// Принудительная инициализация 3D
const force3DInit = () => {
  logDebug('DebugPanel', 'Принудительная инициализация 3D', {
    deviceId: selectedDevice.value?.device_id,
    show3D: show3D.value
  });

  if (selectedDevice.value) {
    handleInit3D(selectedDevice.value.device_id);
  }
};

// Обработчик инициализации 3D
const handleInit3D = (deviceId) => {
  logDebug('DebugPanel', 'Принудительная инициализация 3D', { deviceId });

  // Ищем компонент DeviceCard
  const deviceCard = document.querySelector(`[data-device-id="${deviceId}"]`);
  if (deviceCard && deviceCard.forceInit) {
    logDebug('DebugPanel', 'Вызов forceInit в DeviceCard', { deviceId });
    deviceCard.forceInit();
  } else {
    logDebug('DebugPanel', 'DeviceCard не найден или forceInit недоступен', { deviceId });
  }
};

// Инициализация при монтировании
onMounted(() => {
  logDebug('DebugPanel', 'Инициализация компонента DebugPanel');

  // Проверяем, есть ли выбранное устройство
  if (selectedDevice.value) {
    logDebug('DebugPanel', 'Устройство уже выбрано', { deviceId: selectedDevice.value.device_id });

    // Даем время на полное отображение
    setTimeout(() => {
      handleInit3D(selectedDevice.value.device_id);
    }, 300);
  }

  // Даем время для полной загрузки
  setTimeout(() => {
    // Добавляем обработчик переключения вкладок
    const tabContent = document.querySelector('.el-tabs__content');
    if (tabContent) {
      logDebug('DebugPanel', 'Наблюдение за табами', { tabContent });

      const observer = new MutationObserver(() => {
        logDebug('DebugPanel', 'Изменение табов обнаружено');
        // Даем время на переключение
        setTimeout(() => {
          // Если активирован таб с фейковыми устройствами
          if (document.querySelector('.el-tab-pane.is-active[data-name="fake"]')) {
            logDebug('DebugPanel', 'Таб с фейковыми устройствами активирован');

            // Принудительно инициализируем 3D для фейковых устройств
            store.fakeDevices.forEach(device => {
              handleInit3D(device.device_id);
            });
          }
        }, 500);
      });

      observer.observe(tabContent, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
  }, 100);
});

// Очистка при размонтировании
onUnmounted(() => {
  logDebug('DebugPanel', 'Компонент размонтирован', { deviceId: selectedDevice.value?.device_id });
});

// Следим за изменениями в сторе
watch(() => store.selectedDevice, (newDevice, oldDevice) => {
  logDebug('DebugPanel', 'Выбранное устройство изменилось', {
    oldDeviceId: oldDevice ? oldDevice.device_id : null,
    newDeviceId: newDevice ? newDevice.device_id : null
  });

  // Сбрасываем счетчик попыток
  containerCheckAttempts.value = 0;

  // Если есть новое устройство, инициализируем
  if (newDevice) {
    logDebug('DebugPanel', 'Новое устройство выбрано', { deviceId: newDevice.device_id });

    // Даем время на полное отображение
    setTimeout(() => {
      handleInit3D(newDevice.device_id);

      // Повторная проверка через 500 мс
      setTimeout(() => {
        handleInit3D(newDevice.device_id);
      }, 500);
    }, 300);
  }
}, { deep: true });

// Следим за переключением режима отображения
watch(() => store.interfaceSettings.global3DMode, (newMode, oldMode) => {
  logDebug('DebugPanel', 'Изменение режима отображения', {
    oldMode,
    newMode
  });

  if (newMode && selectedDevice.value) {
    logDebug('DebugPanel', 'Переключение на 3D-режим', { deviceId: selectedDevice.value.device_id });

    // Даем время на отображение
    setTimeout(() => {
      handleInit3D(selectedDevice.value.device_id);
    }, 300);
  }
});
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
.debug-header-content {
  height: 100px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.debug-content {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  overflow-y: auto;
  height: 360px;
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
  position: relative;
  height: 40px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.battery {
  position: relative;
  width: 100%;
  height: 30px;
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
  transition: width 0.3s ease, background-color 0.3s ease;
}
.battery-critical {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #f56c6c 0%, #ff9999 100%);
  overflow: hidden;
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
  font-size: 0.7rem;
  color: #909399;
  width: 100%;
}
.battery-level {
  position: absolute;
  font-size: 0.7rem;
  color: #909399;
}
.battery-type-info {
  position: absolute;
  bottom: -1.5rem;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #606266;
}
.battery-type-label {
  font-weight: bold;
}
.voltage-value {
  text-align: center;
  font-weight: bold;
  color: #409eff;
  font-size: 0.85rem;
  margin-top: 0.2rem;
  line-height: 1.2;
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
.voltage-slider {
  width: 100%;
}
.critical-input {
  width: 100%;
}
.intensity-control {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
:deep(.el-radio-button__inner) {
  display: inline-flex;
  vertical-align: middle;
  padding: .5rem .2rem .4rem .8rem;
  width: 100%;
  min-width: 75px;
  font-size: 0.9rem;
  height: 2rem;
  line-height: 1.25rem;
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
