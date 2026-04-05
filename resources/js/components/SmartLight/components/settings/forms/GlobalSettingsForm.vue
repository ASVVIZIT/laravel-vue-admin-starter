<template>
  <div class="global-settings-form">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка настроек...</span>
    </div>

    <div v-else class="form-scroll-wrapper">
      <el-form :model="settings" label-position="top" size="small" class="compact-form" ref="formRef">

        <!-- БЛОК 1: Питание -->
        <el-divider content-position="left" class="compact-divider">
          <el-icon><Lightning /></el-icon> Питание
        </el-divider>

        <el-form-item label="Крит. напряжение (В)" :error="validationErrors?.critical_voltage?.[0]" class="compact-item">
          <el-input-number
              v-model="settings.critical_voltage"
              :min="voltageRules.critical_voltage.min" :max="voltageRules.critical_voltage.max" :step="voltageRules.critical_voltage.step"
              :precision="2" :disabled="!voltageRules.critical_voltage.enabled" placeholder="3.2"
              controls-position="right" class="full-width compact-input"
              ref="criticalVoltageInput"
              @change="(val) => handleFieldChange('critical_voltage', val, voltageRules.critical_voltage.min, voltageRules.critical_voltage.max)"
              @input="clearFieldError('critical_voltage')"
          />
          <div class="form-tip" v-if="voltageRules.critical_voltage.enabled">Минимальное напряжение для отключения</div>
          <div class="form-tip disabled-tip" v-else>Не применимо для этого типа питания</div>
        </el-form-item>

        <el-form-item label="Мин. напряжение контроллера (В)" :error="validationErrors?.min_controller_voltage?.[0]" class="compact-item">
          <el-input-number
              v-model="settings.min_controller_voltage"
              :min="voltageRules.min_controller_voltage.min" :max="voltageRules.min_controller_voltage.max" :step="voltageRules.min_controller_voltage.step"
              :precision="2" :disabled="!voltageRules.min_controller_voltage.enabled" placeholder="2.8"
              controls-position="right" class="full-width compact-input"
              ref="minControllerVoltageInput"
              @change="(val) => handleFieldChange('min_controller_voltage', val, voltageRules.min_controller_voltage.min, voltageRules.min_controller_voltage.max)"
              @input="clearFieldError('min_controller_voltage')"
          />
          <div class="form-tip" v-if="voltageRules.min_controller_voltage.enabled">Порог предупреждения контроллера</div>
          <div class="form-tip disabled-tip" v-else>Не применимо для этого типа питания</div>
        </el-form-item>

        <!-- БЛОК 2: Спящий режим -->
        <el-divider content-position="left" class="compact-divider">
          <el-icon><Moon /></el-icon> Спящий режим
        </el-divider>

        <el-form-item label="Интервал сна (сек)" :error="validationErrors?.sleep_interval?.[0]" class="compact-item">
          <el-input-number
              v-model="settings.sleep_interval" :min="60" :max="86400" :step="60" placeholder="600"
              controls-position="right" class="full-width compact-input"
              ref="sleepIntervalInput"
              @change="(val) => handleFieldChange('sleep_interval', val, 60, 86400)"
              @input="clearFieldError('sleep_interval')"
          />
          <div class="form-tip">Через сколько секунд уходить в сон</div>
        </el-form-item>

        <el-form-item label="Аварийный интервал (сек)" :error="validationErrors?.emergency_sleep_interval?.[0]" class="compact-item">
          <el-input-number
              v-model="settings.emergency_sleep_interval" :min="300" :max="86400" :step="300" placeholder="3600"
              controls-position="right" class="full-width compact-input"
              ref="emergencyIntervalInput"
              @change="(val) => handleFieldChange('emergency_sleep_interval', val, 300, 86400)"
              @input="clearFieldError('emergency_sleep_interval')"
          />
          <div class="form-tip">Сон при критическом разряде</div>
        </el-form-item>

        <el-form-item label="Время работы контроллера (сек)" :error="validationErrors?.controller_runtime?.[0]" class="compact-item">
          <el-input-number
              v-model="settings.controller_runtime" :min="runtimeRules.min" :max="runtimeRules.max" :step="runtimeRules.step" placeholder="86400"
              controls-position="right" class="full-width compact-input"
              ref="controllerRuntimeInput"
              @change="(val) => handleFieldChange('controller_runtime', val, runtimeRules.min, runtimeRules.max)"
              @input="clearFieldError('controller_runtime')"
          />
          <div class="form-tip">Максимальное время работы без сна</div>
        </el-form-item>

        <!-- БЛОК 3: Тип питания -->
        <el-divider content-position="left" class="compact-divider">
          <el-icon><Cpu /></el-icon> Тип питания
        </el-divider>

        <el-form-item label="Тип источника питания" :error="validationErrors?.power_supply_type?.[0]" class="compact-item">
          <el-select v-model="settings.power_supply_type" placeholder="Выберите тип" class="full-width compact-select" size="small" @change="handlePowerSupplyTypeChange">
            <el-option label="Аккумулятор (2.5-4.3В)" value="battery" />
            <el-option label="DC 5V (4.5-5.5В)" value="dc-5v" />
            <el-option label="DC 12V (10-14В)" value="dc-12v" />
            <el-option label="AC 220V (сеть)" value="ac-220v" />
            <el-option label="Солнечная панель" value="solar" />
          </el-select>
          <div class="form-tip">Влияет на правила валидации напряжений</div>
        </el-form-item>

        <!-- БЛОК 4: Типы по умолчанию -->
        <el-divider content-position="left" class="compact-divider">
          <el-icon><Setting /></el-icon> Типы по умолчанию
        </el-divider>

        <el-form-item label="Тип батареи" class="compact-item">
          <el-select v-model="settings.default_battery_type" placeholder="Выберите тип" class="full-width compact-select" size="small"
                     :loading="!typesStore.typesLoaded" :disabled="!typesStore.typesLoaded">
            <el-option v-for="type in batteryTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="Тип лампы" class="compact-item">
          <el-select v-model="settings.default_bulb_type" placeholder="Выберите тип" class="full-width compact-select" size="small"
                     :loading="!typesStore.typesLoaded" :disabled="!typesStore.typesLoaded">
            <el-option v-for="type in bulbTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="Источник питания" class="compact-item">
          <el-select v-model="settings.default_power_supply" placeholder="Выберите тип" class="full-width compact-select" size="small"
                     :loading="!typesStore.typesLoaded" :disabled="!typesStore.typesLoaded">
            <el-option v-for="type in powerSupplies" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>

        <!-- БЛОК 5: Управление питанием -->
        <el-divider content-position="left" class="compact-divider">
          <el-icon><Cpu /></el-icon> Управление питанием
        </el-divider>

        <el-form-item label="Режим питания" class="compact-item">
          <el-select v-model="settings.power_management_mode" placeholder="Выберите режим" class="full-width compact-select" size="small">
            <el-option label="Экономный" value="conservative" />
            <el-option label="Сбалансированный" value="balanced" />
            <el-option label="Производительный" value="aggressive" />
          </el-select>
          <div class="form-tip">Влияет на расчёт времени работы</div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import { Loading, Lightning, Moon, Setting, Cpu } from '@element-plus/icons-vue';
