<template>
  <div class="app-container">
    <div class="header">
      <h1>
        <el-icon name="lightbulb" class="mr-1" />
        Умное освещение
      </h1>
      <div class="header-actions">
        <el-button
            type="primary"
            @click="loadDevices"
            :loading="loading"
            size="small"
        >
          <el-icon name="refresh" class="mr-1" />
          Обновить
        </el-button>
        <el-button
            @click="showDebugPanel = !showDebugPanel"
            type="info"
            size="small"
            :class="{ 'debug-active': showDebugPanel }"
        >
          <el-icon name="bug" class="mr-1" />
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
        width="550px"
        :modal="false"
    >
      <DeviceSettings :device="selectedDevice" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import DeviceGrid from '@/components/SmartLight/components/DeviceGrid.vue';
import DebugPanel from './DebugPanel.vue';
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
    ElMessage.error('Не удалось загрузить устройства');
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
  padding: 1rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 0.4rem;
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
  height: calc(100vh - 100px);
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
  width: 320px;
  height: 100%;
  overflow-y: auto;
  transform: translateX(100%);
  opacity: 0;
  pointer-events: none;
  border-left: 1px solid #ebeef5;
  background: #fff;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.debug-panel-container.active {
  transform: translateX(0);
  opacity: 1;
  pointer-events: all;
}

/* Для мобильных устройств */
@media (max-width: 1100px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 0;
  }

  .dashboard-layout.debug-active {
    grid-template-rows: 1fr 45vh;
  }

  .debug-panel-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 45vh;
    transform: translateY(100%);
    border-radius: 6px 6px 0 0;
    box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.08);
  }

  .debug-panel-container.active {
    transform: translateY(0);
  }
}
</style>
