<template>
  <div class="dashboard">
    <div class="dashboard-top-bar">
      <!-- Фильтр устройств (читает/пишет в store) -->
      <DeviceFilter />

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
        <div class="monitoring-compact"><PowerMonitoringCompact :current-filter="deviceStore.deviceFilter" /></div>
        <div class="device-grid-container">
          <!-- DeviceGrid читает filteredDevices напрямую из стора -->
          <DeviceGrid
              @device-selected="handleDeviceSelect"
              @open-settings="openDeviceSettings"
              @sleep-click="handleSleepClick"
              @wake-click="handleWakeClick"
              @power-click="handlePowerClick"
          />
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
            <el-descriptions-item label="В">{{ selectedDevice.voltage?.toFixed(2) }}В</el-descriptions-item>
            <el-descriptions-item label="%">{{ selectedDevice.intensity ?? 0 }}%</el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" @click="openDeviceSettings(selectedDevice)" class="full-width"><el-icon><Setting /></el-icon> Настройки устройства</el-button>
        </div>
        <div v-else class="panel-empty"><el-icon><InfoFilled /></el-icon><p>Выберите</p></div>
      </div>
    </div>

    <!-- Панель отладки -->
    <LayoutDebugWrapper :is-open="showDebug" :closable="true" @close="showDebug = false" class="debug-wrapper">
      <template #content>
        <DebugPanel @open-settings="openGlobalSettingsModal" />
      </template>
    </LayoutDebugWrapper>

    <!-- Модалки -->
    <DeviceSettingsModal v-model="deviceSettingsModalVisible" :device-id="selectedDeviceForModal?.device_id" @saved="handleSettingsSaved" />
    <GlobalSettingsModal v-model="globalSettingsModalVisible" @saved="onGlobalSettingsSaved" />

    <!-- ✅ Модалка "Сон" (ЕДИНСТВЕННАЯ) -->
    <el-dialog v-model="sleepConfirmVisible" title="Сон" width="320px" :close-on-click-modal="false">
      <div class="confirm-content"><el-icon class="confirm-icon warning"><WarningFilled /></el-icon><p>Перевести <strong>{{ selectedDeviceForModal?.name }}</strong> в сон?</p></div>
      <template #footer><el-button @click="sleepConfirmVisible = false" size="small">Отмена</el-button><el-button type="warning" @click="confirmSleep" :loading="actionLoading" size="small">В сон</el-button></template>
    </el-dialog>

    <!-- ✅ Модалка "Пробуждение" (ЕДИНСТВЕННАЯ) -->
    <el-dialog v-model="wakeConfirmVisible" title="Пробуждение" width="320px" :close-on-click-modal="false">
      <div class="confirm-content"><el-icon class="confirm-icon success"><CircleCheckFilled /></el-icon><p>Пробудить <strong>{{ selectedDeviceForModal?.name }}</strong>?</p></div>
      <template #footer><el-button @click="wakeConfirmVisible = false" size="small">Отмена</el-button><el-button type="success" @click="confirmWake" :loading="actionLoading" size="small">Пробудить</el-button></template>
    </el-dialog>

    <!-- ✅ Модалка "Питание" (ЕДИНСТВЕННАЯ) -->
    <el-dialog v-model="powerConfirmVisible" title="Питание" width="320px" :close-on-click-modal="false">
      <div class="confirm-content">
        <el-icon class="confirm-icon" :class="powerConfirmIconClass"><component :is="powerConfirmIcon" /></el-icon>
        <p>{{ powerConfirmMessage }}</p>
      </div>
      <template #footer>
        <el-button @click="powerConfirmVisible = false" size="small">Отмена</el-button>
        <el-button :type="powerConfirmType" @click="confirmPower" :loading="actionLoading" size="small">{{ powerConfirmButtonText }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElNotification, ElMessage } from 'element-plus';
