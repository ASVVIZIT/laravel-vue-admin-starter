<template>
  <div class="device-settings-container">
    <el-page-header @back="$router.back" content="Настройки устройства" />

    <el-card class="settings-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="device-header">
          <h3>{{ device.name }}</h3>
          <el-tag :type="statusType" size="small">{{ device.status }}</el-tag>
        </div>
      </template>

      <el-alert
          v-if="error"
          :title="error"
          type="error"
          show-icon
          class="mb-4"
          closable
      />

      <el-form
          :model="localDevice"
          label-width="180px"
          label-position="left"
          class="device-settings-form"
          size="small"
      >
        <el-tabs type="border-card">
          <el-tab-pane label="Основные настройки" name="main">
            <!-- Критическое напряжение -->
            <el-form-item label="Критическое напряжение (В)">
              <div class="battery-slider-container">
                <div class="battery-display">
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
                  <span class="battery-value">{{ localDevice.critical_voltage.toFixed(3) }} В</span>
                </div>

                <el-slider
                    v-model="localDevice.critical_voltage"
                    :min="2.5"
                    :max="4.3"
                    :step="0.001"
                    :format-tooltip="formatVoltageTooltip"
                    class="custom-slider"
                />

                <el-input-number
                    v-model="localDevice.critical_voltage"
                    :min="2.5"
                    :max="4.3"
                    :step="0.001"
                    :precision="3"
                    class="compact-number-input"
                />
              </div>
              <template #help>
                Ниже этого значения устройство перейдёт в аварийный режим
              </template>
            </el-form-item>

            <!-- Интервал сна -->
            <el-form-item label="Интервал сна (сек)">
              <div class="range-input-container">
                <el-input-number
                    v-model="localDevice.sleep_interval"
                    :min="60"
                    :max="86400"
                    :step="60"
                    :controls="false"
                    class="compact-number-input"
                />
                <el-slider
                    v-model="localDevice.sleep_interval"
                    :min="60"
                    :max="3600"
                    :step="60"
                    class="compact-slider"
                />
              </div>
              <template #help>
                Интервал проверки команд в нормальном режиме. 600 = 10 минут
              </template>
            </el-form-item>

            <!-- Экстренный интервал сна -->
            <el-form-item label="Экстренный интервал (сек)">
              <div class="range-input-container">
                <el-input-number
                    v-model="localDevice.emergency_sleep_interval"
                    :min="300"
                    :max="86400"
                    :step="300"
                    :controls="false"
                    class="compact-number-input"
                />
                <el-slider
                    v-model="localDevice.emergency_sleep_interval"
                    :min="300"
                    :max="7200"
                    :step="300"
                    class="compact-slider"
                />
              </div>
              <template #help>
                Интервал сна при критическом заряде. 3600 = 1 час
              </template>
            </el-form-item>

            <!-- Тип устройства -->
            <el-form-item label="Тип устройства">
              <el-select v-model="localDevice.device_type" class="w-full" disabled>
                <el-option value="node_mcu_v3" label="NodeMCU V3" />
                <el-option value="esp8266" label="ESP8266" />
                <el-option value="esp32" label="ESP32" />
              </el-select>
              <template #help>
                Тип устройства не может быть изменен
              </template>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="Wi-Fi настройки" name="wifi">
            <el-form-item label="SSID Wi-Fi">
              <el-input
                  v-model="localDevice.wifi_ssid"
                  placeholder="MyHomeWiFi"
                  clearable
              />
            </el-form-item>

            <el-form-item label="Пароль Wi-Fi">
              <el-input
                  v-model="localDevice.wifi_password"
                  type="password"
                  show-password
                  placeholder="Введите пароль"
                  clearable
              />
            </el-form-item>

            <el-form-item label="MAC-адрес">
              <el-input v-model="localDevice.mac_address" readonly>
                <template #append>
                  <el-button @click="copyMacAddress">Копировать</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="Телеметрия" name="telemetry">
            <div class="telemetry-container">
              <div class="telemetry-header">
                <h4>История напряжения</h4>
                <el-button size="small" @click="refreshTelemetry">
                  <el-icon name="refresh" class="mr-1" />
                  Обновить
                </el-button>
              </div>

              <div class="telemetry-chart">
                <el-empty v-if="telemetry.length === 0" description="Нет данных телеметрии" />
                <div v-else class="chart-container">
                  <div class="chart-y-axis">
                    <div v-for="i in 5" :key="i" class="chart-y-label">
                      {{ (2.5 + (4.3 - 2.5) * (1 - (i-1)/4)).toFixed(1) }}
                    </div>
                  </div>

                  <div class="chart-x-axis">
                    <div
                        v-for="(point, index) in telemetry"
                        :key="index"
                        class="chart-point"
                        :style="{
                        bottom: `${((point.voltage - 2.5) / (4.3 - 2.5) * 100}%`,
                        backgroundColor: point.is_emergency ? '#f56c6c' : '#409eff'
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="form-actions">
          <el-button type="primary" @click="saveDevice">
            <el-icon name="check" class="mr-1" />
            Сохранить
          </el-button>
          <el-button @click="resetToDefault">Сбросить</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { useRoute } from 'vue-router';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';

const route = useRoute();
const store = useSmartLightStore();
const loading = ref(false);
const error = ref(null);
const telemetry = ref([]);

// Получаем устройство по ID из URL
const deviceId = computed(() => route.params.id);
const device = computed(() => {
  return store.devices.find(d => d.device_id === deviceId.value);
});

