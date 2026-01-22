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
              <span>Сбросить</span>
            </el-button>
            <el-button
                @click="saveSettings"
                type="primary"
                :loading="loading"
                size="small"
            >
              <IconWrapper :icon="Check" size="small" class="mr-1" />
              <span>Сохранить</span>
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
              <el-form-item label="Группировка аккумуляторов" prop="battery_group_config.enabled">
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
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="Режимы" name="modes">
              <el-form-item label="Режим работы" prop="operation_mode">
                <el-select v-model="localSettings.operation_mode" class="compact-select">
                  <el-option value="normal" label="Нормальный" />
                  <el-option value="sleep" label="Режим сна" />
                  <el-option value="emergency" label="Аварийный режим" />
                </el-select>
              </el-form-item>

              <el-form-item label="Интервал сна (сек)" prop="sleep_interval">
                <div class="range-input-container">
                  <el-input-number
                      v-model="localSettings.sleep_interval"
                      :min="300"
                      :max="86400"
                      :step="300"
                      :controls="false"
                      class="compact-number-input"
                  />
                  <el-slider
                      v-model="localSettings.sleep_interval"
                      :min="300"
                      :max="3600"
                      :step="300"
                      class="compact-slider"
                  />
                </div>
              </el-form-item>

              <el-form-item label="Интервал аварийного сна (сек)" prop="emergency_sleep_interval">
                <div class="range-input-container">
                  <el-input-number
                      v-model="localSettings.emergency_sleep_interval"
                      :min="300"
                      :max="86400"
                      :step="600"
                      :controls="false"
                      class="compact-number-input"
                  />
                  <el-slider
                      v-model="localSettings.emergency_sleep_interval"
                      :min="300"
                      :max="7200"
                      :step="600"
                      class="compact-slider"
                  />
                </div>
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane label="Электропитание" name="power">
              <el-form-item label="Тип питания" prop="power_type">
                <el-select v-model="localSettings.power_type" class="compact-select">
                  <el-option value="battery" label="Аккумулятор" />
                  <el-option value="grid" label="Сеть" />
                  <el-option value="solar" label="Солнечная батарея" />
                </el-select>
              </el-form-item>

              <el-form-item label="Тип источника питания" prop="power_supply_id">
                <el-select v-model="localSettings.power_supply_id" class="compact-select">
                  <el-option value="standard" label="Стандартный источник" />
                  <el-option value="solar" label="Солнечная панель" />
                  <el-option value="grid" label="Сетевой адаптер" />
                </el-select>
              </el-form-item>

              <el-form-item label="Проверка подключения" prop="connection_check">
                <el-switch
                    v-model="localSettings.connection_check"
                    @change="updateConnectionCheck"
                />
                <div class="connection-check-container" v-if="localSettings.connection_check">
                  <el-form-item label="Интервал проверки (мин)" prop="connection_check_interval">
                    <el-input-number
                        v-model="localSettings.connection_check_interval"
                        :min="1"
                        :max="60"
                        :controls="false"
                        class="compact-number-input"
                    />
                  </el-form-item>
                </div>
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
import {
  calculateMinVoltage,
  calculateMaxVoltage,
  calculateCriticalVoltage
} from '@/components/SmartLight/api/utils/deviceUtils.js';
import { logDebug } from '@/components/SmartLight/api/utils/webglSupport.js';
import IconWrapper from '@/components/SmartLight/components/IconWrapper.vue';

