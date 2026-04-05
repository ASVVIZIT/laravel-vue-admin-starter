<template>
  <div class="dashboard">
    <div class="dashboard-top-bar">
      <div class="device-filter">
        <el-radio-group :model-value="deviceFilter" @update:model-value="deviceFilter = $event" size="small">
          <el-radio-button label="all">Все</el-radio-button>
          <el-radio-button label="real">Реальные</el-radio-button>
          <el-radio-button label="fake">Фейковые</el-radio-button>
        </el-radio-group>
      </div>
      <div class="top-controls">
        <el-button type="primary" :class="{ active: interfaceStore.global3DMode }" @click="toggleGlobal3DMode" size="small">
          <el-icon><Grid v-if="interfaceStore.global3DMode" /><Menu v-else /></el-icon>
          {{ interfaceStore.global3DMode ? '3D' : '2D' }}
        </el-button>
        <el-button type="info" @click="toggleSettingsPanel" size="small"><el-icon><Setting /></el-icon> Настройки</el-button>
        <el-button type="warning" @click="toggleDebugPanel" size="small"><el-icon><Tools /></el-icon> Отладка</el-button>
      </div>
    </div>

    <div class="dashboard-main">
      <div class="dashboard-left">
        <div class="monitoring-compact"><PowerMonitoringCompact :current-filter="deviceFilter" /></div>
        <div class="device-grid-container">
          <DeviceGrid :devices="filteredDevices" @device-selected="handleDeviceSelect" @open-settings="openDeviceSettings" @sleep-click="handleSleepClick" @wake-click="handleWakeClick" />
        </div>
      </div>

      <div class="settings-panel" :class="{ 'panel-open': settingsPanelVisible }">
        <div class="panel-header">
          <span class="panel-title">Настройки</span>
          <el-button type="text" @click="toggleSettingsPanel" size="small"><el-icon><Close /></el-icon></el-button>
        </div>
        <div v-if="selectedDevice" class="panel-content">
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="ID">{{ selectedDevice.device_id }}</el-descriptions-item>
            <el-descriptions-item label="Имя">{{ selectedDevice.name }}</el-descriptions-item>
            <el-descriptions-item label="Статус"><el-tag :type="statusTagType" size="small">{{ statusText }}</el-tag></el-descriptions-item>
            <el-descriptions-item label="Напряжение">{{ selectedDevice.voltage?.toFixed(2) }} В</el-descriptions-item>
            <el-descriptions-item label="Интенсивность">{{ selectedDevice.intensity ?? 0 }}%</el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" @click="openDeviceSettings(selectedDevice)" class="full-width"><el-icon><Setting /></el-icon> Настроить устройство</el-button>
        </div>
        <div v-else class="panel-empty"><el-icon><InfoFilled /></el-icon><p>Выберите устройство</p></div>
      </div>
    </div>

    <!-- Панель отладки через враппер -->
    <LayoutDebugWrapper :is-open="showDebug" :closable="true" @close="showDebug = false" class="debug-wrapper">
      <template #content>
        <!-- эмит open-settings ловится Dashboard и открывает модалку -->
        <DebugPanel @open-settings="openGlobalSettingsModal" />
      </template>
    </LayoutDebugWrapper>

    <!-- Модалки -->
    <DeviceSettingsModal v-model="deviceSettingsModalVisible" :device-id="selectedDeviceForModal?.device_id" @saved="handleSettingsSaved" />
    <GlobalSettingsModal v-model="globalSettingsModalVisible" @saved="onGlobalSettingsSaved" />

    <el-dialog v-model="sleepConfirmVisible" title="Перевод в сон" width="350px" :close-on-click-modal="false">
      <div class="confirm-content"><el-icon class="confirm-icon warning"><WarningFilled /></el-icon><p>Перевести <strong>{{ selectedDeviceForModal?.name }}</strong> в спящий режим?</p></div>
      <template #footer><el-button @click="sleepConfirmVisible = false">Отмена</el-button><el-button type="warning" @click="confirmSleep" :loading="actionLoading">Перевести в сон</el-button></template>
    </el-dialog>

    <el-dialog v-model="wakeConfirmVisible" title="Пробуждение" width="350px" :close-on-click-modal="false">
      <div class="confirm-content"><el-icon class="confirm-icon success"><CircleCheckFilled /></el-icon><p>Пробудить <strong>{{ selectedDeviceForModal?.name }}</strong>?</p></div>
      <template #footer><el-button @click="wakeConfirmVisible = false">Отмена</el-button><el-button type="success" @click="confirmWake" :loading="actionLoading">Пробудить</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import { Grid, Menu, Setting, Tools, Close, InfoFilled, WarningFilled, CircleCheckFilled } from '@element-plus/icons-vue';
