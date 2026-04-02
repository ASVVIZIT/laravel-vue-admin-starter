<template>
  <el-dialog
      v-model="visible"
      title="Настройки устройства"
      width="500px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <div v-if="device" class="device-settings-form">
      <el-form :model="localSettings" label-width="160px" size="small">
        <el-form-item label="Крит. напряжение (В)">
          <el-input-number
              v-model="localSettings.critical_voltage"
              :min="2.5"
              :max="4.3"
              :step="0.1"
              :precision="2"
              class="full-width"
          />
        </el-form-item>

        <el-form-item label="Интервал сна (сек)">
          <el-input-number
              v-model="localSettings.sleep_interval"
              :min="60"
              :max="86400"
              :step="60"
              class="full-width"
          />
        </el-form-item>

        <el-form-item label="Аварийный интервал (сек)">
          <el-input-number
              v-model="localSettings.emergency_sleep_interval"
              :min="300"
              :max="86400"
              :step="60"
              class="full-width"
          />
        </el-form-item>

        <el-form-item label="Тип батареи">
          <el-select v-model="localSettings.battery_type_id" class="full-width">
            <el-option
                v-for="type in batteryTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Тип лампы">
          <el-select v-model="localSettings.bulb_type_id" class="full-width">
            <el-option
                v-for="type in bulbTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Группировка батарей">
          <el-switch
              v-model="localSettings.battery_group_config.enabled"
              active-text="Вкл"
              inactive-text="Выкл"
          />
        </el-form-item>

        <el-form-item v-if="localSettings.battery_group_config.enabled" label="Тип группировки">
          <el-select v-model="localSettings.battery_group_config.type" class="full-width">
            <el-option label="Последовательная" value="series" />
            <el-option label="Параллельная" value="parallel" />
            <el-option label="Последовательно-параллельная" value="series_parallel" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="localSettings.battery_group_config.enabled" label="Количество">
          <el-input-number
              v-model="localSettings.battery_group_config.count"
              :min="1"
              :max="15"
              :step="1"
              class="full-width"
          />
        </el-form-item>
      </el-form>
    </div>

    <div v-else class="no-device">
      <i class="el-icon-info"></i>
      <p>Устройство не найдено</p>
    </div>

    <template #footer>
      <el-button @click="handleClose">Отмена</el-button>
      <el-button type="primary" @click="handleSave" :loading="loading">
        Сохранить
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElNotification } from 'element-plus';
import { useSmartlightStore } from '@components/SmartLight/stores/index.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  deviceId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const store = useSmartlightStore();
const loading = ref(false);
const localSettings = ref({
  critical_voltage: 3.0,
  sleep_interval: 600,
  emergency_sleep_interval: 3600,
  battery_type_id: 'li-ion-18650',
  bulb_type_id: 'classic',
  battery_group_config: {
    enabled: false,
    type: 'series',
    count: 1
  }
});

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const device = computed(() => {
  if (!props.deviceId) return null;
  return store.deviceGetDevice(props.deviceId);
});

const batteryTypes = computed(() => store.batteryTypesForDropdown || []);
const bulbTypes = computed(() => store.bulbTypesForDropdown || []);

// Загружаем настройки при открытии
watch(() => props.modelValue, async (newVal) => {
  if (newVal && props.deviceId) {
    const deviceData = store.deviceGetDevice(props.deviceId);
    if (deviceData) {
      localSettings.value = {
        critical_voltage: deviceData.critical_voltage || 3.0,
        sleep_interval: deviceData.sleep_interval || 600,
        emergency_sleep_interval: deviceData.emergency_sleep_interval || 3600,
        battery_type_id: deviceData.battery_type_id || 'li-ion-18650',
        bulb_type_id: deviceData.bulb_type_id || 'classic',
        battery_group_config: deviceData.battery_group_config || {
          enabled: false,
          type: 'series',
          count: 1
        }
      };
    }
  }
}, { immediate: true });

const handleClose = () => {
  emit('update:modelValue', false);
};

const handleSave = async () => {
  if (!props.deviceId) return;

  loading.value = true;
  try {
    const response = await store.deviceUpdateDeviceSettings(props.deviceId, localSettings.value);
    if (response.success) {
      ElNotification({
        title: 'Успех',
        message: 'Настройки устройства сохранены',
        type: 'success'
      });
      emit('saved', response.data);
      handleClose();
    } else {
      throw new Error(response.message || 'Ошибка сохранения');
    }
  } catch (err) {
    ElNotification({
      title: 'Ошибка',
      message: 'Не удалось сохранить настройки: ' + err.message,
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.device-settings-form {
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.full-width {
  width: 100%;
}

.no-device {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.no-device i {
  font-size: 48px;
  margin-bottom: 10px;
}

:deep(.el-form-item) {
  margin-bottom: 14px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px;
  border-top: 1px solid #ebeef5;
}
</style>
