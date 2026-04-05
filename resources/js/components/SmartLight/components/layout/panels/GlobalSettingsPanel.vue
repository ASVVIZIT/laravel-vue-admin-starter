<template>
  <div class="global-settings-panel" :class="{ 'panel-loading': loading }">
    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        size="small"
        class="settings-form"
    >
      <el-form-item label="Критическое напряжение (В)" prop="critical_voltage">
        <el-input-number
            v-model="formData.critical_voltage"
            :min="2.5"
            :max="4.2"
            :step="0.1"
            :precision="2"
            class="full-width"
        />
        <div class="form-hint">Минимальное напряжение перед аварийным отключением</div>
      </el-form-item>

      <el-form-item label="Интервал сна (сек)" prop="sleep_interval">
        <el-select v-model="formData.sleep_interval" class="full-width">
          <el-option label="5 минут" :value="300" />
          <el-option label="10 минут" :value="600" />
          <el-option label="30 минут" :value="1800" />
          <el-option label="1 час" :value="3600" />
        </el-select>
        <div class="form-hint">Период перехода в спящий режим при бездействии</div>
      </el-form-item>

      <el-form-item label="Экстренный сон (сек)" prop="emergency_sleep_interval">
        <el-input-number
            v-model="formData.emergency_sleep_interval"
            :min="600"
            :max="7200"
            :step="600"
            class="full-width"
        />
        <div class="form-hint">Интервал экстренного перехода в сон при низком заряде</div>
      </el-form-item>

      <el-form-item label="Тип батареи по умолчанию" prop="default_battery_type">
        <el-select
            v-model="formData.default_battery_type"
            class="full-width"
            :loading="typesLoading"
        >
          <el-option
              v-for="type in batteryTypesForDropdown"
              :key="type.value"
              :label="type.label"
              :value="type.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Тип лампы по умолчанию" prop="default_bulb_type">
        <el-select
            v-model="formData.default_bulb_type"
            class="full-width"
            :loading="typesLoading"
        >
          <el-option
              v-for="type in bulbTypesForDropdown"
              :key="type.value"
              :label="type.label"
              :value="type.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Режим управления питанием" prop="power_management_mode">
        <el-radio-group v-model="formData.power_management_mode" class="radio-group">
          <el-radio label="balanced">Сбалансированный</el-radio>
          <el-radio label="performance">Производительность</el-radio>
          <el-radio label="economy">Экономия</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <div class="panel-actions">
      <el-button @click="handleReset" :loading="loading">Сбросить</el-button>
      <el-button type="primary" @click="handleSave" :loading="loading">
        Сохранить
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import { useSettingsStore, useTypesStore } from '@components/SmartLight/stores/index.js';

const emit = defineEmits(['saved']);

const settingsStore = useSettingsStore();
const typesStore = useTypesStore();

const formRef = ref(null);
const loading = ref(false);
// ✅ ИСПРАВЛЕНО: удалён дублирующий ref typesLoading

const formData = ref({
  critical_voltage: 3.2,
  sleep_interval: 600,
  emergency_sleep_interval: 3600,
  default_battery_type: 'li-ion-18650',
  default_bulb_type: 'classic',
  power_management_mode: 'balanced'
});

const formRules = {
  critical_voltage: [
    { required: true, message: 'Укажите напряжение', trigger: 'blur' },
    { type: 'number', min: 2.5, max: 4.2, message: 'Диапазон: 2.5-4.2В', trigger: 'blur' }
  ],
  sleep_interval: [{ required: true, message: 'Выберите интервал', trigger: 'change' }],
  emergency_sleep_interval: [{ required: true, message: 'Укажите интервал', trigger: 'blur' }]
};

const batteryTypesForDropdown = computed(() => typesStore.batteryTypesForDropdownStore);
const bulbTypesForDropdown = computed(() => typesStore.bulbTypesForDropdownStore);
// ✅ ИСПРАВЛЕНО: используем computed из стора (единственное объявление)
const typesLoading = computed(() => typesStore.loading);

onMounted(async () => {
  await loadSettings();
  // ✅ ИСПРАВЛЕНО: не управляем typesLoading вручную, стор делает это сам
  if (!typesStore.typesLoaded.value) {
    await typesStore.fetchTypesStore(); // fetchTypes сам переключает loading
  }
});

const loadSettings = async () => {
  loading.value = true;
  try {
    const response = await settingsStore.getGlobalSettingsStore();
    if (response?.success && response.data) {
      formData.value = { ...formData.value, ...response.data };
    } else {
      const saved = localStorage.getItem('smartlight_global_settings');
      if (saved) formData.value = { ...formData.value, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('[GlobalSettingsPanel] Load failed, using defaults');
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch (err) {
    ElNotification({
      title: 'Ошибка валидации',
      message: 'Проверьте заполнение полей',
      type: 'warning'
    });
    return;
  }

  loading.value = true;
  try {
    const response = await settingsStore.updateGlobalSettingsStore(formData.value);
    if (response?.success) {
      localStorage.setItem('smartlight_global_settings', JSON.stringify(formData.value));
      ElNotification({ title: 'Успех', message: 'Глобальные настройки сохранены', type: 'success' });
      emit('saved');
    } else {
      throw new Error(response?.message || 'Ошибка сохранения');
    }
  } catch (err) {
    ElNotification({ title: 'Ошибка', message: err.message || 'Не удалось сохранить настройки', type: 'error' });
  } finally {
    loading.value = false;
  }
};

const handleReset = async () => {
  loading.value = true;
  try {
    const response = await settingsStore.resetGlobalSettings();
    if (response?.success) {
      formData.value = {
        critical_voltage: 3.2,
        sleep_interval: 600,
        emergency_sleep_interval: 3600,
        default_battery_type: 'li-ion-18650',
        default_bulb_type: 'classic',
        power_management_mode: 'balanced'
      };
      ElNotification({ title: 'Успех', message: 'Настройки сброшены', type: 'success' });
    }
  } catch (err) {
    ElNotification({ title: 'Ошибка', message: err.message || 'Не удалось сбросить настройки', type: 'error' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.global-settings-panel { display: flex; flex-direction: column; gap: 16px; }
.global-settings-panel.panel-loading { opacity: 0.6; pointer-events: none; }
.settings-form { flex: 1; }
.full-width { width: 100%; }
.form-hint { font-size: 11px; color: #909399; margin-top: 4px; line-height: 1.3; }
.radio-group { display: flex; flex-direction: column; gap: 8px; }
.panel-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid #e4e7ed; }
:deep(.el-form-item) { margin-bottom: 16px; }
:deep(.el-form-item__label) { font-weight: 500; color: #303133; }
:deep(.el-input-number), :deep(.el-select) { width: 100%; }
@media (max-width: 480px) {
  .panel-actions { flex-direction: column-reverse; }
  .panel-actions .el-button { width: 100%; }
}
</style>
