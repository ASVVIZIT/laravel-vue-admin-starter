<template>
  <div class="debug-panel">
    <el-card class="debug-card">
      <template #header>
        <div class="debug-header">
          <h3>
            <el-icon name="bug" class="mr-1" />
            Панель отладки
          </h3>
          <el-tag type="warning">Тестовый режим</el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="debug-tabs">
        <el-tab-pane name="real" label="Реальные устройства" :disabled="realDevices.length === 0">
          <el-form v-if="realDevices.length > 0" label-width="180px" size="small">
            <el-form-item label="Выберите устройство">
              <el-select
                  v-model="selectedDeviceId"
                  @change="loadDevice"
                  class="w-full"
                  clearable
              >
                <el-option
                    v-for="device in realDevices"
                    :key="device.device_id"
                    :value="device.device_id"
                    :label="`${device.name} (${device.device_id})`"
                >
                  <div class="debug-device-option">
                    <span>{{ device.name }}</span>
                    <el-tag :type="statusType(device.status)" size="small">
                      {{ device.status }}
                    </el-tag>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <div v-if="currentDevice">
              <el-form-item label="Статус">
                <el-radio-group v-model="deviceStatus" @change="updateStatus">
                  <el-radio-button label="ON">
                    <el-icon name="light-on" class="mr-1" />
                    Вкл
                  </el-radio-button>
                  <el-radio-button label="OFF">
                    <el-icon name="light-off" class="mr-1" />
                    Выкл
                  </el-radio-button>
                  <el-radio-button label="SLEEPING">
                    <el-icon name="moon" class="mr-1" />
                    Сон
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="Напряжение">
                <div class="voltage-control">
                  <el-slider
                      v-model="deviceVoltage"
                      :min="2.5"
                      :max="4.3"
                      :step="0.01"
                      :format-tooltip="formatVoltageTooltip"
                      class="w-full"
                  />
                  <div class="voltage-display">
                    <div class="battery">
                      <div
                          class="battery-fill"
                          :style="{ width: batteryProgress + '%', backgroundColor: batteryColor }"
                      ></div>
                      <div class="battery-cap"></div>
                    </div>
                    <span class="voltage-value">{{ deviceVoltage.toFixed(2) }} В</span>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="Интенсивность">
                <el-slider
                    v-model="deviceIntensity"
                    :min="0"
                    :max="100"
                    :disabled="deviceStatus !== 'ON'"
                />
              </el-form-item>
            </div>
          </el-form>
          <div v-else class="no-devices">
            <el-empty description="Нет реальных устройств" />
          </div>
        </el-tab-pane>

        <el-tab-pane name="fake" label="Тестовые устройства" :disabled="fakeDevices.length === 0">
          <el-form v-if="fakeDevices.length > 0" label-width="180px" size="small">
            <el-form-item label="Выберите устройство">
              <el-select
                  v-model="selectedFakeDeviceId"
                  @change="loadFakeDevice"
                  class="w-full"
                  clearable
              >
                <el-option
                    v-for="device in fakeDevices"
                    :key="device.device_id"
                    :value="device.device_id"
                    :label="`${device.name} (${device.device_id})`"
                >
                  <div class="debug-device-option">
                    <span>{{ device.name }}</span>
                    <el-tag type="warning" size="small">
                      <el-icon name="bug" class="mr-1" />
                      Тест
                    </el-tag>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <div v-if="currentFakeDevice">
              <el-form-item label="Статус">
                <el-radio-group v-model="fakeDeviceStatus" @change="updateFakeStatus">
                  <el-radio-button label="ON">
                    <el-icon name="light-on" class="mr-1" />
                    Вкл
                  </el-radio-button>
                  <el-radio-button label="OFF">
                    <el-icon name="light-off" class="mr-1" />
                    Выкл
                  </el-radio-button>
                  <el-radio-button label="SLEEPING">
                    <el-icon name="moon" class="mr-1" />
                    Сон
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="Напряжение">
                <div class="voltage-control">
                  <el-slider
                      v-model="fakeDeviceVoltage"
                      :min="2.5"
                      :max="4.3"
                      :step="0.01"
                      :format-tooltip="formatVoltageTooltip"
                      class="w-full"
                  />
                  <div class="voltage-display">
                    <div class="battery">
                      <div
                          class="battery-fill"
                          :style="{ width: fakeBatteryProgress + '%', backgroundColor: fakeBatteryColor }"
                      ></div>
                      <div class="battery-cap"></div>
                    </div>
                    <span class="voltage-value">{{ fakeDeviceVoltage.toFixed(2) }} В</span>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="Интенсивность">
                <el-slider
                    v-model="fakeDeviceIntensity"
                    :min="0"
                    :max="100"
                    :disabled="fakeDeviceStatus !== 'ON'"
                />
              </el-form-item>

              <el-form-item label="Критическое напряжение">
                <el-input-number
                    v-model="fakeDeviceCriticalVoltage"
                    :min="2.5"
                    :max="4.3"
                    :step="0.01"
                    :precision="2"
                />
              </el-form-item>

              <el-form-item label="Эмуляция событий">
                <div class="event-buttons">
                  <el-button size="small" @click="simulateLowVoltage">
                    <el-icon name="warning" class="mr-1" />
                    Низкое напряжение
                  </el-button>
                  <el-button size="small" @click="simulateEmergency">
                    <el-icon name="bell" class="mr-1" />
                    Аварийное событие
                  </el-button>
                  <el-button size="small" @click="simulateCommand">
                    <el-icon name="command" class="mr-1" />
                    Отправить команду
                  </el-button>
                </div>
              </el-form-item>
            </div>
          </el-form>
          <div v-else class="no-devices">
            <el-empty description="Нет тестовых устройств" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElNotification } from 'element-plus';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';

