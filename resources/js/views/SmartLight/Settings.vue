<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="header-container">
          <h2 class="header-title">Глобальные настройки SmartLight</h2>
          <div class="header-actions">
            <el-button
                @click="resetToDefaults"
                type="warning"
                :loading="loading"
                size="small"
            >
              <el-icon name="refresh" class="mr-1" />
              Сбросить
            </el-button>
            <el-button
                @click="saveSettings"
                type="primary"
                :loading="loading"
                size="small"
            >
              <el-icon name="check" class="mr-1" />
              Сохранить
            </el-button>
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

      <el-skeleton v-if="loading" :rows="6" animated class="skeleton-container" />

      <div v-else class="scrollable-content">
        <el-form
            :model="localSettings"
            label-width="220px"
            label-position="left"
            class="settings-form"
            size="small"
        >
          <!-- URL сервера -->
          <el-form-item label="URL сервера" prop="global_server_url">
            <el-input
                v-model="localSettings.global_server_url"
                placeholder="https://your-domain.com/smart-light"
                clearable
                class="compact-input"
            />
            <template #help>
              Адрес API для подключения устройств. Не должен содержать '/api/' в начале.
            </template>
          </el-form-item>

          <!-- Критическое напряжение -->
          <el-form-item label="Критическое напряжение" prop="default_critical_voltage">
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
                <span class="battery-value">{{ formattedCriticalVoltage }}</span>
              </div>

              <el-slider
                  v-model="localSettings.default_critical_voltage"
                  :min="2.5"
                  :max="4.3"
                  :step="0.001"
                  :format-tooltip="formatVoltageTooltip"
                  class="custom-slider"
              />

              <el-input-number
                  v-model="localSettings.default_critical_voltage"
                  :min="2.5"
                  :max="4.3"
                  :step="0.001"
                  :precision="3"
                  class="compact-number-input"
              />
            </div>
            <template #help>
              Ниже этого значения устройство перейдёт в аварийный режим. Рекомендуется: 3.2 В
            </template>
          </el-form-item>

          <!-- Интервал сна -->
          <el-form-item label="Интервал сна (сек)" prop="default_sleep_interval">
            <div class="range-input-container">
              <el-input-number
                  v-model="localSettings.default_sleep_interval"
                  :min="60"
                  :max="86400"
                  :step="60"
                  :controls="false"
                  class="compact-number-input"
              />
              <el-slider
                  v-model="localSettings.default_sleep_interval"
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
          <el-form-item
              label="Экстренный интервал сна (сек)"
              prop="default_emergency_sleep_interval"
          >
            <div class="range-input-container">
              <el-input-number
                  v-model="localSettings.default_emergency_sleep_interval"
                  :min="300"
                  :max="86400"
                  :step="300"
                  :controls="false"
                  class="compact-number-input"
              />
              <el-slider
                  v-model="localSettings.default_emergency_sleep_interval"
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

          <el-divider content-position="left">Настройки Wi-Fi (для новых устройств)</el-divider>

          <el-form-item label="SSID Wi-Fi" prop="default_wifi_ssid">
            <el-input
                v-model="localSettings.default_wifi_ssid"
                placeholder="MyHomeWiFi"
                clearable
                class="compact-input"
            />
          </el-form-item>

          <el-form-item label="Пароль Wi-Fi" prop="default_wifi_password">
            <el-input
                v-model="localSettings.default_wifi_password"
                type="password"
                show-password
                placeholder="Введите пароль"
                clearable
                class="compact-input"
            />
          </el-form-item>

          <el-divider content-position="left">Системные настройки</el-divider>

          <el-form-item label="Часовой пояс" prop="timezone">
            <el-select v-model="localSettings.timezone" class="compact-select">
              <el-option value="Asia/Tokyo" label="Токио (UTC+9)" />
              <el-option value="Asia/Yekaterinburg" label="Уфа (UTC+5)" />
              <el-option value="Europe/Moscow" label="Москва (UTC+3)" />
              <el-option value="Europe/London" label="Лондон (UTC+0)" />
              <el-option value="America/New_York" label="Нью-Йорк (UTC-5)" />
            </el-select>
          </el-form-item>

          <el-form-item label="Уровень логирования" prop="log_level">
            <el-select v-model="localSettings.log_level" class="w-32">
              <el-option value="debug" label="Debug" />
              <el-option value="info" label="Info" />
              <el-option value="warning" label="Warning" />
              <el-option value="error" label="Error" />
              <el-option value="critical" label="Critical" />
            </el-select>
          </el-form-item>

          <el-form-item
              label="Хранение телеметрии (дней)"
              prop="telemetry_retention_days"
          >
            <div class="range-input-container">
              <el-input-number
                  v-model="localSettings.telemetry_retention_days"
                  :min="1"
                  :max="365"
                  :controls="false"
                  class="compact-number-input"
              />
              <el-slider
                  v-model="localSettings.telemetry_retention_days"
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
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';

