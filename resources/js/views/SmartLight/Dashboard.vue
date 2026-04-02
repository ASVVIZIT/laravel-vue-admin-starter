<template>
  <div class="dashboard">
    <div class="dashboard-top-bar">
      <div class="device-filter">
        <el-radio-group
            :model-value="deviceFilter"
            @update:model-value="deviceFilter = $event"
            size="small"
        >
          <el-radio-button label="all">Все</el-radio-button>
          <el-radio-button label="real">Реальные</el-radio-button>
          <el-radio-button label="fake">Фейковые</el-radio-button>
        </el-radio-group>
      </div>

      <div class="top-controls">
        <el-button
            type="primary"
            :class="{ active: interfaceStore.global3DMode }"
            @click="toggleGlobal3DMode"
            size="small"
        >
          <el-icon><Grid v-if="interfaceStore.global3DMode" /><Menu v-else /></el-icon>
          {{ interfaceStore.global3DMode ? '3D' : '2D' }}
        </el-button>

        <el-button type="info" @click="toggleSettingsPanel" size="small">
          <el-icon><Setting /></el-icon> Настройки
        </el-button>

        <el-button type="warning" @click="toggleDebugPanel" size="small">
          <el-icon><Tools /></el-icon> Отладка
        </el-button>
      </div>
    </div>

    <div class="dashboard-main">
      <div class="dashboard-left">
        <div class="monitoring-compact">
          <PowerMonitoringCompact :current-filter="deviceFilter" />
        </div>

        <div class="device-grid-container">
          <DeviceGrid
              :devices="filteredDevices"
              @device-selected="handleDeviceSelect"
              @open-settings="openDeviceSettings"
              @sleep-click="handleSleepClick"
              @wake-click="handleWakeClick"
          />
        </div>
      </div>

      <div class="settings-panel" :class="{ 'panel-open': settingsPanelVisible }">
        <div class="panel-header">
          <span class="panel-title">Настройки</span>
          <el-button type="text" @click="toggleSettingsPanel" size="small">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <div v-if="selectedDevice" class="panel-content">
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="ID">{{ selectedDevice.device_id }}</el-descriptions-item>
            <el-descriptions-item label="Имя">{{ selectedDevice.name }}</el-descriptions-item>
            <el-descriptions-item label="Статус">
              <el-tag :type="statusTagType" size="small">{{ statusText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Напряжение">{{ selectedDevice.voltage?.toFixed(2) }} В</el-descriptions-item>
            <el-descriptions-item label="Интенсивность">{{ selectedDevice.intensity }}%</el-descriptions-item>
          </el-descriptions>

          <el-button type="primary" @click="openDeviceSettings(selectedDevice)" class="full-width">
            <el-icon><Setting /></el-icon> Настроить устройство
          </el-button>
        </div>

        <div v-else class="panel-empty">
          <el-icon><InfoFilled /></el-icon>
          <p>Выберите устройство</p>
        </div>
      </div>
    </div>

    <DebugPanel
        @toggle="toggleDebugPanel"
        @open-settings="openGlobalSettingsModal"
    />

    <DeviceSettingsModal
        v-model="deviceSettingsModalVisible"
        :device-id="selectedDeviceForModal?.device_id"
        @saved="handleSettingsSaved"
    />

    <GlobalSettingsPanel v-model="globalSettingsModalVisible" />

    <el-dialog v-model="sleepConfirmVisible" title="Перевод в сон" width="350px" :close-on-click-modal="false">
      <div class="confirm-content">
        <el-icon class="confirm-icon warning"><WarningFilled /></el-icon>
        <p>Перевести <strong>{{ selectedDeviceForModal?.name }}</strong> в спящий режим?</p>
      </div>
      <template #footer>
        <el-button @click="sleepConfirmVisible = false">Отмена</el-button>
        <el-button type="warning" @click="confirmSleep" :loading="actionLoading">Перевести в сон</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="wakeConfirmVisible" title="Пробуждение" width="350px" :close-on-click-modal="false">
      <div class="confirm-content">
        <el-icon class="confirm-icon success"><CircleCheckFilled /></el-icon>
        <p>Пробудить <strong>{{ selectedDeviceForModal?.name }}</strong>?</p>
      </div>
      <template #footer>
        <el-button @click="wakeConfirmVisible = false">Отмена</el-button>
        <el-button type="success" @click="confirmWake" :loading="actionLoading">Пробудить</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import {
  Grid, Menu, Setting, Tools, Close, InfoFilled,
  WarningFilled, CircleCheckFilled
} from '@element-plus/icons-vue';

// ПРЯМОЙ ИМПОРТ ИЗ stores/index.js
import {
  useDeviceStore,
  useInterfaceStore,
  useSettingsStore
} from '@/components/SmartLight/stores/index.js';

import DebugPanel from '@components/SmartLight/components/layout/DebugPanel.vue';
import DeviceGrid from '@components/SmartLight/components/devices/DeviceGrid.vue';
import PowerMonitoringCompact from '@components/SmartLight/components/monitoring/PowerMonitoringCompact.vue';
import DeviceSettingsModal from '@components/SmartLight/components/settings/DeviceSettingsModal.vue';
import GlobalSettingsPanel from '@components/SmartLight/components/settings/GlobalSettingsPanel.vue';

// ИНИЦИАЛИЗАЦИЯ СТОРОВ (ОДИН РАЗ!)
const deviceStore = useDeviceStore();
const interfaceStore = useInterfaceStore();
const settingsStore = useSettingsStore();

const deviceFilter = ref('all');
const deviceSettingsModalVisible = ref(false);
const globalSettingsModalVisible = ref(false);
const selectedDeviceForModal = ref(null);
const sleepConfirmVisible = ref(false);
const wakeConfirmVisible = ref(false);
const actionLoading = ref(false);
const settingsPanelVisible = ref(false);

const selectedDevice = computed(() => deviceStore.selectedDevice);

const filteredDevices = computed(() => {
  if (deviceFilter.value === 'real') return deviceStore.realDevices || [];
  if (deviceFilter.value === 'fake') return deviceStore.fakeDevices || [];
  return deviceStore.devices || [];
});

const statusTagType = computed(() => {
  const map = { 'ON': 'success', 'OFF': 'info', 'SLEEPING': 'warning', 'ERROR': 'danger' };
  return map[selectedDevice.value?.status] || 'info';
});

const statusText = computed(() => {
  const map = { 'ON': 'Включено', 'OFF': 'Выключено', 'SLEEPING': 'Спит', 'ERROR': 'Ошибка' };
  return map[selectedDevice.value?.status] || 'N/A';
});

const toggleGlobal3DMode = () => {
  interfaceStore.toggleGlobal3DMode();
  ElNotification({
    title: 'Режим изменен',
    message: `Переключено на ${interfaceStore.global3DMode ? '3D' : '2D'} режим`,
    type: 'success',
    duration: 2000
  });
};

const toggleDebugPanel = () => {
  interfaceStore.toggleDebugPanel();
};

const toggleSettingsPanel = () => {
  settingsPanelVisible.value = !settingsPanelVisible.value;
};

const openGlobalSettingsModal = () => {
  globalSettingsModalVisible.value = true;
};

const handleDeviceSelect = (device) => {
  deviceStore.selectDevice(device.device_id);
};

const openDeviceSettings = (device) => {
  selectedDeviceForModal.value = device;
  deviceSettingsModalVisible.value = true;
};

const handleSettingsSaved = () => {
  ElNotification({ title: 'Успех', message: 'Настройки сохранены', type: 'success' });
};

const handleSleepClick = (device) => {
  selectedDeviceForModal.value = device;
  sleepConfirmVisible.value = true;
};

const handleWakeClick = (device) => {
  selectedDeviceForModal.value = device;
  wakeConfirmVisible.value = true;
};

const confirmSleep = async () => {
  if (!selectedDeviceForModal.value) return;
  actionLoading.value = true;
  try {
    await deviceStore.forceSleep(selectedDeviceForModal.value.device_id);
    ElNotification({ title: 'Успех', message: 'Устройство переведено в сон', type: 'success' });
    sleepConfirmVisible.value = false;
  } catch (err) {
    ElNotification({ title: 'Ошибка', message: err.message, type: 'error' });
  } finally {
    actionLoading.value = false;
  }
};

const confirmWake = async () => {
  if (!selectedDeviceForModal.value) return;
  actionLoading.value = true;
  try {
    await deviceStore.wakeDevice(selectedDeviceForModal.value.device_id);
    ElNotification({ title: 'Успех', message: 'Устройство пробуждено', type: 'success' });
    wakeConfirmVisible.value = false;
  } catch (err) {
    ElNotification({ title: 'Ошибка', message: err.message, type: 'error' });
  } finally {
    actionLoading.value = false;
  }
};

onMounted(async () => {
  console.log('[Dashboard] Mounted');
  await settingsStore.init();
  interfaceStore.init();
  await deviceStore.fetchDevices();
  console.log('[Dashboard] Devices loaded:', deviceStore.devices.length);
});
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: #f5f7fa; }
.dashboard-top-bar { display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: #fff; border-bottom: 1px solid #e4e7ed; flex-shrink: 0; }
.device-filter { display: flex; align-items: center; }
.top-controls { display: flex; gap: 4px; }
.active { background-color: #409EFF; color: #fff; }
.dashboard-main { display: flex; flex: 1; overflow: hidden; position: relative; }
.dashboard-left { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.monitoring-compact { padding: 8px 15px; background: #fff; border-bottom: 1px solid #e4e7ed; flex-shrink: 0; }
.device-grid-container { flex: 1; overflow-y: auto; padding: 6px; }
.settings-panel { width: 0; transition: width 0.3s ease; overflow: hidden; background: #fff; border-left: 1px solid #e4e7ed; flex-shrink: 0; z-index: 999; }
.settings-panel.panel-open { width: 295px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 6px; border-bottom: 1px solid #e4e7ed; background: #f5f7fa; }
.panel-title { font-weight: 600; color: #303133; font-size: 14px; }
.panel-content { padding: 4px; }
.panel-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #909399; gap: 4px; }
.panel-empty .el-icon { font-size: 32px; }
.panel-empty p { margin: 0; font-size: 13px; }
.full-width { width: 100%; margin-top: 4px; }
.confirm-content { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; }
.confirm-icon { font-size: 40px; }
.confirm-icon.warning { color: #E6A23C; }
.confirm-icon.success { color: #67C23A; }
.confirm-content p { margin: 0; color: #606266; font-size: 14px; }
:deep(.el-descriptions__label) { font-size: 12px; width: 100px; }
:deep(.el-descriptions__content) { font-size: 12px; }
:deep(.el-button) { font-size: 12px; }
:deep(.el-radio-group) { font-size: 12px; }
</style>
