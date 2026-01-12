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
              <Handbag class="status-icon" />
              Демо
            </el-tag>
            <el-tag v-else type="info" size="small">
              <User class="status-icon" />
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
            model="localDevice"
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
                      <span class="battery-level" :style="{ left: criticalThresholdPosition + '%' }">{{ localDevice.critical_voltage.toFixed(2) }} В</span>
                      <span class="battery-level" :style="{ left: '100%' }">4.3 В</span>
                    </div>
                  </div>
                  <div class="voltage-control">
                    <div class="voltage-input">
                      <el-input-number
                          v-model="localDevice.critical_voltage"
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
                        v-model="localDevice.critical_voltage"
                        :min="2.5"
                        :max="4.3"
                        :step="0.01"
                        :format-tooltip="formatVoltageTooltip"
                        class="voltage-slider"
                    />
                  </div>
                </div>
                <template #help>
                  <div class="help-content">
                    <Warning class="help-icon" />
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
                    <Timer class="help-icon" />
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
                    <Moon class="help-icon" />
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
                      <CopyDocument class="button-icon" />
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
              <Check class="action-icon" />
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
import {
  Handbag,
  User,
  Moon,
  Timer,
  Warning,
  CopyDocument,
  Check
} from '@element-plus/icons-vue';
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

// Вычисляем позицию критического порога в процентах
const criticalThresholdPosition = computed(() => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;
  const criticalVoltage = localDevice.value.critical_voltage;

  return ((criticalVoltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
});

// Нормальный прогресс (от критического порога до max)
const batteryNormalProgress = computed(() => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;

  if (localDevice.value.voltage <= localDevice.value.critical_voltage) {
    return 0;
  }

  const normalVoltage = localDevice.value.voltage - localDevice.value.critical_voltage;
  const maxNormalVoltage = maxVoltage - localDevice.value.critical_voltage;

  return Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));
});

// Критический прогресс (от min до критического порога)
const batteryCriticalProgress = computed(() => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;

  if (localDevice.value.voltage >= localDevice.value.critical_voltage) {
    return 0;
  }

  const criticalVoltage = localDevice.value.critical_voltage - localDevice.value.voltage;
  const criticalVoltageRange = localDevice.value.critical_voltage - minVoltage;

  return Math.min(100, Math.max(0, (criticalVoltage / criticalVoltageRange) * 100));
});

// Позиция текущего уровня
const currentLevelPosition = computed(() => {
  const minVoltage = 2.5;
  const maxVoltage = 4.3;
  return ((localDevice.value.voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
});

// Цвет критического уровня
const criticalColor = computed(() => {
  const voltage = localDevice.value.voltage;
  if (voltage < 2.7) return '#f56c6c';
  if (voltage < 3.0) return '#faa7a7';
  return '#ffcccb';
});

// Цвет нормального уровня
const batteryColor = computed(() => {
  const voltage = localDevice.value.voltage;
  if (voltage < 3.0) return '#f56c6c';
  if (voltage < 3.4) return '#e6a23c';
  return '#67c23a';
});

const formatVoltageTooltip = (value) => {
  return Number(value).toFixed(2) + ' В';
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
  gap: 0.5rem;
}

.battery-container {
  height: 20px;
  display: flex;
  align-items: center;
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

.voltage-control {
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

:deep(.el-form-item__content) {
  align-items: flex-start;
}

:deep(.el-divider) {
  margin: 1.5rem 0;
}

:deep(.el-divider__text) {
  font-size: 0.85rem;
  font-weight: 500;
  color: #606266;
}

:deep(.el-slider__runway) {
  height: 4px;
  margin: 0;
}

:deep(.el-slider__button) {
  width: 14px;
  height: 14px;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  width: 24px;
}

:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

:deep(.el-button > svg) {
  width: 0.9rem;
  height: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.25rem;
}

:deep(.el-button > svg:last-child) {
  margin-right: 0;
}

:deep(.help-icon) {
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.button-icon) {
  width: 0.9rem;
  height: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.action-icon) {
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