import { Grid, Menu, Setting, Tools, Close, InfoFilled, WarningFilled, CircleCheckFilled, Switch, Lightning } from '@element-plus/icons-vue';
import { useTypesStore, useDeviceStore, useInterfaceStore, useSettingsStore } from '@/components/SmartLight/stores/index.js';

// ✅ Компонент фильтра (читает/пишет в store)
import DeviceFilter from '@components/SmartLight/components/devices/DeviceFilter.vue';
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

const deviceSettingsModalVisible = ref(false);
const globalSettingsModalVisible = ref(false);
const selectedDeviceForModal = ref(null);

// ✅ Модалки подтверждений (ЕДИНСТВЕННЫЕ)
const sleepConfirmVisible = ref(false);
const wakeConfirmVisible = ref(false);
const powerConfirmVisible = ref(false);
const powerConfirmData = ref(null); // { device, isOn }

const actionLoading = ref(false);
const settingsPanelVisible = ref(false);
const showDebug = ref(false);

const selectedDevice = computed(() => deviceStore.selectedDevice);

const statusTagType = computed(() => ({ 'ON': 'success', 'OFF': 'info', 'SLEEPING': 'warning', 'ERROR': 'danger' }[selectedDevice.value?.status] || 'info'));
const statusText = computed(() => ({ 'ON': 'Вкл', 'OFF': 'Выкл', 'SLEEPING': 'Сон', 'ERROR': 'Ошб' }[selectedDevice.value?.status] || '—'));

// ✅ Логирование
const logAction = (message, data = {}) => {
  interfaceStore.addLog?.({ level: 'info', component: 'Dashboard', message, data });
};

// === 3D Toggle ===
const toggleGlobal3DMode = () => {
  const newMode = !interfaceStore.global3DMode;
  logAction(`3D режим: ${newMode ? 'ВКЛ' : 'ВЫКЛ'}`, { action: 'toggle_3d', mode: newMode ? '3d' : '2d' });
  interfaceStore.toggleGlobal3DMode?.() || (interfaceStore.global3DMode = newMode);
  ElNotification({ title: 'Режим', message: `Переключено на ${newMode ? '3D' : '2D'}`, type: 'success', duration: 1500 });
};

// === Панели ===
const toggleSettingsPanel = () => {
  settingsPanelVisible.value = !settingsPanelVisible.value;
  logAction(`Панель настроек: ${settingsPanelVisible.value ? 'открыта' : 'закрыта'}`, { action: 'toggle_settings_panel', visible: settingsPanelVisible.value });
};

const toggleDebugPanel = () => {
  showDebug.value = !showDebug.value;
  logAction(`Панель отладки: ${showDebug.value ? 'открыта' : 'закрыта'}`, { action: 'toggle_debug_panel', visible: showDebug.value });
  interfaceStore.setDebugPanelVisible?.(showDebug.value);
};

// === Глобальные настройки ===
const openGlobalSettingsModal = () => {
  logAction('Открыты глобальные настройки', { action: 'open_global_settings_modal' });
  globalSettingsModalVisible.value = true;
};

const onGlobalSettingsSaved = () => {
  logAction('Глобальные настройки сохранены', { action: 'global_settings_saved' });
  globalSettingsModalVisible.value = false;
  ElNotification({ title: 'Успех', message: 'Настройки сохранены', type: 'success', duration: 1500 });
};

// === Выбор устройства ===
const handleDeviceSelect = (device) => {
  logAction(`Выбрано устройство: ${device.name}`, { deviceId: device.device_id, deviceName: device.name });
  deviceStore.selectDeviceStore(device.device_id);
};

// === Настройки устройства ===
const openDeviceSettings = (device) => {
  logAction('Открыты настройки устройства', { deviceId: device.device_id, action: 'open_device_settings' });
  selectedDeviceForModal.value = device;
  deviceSettingsModalVisible.value = true;
};

