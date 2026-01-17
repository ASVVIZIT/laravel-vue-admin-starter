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
              <IconWrapper :icon="Refresh" size="small" class="mr-1" />
              Сбросить
            </el-button>
            <el-button
                @click="saveSettings"
                type="primary"
                :loading="loading"
                size="small"
            >
              <IconWrapper :icon="Check" size="small" class="mr-1" />
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
          class="mb-1"
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
          <el-tabs type="border-card" v-model="activeTab">
            <el-tab-pane label="Основные настройки" name="main">
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
              <el-form-item label="Критическое напряжение (В)" prop="default_critical_voltage">
                <div class="battery-slider-container">
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
                    <div class="battery-info-container">
                      <div class="battery-type-info">
                        <span class="battery-type-label">Тип:</span>
                        <span class="battery-type-value">{{ batteryTypeName }}</span>
                      </div>
                      <div class="voltage-value">{{ formattedVoltage }}</div>
                    </div>
                  </div>
                </div>
                <div class="voltage-control">
                  <div class="voltage-input">
                    <el-input-number
                        v-model="localSettings.default_critical_voltage"
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
                      v-model="localSettings.default_critical_voltage"
                      :min="2.5"
                      :max="4.3"
                      :step="0.01"
                      :format-tooltip="formatVoltageTooltip"
                      class="voltage-slider"
                  />
                </div>
                <template #help>
                  <div class="help-content">
                    <Warning class="help-icon" />
                    <span>Ниже этого значения устройство перейдёт в аварийный режим. Рекомендуется: 3.2 В</span>
                  </div>
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
              <el-form-item label="Экстренный интервал сна (сек)" prop="default_emergency_sleep_interval">
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
            </el-tab-pane>

            <el-tab-pane label="Wi-Fi настройки" name="wifi">
              <!-- SSID Wi-Fi -->
              <el-form-item label="SSID Wi-Fi" prop="default_wifi_ssid">
                <el-input
                    v-model="localSettings.default_wifi_ssid"
                    placeholder="MyHomeWiFi"
                    clearable
                    class="compact-input"
                />
              </el-form-item>

              <!-- Пароль Wi-Fi -->
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
            </el-tab-pane>

            <el-tab-pane label="Системные настройки" name="system">
              <!-- Часовой пояс -->
              <el-form-item label="Часовой пояс" prop="timezone">
                <el-select v-model="localSettings.timezone" class="compact-select">
                  <el-option value="Asia/Tokyo" label="Токио (UTC+9)" />
                  <el-option value="Asia/Yekaterinburg" label="Уфа (UTC+5)" />
                  <el-option value="Europe/Moscow" label="Москва (UTC+3)" />
                  <el-option value="Europe/London" label="Лондон (UTC+0)" />
                  <el-option value="America/New_York" label="Нью-Йорк (UTC-5)" />
                </el-select>
              </el-form-item>

              <!-- Уровень логирования -->
              <el-form-item label="Уровень логирования" prop="log_level">
                <el-select v-model="localSettings.log_level" class="w-32">
                  <el-option value="debug" label="Debug" />
                  <el-option value="info" label="Info" />
                  <el-option value="warning" label="Warning" />
                  <el-option value="error" label="Error" />
                  <el-option value="critical" label="Critical" />
                </el-select>
              </el-form-item>

              <!-- Хранение телеметрии -->
              <el-form-item label="Хранение телеметрии (дней)" prop="telemetry_retention_days">
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
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import {
  Check,
  Refresh,
  Warning
} from '@element-plus/icons-vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import IconWrapper from '@/components/SmartLight/components/IconWrapper.vue';

const store = useSmartLightStore();
const loading = ref(false);
const error = ref(null);
const activeTab = ref('main');
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

// Загрузка активного таба из localStorage
const loadActiveTab = () => {
  const tab = localStorage.getItem('smartlight_settings_active_tab');
  if (tab && ['main', 'wifi', 'system'].includes(tab)) {
    activeTab.value = tab;
  } else {
    activeTab.value = 'main';
  }
};

// Сохранение активного таба в localStorage
const saveActiveTab = () => {
  localStorage.setItem('smartlight_settings_active_tab', activeTab.value);
};

