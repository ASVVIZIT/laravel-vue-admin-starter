<template>
  <div class="dashboard">
    <!-- Панель отладки -->
    <debug-panel v-if="interfaceDebugPanelVisible" />

    <!-- Глобальные настройки -->
    <settings-panel v-if="interfaceGlobalSettingsVisible" />

    <!-- Переключатель режима отображения -->
    <div class="display-mode-toggle">
      <el-button
          type="primary"
          :class="{ active: interfaceGlobal3DMode }"
          @click="toggle3DMode"
      >
        <i :class="interfaceGlobal3DMode ? 'el-icon-s-grid' : 'el-icon-s-unfold'"></i>
        {{ interfaceGlobal3DMode ? '3D' : '2D' }} режим
      </el-button>
    </div>

    <!-- Фильтрация устройств -->
    <div class="device-filter">
      <el-radio-group v-model="deviceFilter">
        <el-radio-button label="all">Все</el-radio-button>
        <el-radio-button label="real">Реальные</el-radio-button>
        <el-radio-button label="fake">Фейковые</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Отображение устройств -->
    <device-grid
        :devices="filteredDevices"
        :is-3d-mode="interfaceGlobal3DMode"
    />

    <!-- Показатели питания -->
    <power-monitoring />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useSmartlightStore } from '@/components/SmartLight/stores';
import DebugPanel from '@/views/SmartLight/DebugPanel.vue';
import SettingsPanel from '@/views/SmartLight/GlobalSettingsPanel.vue';
import DeviceGrid from '@/components/SmartLight/components/DeviceGrid.vue';
import PowerMonitoring from '@/components/SmartLight/components/PowerMonitoring.vue';
import { getDevice } from '@/components/SmartLight/utils/deviceUtils';

const store = useSmartlightStore();
const deviceFilter = ref('all');

// Вычисляемые свойства для интерфейса
const interfaceDebugPanelVisible = computed(() => store.interfaceDebugPanelVisible);
const interfaceGlobal3DMode = computed(() => store.interfaceSettings.global3DMode);
const interfaceGlobalSettingsVisible = computed(() => store.interfaceGlobalSettingsVisible);

// Вычисляемое свойство для отфильтрованных устройств
const filteredDevices = computed(() => {
  if (deviceFilter.value === 'real') {
    return store.deviceRealDevices;
  }

  if (deviceFilter.value === 'fake') {
    return store.deviceFakeDevices;
  }

  return store.deviceRealDevices.concat(store.deviceFakeDevices);
});

// Обработчик переключения 3D-режима
const toggle3DMode = () => {
  store.interfaceSetGlobal3DMode(!interfaceGlobal3DMode.value);
};

// Обработчик выбора устройства
const handleDeviceSelect = (deviceId) => {
  store.deviceSelectDevice(deviceId);
};

// Обработчик обновления устройств
const refreshDevices = async () => {
  await store.deviceFetchDevices();
};

// Инициализация сторов
onMounted(async () => {
  store.deviceInit();
  store.interfaceInit();
  store.typesInit();

  // Загружаем устройства
  await refreshDevices();

  // Настраиваем обработчик выбора устройства
  watch(
      () => store.deviceSelectedDevice,
      (newDevice) => {
        if (newDevice) {
          console.log('Выбрано устройство:', newDevice.name);
        }
      }
  );
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
  position: relative;
}

.display-mode-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.device-filter {
  margin-bottom: 20px;
  text-align: center;
}

.active {
  background-color: #409EFF;
  color: #fff;
}
</style>