const handleSettingsSaved = () => {
  logAction('Настройки устройства сохранены', { action: 'device_settings_saved' });
  ElNotification({ title: 'Успех', message: 'Настройки сохранены', type: 'success', duration: 1500 });
};

// === ✅ ОБРАБОТЧИКИ ДЕЙСТВИЙ (единая точка для модалок) ===

// Питание
const handlePowerClick = (device) => {
  const isOn = device.status === 'ON';
  powerConfirmData.value = { device, isOn };
  powerConfirmVisible.value = true;
  logAction('Запрос изменения питания', { deviceId: device.device_id, action: 'request_power', isOn });
};

const powerConfirmMessage = computed(() => {
  const data = powerConfirmData.value;
  if (!data) return '';
  return `Вы действительно хотите ${data.isOn ? 'выключить' : 'включить'} "${data.device.name}"?`;
});

const powerConfirmType = computed(() => powerConfirmData.value?.isOn ? 'warning' : 'success');
const powerConfirmButtonText = computed(() => powerConfirmData.value?.isOn ? 'Выключить' : 'Включить');
const powerConfirmIcon = computed(() => powerConfirmData.value?.isOn ? Lightning : Switch);
const powerConfirmIconClass = computed(() => powerConfirmData.value?.isOn ? 'warning' : 'success');

const confirmPower = async () => {
  const data = powerConfirmData.value;
  if (!data) return;

  actionLoading.value = true;
  try {
    const newStatus = data.isOn ? 'OFF' : 'ON';
    await deviceStore.updateDeviceStatusStore(data.device.device_id, newStatus);
    logAction('Питание изменено', { deviceId: data.device.device_id, action: 'power_confirmed', newStatus });
    ElMessage.success(`Питание: ${data.isOn ? 'выключено' : 'включено'}`);
    powerConfirmVisible.value = false;
  } catch (err) {
    logAction(`Ошибка питания: ${err.message}`, { level: 'error', deviceId: data.device?.device_id });
    ElMessage.error(err.message || 'Не удалось изменить статус');
  } finally {
    actionLoading.value = false;
  }
};

// Сон
const handleSleepClick = (device) => {
  selectedDeviceForModal.value = device;
  sleepConfirmVisible.value = true;
  logAction('Запрос перевода в сон', { deviceId: device.device_id, action: 'request_sleep' });
};

const confirmSleep = async () => {
  if (!selectedDeviceForModal.value) return;
  actionLoading.value = true;
  try {
    await deviceStore.forceSleepStore(selectedDeviceForModal.value.device_id);
    logAction('Устройство переведено в сон', { deviceId: selectedDeviceForModal.value.device_id, action: 'sleep_confirmed' });
    ElNotification({ title: 'Успех', message: 'Устройство в сон', type: 'success', duration: 1500 });
    sleepConfirmVisible.value = false;
  } catch (err) {
    logAction(`Ошибка перевода в сон: ${err.message}`, { level: 'error', deviceId: selectedDeviceForModal.value?.device_id });
    ElMessage.error(err.message || 'Не удалось перевести в сон');
  } finally {
    actionLoading.value = false;
  }
};

// Пробуждение
const handleWakeClick = (device) => {
  selectedDeviceForModal.value = device;
  wakeConfirmVisible.value = true;
  logAction('Запрос пробуждения', { deviceId: device.device_id, action: 'request_wake' });
};

const confirmWake = async () => {
  if (!selectedDeviceForModal.value) return;
  actionLoading.value = true;
  try {
    await deviceStore.wakeDeviceStore(selectedDeviceForModal.value.device_id);
    logAction('Устройство пробуждено', { deviceId: selectedDeviceForModal.value.device_id, action: 'wake_confirmed' });
    ElNotification({ title: 'Успех', message: 'Устройство пробуждено', type: 'success', duration: 1500 });
    wakeConfirmVisible.value = false;
  } catch (err) {
    logAction(`Ошибка пробуждения: ${err.message}`, { level: 'error', deviceId: selectedDeviceForModal.value?.device_id });
    ElMessage.error(err.message || 'Не удалось пробудить');
  } finally {
    actionLoading.value = false;
  }
};