import { useTypesStore, useDeviceStore, useInterfaceStore, useSettingsStore } from '@/components/SmartLight/stores/index.js';

import PowerMonitoringCompact from '@components/SmartLight/components/monitoring/PowerMonitoringCompact.vue';
import DeviceGrid from '@components/SmartLight/components/devices/DeviceGrid.vue';
import DeviceSettingsModal from '@components/SmartLight/components/settings/modals/DeviceSettingsModal.vue';
import GlobalSettingsModal from '@components/SmartLight/components/settings/modals/GlobalSettingsModal.vue';
import DebugPanel from '@components/SmartLight/components/layout/panels/DebugPanel.vue';
import LayoutDebugWrapper from '@components/SmartLight/components/layout/wrappers/LayoutDebugWrapper.vue';

const typesStore = useTypesStore();
const deviceStore = useDeviceStore();
const interfaceStore = useInterfaceStore();
const settingsStore = useSettingsStore();

const deviceFilter = ref('all');
const deviceSettingsModalVisible = ref(false);
const globalSettingsModalVisible = ref(false); // ✅ Для модалки
const selectedDeviceForModal = ref(null);
const sleepConfirmVisible = ref(false);
const wakeConfirmVisible = ref(false);
const actionLoading = ref(false);
const settingsPanelVisible = ref(false);
const showDebug = ref(false);

const selectedDevice = computed(() => deviceStore.selectedDevice);
const filteredDevices = computed(() => {
  if (deviceFilter.value === 'real') return deviceStore.realDevices || [];
  if (deviceFilter.value === 'fake') return deviceStore.fakeDevices || [];
  return deviceStore.devices || [];
});
const statusTagType = computed(() => ({ 'ON': 'success', 'OFF': 'info', 'SLEEPING': 'warning', 'ERROR': 'danger' }[selectedDevice.value?.status] || 'info'));
const statusText = computed(() => ({ 'ON': 'Включено', 'OFF': 'Выключено', 'SLEEPING': 'Спит', 'ERROR': 'Ошибка' }[selectedDevice.value?.status] || 'N/A'));

// ✅ ЛОГИРОВАНИЕ ДЕЙСТВИЙ
const logAction = (message,  {}) => {
  interfaceStore.addLog?.({ level: 'info', component: 'Dashboard', message,  });
};

const toggleGlobal3DMode = () => {
  const newMode = !interfaceStore.global3DMode;
  logAction(`3D режим: ${newMode ? 'ВКЛ' : 'ВЫКЛ'}`, { action: 'toggle_3d', mode: newMode ? '3d' : '2d' });
  interfaceStore.toggleGlobal3DMode?.() || (interfaceStore.global3DMode = newMode);
  ElNotification({ title: 'Режим изменен', message: `Переключено на ${newMode ? '3D' : '2D'}`, type: 'success', duration: 2000 });
};

const toggleSettingsPanel = () => {
  settingsPanelVisible.value = !settingsPanelVisible.value;
  logAction(`Панель настроек: ${settingsPanelVisible.value ? 'открыта' : 'закрыта'}`, { action: 'toggle_settings_panel', visible: settingsPanelVisible.value });
};

const toggleDebugPanel = () => {
  showDebug.value = !showDebug.value;
  logAction(`Панель отладки: ${showDebug.value ? 'открыта' : 'закрыта'}`, { action: 'toggle_debug_panel', visible: showDebug.value });
  interfaceStore.setDebugPanelVisible?.(showDebug.value);
};

