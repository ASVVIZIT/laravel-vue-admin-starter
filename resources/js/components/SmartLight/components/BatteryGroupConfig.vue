<template>
  <div class="battery-group-config">
    <el-card class="config-card">
      <template #header>
        <div class="header-container">
          <h3 class="header-title">Группировка аккумуляторов</h3>
          <el-switch
              v-model="localConfig.enabled"
              @change="handleEnableChange"
              active-text="Включено"
              inactive-text="Выключено"
          />
        </div>
      </template>

      <div v-if="localConfig.enabled" class="config-content">
        <!-- Тип группировки -->
        <div class="config-group">
          <label class="config-label">Тип группировки</label>
          <el-select
              v-model="localConfig.type"
              class="config-select"
              @change="handleTypeChange"
          >
            <el-option value="series" label="Последовательное" />
            <el-option value="parallel" label="Параллельное" />
            <el-option value="series_parallel" label="Последовательно-параллельное" :disabled="!isSeriesParallelSupported" />
          </el-select>
          <div class="config-help">
            <Info class="help-icon" />
            <span>Выберите тип соединения аккумуляторов</span>
          </div>
        </div>

        <!-- Количество аккумуляторов -->
        <div class="config-group">
          <label class="config-label">Количество аккумуляторов</label>
          <div class="battery-count-container">
            <el-input-number
                v-model="localConfig.count"
                :min="1"
                :max="maxBatteries"
                :controls="true"
                class="battery-count-input"
                @change="handleCountChange"
            />
            <div class="battery-visualization">
              <div
                  v-for="n in localConfig.count"
                  :key="n"
                  class="battery-cell"
                  :class="{
                  'series-cell': localConfig.type === 'series',
                  'parallel-cell': localConfig.type === 'parallel',
                  'series-parallel-cell': localConfig.type === 'series_parallel'
                }"
              >
                <div class="battery-plus"></div>
                <div class="battery-minus"></div>
              </div>
            </div>
          </div>
          <div class="config-help">
            <Info class="help-icon" />
            <span>Максимум: {{ maxBatteries }} {{ batteryType.name }}</span>
          </div>
        </div>

        <!-- Схема подключения -->
        <div class="config-group">
          <label class="config-label">Схема подключения</label>
          <div class="connection-scheme">
            <div v-if="localConfig.type === 'series'" class="series-scheme">
              <div v-for="n in localConfig.count" :key="n" class="series-cell">
                <span class="cell-label">{{ n }}</span>
                <div class="cell-plus">+</div>
                <div class="cell-minus">-</div>
                <div v-if="n < localConfig.count" class="connection">---</div>
              </div>
            </div>

            <div v-else-if="localConfig.type === 'parallel'" class="parallel-scheme">
              <div class="parallel-bus">
                <div class="bus-plus">+</div>
                <div class="bus-minus">-</div>
              </div>
              <div class="parallel-cells">
                <div v-for="n in localConfig.count" :key="n" class="parallel-cell">
                  <span class="cell-label">{{ n }}</span>
                  <div class="cell-plus">+</div>
                  <div class="cell-minus">-</div>
                </div>
              </div>
            </div>

            <div v-else-if="localConfig.type === 'series_parallel'" class="series-parallel-scheme">
              <div class="series-groups">
                <div v-for="g in seriesGroups" :key="g" class="series-group">
                  <div class="group-label">Группа {{ g }}</div>
                  <div class="series-cells">
                    <div v-for="n in seriesPerGroup" :key="`${g}-${n}`" class="series-cell">
                      <span class="cell-label">{{ (g-1)*seriesPerGroup + n }}</span>
                      <div class="cell-plus">+</div>
                      <div class="cell-minus">-</div>
                      <div v-if="n < seriesPerGroup" class="connection">---</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="parallel-connection">
                <div class="bus-plus">+</div>
                <div class="bus-minus">-</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Параметры группировки -->
        <div class="config-group">
          <label class="config-label">Рассчитанные параметры</label>
          <div class="calculated-parameters">
            <div class="parameter-item">
              <span class="parameter-label">Мин. напряжение:</span>
              <span class="parameter-value">{{ calculatedMinVoltage }} В</span>
            </div>
            <div class="parameter-item">
              <span class="parameter-label">Макс. напряжение:</span>
              <span class="parameter-value">{{ calculatedMaxVoltage }} В</span>
            </div>
            <div class="parameter-item">
              <span class="parameter-label">Крит. напряжение:</span>
              <span class="parameter-value">{{ calculatedCriticalVoltage }} В</span>
            </div>
            <div class="parameter-item">
              <span class="parameter-label">Общая емкость:</span>
              <span class="parameter-value">{{ calculatedCapacity }} мАч</span>
            </div>
          </div>
        </div>

        <!-- Предупреждения -->
        <div v-if="warnings.length > 0" class="warnings-container">
          <el-alert
              v-for="(warning, index) in warnings"
              :key="index"
              :title="warning"
              type="warning"
              show-icon
              class="warning-alert"
          />
        </div>

        <!-- Кнопки действий -->
        <div class="action-buttons">
          <el-button
              @click="applyConfig"
              type="primary"
              :loading="loading"
              class="apply-button"
          >
            <Check class="button-icon" />
            <span>Применить</span>
          </el-button>
          <el-button
              @click="resetConfig"
              type="warning"
              class="reset-button"
          >
            <Refresh class="button-icon" />
            <span>Сбросить</span>
          </el-button>
        </div>
      </div>

      <div v-else class="disabled-info">
        <List class="info-icon" />
        <span>Группировка аккумуляторов отключена. Включите для настройки.</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import {
  Check,
  Refresh,
  List
} from '@element-plus/icons-vue';
import { useSmartlightStore } from '@/components/SmartLight/stores/smartLightStore';
import { logDebug, logError } from '@components/SmartLight/utils/appLogger.js';

