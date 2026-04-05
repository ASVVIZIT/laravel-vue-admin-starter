<template>
  <div class="global-settings-view">
    <!-- Хедер -->
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

    <!-- Карточка с табами -->
    <el-card class="settings-card">
      <el-tabs v-model="activeTab" type="border-card">

        <!-- ТАБ: Питание -->
        <el-tab-pane label="Питание" name="power">
          <GlobalSettingsForm
              ref="formRef"
              :initial-settings="initialSettings"
              @saved="onFormSaved"
              @cancelled="onFormCancelled"
              @update:settings="onSettingsUpdate"
          />
        </el-tab-pane>

        <!-- ТАБ: Спящий режим -->
        <el-tab-pane label="Спящий режим" name="sleep">
          <GlobalSettingsForm
              ref="formRef"
              :initial-settings="initialSettings"
              @saved="onFormSaved"
              @cancelled="onFormCancelled"
              @update:settings="onSettingsUpdate"
          />
        </el-tab-pane>

        <!-- ТАБ: Типы устройств -->
        <el-tab-pane label="Типы устройств" name="types">
          <GlobalSettingsForm
              ref="formRef"
              :initial-settings="initialSettings"
              @saved="onFormSaved"
              @cancelled="onFormCancelled"
              @update:settings="onSettingsUpdate"
          />
        </el-tab-pane>

        <!-- ТАБ: Управление питанием -->
        <el-tab-pane label="Управление питанием" name="management">
          <GlobalSettingsForm
              ref="formRef"
              :initial-settings="initialSettings"
              @saved="onFormSaved"
              @cancelled="onFormCancelled"
              @update:settings="onSettingsUpdate"
          />
        </el-tab-pane>

        <!-- ТАБ: Информация (только чтение) -->
        <el-tab-pane label="Информация" name="info">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="Всего устройств">{{ deviceStore.devices.length }}</el-descriptions-item>
            <el-descriptions-item label="Реальные устройства">{{ deviceStore.realDevices.length }}</el-descriptions-item>
            <el-descriptions-item label="Фейковые устройства">{{ deviceStore.fakeDevices.length }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Setting, ArrowLeft, RefreshLeft, Check } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';

// ✅ Импорт модульных сторов
import { useDeviceStore, useSettingsStore } from '@/components/SmartLight/stores/index.js';
// ✅ Импорт формы-компонента
import GlobalSettingsForm from '@/components/SmartLight/components/settings/forms/GlobalSettingsForm.vue';

const router = useRouter();
const deviceStore = useDeviceStore();
const settingsStore = useSettingsStore();

const formRef = ref(null);
const activeTab = ref('power');
const loading = ref(false);

// ✅ Вычисляемые начальные настройки из стора
const initialSettings = computed(() => ({
  critical_voltage: settingsStore.globalSettings.critical_voltage || 3.2,
  sleep_interval: settingsStore.globalSettings.sleep_interval || 600,
  emergency_sleep_interval: settingsStore.globalSettings.emergency_sleep_interval || 3600,
  default_battery_type: settingsStore.globalSettings.default_battery_type || 'li-ion-18650',
  default_bulb_type: settingsStore.globalSettings.default_bulb_type || 'classic',
  default_power_supply: settingsStore.globalSettings.default_power_supply || 'standard',
  power_management_mode: settingsStore.globalSettings.power_management_mode || 'balanced',
  controller_runtime: settingsStore.globalSettings.controller_runtime || 86400,
  min_controller_voltage: settingsStore.globalSettings.min_controller_voltage || 2.8,
  power_supply_type: settingsStore.globalSettings.power_supply_type || 'battery'
}));

// ✅ Обработчики событий формы
const onFormSaved = (savedSettings) => {
  ElNotification({ title: 'Успех', message: 'Глобальные настройки сохранены', type: 'success' });
};

const onFormCancelled = (error) => {
  ElNotification({ title: 'Ошибка', message: error?.message || 'Не удалось сохранить', type: 'error' });
};

const onSettingsUpdate = (updatedSettings) => {
  // Опционально: можно обновлять стор в реальном времени
  // settingsStore.globalSettings = { ...settingsStore.globalSettings, ...updatedSettings };
};

// ✅ Кнопки хедера делегируют действия форме
const handleSave = async () => {
  if (formRef.value?.saveSettings) {
    loading.value = true;
    try {
      await formRef.value.saveSettings();
    } finally {
      loading.value = false;
    }
  }
};

const handleReset = async () => {
  if (formRef.value?.resetSettings) {
    loading.value = true;
    try {
      await formRef.value.resetSettings();
    } finally {
      loading.value = false;
    }
  }
};

const goBack = () => {
  router.push({ name: 'SmartLightDashboard' });
};

// ✅ Загрузка типов при монтировании
onMounted(() => {
  // typesStore загрузится автоматически внутри формы при необходимости
});
</script>

<style scoped>
.global-settings-view {
  padding: 12px;
  max-width: 1000px;
  margin: 0 auto;
  font-size: 11px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.header-left { flex: 1; }

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-description {
  font-size: 10px;
  color: #909399;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

:deep(.el-button) {
  font-size: 10px;
  padding: 6px 12px;
  height: 28px;
}

.settings-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-tabs__content) {
  padding: 4px;
}

:deep(.el-descriptions__label),
:deep(.el-descriptions__content) {
  font-size: 10px;
}
</style>
