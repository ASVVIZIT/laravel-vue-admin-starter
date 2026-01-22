<template>
  <div class="device-settings">
    <el-card class="settings-card">
      <template #header>
        <div class="header-container">
          <h2 class="header-title">Настройки устройства {{ device.name }}</h2>
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
              <!-- Тип аккумулятора -->
              <el-form-item label="Тип аккумулятора" prop="battery_type_id">
                <el-select v-model="localSettings.battery_type_id" class="compact-select" @change="updateBatteryType">
                  <el-option value="li-ion-18650" label="Li-ion 18650" />
                  <el-option value="li-ion-21700" label="Li-ion 21700" />
                  <el-option value="li-po" label="Li-Po" />
                  <el-option value="lead-acid" label="Свинцово-кислотный" />
                </el-select>
                <template #help>
                  <div class="help-content">
                    <Warning class="help-icon" />
                    <span>Изменение типа аккумулятора пересчитает все напряжения</span>
                  </div>
                </template>
              </el-form-item>

              <!-- Группировка аккумуляторов -->
              <el-form-item label="Группировка аккумуляторов" prop="battery_group_config">
                <el-switch
                    v-model="localSettings.battery_group_config.enabled"
                    @change="updateBatteryGroupConfig"
                />
                <div class="group-config-container" v-if="localSettings.battery_group_config.enabled">
                  <el-form-item label="Тип группировки" prop="battery_group_config.type">
                    <el-select v-model="localSettings.battery_group_config.type" class="compact-select">
                      <el-option value="series" label="Последовательное" />
                      <el-option value="parallel" label="Параллельное" />
                      <el-option value="series_parallel" label="Последовательно-параллельное" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="Количество аккумуляторов" prop="battery_group_config.count">
                    <el-input-number
                        v-model="localSettings.battery_group_config.count"
                        :min="1"
                        :max="maxBatteriesInGroup"
                        :controls="false"
                        class="compact-number-input"
                    />
                  </el-form-item>
                </div>
              </el-form-item>

              <!-- Критическое напряжение -->
              <el-form-item label="Критическое напряжение (В)" prop="critical_voltage">
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
                    <div class="battery-type-info">
                      <span class="battery-type-label">Тип:</span>
                      <span class="battery-type-value">{{ batteryTypeName }}</span>
                    </div>
                    <div class="voltage-value">{{ formattedVoltage }}</div>
                  </div>
                </div>
                <div class="voltage-control">
                  <div class="voltage-input">
                    <el-input-number
                        v-model="localSettings.critical_voltage"
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
                      v-model="localSettings.critical_voltage"
                      :min="minVoltage"
                      :max="maxVoltage"
                      :step="0.01"
                      :format-tooltip="formatVoltageTooltip"
                      class="voltage-slider"
                  />
                </div>
                <template #help>
                  <div class="help-content">
                    <Warning class="help-icon" />
                    <span>Ниже этого значения устройство перейдёт в аварийный режим</span>
                  </div>
                </template>
              </el-form-item>

              <!-- Тип лампочки -->
              <el-form-item label="Тип лампочки" prop="bulb_type_id">
                <el-select v-model="localSettings.bulb_type_id" class="compact-select" @change="updateBulbType">
                  <el-option value="classic" label="Классическая" />
                  <el-option value="led" label="LED" />
                  <el-option value="halogen" label="Галогенная" />
                  <el-option value="smart_led" label="Smart LED" />
                </el-select>
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="Wi-Fi настройки" name="wifi">
              <!-- SSID Wi-Fi -->
              <el-form-item label="SSID Wi-Fi" prop="wifi_ssid">
                <el-input
                    v-model="localSettings.wifi_ssid"
                    placeholder="MyHomeWiFi"
                    clearable
                    class="compact-input"
                />
              </el-form-item>

              <!-- Пароль Wi-Fi -->
              <el-form-item label="Пароль Wi-Fi" prop="wifi_password">
                <el-input
                    v-model="localSettings.wifi_password"
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
import { logDebug } from '@/components/SmartLight/api/utils/webglSupport.js';
import IconWrapper from '@/components/SmartLight/components/IconWrapper.vue';