const props = defineProps({
  device: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['config-updated']);

const store = useSmartlightStore();
const loading = ref(false);
const warnings = ref([]);

// Локальная копия конфигурации
const localConfig = ref({
  enabled: false,
  type: 'series',
  count: 1,
  connections: []
});

// Инициализация при монтировании
onMounted(() => {
  logDebug('BatteryGroupConfig', 'Инициализация компонента', { deviceId: props.device.device_id });
  initLocalConfig();
});

// Инициализация локальной конфигурации
const initLocalConfig = () => {
  if (props.device.battery_group_config) {
    localConfig.value = {
      enabled: props.device.battery_group_config.enabled || false,
      type: props.device.battery_group_config.type || 'series',
      count: props.device.battery_group_config.count || 1,
      connections: props.device.battery_group_config.connections || []
    };
  }
};

// Тип аккумулятора
const batteryType = computed(() => {
  return store.getBatteryType(props.device.battery_type_id);
});

// Максимальное количество аккумуляторов
const maxBatteries = computed(() => {
  return batteryType.value.groupSupport?.maxInGroup || 10;
});

// Поддержка последовательно-параллельного соединения
const isSeriesParallelSupported = computed(() => {
  return batteryType.value.groupSupport?.series_parallel || false;
});

// Количество групп при последовательно-параллельном соединении
const seriesGroups = computed(() => {
  if (localConfig.value.type !== 'series_parallel' || localConfig.value.count < 2) return 1;
  return Math.ceil(localConfig.value.count / 2);
});

// Количество элементов в серии при последовательно-параллельном соединении
const seriesPerGroup = computed(() => {
  if (localConfig.value.type !== 'series_parallel' || localConfig.value.count < 2) return localConfig.value.count;
  return Math.floor(localConfig.value.count / seriesGroups.value);
});

// Рассчитанное минимальное напряжение
const calculatedMinVoltage = computed(() => {
  const baseMin = batteryType.value.minVoltage;
  if (localConfig.value.type === 'series') {
    return baseMin * localConfig.value.count;
  } else if (localConfig.value.type === 'series_parallel') {
    return baseMin * seriesPerGroup.value;
  }
  return baseMin;
});

// Рассчитанное максимальное напряжение
const calculatedMaxVoltage = computed(() => {
  const baseMax = batteryType.value.maxVoltage;
  if (localConfig.value.type === 'series') {
    return baseMax * localConfig.value.count;
  } else if (localConfig.value.type === 'series_parallel') {
    return baseMax * seriesPerGroup.value;
  }
  return baseMax;
});

// Рассчитанное критическое напряжение
const calculatedCriticalVoltage = computed(() => {
  const baseCritical = batteryType.value.criticalVoltage;
  if (localConfig.value.type === 'series') {
    return baseCritical * localConfig.value.count;
  } else if (localConfig.value.type === 'series_parallel') {
    return baseCritical * seriesPerGroup.value;
  }
  return baseCritical;
});

// Рассчитанная емкость
const calculatedCapacity = computed(() => {
  const baseCapacity = props.device.capacity || batteryType.value.nominalCapacity;
  if (localConfig.value.type === 'parallel') {
    return baseCapacity * localConfig.value.count;
  } else if (localConfig.value.type === 'series_parallel') {
    return baseCapacity * seriesGroups.value;
  }
  return baseCapacity;
});

// Обработчик включения/выключения
const handleEnableChange = (value) => {
  logDebug('BatteryGroupConfig', 'Изменение состояния включения', {
    deviceId: props.device.device_id,
    value
  });

  if (!value) {
    // При выключении сбрасываем конфигурацию
    localConfig.value = {
      enabled: false,
      type: 'series',
      count: 1,
      connections: []
    };
  }
};

// Обработчик изменения типа
const handleTypeChange = (value) => {
  logDebug('BatteryGroupConfig', 'Изменение типа группировки', {
    deviceId: props.device.device_id,
    value
  });

  // Проверяем поддержку типа
  if (value === 'series_parallel' && !isSeriesParallelSupported.value) {
    ElNotification({
      title: 'Предупреждение',
      message: 'Последовательно-параллельное соединение не поддерживается для этого типа аккумулятора',
      type: 'warning'
    });
    localConfig.value.type = 'series';
    return;
  }

  validateConfig();
};

// Обработчик изменения количества
const handleCountChange = (value) => {
  logDebug('BatteryGroupConfig', 'Изменение количества аккумуляторов', {
    deviceId: props.device.device_id,
    value
  });

  // Ограничиваем максимальное количество
  if (value > maxBatteries.value) {
    localConfig.value.count = maxBatteries.value;
    ElNotification({
      title: 'Предупреждение',
      message: `Максимальное количество аккумуляторов: ${maxBatteries.value}`,
      type: 'warning'
    });
  }

  // Проверяем минимальное количество для последовательно-параллельного
  if (localConfig.value.type === 'series_parallel' && value < 2) {
    localConfig.value.type = 'series';
    ElNotification({
      title: 'Предупреждение',
      message: 'Последовательно-параллельное соединение требует минимум 2 аккумулятора',
      type: 'warning'
    });
  }

  validateConfig();
};

// Валидация конфигурации
const validateConfig = () => {
  const warningsArray = [];

  // Проверка максимального количества
  if (localConfig.value.count > maxBatteries.value) {
    warningsArray.push(`Превышено максимальное количество аккумуляторов (${maxBatteries.value})`);
  }

  // Проверка для последовательно-параллельного соединения
  if (localConfig.value.type === 'series_parallel' && localConfig.value.count < 2) {
    warningsArray.push('Последовательно-параллельное соединение требует минимум 2 аккумулятора');
  }

  // Проверка поддержки типа
  if (localConfig.value.type === 'series_parallel' && !isSeriesParallelSupported.value) {
    warningsArray.push('Последовательно-параллельное соединение не поддерживается для этого типа аккумулятора');
  }

  warnings.value = warningsArray;
};

// Применение конфигурации
const applyConfig = async () => {
  logDebug('BatteryGroupConfig', 'Применение конфигурации', {
    deviceId: props.device.device_id,
    config: localConfig.value
  });

  loading.value = true;

  try {
    // Обновляем конфигурацию в Store
    const updatedDevice = {
      ...props.device,
      battery_group_config: { ...localConfig.value }
    };

    // Сохраняем в API
    const resource = new SmartLightResource();
    const response = await resource.updateDeviceSettings(props.device.device_id, {
      battery_group_config: localConfig.value
    });

    if (response.success) {
      // Обновляем устройство в Store
      const deviceIndex = store.devices.findIndex(d => d.device_id === props.device.device_id);
      if (deviceIndex !== -1) {
        store.devices[deviceIndex] = updatedDevice;
      }

      ElNotification({
        title: 'Успех',
        message: 'Конфигурация группировки сохранена',
        type: 'success'
      });

      emit('config-updated', updatedDevice);
    } else {
      throw new Error(response.message || 'Ошибка сохранения конфигурации');
    }
  } catch (error) {
    logDebug('BatteryGroupConfig', 'Ошибка применения конфигурации', {
      deviceId: props.device.device_id,
      error: error.message
    });

    ElNotification({
      title: 'Ошибка',
      message: 'Не удалось сохранить конфигурацию: ' + error.message,
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};

// Сброс конфигурации
const resetConfig = () => {
  logDebug('BatteryGroupConfig', 'Сброс конфигурации', {
    deviceId: props.device.device_id
  });

  ElNotification({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите сбросить конфигурацию группировки?',
    type: 'warning',
    showClose: true,
    duration: 0,
    onConfirm: () => {
      localConfig.value = {
        enabled: false,
        type: 'series',
        count: 1,
        connections: []
      };
      warnings.value = [];
      ElNotification({
        title: 'Успех',
        message: 'Конфигурация сброшена',
        type: 'success'
      });
    }
  });
};
</script>

<style scoped>
.battery-group-config {
  width: 100%;
  padding: 0.5rem;
}

.config-card {
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

.config-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #606266;
}

.config-select {
  width: 100%;
  max-width: 400px;
}

.config-help {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: #909399;
}

.help-icon {
  width: 0.9rem;
  height: 0.9rem;
}

.battery-count-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.battery-count-input {
  width: 150px;
}

.battery-visualization {
  display: flex;
  gap: 0.3rem;
  padding: 0.5rem;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 60px;
  align-items: center;
  justify-content: center;
}

.battery-cell {
  width: 40px;
  height: 60px;
  background: #ebeef5;
  border-radius: 4px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem;
}

.series-cell {
  border: 1px solid #409eff;
}

.parallel-cell {
  border: 1px solid #67c23a;
}

.series-parallel-cell {
  border: 1px solid #e6a23c;
}

.battery-plus {
  width: 8px;
  height: 8px;
  background: #409eff;
  border-radius: 50%;
}

.battery-minus {
  width: 12px;
  height: 2px;
  background: #409eff;
}

.connection-scheme {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.series-scheme {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.series-cell {
  width: 60px;
  height: 80px;
  border: 2px solid #409eff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fc;
}

.cell-label {
  font-weight: bold;
  color: #409eff;
}

.cell-plus {
  width: 12px;
  height: 12px;
  background: #409eff;
  border-radius: 50%;
}

.cell-minus {
  width: 20px;
  height: 4px;
  background: #409eff;
}

.connection {
  width: 20px;
  height: 2px;
  background: #409eff;
}

.parallel-scheme {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.parallel-bus {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.bus-plus {
  width: 20px;
  height: 30px;
  background: #67c23a;
  border-radius: 4px 4px 0 0;
}

.bus-minus {
  width: 20px;
  height: 30px;
  background: #f56c6c;
  border-radius: 4px 4px 0 0;
}

.parallel-cells {
  display: flex;
  gap: 0.5rem;
}

.parallel-cell {
  width: 50px;
  height: 60px;
  border: 2px solid #67c23a;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8fcf8;
}

.series-parallel-scheme {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.series-groups {
  display: flex;
  gap: 1rem;
}

.series-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-label {
  text-align: center;
  font-weight: 500;
  color: #e6a23c;
}

.series-cells {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.series-cell {
  width: 50px;
  height: 40px;
  border: 1px solid #e6a23c;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem;
  background: #fdf8f0;
}

.parallel-connection {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.5rem;
}

.calculated-parameters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f5f7fa;
  border-radius: 4px;
}

.parameter-item {
  display: flex;
  justify-content: space-between;
}

.parameter-label {
  font-size: 0.9rem;
  color: #606266;
}

.parameter-value {
  font-weight: bold;
  color: #409eff;
}

.warnings-container {
  margin-top: 0.5rem;
}

.warning-alert {
  margin-bottom: 0.3rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.apply-button, .reset-button {
  padding: 0.5rem 1rem;
}

.button-icon {
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.3rem;
}

.disabled-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #909399;
}

.info-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: #909399;
}
</style>