// === Инициализация ===
onMounted(async () => {
  logAction('Dashboard загружен', { action: 'mounted', devicesCount: deviceStore.devices.length });
  if (!typesStore.typesLoaded.value) await typesStore.fetchTypesStore();
  await settingsStore.initSettingsStore();
  interfaceStore.initInterfaceStore();
  await deviceStore.fetchDevicesStore();
});
</script>

<style scoped>
/* === ГЛОБАЛЬНЫЕ ОТСТУПЫ — КОМПАКТНЫЙ РЕЖИМ === */
* { box-sizing: border-box; }

.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #f5f7fa;
  font-size: 11px;
}

/* === TOP BAR === */
.dashboard-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 4px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  gap: 4px;
}

.top-controls {
  display: flex;
  gap: 2px;
}

.active {
  background-color: #409EFF;
  color: #fff;
}

/* === MAIN LAYOUT === */
.dashboard-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.dashboard-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 150px);
}

/* === MONITORING === */
.monitoring-compact {
  padding: 2px 4px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

/* === DEVICE GRID === */
.device-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 1px;
}

/* === SETTINGS PANEL === */
.settings-panel {
  position: fixed;
  top: 160px;
  right: -260px;
  width: 260px;
  height: calc(100vh - 170px);
  background: #fff;
  border-left: 1px solid #e4e7ed;
  transition: right 0.25s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.settings-panel.panel-open {
  right: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 4px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.panel-title {
  font-weight: 600;
  color: #303133;
  font-size: 12px;
}

.panel-content {
  padding: 2px 4px;
}

.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  gap: 2px;
  font-size: 11px;
}

.panel-empty .el-icon {
  font-size: 24px;
}

.panel-empty p {
  margin: 0;
}

.full-width {
  width: 100%;
  margin-top: 2px;
}

/* === CONFIRM DIALOGS === */
.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  font-size: 12px;
}

.confirm-icon {
  font-size: 32px;
}

.confirm-icon.warning { color: #E6A23C; }
.confirm-icon.success { color: #67C23A; }

.confirm-content p {
  margin: 0;
  color: #606266;
}

/* === ELEMENT PLUS OVERRIDES — КОМПАКТ === */
:deep(.el-button) {
  font-size: 11px;
  padding: 4px 8px;
  height: 24px;
}

:deep(.el-radio-group) {
  font-size: 11px;
}

:deep(.el-radio-button__inner) {
  padding: 4px 8px;
}

:deep(.el-descriptions__label) {
  font-size: 10px;
  width: 60px;
  padding: 2px 4px;
}

:deep(.el-descriptions__content) {
  font-size: 10px;
  padding: 2px 4px;
}

:deep(.el-descriptions__body) {
  padding: 2px 0;
}

:deep(.el-tag--small) {
  padding: 0 4px;
  font-size: 9px;
}

:deep(.el-dialog__header) {
  padding: 8px 12px;
}

:deep(.el-dialog__body) {
  padding: 8px 12px;
  font-size: 12px;
}

:deep(.el-dialog__footer) {
  padding: 4px 12px 8px;
}

/* === DEBUG WRAPPER === */
.debug-wrapper {
  z-index: 999;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .dashboard-top-bar {
    padding: 2px 3px;
    flex-wrap: wrap;
  }
  .settings-panel {
    width: 220px;
    right: -220px;
  }
  :deep(.el-descriptions__label) {
    width: 50px;
  }
}

@media (max-width: 480px) {
  .dashboard {
    font-size: 10px;
  }
  .settings-panel {
    width: 100%;
    right: -100%;
  }
  :deep(.el-button) {
    font-size: 10px;
    padding: 3px 6px;
    height: 22px;
  }
}
</style>
