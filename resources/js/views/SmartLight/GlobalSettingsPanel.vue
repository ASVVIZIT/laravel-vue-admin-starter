<template>
  <div class="settings-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane name="system" label="Системные настройки">
        <div class="settings-group">
          <label class="settings-label">Критический уровень напряжения</label>
          <el-input-number
              v-model="systemSettings.critical_voltage"
              :min="2.5"
              :max="14.4"
              :step="0.01"
              :precision="2"
              :controls="true"
              class="full-width"
          />
          <div class="settings-help">
            <InfoFilled class="help-icon" />
            <span>Напряжение ниже которого устройство перейдет в аварийный режим</span>
          </div>
        </div>

        <div class="settings-group">
          <label class="settings-label">Интервал сна (сек)</label>
          <el-input-number
              v-model="systemSettings.sleep_interval"
              :min="60"
              :max="86400"
              :controls="true"
              class="full-width"
          />
          <div class="settings-help">
            <InfoFilled class="help-icon" />
            <span>Интервал перехода в спящий режим при отсутствии активности</span>
          </div>
        </div>

        <div class="settings-group">
          <label class="settings-label">Аварийный интервал (сек)</label>
          <el-input-number
              v-model="systemSettings.emergency_sleep_interval"
              :min="300"
              :max="86400"
              :controls="true"
              class="full-width"
          />
          <div class="settings-help">
            <WarningFilled class="help-icon" />
            <span>Интервал перехода в аварийный спящий режим при критическом напряжении</span>
          </div>
        </div>

        <div class="settings-group">
          <label class="settings-label">Сервер</label>
          <el-input
              v-model="systemSettings.server_url"
              placeholder="https://api.smartlight.example.com"
              class="full-width"
          />
          <div class="settings-help">
            <InfoFilled class="help-icon" />
            <span>URL сервера для API-запросов</span>
          </div>
        </div>

        <div class="settings-group">
          <label class="settings-label">Глобальный режим 3D</label>
          <el-switch
              v-model="systemSettings.global_3d_mode"
              active-text="Вкл"
              inactive-text="Выкл"
          />
          <div class="settings-help">
            <InfoFilled class="help-icon" />
            <span>Включение 3D-режима для всех устройств</span>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane name="devices" label="Настройки устройств">
        <div class="settings-group">
          <label class="settings-label">Тип аккумулятора по умолчанию</label>
          <el-select
              v-model="systemSettings.default_battery_type"
              class="full-width"
          >
            <el-option
                v-for="type in batteryTypes"
                :key="type.id"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
          <div class="settings-help">
            <InfoFilled class="help-icon" />
            <span>Тип аккумулятора, используемый при добавлении новых устройств</span>
          </div>
        </div>

        <div class="settings-group">
          <label class="settings-label">Тип лампочки по умолчанию</label>
          <el-select
              v-model="systemSettings.default_bulb_type"
              class="full-width"
          >
            <el-option
                v-for="type in bulbTypes"
                :key="type.id"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
          <div class="settings-help">
            <InfoFilled class="help-icon" />
            <span>Тип лампочки, используемый при добавлении новых устройств</span>
          </div>
        </div>

        <div class="settings-group">
          <label class="settings-label">Тип источника питания по умолчанию</label>
          <el-select
              v-model="systemSettings.default_power_supply"
              class="full-width"
          >
            <el-option
                v-for="type in powerSupplyTypes"
                :key="type.id"
                :label="type.label"
                :value="type.value"
            />
          </el-select>
          <div class="settings-help">
            <InfoFilled class="help-icon" />
            <span>Тип источника питания, используемый при добавлении новых устройств</span>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane name="power-management" label="Управление питанием">
        <div class="settings-group">
          <label class="settings-label">Режим управления питанием</label>
          <el-select
              v-model="systemSettings.power_management_mode"
              class="full-width"
          >
            <el-option value="conservative" label="Консервативный" />
            <el-option value="balanced" label="Сбалансированный" />
            <el-option value="aggressive" label="Агрессивный" />
          </el-select>

          <div class="power-mode-info">
            <p v-if="systemSettings.power_management_mode === 'conservative'">
              <strong>Консервативный режим:</strong> Минимальное энергопотребление контроллера,
              редкое пробуждение для проверки состояния,
              длительное время автономной работы контроллера при отключенной нагрузке
            </p>
            <p v-if="systemSettings.power_management_mode === 'balanced'">
              <strong>Сбалансированный режим:</strong> Оптимальное соотношение между
              энергопотреблением и отзывчивостью системы
            </p>
            <p v-if="systemSettings.power_management_mode === 'aggressive'">
              <strong>Агрессивный режим:</strong> Частое пробуждение контроллера,
              мгновенная реакция на изменения,
              минимальное время автономной работы
            </p>
          </div>
        </div>

        <div class="settings-group">
          <label class="settings-label">Время работы контроллера (сек)</label>
          <el-input-number
              v-model="systemSettings.controller_runtime"
              :min="3600"
              :max="86400"
              :controls="true"
              class="full-width"
          />
          <div class="settings-help">
            <InfoFilled class="help-icon" />
            <span>Максимальное время автономной работы контроллера при отключенной нагрузке</span>
          </div>
        </div>

        <div class="settings-group">
          <label class="settings-label">Мин. напряжение контроллера (В)</label>
          <el-input-number
              v-model="systemSettings.min_controller_voltage"
              :min="2.0"
              :max="3.0"
              :step="0.01"
              :precision="2"
              :controls="true"
              class="full-width"
          />
          <div class="settings-help">
            <WarningFilled class="help-icon" />
            <span>Минимальное напряжение, при котором контроллер может работать автономно</span>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Футер -->
    <div class="settings-footer">
      <el-button size="small" @click="resetToDefaults" :icon="Refresh">
        Сбросить
      </el-button>
      <el-button size="small" type="primary" @click="saveSettings" :icon="Check">
        Сохранить
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import {
  Check,
  Refresh,
  InfoFilled,
  WarningFilled
} from '@element-plus/icons-vue';
import { useSmartlightStore } from '@/components/SmartLight/stores';
import { useTypesStore } from '@/components/SmartLight/stores/smartlight/typesStore.js';
import { logDebug, logError } from '@/components/SmartLight/utils/appLogger';