const props = defineProps({
  device: {
    type: Object,
    required: true
  },
  show3D: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['settings-updated']);

const store = useSmartLightStore();
const loading = ref(false);
const error = ref(null);
const activeTab = ref('main');
const localSettings = ref({ ...props.device });

logDebug('DeviceSettings', 'Компонент создан', {
  deviceId: props.device.device_id,
  name: props.device.name,
  isFake: props.device.is_fake,
  status: props.device.status,
  show3D: props.show3D
});

// Максимальное количество аккумуляторов в группе
const maxBatteriesInGroup = computed(() => {
  const batteryType = store.getBatteryType(props.device.battery_type_id);
  return batteryType?.groupSupport?.maxInGroup || 10;
});

// Минимальное напряжение
const minVoltage = computed(() => {
  return calculateMinVoltage(props.device.device_id);
});

// Максимальное напряжение
const maxVoltage = computed(() => {
  return calculateMaxVoltage(props.device.device_id);
});

// Форматирование тултипа напряжения
const formatVoltageTooltip = (value) => {
  const formatted = Number(value).toFixed(2) + ' В';
  logDebug('DeviceSettings', 'Форматирование тултипа напряжения', {
    value,
    formatted
  });
  return formatted;
};

// Загрузка настроек
const loadSettings = async () => {
  logDebug('DeviceSettings', 'Загрузка настроек', { deviceId: props.device.device_id });

  loading.value = true;
  error.value = null;

  try {
    // Загружаем активный таб
    const tab = localStorage.getItem(`smartlight_device_settings_${props.device.device_id}_active_tab`);
    if (tab && ['main', 'modes', 'power'].includes(tab)) {
      activeTab.value = tab;
    } else {
      activeTab.value = 'main';
    }

    // Загружаем настройки из localStorage
    const settingsJson = localStorage.getItem(`smartlight_device_settings_${props.device.device_id}`);
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      localSettings.value = {
        ...localSettings.value,
        ...settings
      };
    }

    logDebug('DeviceSettings', 'Настройки загружены из localStorage', {
      deviceId: props.device.device_id,
      settings: localSettings.value
    });
  } catch (e) {
    logDebug('DeviceSettings', 'Ошибка загрузки настроек', {
      deviceId: props.device.device_id,
      error: e.message
    });
    console.error('Ошибка загрузки настроек устройства:', e);
    error.value = 'Ошибка загрузки настроек';
  } finally {
    loading.value = false;
  }
};

// Сброс настроек
const resetToDefaults = () => {
  logDebug('DeviceSettings', 'Сброс настроек', { deviceId: props.device.device_id });

  loading.value = true;
  error.value = null;

  try {
    // Сбрасываем критическое напряжение
    localSettings.value.critical_voltage = calculateCriticalVoltage(props.device.device_id);

    // Сбрасываем тип аккумулятора
    localSettings.value.battery_type_id = props.device.battery_type_id || 'li-ion-18650';

    // Сбрасываем группировку
    localSettings.value.battery_group_config = {
      enabled: false,
      type: 'series',
      count: 1,
      connections: []
    };

    // Сбрасываем тип лампочки
    localSettings.value.bulb_type_id = props.device.bulb_type_id || 'classic';

    // Сбрасываем интервалы
    localSettings.value.sleep_interval = 600;
    localSettings.value.emergency_sleep_interval = 3600;

    logDebug('DeviceSettings', 'Настройки сброшены к значениям по умолчанию', {
      deviceId: props.device.device_id,
      settings: localSettings.value
    });

    ElMessage.success('Настройки устройства сброшены');
  } catch (e) {
    logDebug('DeviceSettings', 'Ошибка сброса настроек', {
      deviceId: props.device.device_id,
      error: e.message
    });
    console.error('Ошибка сброса настроек:', e);
    error.value = 'Ошибка сброса настроек';
  } finally {
    loading.value = false;
  }
};