import { useSettingsStore, useTypesStore } from '@/components/SmartLight/stores/index.js';
import { normalizeValidationErrorsUtils } from '@/components/SmartLight/utils/appFormattersUtils.js';
import { validateGlobalSettingsUtils } from '@/components/SmartLight/utils/appValidatorsUtils.js';
import useBoundaryHint from '@/components/SmartLight/composables/useBoundaryHint.js';

const props = defineProps({ initialSettings: { type: Object, default: null } });
const emit = defineEmits(['saved', 'cancelled', 'update:settings']);

const settingsStore = useSettingsStore();
const typesStore = useTypesStore();
const formRef = ref(null);
const loading = ref(false);
const validationErrors = ref({});

const { registerInput, handleInputChange, triggerBoundaryHint, clearHints } = useBoundaryHint();

const criticalVoltageInput = ref(null);
const minControllerVoltageInput = ref(null);
const sleepIntervalInput = ref(null);
const emergencyIntervalInput = ref(null);
const controllerRuntimeInput = ref(null);

const settings = ref({
  critical_voltage: 3.2, sleep_interval: 600, emergency_sleep_interval: 3600,
  default_battery_type: 'li-ion-18650', default_bulb_type: 'classic', default_power_supply: 'standard',
  power_management_mode: 'balanced', controller_runtime: 86400, min_controller_voltage: 2.8,
  power_supply_type: 'battery'
});

