<template>
  <el-dialog
      v-model="visible"
      title="Настройки устройства"
      width="800px"
      :close-on-click-modal="false"
      class="device-settings-modal"
  >
    <div v-if="!device" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка...</span>
    </div>

    <div v-else class="device-settings">
      <!-- Основная информация -->
      <el-descriptions :column="2" border size="small" class="mb-3">
        <el-descriptions-item label="ID">{{ device.device_id }}</el-descriptions-item>
        <el-descriptions-item label="Имя">{{ device.name }}</el-descriptions-item>
        <el-descriptions-item label="Статус">
          <el-tag :type="statusTagType" size="small">{{ statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Напряжение">{{ device.voltage?.toFixed(2) || '0.00' }} В</el-descriptions-item>
      </el-descriptions>

      <!-- ВКЛАДКИ НАСТРОЕК -->
      <el-tabs v-model="activeTab" class="settings-tabs">

        <!-- Вкладка: Питание -->
        <el-tab-pane label="Питание" name="power">
          <div class="settings-section">
            <h4 class="section-title">Параметры батареи</h4>

            <el-form :model="powerSettings" label-width="160px" size="small">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="Тип батареи">
                    <el-select v-model="powerSettings.battery_type_id" placeholder="Выберите тип" style="width: 100%">
                      <el-option
                          v-for="type in batteryTypes"
                          :key="type.id"
                          :label="type.label"
                          :value="type.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Ёмкость (мАч)">
                    <el-input-number
                        v-model="powerSettings.capacity"
                        :min="100"
                        :max="50000"
                        :step="100"
                        placeholder="3500"
                        style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="Напряжение (В)">
                    <el-input-number
                        v-model="powerSettings.voltage"
                        :min="2.5"
                        :max="4.3"
                        :step="0.1"
                        :precision="2"
                        placeholder="3.7"
                        style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Крит. напряжение (В)">
                    <el-input-number
                        v-model="powerSettings.critical_voltage"
                        :min="2.5"
                        :max="4.0"
                        :step="0.1"
                        :precision="2"
                        placeholder="3.0"
                        style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>

            <el-divider />

            <h4 class="section-title">Потребление устройства</h4>
            <el-alert
                title="Укажите фактическое потребление для точного расчёта времени"
                type="info"
                :closable="false"
                show-icon
                class="mb-2"
            />

            <el-form :model="powerSettings" label-width="180px" size="small">
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="Потребление (мА)">
                    <el-input-number
                        v-model="powerSettings.custom_consumption_mA"
                        :min="1"
                        :max="1000"
                        :step="5"
                        placeholder="100"
                        style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Потребление (Вт·ч)">
                    <div class="calculated-value">
                      {{ calculatedPowerWh }} Вт·ч
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Время работы">
                    <div class="calculated-value">
                      {{ calculatedRuntime }}
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- Вкладка: Лампа -->
        <el-tab-pane label="Лампа" name="bulb">
          <div class="settings-section">
            <h4 class="section-title">Параметры лампы</h4>

            <el-form :model="bulbSettings" label-width="160px" size="small">
              <el-form-item label="Тип лампы">
                <el-select v-model="bulbSettings.bulb_type_id" placeholder="Выберите тип" style="width: 100%">
                  <el-option
                      v-for="type in bulbTypes"
                      :key="type.id"
                      :label="type.label"
                      :value="type.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="Интенсивность (%)">
                <el-slider v-model="bulbSettings.intensity" :min="0" :max="100" />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- Вкладка: Группировка -->
        <el-tab-pane label="Группировка" name="group">
          <BatteryGroupConfig
              :device="device"
              @config-updated="handleGroupConfigUpdated"
          />
        </el-tab-pane>

      </el-tabs>
    </div>

    <template #footer>
      <el-button @click="visible = false">Отмена</el-button>
      <el-button type="primary" @click="saveSettings" :loading="saving">
        Сохранить
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Loading } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import { useSmartlightStore } from '@components/SmartLight/stores/index.js';
import { PowerManagementController } from '@components/SmartLight/controllers/PowerManagementController.js';
import { calculatePowerConsumptionWh } from '@components/SmartLight/utils/appPowerUtils.js';
import BatteryGroupConfig from '@components/SmartLight/components/BatteryGroupConfig.vue';

const props = defineProps({
  deviceId: { type: String, required: true }
});

const visible = defineModel();
const store = useSmartlightStore();
const powerController = new PowerManagementController();
const activeTab = ref('power');
const saving = ref(false);

const device = computed(() => store.deviceGetDevice(props.deviceId));

const statusTagType = computed(() => {
  if (!device.value) return 'info';
  const map = { 'ON': 'success', 'OFF': 'info', 'SLEEPING': 'warning', 'ERROR': 'danger' };
  return map[device.value.status] || 'info';
});

const statusText = computed(() => {
  if (!device.value) return 'N/A';
  const map = { 'ON': 'Включено', 'OFF': 'Выключено', 'SLEEPING': 'Спит', 'ERROR': 'Ошибка' };
  return map[device.value.status] || 'N/A';
});

const batteryTypes = computed(() => store.batteryTypesForDropdown);
const bulbTypes = computed(() => store.bulbTypesForDropdown);

// НАСТРОЙКИ ПИТАНИЯ
const powerSettings = ref({
  battery_type_id: '',
  capacity: 3500,
  voltage: 3.7,
  critical_voltage: 3.0,
  custom_consumption_mA: 100
});

// НАСТРОЙКИ ЛАМПЫ
const bulbSettings = ref({
  bulb_type_id: '',
  intensity: 100
});

// НАСТРОЙКИ ГРУППИРОВКИ
const groupSettings = ref({
  enabled: false,
  type: 'series',
  count: 1
});

// РАСЧЁТНЫЕ ЗНАЧЕНИЯ
const calculatedPowerWh = computed(() => {
  if (!device.value) return 0;
  const tempDevice = {
    ...device.value,
    power_config: {
      ...(device.value.power_config || {}),
      custom_consumption_mA: powerSettings.value.custom_consumption_mA
    }
  };
  return calculatePowerConsumptionWh(tempDevice).toFixed(3);
});

const calculatedRuntime = computed(() => {
  if (!device.value) return 'N/A';
  return powerController.calculateRuntime(device.value.device_id);
});

// ЗАГРУЗКА НАСТРОЕК ПРИ ОТКРЫТИИ
watch(() => props.deviceId, (newId) => {
  if (newId && device.value) {
    loadSettings();
  }
}, { immediate: true });

const loadSettings = () => {
  if (!device.value) return;

  powerSettings.value = {
    battery_type_id: device.value.battery_type_id || 'li-ion-18650',
    capacity: device.value.capacity || 3500,
    voltage: device.value.voltage || 3.7,
    critical_voltage: device.value.critical_voltage || 3.0,
    custom_consumption_mA: device.value.power_config?.custom_consumption_mA ||
        device.value.power_config?.base_consumption_mA || 100
  };

  bulbSettings.value = {
    bulb_type_id: device.value.bulb_type_id || 'classic',
    intensity: device.value.intensity || 100
  };

  if (device.value.battery_group_config) {
    groupSettings.value = {
      enabled: device.value.battery_group_config.enabled || false,
      type: device.value.battery_group_config.type || 'series',
      count: device.value.battery_group_config.count || 1
    };
  }
};

const handleGroupConfigUpdated = (updatedConfig) => {
  groupSettings.value = { ...updatedConfig };
};

const saveSettings = async () => {
  saving.value = true;

  try {
    // ✅ СОБИРАЕМ ВСЕ НАСТРОЙКИ
    const settings = {
      battery_type_id: powerSettings.value.battery_type_id,
      capacity: powerSettings.value.capacity,
      critical_voltage: powerSettings.value.critical_voltage,
      bulb_type_id: bulbSettings.value.bulb_type_id,
      power_config: {
        ...(device.value?.power_config || {}),
        custom_consumption_mA: powerSettings.value.custom_consumption_mA,
        base_consumption_mA: powerSettings.value.custom_consumption_mA
      },
      battery_group_config: {
        enabled: groupSettings.value.enabled,
        type: groupSettings.value.type,
        count: groupSettings.value.count
      }
    };

    console.log('[DeviceSettings] Saving settings:', settings);

    // ✅ СОХРАНЯЕМ ЧЕРЕЗ CONTROLLER
    const response = await powerController.savePowerManagementSettings(props.deviceId, settings);

    if (response.success) {
      ElNotification({
        title: 'Успех',
        message: 'Настройки сохранены',
        type: 'success'
      });
      visible.value = false;
    } else {
      throw new Error(response.message || 'Ошибка сохранения');
    }
  } catch (error) {
    console.error('[DeviceSettings] Save error:', error);
    ElNotification({
      title: 'Ошибка',
      message: error.message,
      type: 'error'
    });
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.device-settings-modal :deep(.el-dialog__body) {
  padding: 16px;
}

.device-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.settings-tabs {
  margin-top: 10px;
}

.settings-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
}

.settings-tabs :deep(.el-tabs__item) {
  padding: 0 16px;
  font-size: 13px;
}

.settings-section {
  padding: 8px 4px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.mb-2 {
  margin-bottom: 12px;
}

.mb-3 {
  margin-bottom: 16px;
}

.calculated-value {
  font-size: 13px;
  font-weight: 600;
  color: #409EFF;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  text-align: center;
}

:deep(.el-form-item) {
  margin-bottom: 14px;
}

:deep(.el-descriptions__label) {
  font-size: 12px;
  width: 100px;
}

:deep(.el-descriptions__content) {
  font-size: 12px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
