<template>
  <div class="device-settings-container" v-if="deviceLoaded">
    <el-page-header @back="$router.back" content="Настройки устройства" />

    <el-card class="settings-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="device-header">
          <h3>{{ device.name }}</h3>
          <div class="header-tags">
            <el-tag :type="statusType" size="small">{{ device.status }}</el-tag>
            <el-tag v-if="device.is_fake" type="warning" size="small">
              <el-icon name="bug" class="mr-1" />
              Демо
            </el-tag>
            <el-tag v-else-if="device.isManual()" type="info" size="small">
              <el-icon name="user" class="mr-1" />
              Ручное
            </el-tag>
          </div>
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

      <el-skeleton v-if="loading" :rows="6" animated />

      <div v-else class="scrollable-content">
        <el-form
            :model="localDevice"
            label-width="220px"
            label-position="left"
            class="settings-form"
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
                  <div class="help-content">
                    <el-icon name="warning" class="mr-1" />
                    <span>Ниже этого значения устройство перейдёт в аварийный режим</span>
                  </div>
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
                  <div class="help-content">
                    <el-icon name="timer" class="mr-1" />
                    <span>Интервал проверки команд в нормальном режиме. 600 = 10 минут</span>
                  </div>
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
                  <div class="help-content">
                    <el-icon name="moon" class="mr-1" />
                    <span>Интервал сна при критическом заряде. 3600 = 1 час</span>
                  </div>
                </template>
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="Wi-Fi настройки" name="wifi">
              <!-- SSID Wi-Fi -->
              <el-form-item label="SSID Wi-Fi">
                <el-input
                    v-model="localDevice.wifi_ssid"
                    placeholder="MyHomeWiFi"
                    clearable
                />
              </el-form-item>

              <!-- Пароль Wi-Fi -->
              <el-form-item label="Пароль Wi-Fi">
                <el-input
                    v-model="localDevice.wifi_password"
                    type="password"
                    show-password
                    placeholder="Введите пароль"
                    clearable
                />
              </el-form-item>

              <!-- MAC-адрес -->
              <el-form-item label="MAC-адрес">
                <el-input v-model="localDevice.mac_address" readonly>
                  <template #append>
                    <el-button @click="copyMacAddress">
                      <el-icon name="copy-document" />
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="Системные настройки" name="system">
              <!-- Тип устройства -->
              <el-form-item label="Тип устройства">
                <el-select v-model="localDevice.device_type" class="w-full" disabled>
                  <el-option value="node_mcu_v3" label="NodeMCU V3" />
                  <el-option value="esp8266" label="ESP8266" />
                  <el-option value="esp32" label="ESP32" />
                  <el-option value="custom" label="Другое устройство" />
                </el-select>
                <template #help>
                  Тип устройства не может быть изменен
                </template>
              </el-form-item>

              <!-- Часовой пояс -->
              <el-form-item label="Часовой пояс">
                <el-select v-model="localDevice.timezone" class="w-64">
                  <el-option value="Asia/Tokyo" label="Токио (UTC+9)" />
                  <el-option value="Asia/Yekaterinburg" label="Уфа (UTC+5)" />
                  <el-option value="Europe/Moscow" label="Москва (UTC+3)" />
                  <el-option value="Europe/London" label="Лондон (UTC+0)" />
                  <el-option value="America/New_York" label="Нью-Йорк (UTC-5)" />
                </el-select>
              </el-form-item>

              <!-- Уровень логирования -->
              <el-form-item label="Уровень логирования">
                <el-select v-model="localDevice.log_level" class="w-32">
                  <el-option value="debug" label="Debug" />
                  <el-option value="info" label="Info" />
                  <el-option value="warning" label="Warning" />
                  <el-option value="error" label="Error" />
                  <el-option value="critical" label="Critical" />
                </el-select>
              </el-form-item>

              <!-- Хранение телеметрии -->
              <el-form-item label="Хранение телеметрии (дней)">
                <div class="range-input-container">
                  <el-input-number
                      v-model="localDevice.telemetry_retention_days"
                      :min="1"
                      :max="365"
                      :controls="false"
                      class="compact-number-input"
                  />
                  <el-slider
                      v-model="localDevice.telemetry_retention_days"
                      :min="1"
                      :max="180"
                      :step="1"
                      class="compact-slider"
                  />
                </div>
                <template #help>
                  Старые записи телеметрии будут автоматически удаляться
                </template>
              </el-form-item>
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
      </div>
    </el-card>
  </div>
  <div v-else class="loading-container">
    <el-skeleton :rows="6" animated />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';

const route = useRoute();
const router = useRouter();
const store = useSmartLightStore();
const loading = ref(false);
const error = ref(null);
const deviceLoaded = ref(false);

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
  mac_address: '',
  timezone: 'Europe/Moscow',
  log_level: 'info',
  telemetry_retention_days: 30
});