const voltageRules = computed(() => {
  const type = settings.value.power_supply_type;
  const rules = {
    'battery': { critical_voltage: { min: 2.0, max: 4.3, step: 0.1, enabled: true }, min_controller_voltage: { min: 2.0, max: 3.0, step: 0.1, enabled: true } },
    'dc-5v': { critical_voltage: { enabled: false }, min_controller_voltage: { min: 4.0, max: 5.0, step: 0.1, enabled: true } },
    'dc-12v': { critical_voltage: { enabled: false }, min_controller_voltage: { min: 9.0, max: 12.0, step: 0.5, enabled: true } },
    'ac-220v': { critical_voltage: { enabled: false }, min_controller_voltage: { enabled: false } },
    'solar': { critical_voltage: { min: 2.0, max: 6.0, step: 0.1, enabled: true }, min_controller_voltage: { min: 2.0, max: 5.0, step: 0.1, enabled: true } }
  };
  return rules[type] || rules.battery;
});

const runtimeRules = computed(() => {
  const type = settings.value.power_supply_type;
  return { 'battery': { min: 3600, max: 86400, step: 3600 }, 'dc-5v': { min: 3600, max: 172800, step: 3600 }, 'dc-12v': { min: 3600, max: 172800, step: 3600 }, 'ac-220v': { min: 3600, max: 604800, step: 3600 }, 'solar': { min: 3600, max: 259200, step: 3600 } }[type] || { min: 3600, max: 86400, step: 3600 };
});

const batteryTypes = computed(() => typesStore.batteryTypesForDropdownStore || []);
const bulbTypes = computed(() => typesStore.bulbTypesForDropdownStore || []);
const powerSupplies = computed(() => typesStore.powerSuppliesForDropdownStore || []);

const loadSettings = () => {
  if (props.initialSettings) settings.value = { ...settings.value, ...props.initialSettings };
  else settings.value = {
    critical_voltage: settingsStore.globalSettings.critical_voltage || 3.2, sleep_interval: settingsStore.globalSettings.sleep_interval || 600,
    emergency_sleep_interval: settingsStore.globalSettings.emergency_sleep_interval || 3600, default_battery_type: settingsStore.globalSettings.default_battery_type || 'li-ion-18650',
    default_bulb_type: settingsStore.globalSettings.default_bulb_type || 'classic', default_power_supply: settingsStore.globalSettings.default_power_supply || 'standard',
    power_management_mode: settingsStore.globalSettings.power_management_mode || 'balanced', controller_runtime: settingsStore.globalSettings.controller_runtime || 86400,
    min_controller_voltage: settingsStore.globalSettings.min_controller_voltage || 2.8, power_supply_type: settingsStore.globalSettings.power_supply_type || 'battery'
  };
};

const clearFieldError = (field) => { if (validationErrors.value?.[field]) delete validationErrors.value[field]; };
const handleFieldChange = (field, val, min, max) => { clearFieldError(field); clearHints(field); handleInputChange(field, val, min, max); };
const handlePowerSupplyTypeChange = () => {
  const r = voltageRules.value;
  if (!r.critical_voltage?.enabled && settings.value.critical_voltage) settings.value.critical_voltage = null;
  if (!r.min_controller_voltage?.enabled && settings.value.min_controller_voltage) settings.value.min_controller_voltage = null;
  clearFieldError('critical_voltage'); clearFieldError('min_controller_voltage');
};

const saveSettings = async () => {
  loading.value = true; validationErrors.value = {};
  try {
    const v = validateGlobalSettingsUtils(settings.value, null);
    if (!v.valid) {
      validationErrors.value = normalizeValidationErrorsUtils(v.errors.reduce((acc, err, i) => { const m = err.match(/(?:Критическое напряжение|Мин\. напряжение контроллера|Интервал сна|Аварийный интервал|Время работы контроллера|Тип источника питания)/i); acc[m ? m[0].toLowerCase().replace(/[^a-zа-яё0-9]/g, '_').replace('мин_', 'min_') : `field_${i}`] = [err]; return acc; }, {}));
      ElNotification({ title: 'Ошибка валидации', message: v.errors[0], type: 'warning', duration: 3000 });
      loading.value = false; return false;
    }
    const res = await settingsStore.updateGlobalSettingsStore(settings.value);
    if (res?.success) { emit('saved', settings.value); return true; }
    else { validationErrors.value = normalizeValidationErrorsUtils(res?.errors || {}); throw new Error(res?.message || 'Ошибка валидации'); }
  } catch (e) { emit('cancelled', e); return false; } finally { loading.value = false; }
};

const resetSettings = async () => {
  loading.value = true;
  try { const r = await settingsStore.resetGlobalSettingsStore(); if (r?.success) { loadSettings(); emit('saved', settings.value); } }
  catch (e) { emit('cancelled', e); } finally { loading.value = false; }
};

