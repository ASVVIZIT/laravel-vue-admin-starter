<template>
  <div class="device-settings-form">
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

      <el-form-item label="Группировка">
        <el-switch
            v-model="localSettings.battery_group_config.enabled"
            active-text="Вкл"
            inactive-text="Выкл"
        />
      </el-form-item>

      <el-form-item v-if="localSettings.battery_group_config.enabled" label="Тип">
        <el-select v-model="localSettings.battery_group_config.type" class="full-width">
          <el-option label="Последовательная" value="series" />
          <el-option label="Параллельная" value="parallel" />
          <el-option label="Посл.-параллельная" value="series_parallel" />
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

      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="loading" class="full-width">
          Сохранить
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElNotification } from 'element-plus';
import { useSmartlightStore } from '@components/SmartLight/stores/index.js';

const props = defineProps({
  device: { type: Object, required: true }
});

const emit = defineEmits(['saved', 'close']);

const store = useSmartlightStore();
const loading = ref(false);
const localSettings = ref({
  critical_voltage: 3.0,
  sleep_interval: 600,
  emergency_sleep_interval: 3600,
  battery_type_id: 'li-ion-18650',
  bulb_type_id: 'classic',
  battery_group_config: { enabled: false, type: 'series', count: 1 }
});

const batteryTypes = computed(() => store.batteryTypesForDropdown || []);
const bulbTypes = computed(() => store.bulbTypesForDropdown || []);

watch(() => props.device, (newDevice) => {
  if (newDevice) {
    localSettings.value = {
      critical_voltage: newDevice.critical_voltage || 3.0,
      sleep_interval: newDevice.sleep_interval || 600,
      emergency_sleep_interval: newDevice.emergency_sleep_interval || 3600,
      battery_type_id: newDevice.battery_type_id || 'li-ion-18650',
      bulb_type_id: newDevice.bulb_type_id || 'classic',
      battery_group_config: newDevice.battery_group_config || { enabled: false, type: 'series', count: 1 }
    };
  }
}, { immediate: true });

const handleSave = async () => {
  loading.value = true;
  try {
    const response = await store.deviceUpdateDeviceSettings(props.device.device_id, localSettings.value);
    if (response.success) {
      ElNotification({ title: 'Успех', message: 'Настройки устройства сохранены', type: 'success' });
      emit('saved', response.data);
    } else {
      throw new Error(response.message);
    }
  } catch (err) {
    ElNotification({ title: 'Ошибка', message: 'Не удалось сохранить: ' + err.message, type: 'error' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.device-settings-form { padding: 10px; }
.full-width { width: 100%; }
:deep(.el-form-item) { margin-bottom: 12px; }
:deep(.el-input-number) { width: 100%; }
</style>