// Загрузка настроек при монтировании
onMounted(async () => {
  try {
    // Сначала загружаем устройства, если они не загружены
    if (store.devices.length === 0) {
      await store.fetchDevices();
    }

    syncLocalDevice();
  } catch (err) {
    error.value = 'Ошибка загрузки настроек: ' + err.message;
    router.push({ name: 'SmartLightDashboard' });
  }
});

// Синхронизация локальных настроек со стором
const syncLocalDevice = () => {
  if (device.value) {
    localDevice.value = {
      ...localDevice.value,
      ...device.value,
      wifi_ssid: device.value.wifi_ssid || '',
      wifi_password: device.value.wifi_password || '',
      mac_address: device.value.is_fake
          ? `FAKE-${device.value.device_id}`
          : `SL-${device.value.device_id}`,
      timezone: device.value.timezone || 'Europe/Moscow',
      log_level: device.value.log_level || 'info',
      telemetry_retention_days: device.value.telemetry_retention_days || 30
    };
    deviceLoaded.value = true;
  } else {
    deviceLoaded.value = false;
    error.value = 'Устройство не найдено';
  }
};

// Следим за изменениями в сторе
watch(() => store.devices, syncLocalDevice);
watch(route, syncLocalDevice);

const statusType = computed(() => {
  if (!device.value) return 'info';

  switch (device.value.status) {
    case 'ON': return 'success';
    case 'OFF': return 'info';
    case 'SLEEPING': return 'warning';
    default: return 'danger';
  }
});

const batteryProgress = computed(() => {
  const voltage = Number(localDevice.value.critical_voltage);
  return Math.min(100, Math.max(0, ((voltage - 2.5) / (4.3 - 2.5)) * 100));
});

const batteryColor = computed(() => {
  const voltage = Number(localDevice.value.critical_voltage);
  if (voltage < 3.0) return '#f56c6c';
  if (voltage < 3.4) return '#e6a23c';
  return '#67c23a';
});

const formatVoltageTooltip = (value) => {
  return Number(value).toFixed(3) + ' В';
};

const saveDevice = async () => {
  try {
    loading.value = true;
    error.value = null;

    const updatedDevice = {
      ...device.value,
      critical_voltage: localDevice.value.critical_voltage,
      sleep_interval: localDevice.value.sleep_interval,
      emergency_sleep_interval: localDevice.value.emergency_sleep_interval,
      wifi_ssid: localDevice.value.wifi_ssid,
      wifi_password: localDevice.value.wifi_password
    };

    // Для реальных устройств отправляем обновление
    if (!device.value.is_fake) {
      const response = await store.updateDevice(updatedDevice);

      if (response.success) {
        ElMessage.success('Настройки сохранены');
      } else {
        throw new Error(response.message || 'Ошибка сохранения настроек');
      }
    } else {
      // Для фейковых устройств - только локальное обновление
      const deviceIndex = store.devices.findIndex(d => d.device_id === device.value.device_id);
      if (deviceIndex !== -1) {
        store.devices[deviceIndex] = {
          ...store.devices[deviceIndex],
          ...updatedDevice
        };
      }

      ElNotification({
        title: 'Эмуляция',
        message: 'Настройки фейкового устройства обновлены',
        type: 'info',
        duration: 2000
      });
    }

    syncLocalDevice();
  } catch (err) {
    error.value = 'Ошибка сохранения настроек: ' + (err.message || err);
    ElMessage.error('Не удалось сохранить настройки');
  } finally {
    loading.value = false;
  }
};

const resetToDefault = async () => {
  try {
    loading.value = true;
    error.value = null;

    localDevice.value.critical_voltage = 3.2;
    localDevice.value.sleep_interval = 600;
    localDevice.value.emergency_sleep_interval = 3600;

    ElNotification({
      title: 'Сброс',
      message: 'Настройки сброшены к значениям по умолчанию',
      type: 'success'
    });
  } catch (err) {
    error.value = 'Ошибка сброса настроек: ' + (err.message || err);
    ElMessage.error('Не удалось сбросить настройки');
  } finally {
    loading.value = false;
  }
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

.settings-card {
  border-radius: 8px;
}

.device-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.loading-container {
  padding: 1.5rem;
}

.scrollable-content {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
  padding: 1rem;
}

.settings-form {
  padding: 0.5rem;
  max-width: 100%;
}

.compact-input {
  width: 100%;
  max-width: 400px;
}

.compact-number-input {
  width: 100px;
}

.compact-slider {
  flex: 1;
}

.range-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.battery-slider-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

:deep(.el-form-item__content) {
  align-items: flex-start;
}

:deep(.el-divider) {
  margin: 2rem 0;
}

:deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

:deep(.el-slider__runway) {
  margin: 8px 0;
  height: 4px;
}

:deep(.el-slider__button) {
  width: 14px;
  height: 14px;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  width: 24px;
}
</style>