const settingsStore = useSettingsStore();
const typesStore = useTypesStore();
const loading = ref(false);
const error = ref(null);
const activeTab = ref('system');
const systemSettings = ref({
  critical_voltage: 3.2,
  sleep_interval: 600,
  emergency_sleep_interval: 3600,
  server_url: import.meta.env.VITE_API_BASE_URL || '/api/smart-light',
  global_3d_mode: false,
  default_battery_type: 'li-ion-18650',
  default_bulb_type: 'classic',
  default_power_supply: 'standard',
  power_management_mode: 'balanced',
  controller_runtime: 86400,
  min_controller_voltage: 2.8
});

// Используем ваши вычисляемые свойства
const batteryTypes = computed(() => {
  return typesStore.computed.batteryTypesForDropdown;
});

const bulbTypes = computed(() => {
  return typesStore.computed.bulbTypesForDropdown;
});

const powerSupplyTypes = computed(() => {
  return [
    { id: 'standard', value: 'standard', label: 'Стандартный' },
    { id: 'solar', value: 'solar', label: 'Солнечная панель' },
    { id: 'grid', value: 'grid', label: 'Сеть' }
  ];
});

// Инициализация при монтировании
onMounted(async () => {
  logDebug('Settings', 'Инициализация глобальных настроек');

  try {
    loading.value = true;
    const settings = await settingsStore.actions.getGlobalSettings();

    if (settings.success) {
      systemSettings.value = {
        ...systemSettings.value,
        ...settings.data
      };
    }
  } catch (err) {
    logError('Settings', 'Ошибка загрузки настроек', err);
    error.value = 'Не удалось загрузить настройки';
  } finally {
    loading.value = false;
  }
});

// Сохранение настроек
const saveSettings = async () => {
  logDebug('Settings', 'Сохранение настроек', { settings: systemSettings.value });

  try {
    loading.value = true;
    error.value = null;

    const response = await settingsStore.actions.updateGlobalSettings(systemSettings.value);

    if (response.success) {
      // Сохраняем в localStorage
      localStorage.setItem('smartlight_global_settings', JSON.stringify(systemSettings.value));

      ElNotification({
        title: 'Успех',
        message: 'Глобальные настройки сохранены',
        type: 'success'
      });
    } else {
      throw new Error(response.message || 'Ошибка сохранения настроек');
    }
  } catch (err) {
    error.value = 'Не удалось сохранить настройки';
    logError('Settings', 'Ошибка сохранения настроек', err);

    ElNotification({
      title: 'Ошибка',
      message: 'Ошибка сохранения глобальных настроек',
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};

// Сброс настроек
const resetToDefaults = () => {
  logDebug('Settings', 'Сброс настроек к значениям по умолчанию');

  ElNotification({
    title: 'Подтверждение',
    message: 'Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?',
    type: 'warning',
    showClose: true,
    duration: 0,
    onConfirm: () => {
      systemSettings.value = {
        critical_voltage: 3.2,
        sleep_interval: 600,
        emergency_sleep_interval: 3600,
        server_url: import.meta.env.VITE_API_BASE_URL || '/api/smart-light',
        global_3d_mode: false,
        default_battery_type: 'li-ion-18650',
        default_bulb_type: 'classic',
        default_power_supply: 'standard',
        power_management_mode: 'balanced',
        controller_runtime: 86400,
        min_controller_voltage: 2.8
      };

      ElNotification({
        title: 'Успех',
        message: 'Глобальные настройки сброшены',
        type: 'success'
      });
    }
  });
};
</script>

<script>
export default {
  name: 'GlobalSettingsPanel'
};
</script>

<style scoped>
.settings-container {
  padding: 1rem;
}

.settings-group {
  margin-bottom: 1.5rem;
}

.settings-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #606266;
}

.settings-help {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: #909399;
}

.help-icon {
  width: 0.9rem;
  height: 0.9rem;
}

.power-mode-info {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #606266;
}

.power-mode-info p {
  margin: 0;
  line-height: 1.5;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid #ebeef5;
}

.full-width {
  width: 100%;
}
</style>