const props = defineProps({
  device: {
    type: Object,
    required: true
  },
  show3D: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['settings-updated']);

logDebug('DeviceSettings', 'Компонент создан', {
  deviceId: props.device.device_id,
  name: props.device.name,
  show3D: props.show3D
});

const store = useSmartLightStore();
const loading = ref(false);
const error = ref(null);
const activeTab = ref('main');
const localSettings = ref({
  battery_type_id: 'li-ion-18650',
  battery_group_config: {
    enabled: false,
    type: 'series',
    count: 1,
    connections: []
  },
  critical_voltage: 3.2,
  bulb_type_id: 'classic',
  sleep_interval: 600,
  emergency_sleep_interval: 3600,
  wifi_ssid: '',
  wifi_password: '',
  timezone: 'Europe/Moscow',
  log_level: 'info',
  telemetry_retention_days: 30
});

// Загрузка активного таба из localStorage
const loadActiveTab = () => {
  logDebug('DeviceSettings', 'Загрузка активного таба', {
    deviceId: props.device.device_id
  });

  const tab = localStorage.getItem(`smartlight_device_settings_${props.device.device_id}_active_tab`);
  if (tab && ['main', 'wifi', 'system'].includes(tab)) {
    activeTab.value = tab;
  } else {
    activeTab.value = 'main';
  }
};

// Сохранение активного таба в localStorage
const saveActiveTab = () => {
  logDebug('DeviceSettings', 'Сохранение активного таба', {
    deviceId: props.device.device_id,
    activeTab: activeTab.value
  });

  localStorage.setItem(`smartlight_device_settings_${props.device.device_id}_active_tab`, activeTab.value);
};

// Загрузка настроек
const loadSettings = () => {
  logDebug('DeviceSettings', 'Загрузка настроек', {
    deviceId: props.device.device_id
  });

  try {
    // Загружаем активный таб
    loadActiveTab();

    // Загружаем настройки из пропсов
    localSettings.value = {
      ...localSettings.value,
      ...props.device
    };

    logDebug('DeviceSettings', 'Настройки из пропсов загружены', {
      deviceId: props.device.device_id,
      settings: localSettings.value
    });

    // Загружаем настройки из локального хранилища
    const settingsJson = localStorage.getItem(`smartlight_device_settings_${props.device.device_id}`);
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      localSettings.value = {
        ...localSettings.value,
        ...settings
      };

      logDebug('DeviceSettings', 'Настройки из локального хранилища загружены', {
        deviceId: props.device.device_id,
        settings
      });
    }
  } catch (e) {
    logDebug('DeviceSettings', 'Ошибка загрузки настроек', {
      deviceId: props.device.device_id,
      error: e.message
    });

    console.error('Ошибка загрузки настроек устройства:', e);
    error.value = 'Ошибка загрузки настроек';
  }
};

