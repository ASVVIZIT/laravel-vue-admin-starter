<template>
  <el-dialog v-model="visible" title="Глобальные настройки" width="600px" :close-on-click-modal="false">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка настроек...</span>
    </div>

    <el-form v-else :model="settings" label-width="180px" size="small">
      <!-- Напряжение -->
      <el-form-item label="Крит. напряжение (В)">
        <el-input-number
            v-model="settings.critical_voltage"
            :min="2.5"
            :max="4.3"
            :step="0.1"
            :precision="2"
        />
      </el-form-item>

      <!-- Интервал сна -->
      <el-form-item label="Интервал сна (сек)">
        <el-input-number
            v-model="settings.sleep_interval"
            :min="60"
            :max="86400"
            :step="60"
        />
      </el-form-item>

      <!-- Аварийный интервал -->
      <el-form-item label="Аварийный интервал (сек)">
        <el-input-number
            v-model="settings.emergency_sleep_interval"
            :min="300"
            :max="86400"
            :step="300"
        />
      </el-form-item>

      <!-- Тип батареи по умолчанию -->
      <el-form-item label="Тип батареи">
        <el-select v-model="settings.default_battery_type" placeholder="Выберите тип" style="width: 100%">
          <el-option
              v-for="type in store.batteryTypesForDropdown"
              :key="type.id"
              :label="type.label"
              :value="type.id"
          />
        </el-select>
      </el-form-item>

      <!-- Тип лампы по умолчанию -->
      <el-form-item label="Тип лампы">
        <el-select v-model="settings.default_bulb_type" placeholder="Выберите тип" style="width: 100%">
          <el-option
              v-for="type in store.bulbTypesForDropdown"
              :key="type.id"
              :label="type.label"
              :value="type.id"
          />
        </el-select>
      </el-form-item>

      <!-- Тип источника питания -->
      <el-form-item label="Источник питания">
        <el-select v-model="settings.default_power_supply" placeholder="Выберите тип" style="width: 100%">
          <el-option
              v-for="type in store.powerSuppliesForDropdown"
              :key="type.id"
              :label="type.label"
              :value="type.id"
          />
        </el-select>
      </el-form-item>

      <!-- Режим управления питанием -->
      <el-form-item label="Режим питания">
        <el-select v-model="settings.power_management_mode" placeholder="Выберите режим" style="width: 100%">
          <el-option label="Экономный" value="conservative" />
          <el-option label="Сбалансированный" value="balanced" />
          <el-option label="Производительный" value="aggressive" />
        </el-select>
      </el-form-item>

      <!-- Время работы контроллера -->
      <el-form-item label="Время работы контроллера (сек)">
        <el-input-number
            v-model="settings.controller_runtime"
            :min="3600"
            :max="604800"
            :step="3600"
        />
      </el-form-item>

      <!-- Мин. напряжение контроллера -->
      <el-form-item label="Мин. напряжение контроллера (В)">
        <el-input-number
            v-model="settings.min_controller_voltage"
            :min="2.5"
            :max="3.5"
            :step="0.1"
            :precision="2"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">Отмена</el-button>
      <el-button @click="resetSettings" :loading="loading">Сбросить</el-button>
      <el-button type="primary" @click="saveSettings" :loading="loading">Сохранить</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
// ✅ ТОЛЬКО STORE — БЕЗ ПРЯМЫХ ИМПОРТОВ ТИПОВ
import { useSmartlightStore } from '@components/SmartLight/stores/index.js';

const visible = defineModel();
const store = useSmartlightStore();
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

// ✅ ЗАГРУЗКА НАСТРОЕК ПРИ ОТКРЫТИИ
watch(() => visible.value, (newVal) => {
  if (newVal) {
    loadSettings();
  }
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

const saveSettings = async () => {
  loading.value = true;
  try {
    const response = await store.settingsUpdateGlobalSettings(settings.value);
    if (response.success) {
      ElNotification({
        title: 'Успех',
        message: 'Глобальные настройки сохранены',
        type: 'success'
      });
      visible.value = false;
    } else {
      throw new Error(response.message || 'Ошибка сохранения');
    }
  } catch (error) {
    ElNotification({
      title: 'Ошибка',
      message: error.message,
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};

const resetSettings = async () => {
  loading.value = true;
  try {
    const response = await store.settingsResetGlobalSettings();
    if (response.success) {
      loadSettings();
      ElNotification({
        title: 'Успех',
        message: 'Настройки сброшены',
        type: 'success'
      });
    }
  } catch (error) {
    ElNotification({
      title: 'Ошибка',
      message: error.message,
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  color: #909399;
  gap: 6px;
}

.loading-state .el-icon {
  font-size: 32px;
}

:deep(.el-form-item) {
  margin-bottom: 6px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
