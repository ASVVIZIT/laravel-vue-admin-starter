<template>
  <div class="device-grid">
    <el-skeleton v-if="loading" :rows="3" :count="8" animated />

    <div v-if="!loading && realDevices.length === 0 && fakeDevices.length === 0" class="no-devices">
      <el-empty description="Нет устройств" />
    </div>

    <el-tabs
        v-else
        class="device-tabs"
        type="border-card"
        @tab-click="handleTabClick"
    >
      <!-- Реальные устройства -->
      <el-tab-pane
          :label="`Реальные (${realDevices.length})`"
          :disabled="realDevices.length === 0"
          name="real"
      >
        <div class="grid-container">
          <div
              v-for="device in realDevices"
              :key="device.device_id"
              class="device-col"
              :class="{ 'device-col--selected': selectedDeviceId === device.device_id }"
              @click="selectDevice(device)"
          >
            <DeviceCard
                :device="device"
                :is-selected="selectedDeviceId === device.device_id"
                @command-sent="refreshDevice"
                @emergency-sleep="handleEmergencySleep"
                @open-settings="openDeviceSettings"
                @init-3d="handleInit3D"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- Фейковые устройства -->
      <el-tab-pane
          :label="`Демонстрация (${fakeDevices.length})`"
          :disabled="fakeDevices.length === 0"
          name="fake"
      >
        <div class="fake-devices-banner">
          <Warning class="banner-icon" />
          <span>Тестовые устройства</span>
        </div>

        <div v-if="fakeDevices.length === 0 && !loading" class="no-devices">
          <el-empty description="Нет тестовых устройств" />
        </div>

        <div class="grid-container">
          <div
              v-for="device in fakeDevices"
              :key="device.device_id"
              class="device-col fake-device"
              :class="{ 'device-col--selected': selectedDeviceId === device.device_id }"
              @click="selectDevice(device)"
          >
            <DeviceCard
                :device="device"
                :is-selected="selectedDeviceId === device.device_id"
                @command-sent="refreshDevice"
                @emergency-sleep="handleEmergencySleep"
                @open-settings="openDeviceSettings"
                @init-3d="handleInit3D"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Warning } from '@element-plus/icons-vue';
import { useSmartLightStore } from '@/components/SmartLight/stores/smartLightStore.js';
import DeviceCard from '@/components/SmartLight/components/DeviceCard.vue';
import { logDebug } from '@/components/SmartLight/api/utils/webglSupport.js';

const emit = defineEmits(['device-selected', 'emergency-sleep', 'open-settings']);

const store = useSmartLightStore();
const loading = ref(true);
const selectedDeviceId = computed(() => store.selectedDeviceId);
const activeTab = ref('real');

logDebug('DeviceGrid', 'Компонент создан', {
  selectedDeviceId: store.selectedDeviceId
});

// Реальные устройства (is_fake = false)
const realDevices = computed(() => {
  const devices = store.realDevices;
  logDebug('DeviceGrid', 'Получение реальных устройств', {
    count: devices.length,
    devices
  });
  return devices;
});

// Фейковые устройства (is_fake = true)
const fakeDevices = computed(() => {
  const devices = store.fakeDevices;
  logDebug('DeviceGrid', 'Получение фейковых устройств', {
    count: devices.length,
    devices
  });
  return devices;
});

// Селектор устройства
const selectDevice = (device) => {
  logDebug('DeviceGrid', 'Выбор устройства', {
    deviceId: device.device_id,
    name: device.name
  });

  store.selectDevice(device.device_id);
  emit('device-selected', device);
};

// Загрузка устройств
const loadDevices = async () => {
  logDebug('DeviceGrid', 'Загрузка устройств');

  loading.value = true;
  try {
    await store.fetchDevices();
  } catch (error) {
    console.error('Ошибка загрузки устройств:', error);
  } finally {
    loading.value = false;
  }
};

