<template>
  <div class="device-settings-page">
    <div class="page-header">
      <h1 class="page-title">Настройки устройства</h1>
      <el-button @click="goBack" size="small">
        <el-icon><ArrowLeft /></el-icon> Назад
      </el-button>
    </div>

    <div class="page-content">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span class="device-name">{{ device?.name || 'Загрузка...' }}</span>
            <el-tag :type="statusTagType" size="small">{{ statusText }}</el-tag>
          </div>
        </template>

        <DeviceSettingsForm
            v-if="device"
            :device="device"
            @saved="handleSaved"
            @cancelled="goBack"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import { useDeviceStore } from '@/components/SmartLight/stores/index.js';
import DeviceSettingsForm from '@/components/SmartLight/components/settings/DeviceSettingsForm.vue';

const router = useRouter();
const route = useRoute();
const deviceStore = useDeviceStore();

const device = ref(null);
const deviceId = computed(() => route.params.deviceId);

const statusTagType = computed(() => {
  if (!device.value) return 'info';
  const map = { 'ON': 'success', 'OFF': 'info', 'SLEEPING': 'warning', 'ERROR': 'danger' };
  return map[device.value.status] || 'info';
});

const statusText = computed(() => {
  if (!device.value) return 'Загрузка...';
  const map = { 'ON': 'Включено', 'OFF': 'Выключено', 'SLEEPING': 'Сон', 'ERROR': 'Ошибка' };
  return map[device.value.status] || 'N/A';
});

const loadDevice = async () => {
  if (!deviceId.value) return;
  await deviceStore.fetchDevices();
  device.value = deviceStore.getDevice(deviceId.value);
  if (!device.value) {
    ElNotification({ title: 'Ошибка', message: 'Устройство не найдено', type: 'error' });
    goBack();
  }
};

const handleSaved = () => {
  ElNotification({ title: 'Успех', message: 'Настройки сохранены', type: 'success' });
};

const goBack = () => {
  router.push({ name: 'SmartLightDashboard' });
};

onMounted(() => { loadDevice(); });
</script>

<style scoped>
.device-settings-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}
.page-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.settings-card {
  border: none;
  box-shadow: none;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.device-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>