// ✅ ФИКС: открывает модалку глобальных настроек
const openGlobalSettingsModal = () => {
  logAction('Открыты глобальные настройки (модалка)', { action: 'open_global_settings_modal' });
  globalSettingsModalVisible.value = true;
};

const onGlobalSettingsSaved = () => {
  logAction('Глобальные настройки сохранены', { action: 'global_settings_saved' });
  globalSettingsModalVisible.value = false;
  ElNotification({ title: 'Успех', message: 'Глобальные настройки сохранены', type: 'success' });
};

const handleDeviceSelect = (device) => {
  logAction(`Выбрано устройство: ${device.name}`, { deviceId: device.device_id, deviceName: device.name, intensity: device.intensity });
  deviceStore.selectDeviceStore(device.device_id);
};

const openDeviceSettings = (device) => {
  logAction('Открыты настройки устройства', { deviceId: device.device_id, action: 'open_device_settings' });
  selectedDeviceForModal.value = device;
  deviceSettingsModalVisible.value = true;
};

const handleSettingsSaved = () => {
  logAction('Настройки устройства сохранены', { action: 'device_settings_saved' });
  ElNotification({ title: 'Успех', message: 'Настройки сохранены', type: 'success' });
};

const handleSleepClick = (device) => {
  logAction('Запрос перевода в сон', { deviceId: device.device_id, action: 'request_sleep' });
  selectedDeviceForModal.value = device;
  sleepConfirmVisible.value = true;
};

const handleWakeClick = (device) => {
  logAction('Запрос пробуждения', { deviceId: device.device_id, action: 'request_wake' });
  selectedDeviceForModal.value = device;
  wakeConfirmVisible.value = true;
};

const confirmSleep = async () => {
  if (!selectedDeviceForModal.value) return;
  actionLoading.value = true;
  try {
    await deviceStore.forceSleepStore(selectedDeviceForModal.value.device_id);
    logAction('Устройство переведено в сон', { deviceId: selectedDeviceForModal.value.device_id, action: 'sleep_confirmed' });
    ElNotification({ title: 'Успех', message: 'Устройство переведено в сон', type: 'success' });
    sleepConfirmVisible.value = false;
  } catch (err) {
    logAction(`Ошибка перевода в сон: ${err.message}`, { level: 'error', deviceId: selectedDeviceForModal.value?.device_id });
    ElNotification({ title: 'Ошибка', message: err.message, type: 'error' });
  } finally { actionLoading.value = false; }
};

const confirmWake = async () => {
  if (!selectedDeviceForModal.value) return;
  actionLoading.value = true;
  try {
    await deviceStore.wakeDeviceStore(selectedDeviceForModal.value.device_id);
    logAction('Устройство пробуждено', { deviceId: selectedDeviceForModal.value.device_id, action: 'wake_confirmed' });
    ElNotification({ title: 'Успех', message: 'Устройство пробуждено', type: 'success' });
    wakeConfirmVisible.value = false;
  } catch (err) {
    logAction(`Ошибка пробуждения: ${err.message}`, { level: 'error', deviceId: selectedDeviceForModal.value?.device_id });
    ElNotification({ title: 'Ошибка', message: err.message, type: 'error' });
  } finally { actionLoading.value = false; }
};

onMounted(async () => {
  logAction('Dashboard загружен', { action: 'mounted', devicesCount: deviceStore.devices.length });
  if (!typesStore.typesLoaded.value) {
    await typesStore.fetchTypesStore();
  }
  await settingsStore.initSettingsStore();
  interfaceStore.initInterfaceStore();
  await deviceStore.fetchDevicesStore();
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
.settings-panel { position: fixed; top: 130px; right: -295px; width: 295px; height: calc(100vh - 140px); background: #fff; border-left: 1px solid #e4e7ed; transition: right 0.3s ease; z-index: 1000; display: flex; flex-direction: column; }
.settings-panel.panel-open { right: 0; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 6px; border-bottom: 1px solid #e4e7ed; background: #f5f7fa; }
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