const store = useSmartLightStore();
const loading = computed(() => store.loading);
const error = computed(() => store.error);

const localSettings = ref({
  global_server_url: '',
  default_critical_voltage: 3.2,
  default_sleep_interval: 600,
  default_emergency_sleep_interval: 3600,
  default_wifi_ssid: '',
  default_wifi_password: '',
  timezone: 'Europe/Moscow',
  log_level: 'info',
  telemetry_retention_days: 30
});

// Загрузка настроек при монтировании
onMounted(async () => {
  try {
    const response = await store.fetchGlobalSettings();

    if (response.success) {
      // Используем response.data для обновления
      localSettings.value = {
        ...localSettings.value,
        ...response.data
      };
    } else {
      throw new Error(response.message || 'Ошибка загрузки настроек');
    }
  } catch (err) {
    error.value = 'Ошибка загрузки настроек: ' + (err.message || err);
    ElNotification({
      title: 'Ошибка',
      message: 'Не удалось загрузить настройки',
      type: 'error'
    });
  }
});

// Сохранение настроек
const saveSettings = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await store.updateGlobalSettings(localSettings.value);

    if (response.success) {
      // Обновляем локальные настройки
      localSettings.value = {
        ...localSettings.value,
        ...response.data
      };
      ElMessage.success('Настройки успешно сохранены');
    } else {
      throw new Error(response.message || 'Ошибка сохранения настроек');
    }
  } catch (err) {
    error.value = 'Ошибка сохранения настроек: ' + (err.message || err);
    ElMessage.error('Ошибка сохранения настроек');
  } finally {
    loading.value = false;
  }
};

// Сброс настроек
const resetToDefaults = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await store.resetGlobalSettings();

    if (response.success) {
      // Обновляем локальные настройки
      localSettings.value = {
        ...localSettings.value,
        ...response.data
      };
      ElMessage.success('Настройки успешно сброшены');
    } else {
      throw new Error(response.message || 'Ошибка сброса настроек');
    }
  } catch (err) {
    error.value = 'Ошибка сброса настроек: ' + (err.message || err);
    ElMessage.error('Ошибка сброса настроек');
  } finally {
    loading.value = false;
  }
};

// Вычисляемые свойства
const batteryProgress = computed(() => {
  const voltage = Number(localSettings.value.default_critical_voltage);
  return Math.min(100, Math.max(0, ((voltage - 2.5) / (4.3 - 2.5)) * 100));
});

const batteryColor = computed(() => {
  const voltage = Number(localSettings.value.default_critical_voltage);
  if (voltage < 3.0) return '#f56c6c';
  if (voltage < 3.4) return '#e6a23c';
  return '#67c23a';
});

const formattedCriticalVoltage = computed(() => {
  return Number(localSettings.value.default_critical_voltage).toFixed(3) + ' В';
});

const formatVoltageTooltip = (value) => {
  return Number(value).toFixed(3) + ' В';
};
</script>

<style scoped>
.settings-container {
  padding: 1.5rem;
}

.settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
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

.compact-input,
.compact-select {
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

.skeleton-container {
  padding: 1rem;
}

:deep(.el-form-item__content) {
  align-items: flex-start;
}

:deep(.el-divider) {
  margin: 1.5rem 0;
}

:deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
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