const store = useSmartLightStore();
const activeTab = ref('fake');
const selectedDeviceId = ref(null);
const selectedFakeDeviceId = ref(null);

// Реальные устройства
const realDevices = computed(() => {
  return store.devices.filter(device => !device.is_fake);
});

// Фейковые устройства
const fakeDevices = computed(() => {
  return store.devices.filter(device => device.is_fake);
});

// Текущее реальное устройство
const currentDevice = computed(() => {
  return realDevices.value.find(d => d.device_id === selectedDeviceId.value);
});

// Текущее фейковое устройство
const currentFakeDevice = computed(() => {
  return fakeDevices.value.find(d => d.device_id === selectedFakeDeviceId.value);
});

// Реальные устройства
const deviceStatus = ref('OFF');
const deviceVoltage = ref(3.7);
const deviceIntensity = ref(100);

// Фейковые устройства
const fakeDeviceStatus = ref('OFF');
const fakeDeviceVoltage = ref(3.7);
const fakeDeviceIntensity = ref(100);
const fakeDeviceCriticalVoltage = ref(3.2);

// Цвет батареи для реальных устройств
const batteryProgress = computed(() => {
  const voltage = deviceVoltage.value;
  return Math.min(100, Math.max(0, ((voltage - 2.5) / (4.3 - 2.5)) * 100));
});

const batteryColor = computed(() => {
  const voltage = deviceVoltage.value;
  if (voltage < 3.0) return '#f56c6c';
  if (voltage < 3.4) return '#e6a23c';
  return '#67c23a';
});

// Цвет батареи для фейковых устройств
const fakeBatteryProgress = computed(() => {
  const voltage = fakeDeviceVoltage.value;
  return Math.min(100, Math.max(0, ((voltage - 2.5) / (4.3 - 2.5)) * 100));
});

const fakeBatteryColor = computed(() => {
  const voltage = fakeDeviceVoltage.value;
  if (voltage < 3.0) return '#f56c6c';
  if (voltage < 3.4) return '#e6a23c';
  return '#67c23a';
});

const statusType = (status) => {
  switch (status) {
    case 'ON': return 'success';
    case 'OFF': return 'info';
    case 'SLEEPING': return 'warning';
    default: return 'danger';
  }
};

const formatVoltageTooltip = (value) => {
  return Number(value).toFixed(2) + ' В';
};

// Загрузка реального устройства
const loadDevice = (deviceId) => {
  const device = realDevices.value.find(d => d.device_id === deviceId);
  if (device) {
    selectedDeviceId.value = deviceId;
    deviceStatus.value = device.status;
    deviceVoltage.value = device.voltage;
    deviceIntensity.value = device.intensity;
  }
};

// Обновление реального устройства
const updateStatus = () => {
  const device = realDevices.value.find(d => d.device_id === selectedDeviceId.value);
  if (device) {
    device.status = deviceStatus.value;
    device.voltage = deviceVoltage.value;
    device.intensity = deviceIntensity.value;

    ElNotification({
      title: 'Устройство',
      message: `Реальное устройство обновлено`,
      type: 'success'
    });
  }
};