// Загрузка настроек при монтировании
onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await store.fetchGlobalSettings();

    if (response.success) {
      // Объединяем настройки
      localSettings.value = {
        ...localSettings.value,
        ...response.data
      };
    } else {
      throw new Error(response.message || 'Ошибка загрузки глобальных настроек');
    }

    // Загружаем активный таб
    loadActiveTab();
  } catch (err) {
    error.value = 'Ошибка загрузки настроек: ' + (err.message || err);
    ElNotification({
      title: 'Ошибка',
      message: 'Не удалось загрузить глобальные настройки',
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
});

// Сохранение настроек
const saveSettings = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Проверяем допустимые значения
    localSettings.value.default_critical_voltage = Math.min(4.3, Math.max(2.5, localSettings.value.default_critical_voltage));
    localSettings.value.default_sleep_interval = Math.min(86400, Math.max(60, localSettings.value.default_sleep_interval));
    localSettings.value.default_emergency_sleep_interval = Math.min(86400, Math.max(300, localSettings.value.default_emergency_sleep_interval));
    localSettings.value.telemetry_retention_days = Math.min(365, Math.max(1, localSettings.value.telemetry_retention_days));

    // Отправляем данные в правильной структуре
    const response = await store.updateGlobalSettings({
      global_server_url: localSettings.value.global_server_url,
      default_critical_voltage: localSettings.value.default_critical_voltage,
      default_sleep_interval: localSettings.value.default_sleep_interval,
      default_emergency_sleep_interval: localSettings.value.default_emergency_sleep_interval,
      default_wifi_ssid: localSettings.value.default_wifi_ssid,
      default_wifi_password: localSettings.value.default_wifi_password,
      timezone: localSettings.value.timezone,
      log_level: localSettings.value.log_level,
      telemetry_retention_days: localSettings.value.telemetry_retention_days
    });

    if (response.success) {
      // Объединяем настройки
      localSettings.value = {
        ...localSettings.value,
        ...response.data
      };

      ElMessage.success('Глобальные настройки сохранены');
    } else {
      throw new Error(response.message || 'Ошибка сохранения глобальных настроек');
    }
  } catch (err) {
    error.value = 'Ошибка сохранения настроек: ' + (err.message || err);
    ElMessage.error('Ошибка сохранения глобальных настроек');
  } finally {
    loading.value = false;
  }
};

// Сброс настроек
const resetToDefaults = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await store.resetGlobalSettings();

    if (response.success) {
      // Объединяем настройки
      localSettings.value = {
        ...localSettings.value,
        ...response.data
      };

      ElNotification({
        title: 'Успех',
        message: 'Глобальные настройки сброшены',
        type: 'success'
      });
    } else {
      throw new Error(response.message || 'Ошибка сброса глобальных настроек');
    }
  } catch (err) {
    error.value = 'Ошибка сброса настроек: ' + (err.message || err);
    ElMessage.error('Ошибка сброса глобальных настроек');
  } finally {
    loading.value = false;
  }
};

// Вычисляемые свойства
const batteryNormalProgress = computed(() => {
  const min = 2.5;
  const max = 4.3;
  const critical = 3.2;

  if (localSettings.value.default_critical_voltage <= critical) {
    return 0;
  }

  const normalVoltage = localSettings.value.default_critical_voltage - critical;
  const maxNormalVoltage = max - critical;
  return Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));
});

const batteryCriticalProgress = computed(() => {
  const min = 2.5;
  const max = 4.3;
  const critical = 3.2;

  if (localSettings.value.default_critical_voltage >= critical) {
    return 0;
  }

  const criticalVoltageValue = critical - localSettings.value.default_critical_voltage;
  const criticalVoltageRange = critical - min;
  return Math.min(100, Math.max(0, (criticalVoltageValue / criticalVoltageRange) * 100));
});

const criticalThresholdPosition = computed(() => {
  const min = 2.5;
  const max = 4.3;
  const critical = 3.2;
  return ((critical - min) / (max - min)) * 100;
});

const currentLevelPosition = computed(() => {
  const min = 2.5;
  const max = 4.3;
  return ((localSettings.value.default_critical_voltage - min) / (max - min)) * 100;
});

const batteryColor = computed(() => {
  const voltage = localSettings.value.default_critical_voltage;
  if (voltage < 2.7) return '#f56c6c';
  if (voltage < 3.0) return '#e6a23c';
  return '#67c23a';
});

const criticalColor = computed(() => {
  const voltage = localSettings.value.default_critical_voltage;
  if (voltage < 2.7) return '#f56c6c';
  if (voltage < 3.0) return '#faa7a7';
  return '#ffcccb';
});

const formattedCriticalThreshold = computed(() => {
  return Number(3.2).toFixed(2);
});

const formattedMinVoltage = computed(() => {
  return Number(2.5).toFixed(1);
});

const formattedMaxVoltage = computed(() => {
  return Number(4.3).toFixed(1);
});

const formattedVoltage = computed(() => {
  return Number(localSettings.value.default_critical_voltage).toFixed(2) + ' В';
});

const batteryTypeName = computed(() => {
  const voltage = localSettings.value.default_critical_voltage;
  if (voltage < 3.0) return 'Критический режим';
  if (voltage < 3.4) return 'Внимание';
  return 'Нормальный режим';
});

const formatVoltageTooltip = (value) => {
  return Number(value).toFixed(2) + ' В';
};

// Следим за изменением активного таба
watch(activeTab, (newValue) => {
  saveActiveTab();
});
</script>

<style scoped>
.settings-container {
  padding: 0.75rem;
  height: 100%;
}

.settings-card {
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.header-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 0.3rem;
}

.skeleton-container {
  padding: 0.5rem;
}

.scrollable-content {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  padding: 0.5rem;
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

.battery-info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  width: 100%;
  margin-top: 10px;
}

.battery-type-info {
  position: relative;
  display: flex;
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
  line-height: 1.2;
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

.compact-select {
  width: 100%;
  max-width: 400px;
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
  width: 20px;
}

.help-content {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.help-icon {
  width: 0.9rem;
  height: 0.9rem;
}
</style>
