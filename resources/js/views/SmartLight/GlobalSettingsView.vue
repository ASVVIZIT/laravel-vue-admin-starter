<template>
  <div class="global-settings-view">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><Setting /></el-icon>
          Глобальные настройки
        </h1>
        <p class="page-description">Настройки системы по умолчанию для всех устройств</p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack" size="small">
          <el-icon><ArrowLeft /></el-icon> Назад
        </el-button>
        <el-button @click="handleReset" :loading="loading">
          <el-icon><RefreshLeft /></el-icon> Сбросить
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">
          <el-icon><Check /></el-icon> Сохранить
        </el-button>
      </div>
    </div>

    <el-card class="settings-card">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="Питание" name="power">
          <el-form :model="settings" label-width="220px">
            <el-form-item label="Крит. напряжение (В)">
              <el-input-number v-model="settings.critical_voltage" :min="2.5" :max="4.3" :step="0.1" :precision="2" />
              <div class="form-tip">Минимальное напряжение для отключения устройства</div>
            </el-form-item>
            <el-form-item label="Мин. напряжение контроллера (В)">
              <el-input-number v-model="settings.min_controller_voltage" :min="2.5" :max="3.5" :step="0.1" :precision="2" />
              <div class="form-tip">Порог предупреждения контроллера</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Спящий режим" name="sleep">
          <el-form :model="settings" label-width="220px">
            <el-form-item label="Интервал сна (сек)">
              <el-input-number v-model="settings.sleep_interval" :min="60" :max="86400" :step="60" />
              <div class="form-tip">Через сколько секунд уходить в сон при бездействии</div>
            </el-form-item>
            <el-form-item label="Аварийный интервал (сек)">
              <el-input-number v-model="settings.emergency_sleep_interval" :min="300" :max="86400" :step="300" />
              <div class="form-tip">Сон при критическом разряде батареи</div>
            </el-form-item>
            <el-form-item label="Время работы контроллера (сек)">
              <el-input-number v-model="settings.controller_runtime" :min="3600" :max="604800" :step="3600" />
              <div class="form-tip">Максимальное время работы без перехода в сон</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Типы устройств" name="types">
          <el-form :model="settings" label-width="220px">
            <el-form-item label="Тип батареи по умолчанию">
              <el-select v-model="settings.default_battery_type" placeholder="Выберите тип" style="width: 100%">
                <el-option v-for="type in store.batteryTypesForDropdown" :key="type.id" :label="type.label" :value="type.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="Тип лампы по умолчанию">
              <el-select v-model="settings.default_bulb_type" placeholder="Выберите тип" style="width: 100%">
                <el-option v-for="type in store.bulbTypesForDropdown" :key="type.id" :label="type.label" :value="type.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="Источник питания по умолчанию">
              <el-select v-model="settings.default_power_supply" placeholder="Выберите тип" style="width: 100%">
                <el-option v-for="type in store.powerSuppliesForDropdown" :key="type.id" :label="type.label" :value="type.id" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Управление питанием" name="management">
          <el-form :model="settings" label-width="220px">
            <el-form-item label="Режим управления питанием">
              <el-select v-model="settings.power_management_mode" placeholder="Выберите режим" style="width: 100%">
                <el-option label="Экономный (conservative)" value="conservative" />
                <el-option label="Сбалансированный (balanced)" value="balanced" />
                <el-option label="Производительный (aggressive)" value="aggressive" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Информация" name="info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Всего устройств">{{ store.devices.length }}</el-descriptions-item>
            <el-descriptions-item label="Реальные устройства">{{ store.realDevices.length }}</el-descriptions-item>
            <el-descriptions-item label="Фейковые устройства">{{ store.fakeDevices.length }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Setting, ArrowLeft, RefreshLeft, Check } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import { useSmartlightStore } from '@/components/SmartLight/stores/index.js';

const router = useRouter();
const store = useSmartlightStore();

const activeTab = ref('power');
const loading = ref(false);

const settings = ref({
  critical_voltage: 3.2,
  sleep_interval: 600,
  emergency_sleep_interval: 3600,
  default_battery_type: 'li-ion-18650',
  default_bulb_type: 'classic',
  default_power_supply: 'standard',
  power_management_mode: 'balanced',
  controller_runtime: 86400,
  min_controller_voltage: 2.8
});

const loadSettings = () => {
  settings.value = {
    critical_voltage: store.globalSettings.critical_voltage || 3.2,
    sleep_interval: store.globalSettings.sleep_interval || 600,
    emergency_sleep_interval: store.globalSettings.emergency_sleep_interval || 3600,
    default_battery_type: store.globalSettings.default_battery_type || 'li-ion-18650',
    default_bulb_type: store.globalSettings.default_bulb_type || 'classic',
    default_power_supply: store.globalSettings.default_power_supply || 'standard',
    power_management_mode: store.globalSettings.power_management_mode || 'balanced',
    controller_runtime: store.globalSettings.controller_runtime || 86400,
    min_controller_voltage: store.globalSettings.min_controller_voltage || 2.8
  };
};

const handleSave = async () => {
  loading.value = true;
  try {
    const response = await store.settingsUpdateGlobalSettings(settings.value);
    if (response.success) {
      ElNotification({ title: 'Успех', message: 'Глобальные настройки сохранены', type: 'success' });
    }
  } catch (error) {
    ElNotification({ title: 'Ошибка', message: error.message, type: 'error' });
  } finally {
    loading.value = false;
  }
};

const handleReset = async () => {
  loading.value = true;
  try {
    const response = await store.settingsResetGlobalSettings();
    if (response.success) {
      loadSettings();
      ElNotification({ title: 'Успех', message: 'Настройки сброшены', type: 'success' });
    }
  } catch (error) {
    ElNotification({ title: 'Ошибка', message: error.message, type: 'error' });
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push({ name: 'SmartLightDashboard' });
};

onMounted(() => { loadSettings(); });
</script>

<style scoped>
.global-settings-view { padding: 20px; max-width: 1000px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 20px; }
.header-left { flex: 1; }
.page-title { font-size: 22px; font-weight: 600; color: #303133; margin: 0 0 8px 0; display: flex; align-items: center; gap: 10px; }
.page-description { font-size: 13px; color: #909399; margin: 0; }
.header-actions { display: flex; gap: 8px; flex-shrink: 0; }
.settings-card { border: none; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); }
:deep(.el-tabs__content) { padding: 20px; }
:deep(.el-form-item) { margin-bottom: 20px; }
:deep(.el-input-number) { width: 100%; }
.form-tip { font-size: 12px; color: #909399; margin-top: 6px; }
</style>
