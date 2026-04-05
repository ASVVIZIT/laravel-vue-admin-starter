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
        </div>

        <div class="config-group">
          <label class="config-label">Количество аккумуляторов</label>
          <el-input-number
              v-model="localConfig.count"
              :min="1"
              :max="maxBatteries"
              @change="handleCountChange"
          />
        </div>

        <div class="config-group">
          <label class="config-label">Параметры</label>
          <div class="calculated-parameters">
            <div class="parameter-item">
              <span>Мин. напряжение:</span>
              <span>{{ calculatedMinVoltage }} В</span>
            </div>
            <div class="parameter-item">
              <span>Макс. напряжение:</span>
              <span>{{ calculatedMaxVoltage }} В</span>
            </div>
            <div class="parameter-item">
              <span>Крит. напряжение:</span>
              <span>{{ calculatedCriticalVoltage }} В</span>
            </div>
            <div class="parameter-item">
              <span>Емкость:</span>
              <span>{{ calculatedCapacity }} мАч</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <el-button @click="applyConfig" type="primary" :loading="loading">
            Применить
          </el-button>
          <el-button @click="resetConfig" type="warning">
            Сбросить
          </el-button>
        </div>
      </div>

      <div v-else class="disabled-info">
        <span>Группировка отключена</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import { useSmartlightStore } from '@components/SmartLight/stores/index.js';
import { CoreSmartLightResource } from '@components/SmartLight/api/core/resource/coreSmartLightResource.js';

const props = defineProps({
  device: { type: Object, required: true }
});

const emit = defineEmits(['config-updated']);

const store = useSmartlightStore();
const loading = ref(false);
const localConfig = ref({
  enabled: false,
  type: 'series',
  count: 1
});

onMounted(() => {
  initLocalConfig();
});

const initLocalConfig = () => {
  if (props.device.battery_group_config) {
    localConfig.value = {
      enabled: props.device.battery_group_config.enabled || false,
      type: props.device.battery_group_config.type || 'series',
      count: props.device.battery_group_config.count || 1
    };
  }
};

const batteryType = computed(() => {
  return store.typesGetBatteryTypeById(props.device.battery_type_id);
});

const maxBatteries = computed(() => {
  return batteryType.value.groupSupport?.maxInGroup || 10;
});

const isSeriesParallelSupported = computed(() => {
  return batteryType.value.groupSupport?.series_parallel || false;
});

const calculatedMinVoltage = computed(() => {
  const baseMin = batteryType.value.minVoltage;
  if (localConfig.value.type === 'series') {
    return baseMin * localConfig.value.count;
  } else if (localConfig.value.type === 'series_parallel') {
    return baseMin * Math.floor(localConfig.value.count / 2);
  }
  return baseMin;
});

const calculatedMaxVoltage = computed(() => {
  const baseMax = batteryType.value.maxVoltage;
  if (localConfig.value.type === 'series') {
    return baseMax * localConfig.value.count;
  } else if (localConfig.value.type === 'series_parallel') {
    return baseMax * Math.floor(localConfig.value.count / 2);
  }
  return baseMax;
});

const calculatedCriticalVoltage = computed(() => {
  const baseCritical = batteryType.value.criticalVoltage;
  if (localConfig.value.type === 'series') {
    return baseCritical * localConfig.value.count;
  } else if (localConfig.value.type === 'series_parallel') {
    return baseCritical * Math.floor(localConfig.value.count / 2);
  }
  return baseCritical;
});

const calculatedCapacity = computed(() => {
  const baseCapacity = props.device.capacity || batteryType.value.nominalCapacity;
  if (localConfig.value.type === 'parallel') {
    return baseCapacity * localConfig.value.count;
  } else if (localConfig.value.type === 'series_parallel') {
    return baseCapacity * Math.ceil(localConfig.value.count / 2);
  }
  return baseCapacity;
});

const handleEnableChange = (value) => {
  if (!value) {
    localConfig.value = { enabled: false, type: 'series', count: 1 };
  }
};

const handleTypeChange = (value) => {
  if (value === 'series_parallel' && !isSeriesParallelSupported.value) {
    ElNotification({
      title: 'Предупреждение',
      message: 'Не поддерживается для этого типа',
      type: 'warning'
    });
    localConfig.value.type = 'series';
  }
};

const handleCountChange = (value) => {
  if (value > maxBatteries.value) {
    localConfig.value.count = maxBatteries.value;
  }
};

const applyConfig = async () => {
  loading.value = true;
  try {
    const resource = new CoreSmartLightResource();
    const response = await resource.updateDeviceSettings(props.device.device_id, {
      battery_group_config: localConfig.value
    });

    if (response.success) {
      ElNotification({ title: 'Успех', message: 'Конфигурация сохранена', type: 'success' });
      emit('config-updated', { ...props.device, battery_group_config: localConfig.value });
    }
  } catch (error) {
    ElNotification({ title: 'Ошибка', message: error.message, type: 'error' });
  } finally {
    loading.value = false;
  }
};

const resetConfig = () => {
  localConfig.value = { enabled: false, type: 'series', count: 1 };
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
  font-size: 0.85rem;
}

.parameter-item span:first-child {
  color: #606266;
}

.parameter-item span:last-child {
  font-weight: bold;
  color: #409eff;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.disabled-info {
  padding: 1rem;
  background: #f5f7fa;
  border-radius: 4px;
  text-align: center;
  color: #909399;
}
</style>