// Обработка переключения табов
const handleTabClick = (tab) => {
  logDebug('DeviceGrid', 'Переключение таба', {
    label: tab.props.label,
    name: tab.props.name
  });

  activeTab.value = tab.props.name;

  // Если переключаемся на фейковые устройства, инициализируем 3D-рендеринг
  if (tab.props.name === 'fake') {
    logDebug('DeviceGrid', 'Активирован таб с фейковыми устройствами', {
      fakeDevicesCount: fakeDevices.value.length
    });

    // Принудительно инициализируем 3D для фейковых устройств
    setTimeout(() => {
      fakeDevices.value.forEach(device => {
        handleInit3D(device.device_id);
      });
    }, 300);
  }
};

// Обработчик инициализации 3D
const handleInit3D = (deviceId) => {
  logDebug('DeviceGrid', 'Принудительная инициализация 3D', { deviceId });

  // Ищем компонент DeviceCard
  const deviceCard = document.querySelector(`[data-device-id="${deviceId}"]`);
  if (deviceCard && deviceCard.forceInit) {
    logDebug('DeviceGrid', 'Вызов forceInit в DeviceCard', { deviceId });
    deviceCard.forceInit();
  } else {
    logDebug('DeviceGrid', 'DeviceCard не найден или forceInit недоступен', { deviceId });
  }
};

onMounted(() => {
  logDebug('DeviceGrid', 'Инициализация компонента');

  loadDevices();

  // Даем время для полной загрузки
  setTimeout(() => {
    // Добавляем обработчик переключения вкладок
    const tabContent = document.querySelector('.el-tabs__content');
    if (tabContent) {
      logDebug('DeviceGrid', 'Наблюдение за табами', { tabContent });

      const observer = new MutationObserver(() => {
        logDebug('DeviceGrid', 'Изменение табов обнаружено');
        // Даем время на переключение
        setTimeout(() => {
          // Если активирован таб с фейковыми устройствами
          if (document.querySelector('.el-tab-pane.is-active[data-name="fake"]')) {
            logDebug('DeviceGrid', 'Таб с фейковыми устройствами активирован');

            // Принудительно инициализируем 3D для фейковых устройств
            fakeDevices.value.forEach(device => {
              handleInit3D(device.device_id);
            });
          }
        }, 500);
      });

      observer.observe(tabContent, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
  }, 100);
});

// Следим за изменениями в сторе
watch(() => store.devices, (newDevices, oldDevices) => {
  logDebug('DeviceGrid', 'Изменение списка устройств', {
    oldCount: oldDevices ? oldDevices.length : 0,
    newCount: newDevices.length
  });
});

// Следим за выбранным устройством
watch(() => store.selectedDevice, (newDevice, oldDevice) => {
  logDebug('DeviceGrid', 'Изменение выбранного устройства', {
    oldDeviceId: oldDevice ? oldDevice.device_id : null,
    newDeviceId: newDevice ? newDevice.device_id : null
  });
});

// Обновление устройства
const refreshDevice = (deviceId) => {
  logDebug('DeviceGrid', 'Обновление устройства', { deviceId });
  loadDevices();
};

// Обработка перевода в сон
const handleEmergencySleep = (deviceId) => {
  logDebug('DeviceGrid', 'Обработка перевода в сон', { deviceId });
  refreshDevice(deviceId);
};

// Открытие настроек устройства
const openDeviceSettings = (device) => {
  logDebug('DeviceGrid', 'Открытие настроек устройства', {
    deviceId: device.device_id,
    name: device.name
  });
  emit('open-settings', device);
};
</script>

<style scoped>
.device-grid {
  height: 100%;
  width: 100%;
}

.no-devices {
  padding: 1rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 1rem;
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 250px);
}

.device-col {
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.device-col--selected {
  box-shadow:
      0 2px 6px rgba(0, 0, 0, 0.08),
      0 0 0 2px #409eff;
}

.fake-device {
  background: #f9fafb;
}

.fake-devices-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f5f7fa;
  border-radius: 4px;
  margin: 1rem;
  margin-top: 0;
  font-weight: 500;
  color: #606266;
}

.banner-icon {
  width: 1rem;
  height: 1rem;
}
</style>
