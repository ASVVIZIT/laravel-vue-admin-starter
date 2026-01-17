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
          <span>Обновить</span>
        </el-button>
        <el-button
            @click="showDebugPanel = !showDebugPanel"
            type="info"
            size="small"
            :class="{ 'debug-active': showDebugPanel }"
        >
          <Handbag class="action-icon" />
          <span>Отладка</span>
        </el-button>
        <el-button
            @click="toggle3DMode"
            type="warning"
            size="small"
            :class="{ 'mode-3d': store.interfaceSettings.global3DMode }"
        >
          <Eleme v-if="store.interfaceSettings.global3DMode" class="mode-icon" />
          <Grid v-else class="mode-icon" />
          <span>{{ store.interfaceSettings.global3DMode ? '3D режим' : '2D режим' }}</span>
        </el-button>
      </div>
    </div>

    <div class="dashboard-layout"
         :class="{
           'debug-active': showDebugPanel,
           'mode-3d': store.interfaceSettings.global3DMode
         }">
      <div class="content-container">
        <DeviceGrid
            @device-updated="refreshDevice"
            @emergency-sleep="handleEmergencySleep"
            @open-settings="openDeviceSettings"
            @device-selected="handleDeviceSelected"
            :show-3d="store.interfaceSettings.global3DMode"
        />
      </div>
      <div class="debug-panel-container" :class="{ 'active': showDebugPanel }">
        <DebugPanel :show-3d="store.interfaceSettings.global3DMode" />
      </div>
    </div>

    <el-dialog
        v-model="deviceSettingsVisible"
        title="Настройки устройства"
        width="520px"
        :modal="false"
    >
      <DeviceSettings :device="selectedDevice" :show-3d="store.interfaceSettings.global3DMode" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import {
  Opportunity,
  Refresh,
  Handbag,
  Eleme,
  Grid
} from '@element-plus/icons-vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import DeviceGrid from '@/components/SmartLight/components/DeviceGrid.vue';
import DebugPanel from '@/views/SmartLight/DebugPanel.vue';
import DeviceSettings from '@/views/SmartLight/DeviceSettings.vue';

const store = useSmartLightStore();
const devices = ref([]);
const loading = ref(false);
const showDebugPanel = ref(false);
const deviceSettingsVisible = ref(false);
const selectedDevice = ref(null);

// Загрузка устройств
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

// Обработчик переключения режима отображения
const toggle3DMode = () => {
  store.setGlobal3DMode(!store.interfaceSettings.global3DMode);

  ElNotification({
    title: 'Режим отображения',
    message: store.interfaceSettings.global3DMode ? 'Включен 3D режим' : 'Включен 2D режим',
    type: store.interfaceSettings.global3DMode ? 'success' : 'info'
  });
};

// Обновление устройства
const refreshDevice = async (deviceId) => {
  await loadDevices();
};

// Обработка перевода в сон
const handleEmergencySleep = async (deviceId) => {
  try {
    await store.forceSleep(deviceId);
    refreshDevice(deviceId);
  } catch (error) {
    ElNotification({
      title: 'Ошибка',
      message: 'Ошибка отправки команды сна',
      type: 'error'
    });
  }
};

// Выбор устройства
const handleDeviceSelected = (device) => {
  store.selectDevice(device.device_id);
  selectedDevice.value = device;
};

// Открытие настроек устройства
const openDeviceSettings = (device) => {
  selectedDevice.value = device;
  deviceSettingsVisible.value = true;
};

onMounted(() => {
  store.initInterfaceSettings();
  loadDevices();
});
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

:deep(.mode-icon) {
  width: 0.8rem;
  height: 0.8rem;
}

.header-actions .debug-active {
  background-color: #e6a23c !important;
  border-color: #e6a23c !important;
  color: #fff !important;
}

.header-actions .mode-3d {
  background-color: #ff9800 !important;
  border-color: #ff9800 !important;
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

.dashboard-layout.mode-3d {
  grid-template-rows: 1fr 0;
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
</style>
