<template>
  <div class="device-grid">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка...</span>
    </div>
    <div v-else-if="error" class="error">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ error }}</span>
    </div>
    <div v-else-if="!devices || devices.length === 0" class="empty">
      <el-icon><InfoFilled /></el-icon>
      <span>Нет устройств</span>
    </div>
    <div v-else class="grid-container">
      <div
          v-for="device in devices"
          :key="device.device_id"
          class="grid-item"
      >
        <DeviceCard
            :device="device"
            @device-selected="$emit('device-selected', device)"
            @open-settings="$emit('open-settings', device)"
            @sleep-click="$emit('sleep-click', device)"
            @wake-click="$emit('wake-click', device)"
            @power-click="$emit('power-click', device)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Loading, WarningFilled, InfoFilled } from '@element-plus/icons-vue';
import { useDeviceStore } from '@/components/SmartLight/stores/index.js';
import DeviceCard from './DeviceCard.vue';

defineEmits([
  'device-selected',
  'open-settings',
  'sleep-click',
  'wake-click',
  'power-click'
]);

const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  }
});

const store = useDeviceStore();
const loading = ref(false);
const error = ref(null);

const handleDeviceSelect = (device) => {
  store.selectDeviceStore(device.device_id);
};

onMounted(async () => {
  loading.value = true;
  try {
    const result = await store.fetchDevicesStore();
    if (!result.success) {
      error.value = result.message || 'Ошибка загрузки устройств';
    }
  } catch (err) {
    error.value = err.message || 'Неизвестная ошибка';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.device-grid {
  width: 100%;
}

.loading,
.error,
.empty {
  padding: 40px;
  text-align: center;
  color: #909399;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.loading .is-loading,
.error .el-icon,
.empty .el-icon {
  font-size: 24px;
}

.error {
  color: #f56c6c;
}

.grid-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px;
  width: 100%;
  justify-content: flex-start;
}

.grid-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.grid-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