// Сохранение настроек
const saveSettings = async () => {
  logDebug('DeviceSettings', 'Сохранение настроек', {
    deviceId: props.device.device_id,
    settings: localSettings.value
  });

  loading.value = true;
  error.value = null;

  try {
    // Проверяем допустимые значения
    localSettings.value.critical_voltage = Math.min(maxVoltage.value, Math.max(minVoltage.value, localSettings.value.critical_voltage));
    localSettings.value.sleep_interval = Math.min(86400, Math.max(60, localSettings.value.sleep_interval));
    localSettings.value.emergency_sleep_interval = Math.min(86400, Math.max(300, localSettings.value.emergency_sleep_interval));
    localSettings.value.telemetry_retention_days = Math.min(365, Math.max(1, localSettings.value.telemetry_retention_days));

    logDebug('DeviceSettings', 'Проверка допустимых значений', {
      deviceId: props.device.device_id,
      critical_voltage: localSettings.value.critical_voltage,
      sleep_interval: localSettings.value.sleep_interval,
      emergency_sleep_interval: localSettings.value.emergency_sleep_interval,
      telemetry_retention_days: localSettings.value.telemetry_retention_days
    });

    // Сохраняем в локальное хранилище
    localStorage.setItem(
        `smartlight_device_settings_${props.device.device_id}`,
        JSON.stringify(localSettings.value)
    );

    logDebug('DeviceSettings', 'Настройки сохранены в localStorage', {
      deviceId: props.device.device_id
    });

    // Сохраняем активный таб
    saveActiveTab();

    // Обновляем критическое напряжение в Store
    store.updateDeviceCriticalVoltage(props.device.device_id, localSettings.value.critical_voltage);

    logDebug('DeviceSettings', 'Критическое напряжение обновлено в Store', {
      deviceId: props.device.device_id,
      voltage: localSettings.value.critical_voltage
    });

    // Обновляем тип аккумулятора в Store
    store.updateDeviceBatteryType(props.device.device_id, localSettings.value.battery_type_id);

    logDebug('DeviceSettings', 'Тип аккумулятора обновлен в Store', {
      deviceId: props.device.device_id,
      battery_type_id: localSettings.value.battery_type_id
    });

    // Обновляем тип лампочки в Store
    store.updateDeviceBulbType(props.device.device_id, localSettings.value.bulb_type_id);

    logDebug('DeviceSettings', 'Тип лампочки обновлен в Store', {
      deviceId: props.device.device_id,
      bulb_type_id: localSettings.value.bulb_type_id
    });

    // Обновляем конфигурацию группировки в Store
    store.updateDeviceBatteryGroup(props.device.device_id, localSettings.value.battery_group_config);

    logDebug('DeviceSettings', 'Конфигурация группировки обновлена в Store', {
      deviceId: props.device.device_id,
      battery_group_config: localSettings.value.battery_group_config
    });

    ElMessage.success('Настройки устройства сохранены');
  } catch (err) {
    logDebug('DeviceSettings', 'Ошибка сохранения настроек', {
      deviceId: props.device.device_id,
      error: err.message
    });

    error.value = 'Не удалось сохранить настройки: ' + (err.message || err);
    ElMessage.error('Ошибка сохранения настроек');
  } finally {
    logDebug('DeviceSettings', 'Завершение сохранения', { deviceId: props.device.device_id });
    loading.value = false;
  }
};

// Сброс настроек
const resetToDefaults = () => {
  logDebug('DeviceSettings', 'Сброс настроек к значениям по умолчанию', { deviceId: props.device.device_id });

  // Сбрасываем критическое напряжение
  localSettings.value.critical_voltage = store.calculateGroupCriticalVoltage(props.device.device_id);

  logDebug('DeviceSettings', 'Критическое напряжение сброшено', {
    deviceId: props.device.device_id,
    defaultVoltage: localSettings.value.critical_voltage
  });

  ElMessage.success('Настройки устройства сброшены');
};

// Обновление конфигурации группировки
const updateBatteryGroupConfig = () => {
  logDebug('DeviceSettings', 'Обновление конфигурации группировки', {
    deviceId: props.device.device_id,
    enabled: localSettings.value.battery_group_config.enabled
  });

  // При включении группировки устанавливаем значения по умолчанию
  if (localSettings.value.battery_group_config.enabled) {
    localSettings.value.battery_group_config.type = 'series';
    localSettings.value.battery_group_config.count = 2;
    saveSettings();
  } else {
    // При отключении группировки сбрасываем настройки
    localSettings.value.battery_group_config = {
      enabled: false,
      type: 'series',
      count: 1,
      connections: []
    };
    saveSettings();
  }
};

// Обновление типа аккумулятора
const updateBatteryType = () => {
  logDebug('DeviceSettings', 'Обновление типа аккумулятора', {
    deviceId: props.device.device_id,
    battery_type_id: localSettings.value.battery_type_id
  });

  // Пересчитываем критическое напряжение при изменении типа
  localSettings.value.critical_voltage = store.calculateGroupCriticalVoltage(props.device.device_id);

  logDebug('DeviceSettings', 'Критическое напряжение пересчитано', {
    deviceId: props.device.device_id,
    critical_voltage: localSettings.value.critical_voltage
  });

  // Сохраняем настройки
  saveSettings();
};

