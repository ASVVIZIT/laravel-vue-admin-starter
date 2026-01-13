<template>
  <div class="device-grid">
    <el-skeleton v-if="loading" :rows="3" :count="8" animated />

    <div v-if="!loading && devices.length === 0" class="no-devices">
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
                @command-sent="$emit('device-updated', device.device_id)"
                @emergency-sleep="$emit('emergency-sleep', device.device_id)"
                @open-settings="$emit('open-settings', device)"
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

        <div class="grid-scroll-container">
          <div v-if="fakeDevices.length === 0" class="no-devices">
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
                  @command-sent="$emit('device-updated', device.device_id)"
                  @emergency-sleep="$emit('emergency-sleep', device.device_id)"
                  @open-settings="$emit('open-settings', device)"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Warning } from '@element-plus/icons-vue';
import DeviceCard from './DeviceCard.vue';

const props = defineProps({
  devices: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['device-updated', 'emergency-sleep', 'open-settings', 'device-selected']);

// Реальные устройства (is_fake = false)
const realDevices = computed(() => {
  return props.devices.filter(device => !device.is_fake);
});

// Фейковые устройства (is_fake = true)
const fakeDevices = computed(() => {
  return props.devices.filter(device => device.is_fake);
});

// ID выбранного устройства
const selectedDeviceId = ref(null);

// Селектор устройства
const selectDevice = (device) => {
  selectedDeviceId.value = device.device_id;
  emit('device-selected', device);
};
</script>

<style scoped>
.device-grid {
  width: 100%;
  margin-top: 0.5rem;
}

.device-tabs {
  border: 1px solid #ebeef5;
  border-radius: 3px;
  overflow: hidden;
}

.grid-scroll-container {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  padding: 0.75rem;
  grid-auto-rows: minmax(280px, auto);
}

.device-col {
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  height: 280px;
  display: flex;
  flex-direction: column;
}

.device-col:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Выделение выбранного устройства */
.device-col--selected {
  box-shadow: 0 0 0 2px #409eff;
  transform: translateY(-1px);
}

.fake-devices-banner {
  background: #fff7e6;
  border: 1px solid #fffae6;
  border-radius: 3px;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  color: #e6a23c;
  font-size: 0.85rem;
}

.no-devices {
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

/* РАЗМЕРЫ ИКОНОК */
:deep(.banner-icon) {
  width: 1rem;
  height: 1rem;
  margin-right: 0.25rem;
}
</style>
