<template>
  <div class="global-settings-form">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка настроек...</span>
    </div>

    <el-form v-else :model="settings" label-width="200px" size="default">
      <!-- БЛОК 1: Питание -->
      <el-divider content-position="left">
        <el-icon><Lightning /></el-icon> Питание
      </el-divider>

      <el-form-item label="Крит. напряжение (В)">
        <el-input-number
            v-model="settings.critical_voltage"
            :min="2.5"
            :max="4.3"
            :step="0.1"
            :precision="2"
            placeholder="3.2"
        />
        <div class="form-tip">Минимальное напряжение для отключения</div>
      </el-form-item>

      <el-form-item label="Мин. напряжение контроллера (В)">
        <el-input-number
            v-model="settings.min_controller_voltage"
            :min="2.5"
            :max="3.5"
            :step="0.1"
            :precision="2"
            placeholder="2.8"
        />
        <div class="form-tip">Порог предупреждения контроллера</div>
      </el-form-item>

      <!-- БЛОК 2: Спящий режим -->
      <el-divider content-position="left">
        <el-icon><Moon /></el-icon> Спящий режим
      </el-divider>

      <el-form-item label="Интервал сна (сек)">
        <el-input-number
            v-model="settings.sleep_interval"
            :min="60"
            :max="86400"
            :step="60"
            placeholder="600"
        />
        <div class="form-tip">Через сколько секунд уходить в сон</div>
      </el-form-item>

      <el-form-item label="Аварийный интервал (сек)">
        <el-input-number
            v-model="settings.emergency_sleep_interval"
            :min="300"
            :max="86400"
            :step="300"
            placeholder="3600"
        />
        <div class="form-tip">Сон при критическом разряде</div>
      </el-form-item>

      <!-- БЛОК 3: Типы по умолчанию -->
      <el-divider content-position="left">
        <el-icon><Setting /></el-icon> Типы по умолчанию
      </el-divider>

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

      <!-- БЛОК 4: Управление питанием -->
      <el-divider content-position="left">
        <el-icon><Cpu /></el-icon> Управление питанием
      </el-divider>

      <el-form-item label="Режим питания">
        <el-select v-model="settings.power_management_mode" placeholder="Выберите режим" style="width: 100%">
          <el-option label="Экономный" value="conservative" />
          <el-option label="Сбалансированный" value="balanced" />
          <el-option label="Производительный" value="aggressive" />
        </el-select>
        <div class="form-tip">Влияет на расчёт времени работы</div>
      </el-form-item>

      <el-form-item label="Время работы контроллера (сек)">
        <el-input-number
            v-model="settings.controller_runtime"
            :min="3600"
            :max="604800"
            :step="3600"
            placeholder="86400"
        />
        <div class="form-tip">Максимальное время работы без сна</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Loading, Lightning, Moon, Setting, Cpu } from '@element-plus/icons-vue';
import { useSmartlightStore } from '@/components/SmartLight/stores/index.js';

const props = defineProps({
  initialSettings: { type: Object, default: null }
});

const emit = defineEmits(['saved', 'cancelled', 'update:settings']);

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

// Загрузка настроек
const loadSettings = () => {
  if (props.initialSettings) {
    settings.value = { ...settings.value, ...props.initialSettings };
  } else {
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
  }
};

const saveSettings = async () => {
  loading.value = true;
  try {
    const response = await store.settingsUpdateGlobalSettings(settings.value);
    if (response.success) {
      emit('saved', settings.value);
    } else {
      throw new Error(response.message || 'Ошибка сохранения');
    }
  } catch (error) {
    emit('cancelled', error);
    throw error;
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
      emit('saved', settings.value);
    }
  } catch (error) {
    emit('cancelled', error);
  } finally {
    loading.value = false;
  }
};

watch(() => settings.value, (newVal) => {
  emit('update:settings', newVal);
}, { deep: true });

// Автозагрузка при монтировании
loadSettings();

// Экспортируем методы для родителя
defineExpose({ saveSettings, resetSettings, settings });
</script>

<style scoped>
.global-settings-form {
  padding: 10px 5px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
  gap: 10px;
}

.loading-state .el-icon {
  font-size: 32px;
}

:deep(.el-divider) {
  margin: 20px 0 15px;
}

:deep(.el-divider__text) {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-input-number) {
  width: 100%;
}

.form-tip {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.3;
}
</style>