// Обновление типа лампочки
const updateBulbType = () => {
  logDebug('DeviceSettings', 'Обновление типа лампочки', {
    deviceId: props.device.device_id,
    bulb_type_id: localSettings.value.bulb_type_id
  });

  // Сохраняем настройки
  saveSettings();
};

// Вычисляемые свойства
const minVoltage = computed(() => {
  const min = store.calculateGroupMinVoltage(props.device.device_id);
  logDebug('DeviceSettings', 'Получение минимального напряжения', {
    deviceId: props.device.device_id,
    minVoltage: min
  });
  return min;
});

const maxVoltage = computed(() => {
  const max = store.calculateGroupMaxVoltage(props.device.device_id);
  logDebug('DeviceSettings', 'Получение максимального напряжения', {
    deviceId: props.device.device_id,
    maxVoltage: max
  });
  return max;
});

const maxBatteriesInGroup = computed(() => {
  const batteryType = store.getBatteryType(props.device.battery_type_id);
  const maxInGroup = batteryType?.groupSupport?.maxInGroup || 10;

  logDebug('DeviceSettings', 'Получение максимального количества батарей в группе', {
    deviceId: props.device.device_id,
    maxInGroup
  });

  return maxInGroup;
});

const batteryNormalProgress = computed(() => {
  const min = minVoltage.value;
  const max = maxVoltage.value;
  const critical = store.calculateGroupCriticalVoltage(props.device.device_id);

  if (localSettings.value.critical_voltage <= critical) {
    logDebug('DeviceSettings', 'Критический режим', {
      deviceId: props.device.device_id,
      critical_voltage: localSettings.value.critical_voltage,
      critical
    });
    return 0;
  }

  const normalVoltage = localSettings.value.critical_voltage - critical;
  const maxNormalVoltage = max - critical;
  const progress = Math.min(100, Math.max(0, (normalVoltage / maxNormalVoltage) * 100));

  logDebug('DeviceSettings', 'Вычисление нормального прогресса', {
    deviceId: props.device.device_id,
    min,
    max,
    critical,
    critical_voltage: localSettings.value.critical_voltage,
    progress
  });

  return progress;
});

const batteryCriticalProgress = computed(() => {
  const min = minVoltage.value;
  const max = maxVoltage.value;
  const critical = store.calculateGroupCriticalVoltage(props.device.device_id);

  if (localSettings.value.critical_voltage >= critical) {
    logDebug('DeviceSettings', 'Нормальный режим', {
      deviceId: props.device.device_id,
      critical_voltage: localSettings.value.critical_voltage,
      critical
    });
    return 0;
  }

  const criticalVoltage = critical - localSettings.value.critical_voltage;
  const criticalVoltageRange = critical - min;
  const progress = Math.min(100, Math.max(0, (criticalVoltage / criticalVoltageRange) * 100));

  logDebug('DeviceSettings', 'Вычисление критического прогресса', {
    deviceId: props.device.device_id,
    min,
    max,
    critical,
    critical_voltage: localSettings.value.critical_voltage,
    progress
  });

  return progress;
});

const criticalThresholdPosition = computed(() => {
  const min = minVoltage.value;
  const max = maxVoltage.value;
  const critical = store.calculateGroupCriticalVoltage(props.device.device_id);
  const position = ((critical - min) / (max - min)) * 100;

  logDebug('DeviceSettings', 'Позиция критического порога', {
    deviceId: props.device.device_id,
    min,
    max,
    critical,
    position
  });

  return position;
});

const currentLevelPosition = computed(() => {
  const min = minVoltage.value;
  const max = maxVoltage.value;
  const position = ((localSettings.value.critical_voltage - min) / (max - min)) * 100;

  logDebug('DeviceSettings', 'Позиция текущего уровня', {
    deviceId: props.device.device_id,
    min,
    max,
    critical_voltage: localSettings.value.critical_voltage,
    position
  });

  return position;
});

