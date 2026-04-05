<template>
  <div class="device-list">
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
    <div v-else class="list-container">
      <div
          v-for="device in devices"
          :key="device.device_id"
          class="list-item"
          :class="{ 'list-item--selected': isSelected(device) }"
          @click="selectDevice(device)"
      >
        <div class="list-item__info">
          <div class="list-item__name">{{ device.name }}</div>
          <div class="list-item__id">{{ device.device_id }}</div>
        </div>
        <div class="list-item__status">
          <el-tag :type="getStatusTagType(device)" size="small">
            {{ getStatusText(device) }}
          </el-tag>
        </div>
        <div class="list-item__metrics">
          <span class="metric">{{ device.voltage?.toFixed(1) }}В</span>
          <span class="metric">{{ device.intensity }}%</span>
        </div>
        <div class="list-item__actions">
          <el-button size="small" @click.stop="openSettings(device)">
            <el-icon><Setting /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  Loading,
  WarningFilled,
  InfoFilled,
  Setting
} from '@element-plus/icons-vue';
import {
  useDeviceStore,
  useInterfaceStore
} from '@/components/SmartLight/stores/index.js';

const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

const emit = defineEmits([
  'device-selected',
  'open-settings'
]);

const deviceStore = useDeviceStore();
const interfaceStore = useInterfaceStore();

const selectedDevice = computed(() => deviceStore.selectedDevice);

// === ЛОГИРОВАНИЕ ===
const logAction = (message, extraData = {}) => {
  interfaceStore.addLog?.({
    level: 'info',
    component: 'DeviceList',
    message: message,
    data: {
      deviceCount: props.devices?.length || 0,
      ...extraData
    }
});
};

const isSelected = (device) => {
  return selectedDevice.value?.device_id === device.device_id;
};

const getStatusTagType = (device) => {
  const map = {
    ON: 'success',
    OFF: 'info',
    SLEEPING: 'warning',
    ERROR: 'danger'
  };
  return map[device.status] || 'info';
};

const getStatusText = (device) => {
  const map = {
    ON: 'Вкл',
    OFF: 'Выкл',
    SLEEPING: 'Сон',
    ERROR: 'Ошб'
  };
  return map[device.status] || 'N/A';
};

const selectDevice = (device) => {
  logAction('Выбрано устройство из списка', {
    deviceId: device.device_id,
    deviceName: device.name,
    action: 'list_selection'
  });
  deviceStore.selectDeviceStore(device.device_id);
  emit('device-selected', device);
};

const openSettings = (device) => {
  logAction('Открыты настройки из списка', {
    deviceId: device.device_id,
    deviceName: device.name,
    action: 'list_open_settings'
  });
  emit('open-settings', device);
};
</script>

<style scoped>
.device-list {
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

.error {
  color: #f56c6c;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.list-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.list-item--selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.list-item__info {
  flex: 1;
  min-width: 0;
}

.list-item__name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item__id {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.list-item__status {
  width: 60px;
  flex-shrink: 0;
}

.list-item__metrics {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.metric {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.list-item__actions {
  flex-shrink: 0;
}

:deep(.el-button) {
  padding: 4px 6px;
}

:deep(.el-button .el-icon) {
  font-size: 14px;
}
</style>