// Загрузка фейкового устройства
const loadFakeDevice = (deviceId) => {
  const device = fakeDevices.value.find(d => d.device_id === deviceId);
  if (device) {
    selectedFakeDeviceId.value = deviceId;
    fakeDeviceStatus.value = device.status;
    fakeDeviceVoltage.value = device.voltage;
    fakeDeviceIntensity.value = device.intensity;
    fakeDeviceCriticalVoltage.value = device.critical_voltage;
  }
};

// Обновление фейкового устройства
const updateFakeStatus = () => {
  const device = fakeDevices.value.find(d => d.device_id === selectedFakeDeviceId.value);
  if (device) {
    device.status = fakeDeviceStatus.value;
    device.voltage = fakeDeviceVoltage.value;
    device.intensity = fakeDeviceIntensity.value;
    device.critical_voltage = fakeDeviceCriticalVoltage.value;

    ElNotification({
      title: 'Тестовое устройство',
      message: `Обновлено`,
      type: 'success'
    });
  }
};

// Эмуляция низкого напряжения
const simulateLowVoltage = () => {
  fakeDeviceVoltage.value = 2.9;
  fakeDeviceStatus.value = 'ON';

  ElNotification({
    title: 'Эмуляция',
    message: 'Низкое напряжение (2.9 В)',
    type: 'warning',
    duration: 2000
  });
};

// Эмуляция аварийного события
const simulateEmergency = () => {
  fakeDeviceVoltage.value = 2.7;
  fakeDeviceStatus.value = 'SLEEPING';

  ElNotification({
    title: 'Эмуляция',
    message: 'Эмуляция аварийного события',
    type: 'error',
    duration: 2000
  });
};

// Эмуляция отправки команды
const simulateCommand = () => {
  fakeDeviceStatus.value = fakeDeviceStatus.value === 'ON' ? 'OFF' : 'ON';
  fakeDeviceVoltage.value = fakeDeviceStatus.value === 'ON' ? 3.9 : 3.8;

  ElNotification({
    title: 'Эмуляция',
    message: `Команда "${fakeDeviceStatus.value}" отправлена`,
    type: 'success',
    duration: 2000
  });
};

// Инициализация
onMounted(() => {
  store.fetchDevices();

  // Автоматический выбор первого фейкового устройства
  if (fakeDevices.value.length > 0) {
    selectedFakeDeviceId.value = fakeDevices.value[0].device_id;
    loadFakeDevice(selectedFakeDeviceId.value);
  }

  // Автоматический выбор первого реального устройства
  if (realDevices.value.length > 0) {
    selectedDeviceId.value = realDevices.value[0].device_id;
    loadDevice(selectedDeviceId.value);
  }
});

// Следим за изменениями в сторе
watch(() => store.devices, () => {
  // Автоматический выбор первого фейкового устройства
  if (fakeDevices.value.length > 0 && !selectedFakeDeviceId.value) {
    selectedFakeDeviceId.value = fakeDevices.value[0].device_id;
    loadFakeDevice(selectedFakeDeviceId.value);
  }

  // Автоматический выбор первого реального устройства
  if (realDevices.value.length > 0 && !selectedDeviceId.value) {
    selectedDeviceId.value = realDevices.value[0].device_id;
    loadDevice(selectedDeviceId.value);
  }
});
</script>

<style scoped>
.debug-panel {
  margin-top: 20px;
}

.debug-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.debug-device-option {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.voltage-control {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.voltage-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.battery {
  position: relative;
  width: 120px;
  height: 60px;
  border: 2px solid #409eff;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 0%, #f9f9f9 100%);
  overflow: hidden;
}

.battery-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.battery-cap {
  position: absolute;
  top: 20px;
  right: -8px;
  width: 8px;
  height: 20px;
  background: #409eff;
  border-radius: 0 4px 4px 0;
}

.voltage-value {
  font-weight: bold;
  color: #409eff;
  font-size: 1.1rem;
  min-width: 80px;
  text-align: center;
}

.debug-tabs {
  margin-top: 1rem;
}

.no-devices {
  padding: 1.5rem;
}

.event-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

:deep(.el-radio-button__inner) {
  width: 80px;
}
</style>
