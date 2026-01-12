<template>
  <div class="app-container">
    <div class="header">
      <h1>
        <Opportunity class="header-icon" />
        Умное освещение
      </h1>
      <div class="header-actions">
        <el-button
            type="primary"
            @click="loadDevices"
            :loading="loading"
            size="small"
        >
          <Refresh v-if="!loading" class="action-icon" />
          Обновить
        </el-button>
        <el-button
            @click="showDebugPanel = !showDebugPanel"
            type="info"
            size="small"
            :class="{ 'debug-active': showDebugPanel }"
        >
          <Handbag class="action-icon" />
          Отладка
        </el-button>
      </div>
    </div>

    <div class="dashboard-layout" :class="{ 'debug-active': showDebugPanel }">
      <div class="content-container">
        <DeviceGrid
            :devices="devices"
            :loading="loading"
            @device-updated="refreshDevice"
            @emergency-sleep="handleEmergencySleep"
            @open-settings="openDeviceSettings"
            @device-selected="handleDeviceSelected"
        />
      </div>

      <div class="debug-panel-container" :class="{ 'active': showDebugPanel }">
        <DebugPanel />
      </div>
    </div>

    <el-dialog
        v-model="deviceSettingsVisible"
        title="Настройки устройства"
        width="520px"
        :modal="false"
    >
      <DeviceSettings :device="selectedDevice" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import {
  Opportunity,
  Refresh,
  Handbag
} from '@element-plus/icons-vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import DeviceGrid from '@/components/SmartLight/components/DeviceGrid.vue';
import DebugPanel from './DebugPanel.vue';  // ПРАВИЛЬНЫЙ ИМПОРТ
import DeviceSettings from './DeviceSettings.vue';

const store = useSmartLightStore();
const devices = ref([]);
const loading = ref(false);
const showDebugPanel = ref(false);
const deviceSettingsVisible = ref(false);
const selectedDevice = ref(null);

const loadDevices = async () => {
  loading.value = true;
  try {
    await store.fetchDevices();
    devices.value = store.devices;
  } catch (error) {
    console.error('Ошибка загрузки устройств:', error);
    ElNotification({
      title: 'Ошибка',
      message: 'Не удалось загрузить устройства',
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};

const refreshDevice = async (deviceId) => {
  await loadDevices();
};

const handleEmergencySleep = async (deviceId) => {
  try {
    await store.forceSleep(deviceId);
    refreshDevice(deviceId);
  } catch (error) {
    ElMessage.error('Ошибка отправки команды сна');
  }
};

const handleDeviceSelected = (device) => {
  store.selectDevice(device.device_id);
};

const openDeviceSettings = (device) => {
  selectedDevice.value = device;
  deviceSettingsVisible.value = true;
};

onMounted(loadDevices);
</script>

<style scoped>
.app-container {
  padding: 0.75rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.header-actions {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}

.header-actions .debug-active {
  background-color: #e6a23c !important;
  border-color: #e6a23c !important;
  color: #fff !important;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 0;
  height: calc(100vh - 80px);
  overflow: hidden;
  transition: grid-template-columns 0.3s ease;
}

.dashboard-layout.debug-active {
  grid-template-columns: 1fr 320px;
}

.content-container {
  height: 100%;
  overflow: hidden;
}

.debug-panel-container {
  transform: translateX(100%);
  opacity: 0;
  pointer-events: none;
  border-left: 1px solid #ebeef5;
  background: #fff;
  transition: all 0.3s ease;
}

.debug-panel-container.active {
  transform: translateX(0);
  opacity: 1;
  pointer-events: all;
}

/* Для мобильных устройств */
@media (max-width: 1000px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 0;
  }

  .dashboard-layout.debug-active {
    grid-template-rows: 1fr 40vh;
  }

  .debug-panel-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 40vh;
    transform: translateY(100%);
    border-radius: 4px 4px 0 0;
    box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.08);
  }

  .debug-panel-container.active {
    transform: translateY(0);
  }
}

/* РАЗМЕРЫ ИКОНОК */
:deep(.header-icon) {
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.25rem;
}

:deep(.action-icon) {
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.25rem;
}
</style>