watch(() => settings.value, (v) => emit('update:settings', v), { deep: true });

onMounted(() => {
  loadSettings();
  if (criticalVoltageInput.value) registerInput('critical_voltage', criticalVoltageInput.value);
  if (minControllerVoltageInput.value) registerInput('min_controller_voltage', minControllerVoltageInput.value);
  if (sleepIntervalInput.value) registerInput('sleep_interval', sleepIntervalInput.value);
  if (emergencyIntervalInput.value) registerInput('emergency_sleep_interval', emergencyIntervalInput.value);
  if (controllerRuntimeInput.value) registerInput('controller_runtime', controllerRuntimeInput.value);
});

defineExpose({ saveSettings, resetSettings, settings });
</script>

<style scoped>
.global-settings-form { padding: 2px; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; color: #909399; gap: 4px; font-size: 10px; }
.loading-state .el-icon { font-size: 20px; }

/* ✅ Scroll Wrapper */
.form-scroll-wrapper {
  max-height: 480px;
  overflow-y: auto;
  padding-right: 6px;
  padding-bottom: 8px;
}
.form-scroll-wrapper::-webkit-scrollbar { width: 4px; }
.form-scroll-wrapper::-webkit-scrollbar-track { background: transparent; }
.form-scroll-wrapper::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 2px; }

/* === Divider === */
:deep(.compact-divider) { margin: 6px 0 4px; }
:deep(.compact-divider .el-divider__text) { font-size: 10px; font-weight: 600; color: #303133; padding: 0 4px; background: #fff; }

/* === Form Items === */
:deep(.compact-item) { margin-bottom: 6px; }
:deep(.compact-item .el-form-item__label) { font-size: 9px; font-weight: 600; color: #606266; margin-bottom: 2px; line-height: 1.2; padding: 0; }

/* === Inputs & Selects === */
:deep(.compact-input), :deep(.compact-select) { width: 100%; --el-input-height: 26px; --el-input-font-size: 10px; }
:deep(.compact-input .el-input__wrapper), :deep(.compact-select .el-select__wrapper) { padding: 1px 8px; box-shadow: 0 0 0 1px #dcdfe6 inset; border-radius: 4px; }
:deep(.compact-input .el-input__inner), :deep(.compact-select .el-select__input) { font-size: 10px; height: 24px; line-height: 24px; padding: 0; }

/* === Input Number Controls (Right) === */
:deep(.compact-input.el-input-number.is-controls-right .el-input-number__decrease),
:deep(.compact-input.el-input-number.is-controls-right .el-input-number__increase) {
  width: 20px; height: 13px; line-height: 13px; font-size: 9px; border-left: 1px solid #dcdfe6;
}
:deep(.compact-input.el-input-number.is-controls-right .el-input-number__increase) { border-top: 1px solid #dcdfe6; border-bottom: none; }
:deep(.compact-input.el-input-number.is-controls-right .el-input__wrapper) { padding-right: 26px; }

/* === Select Dropdown === */
:deep(.compact-select .el-select-dropdown) { font-size: 10px; padding: 4px 0; }
:deep(.compact-select .el-select-dropdown__item) { font-size: 10px; padding: 6px 12px; }

/* === Form Tips === */
.form-tip { font-size: 8px; color: #909399; margin-top: 2px; line-height: 1.2; padding-left: 2px; }
.form-tip.disabled-tip { color: #c0c4cc; font-style: italic; }

/* === Error States === */
:deep(.el-form-item.is-error .el-input__wrapper), :deep(.el-form-item.is-error .el-select__wrapper) { box-shadow: 0 0 0 1px #f56c6c inset; }

/* === Boundary Hint === */
:deep(.boundary-hint) { position: absolute; right: 0; background: #fef0f0; border: 1px solid #f56c6c; border-radius: 4px; padding: 4px 8px; font-size: 9px; color: #f56c6c; font-weight: 500; white-space: nowrap; z-index: 1000; pointer-events: none; box-shadow: 0 2px 8px rgba(0,0,0,0.1); animation: fadeInHint 0.15s ease; }
:deep(.boundary-hint--min) { bottom: -26px; background: #fdf6ec; border-color: #e6a23c; color: #e6a23c; }
:deep(.boundary-hint--max) { top: -26px; }
@keyframes fadeInHint { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeOutHint { from { opacity: 1; } to { opacity: 0; } }

.full-width { width: 100%; }
</style>
