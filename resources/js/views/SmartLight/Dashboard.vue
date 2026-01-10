<template>
  <div class="app-container">
    <div class="header">
      <h1>
        <el-icon name="lightbulb" class="mr-2" />
        Умное освещение
      </h1>
      <div class="header-actions">
        <el-button
            type="primary"
            @click="loadDevices"
            :loading="loading"
        >
          <el-icon name="refresh" class="mr-1" />
          Обновить
        </el-button>
        <el-button
            @click="showDebugPanel = !showDebugPanel"
            type="info"
            size="small"
        >
          <el-icon name="bug" class="mr-1" />
          Отладка
        </el-button>
      </div>
    </div>

    <DebugPanel
        v-if="showDebugPanel"
        :devices="devices"
        class="debug-panel"
        @device-selected="handleDeviceSelected"
    />

    <DeviceGrid
        :devices="devices"
        :loading="loading"
        @device-updated="refreshDevice"
        @emergency-sleep="handleEmergencySleep"
        @open-settings="openDeviceSettings"
    />

    <el-dialog
        v-model="deviceSettingsVisible"
        title="Индивидуальные настройки устройства"
        width="600px"
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
  selectedDevice.value = device;
  deviceSettingsVisible.value = true;
};

const openDeviceSettings = (device) => {
  selectedDevice.value = device;
  deviceSettingsVisible.value = true;
};

onMounted(loadDevices);
</script>

<style scoped>
.app-container {
  padding: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.debug-panel {
  margin-bottom: 1.5rem;
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