// Сохранение настроек
const saveSettings = async () => {
  logDebug('DeviceSettings', 'Сохранение настроек', { deviceId: props.device.device_id });

  loading.value = true;
  error.value = null;

  try {
    // Проверяем допустимые значения
    localSettings.value.critical_voltage = Math.min(4.3, Math.max(2.5, localSettings.value.critical_voltage));
    localSettings.value.sleep_interval = Math.min(86400, Math.max(60, localSettings.value.sleep_interval));
    localSettings.value.emergency_sleep_interval = Math.min(86400, Math.max(300, localSettings.value.emergency_sleep_interval));
    localSettings.value.telemetry_retention_days = Math.min(365, Math.max(1, localSettings.value.telemetry_retention_days));

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
    store.updateDeviceCriticalVoltage(
        props.device.device_id,
        localSettings.value.critical_voltage
    );

    logDebug('DeviceSettings', 'Критическое напряжение обновлено в Store', {
      deviceId: props.device.device_id,
      voltage: localSettings.value.critical_voltage
    });

    ElNotification({
      title: 'Устройство',
      message: 'Настройки устройства сохранены',
      type: 'success'
    });

    emit('settings-updated', { ...localSettings.value });
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

// Сохранение активного таба
const saveActiveTab = () => {
  localStorage.setItem(
      `smartlight_device_settings_${props.device.device_id}_active_tab`,
      activeTab.value
  );
};

// Восстановление активного таба
const restoreActiveTab = () => {
  const tab = localStorage.getItem(`smartlight_device_settings_${props.device.device_id}_active_tab`);
  if (tab && ['main', 'modes', 'power'].includes(tab)) {
    activeTab.value = tab;
  } else {
    activeTab.value = 'main';
  }
};

// Обновление типа аккумулятора
const updateBatteryType = () => {
  logDebug('DeviceSettings', 'Обновление типа аккумулятора', {
    deviceId: props.device.device_id,
    batteryType: localSettings.value.battery_type_id
  });

  // Пересчитываем критическое напряжение при изменении типа
  localSettings.value.critical_voltage = calculateCriticalVoltage(props.device.device_id);

  logDebug('DeviceSettings', 'Критическое напряжение пересчитано', {
    deviceId: props.device.device_id,
    criticalVoltage: localSettings.value.critical_voltage
  });

  // Сохраняем настройки
  saveSettings();
};

// Обновление группировки аккумуляторов
const updateBatteryGroupConfig = () => {
  logDebug('DeviceSettings', 'Обновление группировки аккумуляторов', {
    deviceId: props.device.device_id,
    config: localSettings.value.battery_group_config
  });

  // При включении группировки устанавливаем значения по умолчанию
  if (localSettings.value.battery_group_config.enabled) {
    localSettings.value.battery_group_config.type = 'series';
    localSettings.value.battery_group_config.count = 2;
  } else {
    // При отключении группировки сбрасываем настройки
    localSettings.value.battery_group_config = {
      enabled: false,
      type: 'series',
      count: 1,
      connections: []
    };
  }

  // Пересчитываем напряжения
  localSettings.value.critical_voltage = calculateCriticalVoltage(props.device.device_id);
  localSettings.value.min_voltage = calculateMinVoltage(props.device.device_id);
  localSettings.value.max_voltage = calculateMaxVoltage(props.device.device_id);

  saveSettings();
};

// Обновление проверки подключения
const updateConnectionCheck = (value) => {
  logDebug('DeviceSettings', 'Обновление проверки подключения', {
    deviceId: props.device.device_id,
    value
  });

  if (value) {
    // Устанавливаем интервал проверки по умолчанию
    if (!localSettings.value.connection_check_interval) {
      localSettings.value.connection_check_interval = 5;
    }
  }

  saveSettings();
};

onMounted(() => {
  logDebug('DeviceSettings', 'Инициализация компонента', { deviceId: props.device.device_id });
  loadSettings();
  restoreActiveTab();
});

// Следим за изменениями
watch(activeTab, (newValue) => {
  saveActiveTab();
});

watch(() => store.devices, (newDevices) => {
  logDebug('DeviceSettings', 'Изменение списка устройств', {
    deviceId: props.device.device_id,
    newCount: newDevices.length
  });

  const device = newDevices.find(d => d.device_id === props.device.device_id);
  if (device) {
    logDebug('DeviceSettings', 'Обновление данных устройства', {
      deviceId: props.device.device_id,
      device
    });
    props.device = { ...device };
  }
}, { deep: true });
</script>

<style scoped>
.device-settings {
  padding: 1rem;
}

.settings-card {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.skeleton-container {
  height: 300px;
  margin-top: 1rem;
}

.scrollable-content {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  padding: 0.5rem;
}

.settings-form {
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

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  width: 20px;
}

.range-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.compact-number-input {
  width: 100px;
}

.compact-slider {
  flex: 1;
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