const localDevice = ref({
  name: '',
  device_id: '',
  status: 'OFF',
  voltage: 3.7,
  intensity: 100,
  critical_voltage: 3.2,
  sleep_interval: 600,
  emergency_sleep_interval: 3600,
  device_type: 'node_mcu_v3',
  wifi_ssid: '',
  wifi_password: '',
  mac_address: ''
});

// Синхронизация с устройством
onMounted(() => {
  if (device.value) {
    syncLocalDevice();
    loadTelemetry();
  } else {
    error.value = 'Устройство не найдено';
  }
});

watch(device, (newVal) => {
  if (newVal) {
    syncLocalDevice();
    loadTelemetry();
  }
});

const syncLocalDevice = () => {
  if (device.value) {
    localDevice.value = {
      ...localDevice.value,
      ...device.value,
      wifi_ssid: device.value.wifi_ssid || '',
      wifi_password: device.value.wifi_password || '',
      mac_address: device.value.mac_address || `SL-${device.value.device_id}`
    };
  }
};

const statusType = computed(() => {
  switch (localDevice.value.status) {
    case 'ON': return 'success';
    case 'OFF': return 'info';
    case 'SLEEPING': return 'warning';
    case 'LOW_POWER': return 'danger';
    default: return 'info';
  }
});

const batteryProgress = computed(() => {
  const voltage = Number(localDevice.value.voltage);
  return Math.min(100, Math.max(0, ((voltage - 2.5) / (4.3 - 2.5)) * 100));
});

const batteryColor = computed(() => {
  const voltage = Number(localDevice.value.voltage);
  if (voltage < 3.0) return '#f56c6c';
  if (voltage < 3.4) return '#e6a23c';
  return '#67c23a';
});

const formatVoltageTooltip = (value) => {
  return Number(value).toFixed(3) + ' В';
};

const loadTelemetry = async () => {
  try {
    // В реальном приложении здесь будет вызов API
    // Для теста создаем фейковую телеметрию
    const now = new Date();
    const fakeTelemetry = [];

    for (let i = 0; i < 10; i++) {
      const voltage = 3.7 - (i * 0.05);
      fakeTelemetry.push({
        voltage,
        status: voltage > 3.2 ? 'ON' : 'SLEEPING',
        is_emergency: voltage < 3.0,
        received_at: new Date(now.getTime() - i * 300000)
      });
    }

    telemetry.value = fakeTelemetry;
  } catch (err) {
    error.value = 'Ошибка загрузки телеметрии';
  }
};

const saveDevice = async () => {
  try {
    loading.value = true;
    error.value = null;

    // В реальном приложении здесь будет вызов API
    // Для теста просто обновляем локальное состояние
    const updatedDevice = {
      ...device.value,
      critical_voltage: localDevice.value.critical_voltage,
      sleep_interval: localDevice.value.sleep_interval,
      emergency_sleep_interval: localDevice.value.emergency_sleep_interval,
      wifi_ssid: localDevice.value.wifi_ssid,
      wifi_password: localDevice.value.wifi_password
    };

    // В реальном приложении: await store.updateDevice(updatedDevice);
    // Для теста обновляем только локальные данные
    store.devices = store.devices.map(d =>
        d.device_id === updatedDevice.device_id ? updatedDevice : d
    );

    ElMessage.success('Настройки сохранены');
  } catch (err) {
    error.value = err.message || 'Ошибка сохранения настроек';
    ElMessage.error('Не удалось сохранить настройки');
  } finally {
    loading.value = false;
  }
};

const resetToDefault = () => {
  if (!device.value) return;

  localDevice.value.critical_voltage = 3.2;
  localDevice.value.sleep_interval = 600;
  localDevice.value.emergency_sleep_interval = 3600;

  ElNotification({
    title: 'Сброс',
    message: 'Настройки сброшены к значениям по умолчанию',
    type: 'success'
  });
};

const copyMacAddress = () => {
  navigator.clipboard.writeText(localDevice.value.mac_address);
  ElNotification({
    title: 'Скопировано',
    message: 'MAC-адрес скопирован в буфер обмена',
    type: 'success'
  });
};
</script>

<style scoped>
.device-settings-container {
  padding: 1.5rem;
}

.device-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.settings-card {
  border-radius: 8px;
}

.device-settings-form {
  padding: 1rem;
}

.battery-slider-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.battery-display {
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

.battery-value {
  font-weight: bold;
  color: #409eff;
  font-size: 1.1rem;
  min-width: 80px;
  text-align: center;
}

.range-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.compact-number-input {
  width: 120px;
}

.compact-slider {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.telemetry-container {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  margin-top: 10px;
}

.telemetry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chart-container {
  position: relative;
  height: 200px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  background: #fff;
}

.chart-y-axis {
  position: absolute;
  left: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
}

.chart-y-label {
  font-size: 12px;
  color: #909399;
}

.chart-x-axis {
  position: absolute;
  left: 25px;
  right: 10px;
  bottom: 10px;
  height: calc(100% - 20px);
  display: flex;
  align-items: flex-start;
  gap: 2px;
  background: #f5f7fa;
  border-radius: 2px;
  overflow: hidden;
}

.chart-point {
  width: 4px;
  position: absolute;
  height: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

:deep(.el-tabs__content) {
  padding: 15px;
}

:deep(.el-slider__runway) {
  margin: 8px 0;
  height: 4px;
}

:deep(.el-slider__button) {
  width: 14px;
  height: 14px;
}
</style>
