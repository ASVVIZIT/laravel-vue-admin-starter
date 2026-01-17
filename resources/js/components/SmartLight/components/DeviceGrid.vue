<template>
  <div class="device-grid">
    <el-skeleton v-if="loading" :rows="3" :count="8" animated />

    <div v-if="!loading && realDevices.length === 0 && fakeDevices.length === 0" class="no-devices">
      <el-empty description="Нет устройств" />
    </div>

    <el-tabs v-else class="device-tabs" type="border-card">
      <!-- Реальные устройства -->
      <el-tab-pane
          :label="`Реальные (${realDevices.length})`"
          :disabled="realDevices.length === 0"
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
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- Фейковые устройства -->
      <el-tab-pane
          :label="`Демонстрация (${fakeDevices.length})`"
          :disabled="fakeDevices.length === 0"
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

const store = useSmartLightStore();
const loading = ref(true);
const selectedDeviceId = computed(() => store.selectedDeviceId);

// Реальные устройства (is_fake = false)
const realDevices = computed(() => {
  return store.realDevices;
});

// Фейковые устройства (is_fake = true)
const fakeDevices = computed(() => {
  return store.fakeDevices;
});

// Селектор устройства
const selectDevice = (device) => {
  store.selectDevice(device.device_id);
};

// Загрузка устройств
const loadDevices = async () => {
  loading.value = true;
  try {
    await store.fetchDevices();
  } catch (error) {
    console.error('Ошибка загрузки устройств:', error);
  } finally {
    loading.value = false;
  }
};

// Обновление устройства
const refreshDevice = (deviceId) => {
  loadDevices();
};

// Обработка перевода в сон
const handleEmergencySleep = (deviceId) => {
  refreshDevice(deviceId);
};

// Открытие настроек устройства
const openDeviceSettings = (device) => {
  emit('open-settings', device);
};

onMounted(() => {
  loadDevices();
});

// Следим за изменениями в сторе
watch(() => store.devices, (newDevices, oldDevices) => {
  // Компонент будет автоматически обновляться через реактивность Pinia
});

// Следим за выбранным устройством
watch(() => store.selectedDevice, (newDevice, oldDevice) => {
  // Компонент будет автоматически обновляться через реактивность Pinia
});
</script>

<style scoped>
.device-grid {
  height: 100%;
  width:  device-grid;
}

.no-devices {
  padding: 1rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 2fr));
  grid-gap: 2rem 1.2rem;
  padding: 1rem 1rem 3rem 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 320px)
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
  margin-top: 0.1rem;
  font-weight: 500;
  color: #606266;
}

.banner-icon {
  width: 1rem;
  height: 1rem;
}
</style>