const batteryColor = computed(() => {
  const voltage = localSettings.value.critical_voltage;
  let color;
  if (voltage < 2.7) color = '#f56c6c';
  else if (voltage < 3.0) color = '#e6a23c';
  else color = '#67c23a';

  logDebug('DeviceSettings', 'Цвет батареи', {
    deviceId: props.device.device_id,
    voltage,
    color
  });

  return color;
});

const criticalColor = computed(() => {
  const voltage = localSettings.value.critical_voltage;
  let color;
  if (voltage < 2.7) color = '#f56c6c';
  else if (voltage < 3.0) color = '#faa7a7';
  else color = '#ffcccb';

  logDebug('DeviceSettings', 'Цвет критического уровня', {
    deviceId: props.device.device_id,
    voltage,
    color
  });

  return color;
});

const formattedCriticalThreshold = computed(() => {
  const value = store.calculateGroupCriticalVoltage(props.device.device_id).toFixed(2);
  logDebug('DeviceSettings', 'Форматированное критическое напряжение', {
    deviceId: props.device.device_id,
    value
  });
  return value;
});

const formattedMinVoltage = computed(() => {
  const value = store.calculateGroupMinVoltage(props.device.device_id).toFixed(1);
  logDebug('DeviceSettings', 'Форматированное минимальное напряжение', {
    deviceId: props.device.device_id,
    value
  });
  return value;
});

const formattedMaxVoltage = computed(() => {
  const value = store.calculateGroupMaxVoltage(props.device.device_id).toFixed(1);
  logDebug('DeviceSettings', 'Форматированное максимальное напряжение', {
    deviceId: props.device.device_id,
    value
  });
  return value;
});

const formattedVoltage = computed(() => {
  const value = localSettings.value.critical_voltage.toFixed(2) + ' В';
  logDebug('DeviceSettings', 'Форматированное текущее напряжение', {
    deviceId: props.device.device_id,
    value
  });
  return value;
});

const batteryTypeName = computed(() => {
  const voltage = localSettings.value.critical_voltage;
  let name;
  if (voltage < 3.0) name = 'Критический режим';
  else if (voltage < 3.4) name = 'Внимание';
  else name = 'Нормальный режим';

  logDebug('DeviceSettings', 'Определение типа аккумулятора', {
    deviceId: props.device.device_id,
    voltage,
    name
  });

  return name;
});

const formatVoltageTooltip = (value) => {
  const formatted = Number(value).toFixed(2) + ' В';
  logDebug('DeviceSettings', 'Форматирование тултипа напряжения', {
    value,
    formatted
  });
  return formatted;
};

// Инициализация
onMounted(() => {
  logDebug('DeviceSettings', 'Инициализация компонента', { deviceId: props.device.device_id });
  loadSettings();
});

// Следим за изменением активного таба
watch(activeTab, (newValue) => {
  logDebug('DeviceSettings', 'Активный таб изменился', { newValue });
  saveActiveTab();
});

// Следим за изменениями в сторе
watch(() => store.devices, (newDevices) => {
  logDebug('DeviceSettings', 'Изменение списка устройств', {
    deviceId: props.device.device_id,
    newDevicesCount: newDevices.length
  });

  const device = newDevices.find(d => d.device_id === props.device.device_id);
  if (device) {
    logDebug('DeviceSettings', 'Устройство обновлено в сторе', {
      deviceId: props.device.device_id,
      device
    });
    props.device = { ...device };
  }
}, { deep: true });

// Следим за изменением состояния устройства
watch(() => store.getDevice(props.device.device_id), (newDevice) => {
  if (newDevice) {
    logDebug('DeviceSettings', 'Состояние устройства изменилось', {
      deviceId: props.device.device_id,
      newDevice
    });
    localSettings.value = {
      ...localSettings.value,
      ...newDevice
    };
  }
});
</script>

<style scoped>
.device-settings {
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
  height: calc(100vh - 250px);
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
}

.battery-type-info {
  position: relative;
  display: flex;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #606266;
  width: 100%;
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

.group-config-container {
  margin-top: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid #ebeef5;
  border-radius: 4px;
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
