<template>
  <div class="device-grid">
    <div class="grid-container">
      <div
          v-for="device in devices"
          :key="device.device_id"
          class="grid-item"
          @click="handleDeviceSelect(device)"
      >
        <DeviceCard
            :device="device"
            :show-3d="show3d"
            :selected="selectedDeviceId === device.device_id"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElNotification } from 'element-plus';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';
import { useSmartlightStore } from '@/components/SmartLight/stores';
import DeviceCard from '@/components/SmartLight/components/DeviceCard.vue';

const props = defineProps({
  show3d: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['device-selected']);

// Инициализация
const store = useSmartlightStore();
const loading = ref(false);
const error = ref(null);

// Вычисляемые свойства
const devices = computed(() => {
  return store.deviceRealDevices.length > 0
      ? store.deviceRealDevices
      : store.deviceFakeDevices;
});

const selectedDeviceId = computed(() => store.device.selectedDeviceId);

// Обработчик выбора устройства
const handleDeviceSelect = (device) => {
  logDebug('DeviceGrid', 'Выбрано устройство', { deviceId: device.device_id });
  store.deviceSelectDevice(device.device_id);
  emit('device-selected', device);
};

// Инициализация при монтировании
onMounted(async () => {
  logDebug('DeviceGrid', 'Инициализация DeviceGrid');

  try {
    await store.deviceFetchDevices();

    // Выбираем первое устройство
    if (devices.value.length > 0) {
      handleDeviceSelect(devices.value[0]);
    }
  } catch (err) {
    logError('DeviceGrid', 'Ошибка загрузки устройств', err);
    error.value = 'Не удалось загрузить устройства';

    ElNotification({
      title: 'Ошибка',
      message: 'Не удалось загрузить устройства',
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
});

// Следим за изменением выбранного устройства
watch(() => store.device.selectedDeviceId, (newDeviceId) => {
  logDebug('DeviceGrid', 'Выбранное устройство изменилось', { newDeviceId });
});
</script>

<script>
export default {
  name: 'DeviceGrid'
};
</script>

<style scoped>
.device-grid {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 0.5rem;
  height: 100%;
  overflow-y: auto;
}

.grid-item {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 350px;
}

.grid-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
