<template>
  <el-dialog
      v-model="visible"
      title="Настройки устройства"
      width="500px"
      :close-on-click-modal="false"
      class="device-settings-modal"
      @close="handleClose"
  >
    <div v-if="device" class="modal-content">
      <DeviceSettingsForm
          :device="device"
          :settings="localSettings"
          @update:settings="localSettings = $event"
      />
    </div>

    <div v-else class="modal-empty">
      <el-icon><InfoFilled /></el-icon>
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
import { InfoFilled } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import { useDeviceStore, useTypesStore } from '@components/SmartLight/stores/index.js';
import DeviceSettingsForm from '../forms/DeviceSettingsForm.vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  deviceId: { type: String, default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const visible = defineModel();
const deviceStore = useDeviceStore();
const typesStore = useTypesStore();
const loading = ref(false);

const localSettings = ref({
  critical_voltage: 3.0,
  sleep_interval: 600,
  emergency_sleep_interval: 3600,
  battery_type_id: 'li-ion-18650',
  bulb_type_id: 'classic',
  battery_group_config: { enabled: false, type: 'series', count: 1 }
});

const device = computed(() => {
  if (!props.deviceId) return null;
  return deviceStore.getDevice(props.deviceId);
});

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.deviceId && device.value) {
    localSettings.value = {
      critical_voltage: device.value.critical_voltage || 3.0,
      sleep_interval: device.value.sleep_interval || 600,
      emergency_sleep_interval: device.value.emergency_sleep_interval || 3600,
      battery_type_id: device.value.battery_type_id || 'li-ion-18650',
      bulb_type_id: device.value.bulb_type_id || 'classic',
      battery_group_config: device.value.battery_group_config || {
        enabled: false,
        type: 'series',
        count: 1
      }
    };
  }
}, { immediate: true });

const handleClose = () => {
  emit('update:modelValue', false);
};

const handleSave = async () => {
  if (!props.deviceId) return;
  loading.value = true;
  try {
    const response = await deviceStore.updateDeviceSettings(props.deviceId, localSettings.value);
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
      message: 'Не удалось сохранить: ' + err.message,
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.device-settings-modal :deep(.el-dialog__body) {
  padding: 20px;
}

.device-settings-modal :deep(.el-dialog__footer) {
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
}

.modal-content {
  padding: 10px;
  max-height: 450px;
  overflow-y: auto;
}

.modal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  color: #909399;
  gap: 12px;
}

.modal-empty .el-icon {
  font-size: 48px;
  color: #c0c4cc;
}

.modal-empty p {
  margin: 0;
  font-size: 14px;
}
</style>
