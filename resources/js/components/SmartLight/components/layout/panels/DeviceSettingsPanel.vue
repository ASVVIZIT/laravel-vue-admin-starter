<template>
  <div class="device-settings-panel" :class="{ 'panel-loading': loading }">
    <div class="device-info">
      <div class="device-name">{{ device.name }}</div>
      <el-tag :type="statusTagType" size="small">{{ statusText }}</el-tag>
    </div>

    <DeviceSettingsForm
        :device="device"
        :settings="localSettings"
        @update:settings="localSettings = $event"
    />

    <div class="panel-actions">
      <el-button type="primary" @click="handleSave" :loading="saving" class="full-width">
        Сохранить
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElNotification } from 'element-plus';
import { useDeviceStore } from '@/components/SmartLight/stores/index.js';
import DeviceSettingsForm from '@/components/SmartLight/components/settings/forms/DeviceSettingsForm.vue';

const props = defineProps({
  deviceId: { type: String, required: true }
});

const emit = defineEmits(['saved']);

const deviceStore = useDeviceStore();
const loading = ref(false);
const saving = ref(false);

const localSettings = ref({
  critical_voltage: 3.0,
  sleep_interval: 600,
  emergency_sleep_interval: 3600,
  battery_type_id: 'li-ion-18650',
  bulb_type_id: 'classic',
  battery_group_config: { enabled: false, type: 'series', count: 1 }
});

const device = computed(() => deviceStore.getDeviceStore(props.deviceId));

const statusTagType = computed(() => {
  if (!device.value) return 'info';
  const map = {
    'ON': 'success',
    'OFF': 'info',
    'SLEEPING': 'warning',
    'ERROR': 'danger'
  };
  return map[device.value.status] || 'info';
});

const statusText = computed(() => {
  if (!device.value) return 'N/A';
  const map = {
    'ON': 'Включено',
    'OFF': 'Выключено',
    'SLEEPING': 'Спит',
    'ERROR': 'Ошибка'
  };
  return map[device.value.status] || 'N/A';
});

watch(() => props.deviceId, (newId) => {
  if (newId && device.value) {
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

const handleSave = async () => {
  if (!props.deviceId) return;
  saving.value = true;
  try {
    const response = await deviceStore.updateDeviceSettingsStore(props.deviceId, localSettings.value);
    if (response.success) {
      ElNotification({
        title: 'Успех',
        message: 'Настройки устройства сохранены',
        type: 'success'
      });
      emit('saved', response.data);
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
    saving.value = false;
  }
};
</script>

<style scoped>
.device-settings-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.device-settings-panel.panel-loading {
  opacity: 0.6;
  pointer-events: none;
}

.device-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
  border: 1px solid #e1f3d8;
  border-radius: 4px;
}

.device-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.panel-actions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.full-width {
  width: 100%;
}
</style>
