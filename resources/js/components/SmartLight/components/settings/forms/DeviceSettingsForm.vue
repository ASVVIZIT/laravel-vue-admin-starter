<template>
  <div class="device-settings-form">
    <!-- ✅ Компактный хедер: Название + Бейдж типа -->
    <div class="form-header">
      <span class="device-name">{{ props.device?.name || 'Устройство' }}</span>
      <el-tag
          :type="props.device?.is_fake ? 'warning' : 'success'"
          effect="plain"
          size="small"
          class="device-type-badge"
      >
        {{ props.device?.is_fake ? '🎭 Тест' : '🔌 Реал' }}
      </el-tag>
    </div>

    <div class="form-scroll-wrapper">
      <el-form :model="localSettings" label-position="top" size="small" class="compact-form" ref="formRef">

        <!-- БЛОК 1: Напряжение -->
        <el-divider content-position="left" class="compact-divider">
          <el-icon><Lightning /></el-icon> Питание
        </el-divider>

        <el-form-item label="Крит. напряжение (В)" :error="validationErrors?.critical_voltage?.[0]" class="compact-item">
          <el-input-number
              v-model="localSettings.critical_voltage"
              :min="voltageRules.critical_voltage.min" :max="voltageRules.critical_voltage.max" :step="voltageRules.critical_voltage.step"
              :precision="2" :disabled="!voltageRules.critical_voltage.enabled"
              controls-position="right" class="full-width compact-input"
              ref="criticalVoltageInput"
              @change="(val) => handleFieldChange('critical_voltage', val, voltageRules.critical_voltage.min, voltageRules.critical_voltage.max)"
              @input="clearFieldError('critical_voltage')"
          />
          <div class="form-tip" v-if="voltageRules.critical_voltage.enabled">Минимальное напряжение для отключения</div>
          <div class="form-tip disabled-tip" v-else>Не применимо</div>
        </el-form-item>

        <!-- БЛОК 2: Спящий режим -->
        <el-divider content-position="left" class="compact-divider">
          <el-icon><Moon /></el-icon> Спящий режим
        </el-divider>

        <el-form-item label="Интервал сна (сек)" :error="validationErrors?.sleep_interval?.[0]" class="compact-item">
          <el-input-number
              v-model="localSettings.sleep_interval" :min="60" :max="86400" :step="60"
              controls-position="right" class="full-width compact-input"
              ref="sleepIntervalInput"
              @change="(val) => handleFieldChange('sleep_interval', val, 60, 86400)"
              @input="clearFieldError('sleep_interval')"
          />
          <div class="form-tip">Через сколько секунд уходить в сон</div>
        </el-form-item>

        <el-form-item label="Аварийный интервал (сек)" :error="validationErrors?.emergency_sleep_interval?.[0]" class="compact-item">
          <el-input-number
              v-model="localSettings.emergency_sleep_interval" :min="300" :max="86400" :step="300"
              controls-position="right" class="full-width compact-input"
              ref="emergencyIntervalInput"
              @change="(val) => handleFieldChange('emergency_sleep_interval', val, 300, 86400)"
              @input="clearFieldError('emergency_sleep_interval')"
          />
          <div class="form-tip">Сон при критическом разряде</div>
        </el-form-item>

        <!-- БЛОК 3: Типы устройств -->
        <el-divider content-position="left" class="compact-divider">
          <el-icon><Setting /></el-icon> Типы
        </el-divider>

        <el-form-item label="Тип батареи" class="compact-item">
          <el-select v-model="localSettings.battery_type_id" class="full-width compact-select"
                     :loading="!typesStore.typesLoaded" :disabled="!typesStore.typesLoaded" size="small">
            <el-option v-for="type in batteryTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="Тип лампы" class="compact-item">
          <el-select v-model="localSettings.bulb_type_id" class="full-width compact-select"
                     :loading="!typesStore.typesLoaded" :disabled="!typesStore.typesLoaded" size="small">
            <el-option v-for="type in bulbTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>

        <!-- БЛОК 4: Группировка батарей -->
        <el-divider content-position="left" class="compact-divider">
          <el-icon><Connection /></el-icon> Группировка
        </el-divider>

        <el-form-item label="Включить" class="compact-item">
          <el-switch v-model="localSettings.battery_group_config.enabled" size="small"
                     active-text="Вкл" inactive-text="Выкл" @change="handleGroupConfigChange" />
        </el-form-item>

        <el-form-item v-if="localSettings.battery_group_config.enabled" label="Тип соединения"
                      :error="validationErrors?.['battery_group_config.type']?.[0]" class="compact-item">
          <el-select v-model="localSettings.battery_group_config.type" class="full-width compact-select" size="small"
                     @input="clearFieldError('battery_group_config.type')">
            <el-option label="Последовательная" value="series" />
            <el-option label="Параллельная" value="parallel" />
            <el-option label="Посл.-параллельная" value="series_parallel" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="localSettings.battery_group_config.enabled" label="Количество"
                      :error="validationErrors?.['battery_group_config.count']?.[0]" class="compact-item">
          <el-input-number
              v-model="localSettings.battery_group_config.count"
              :min="1" :max="15" :step="1"
              controls-position="right" class="full-width compact-input"
              ref="groupCountInput"
              @change="(val) => handleFieldChange('battery_group_config.count', val, 1, 15)"
              @input="clearFieldError('battery_group_config.count')"
          />
        </el-form-item>

        <!-- Кнопки действий -->
        <el-form-item class="compact-actions">
          <el-button type="primary" @click="handleSave" :loading="loading" class="full-width compact-button" size="small">
            Сохранить
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { ElNotification } from 'element-plus';
import { Lightning, Moon, Setting, Connection } from '@element-plus/icons-vue';
import { useDeviceStore, useTypesStore } from '@/components/SmartLight/stores/index.js';
import { normalizeValidationErrorsUtils } from '@/components/SmartLight/utils/appFormattersUtils.js';
import { validateDeviceSettingsUtils } from '@/components/SmartLight/utils/appValidatorsUtils.js';
import useBoundaryHint from '@/components/SmartLight/composables/useBoundaryHint.js';

const props = defineProps({ device: { type: Object, required: true }, settings: { type: Object, default: null } });
const emit = defineEmits(['saved', 'close', 'update:settings']);

const deviceStore = useDeviceStore();
const typesStore = useTypesStore();
const formRef = ref(null);
const loading = ref(false);
const validationErrors = ref({});

const { registerInput, handleInputChange, triggerBoundaryHint, clearHints } = useBoundaryHint();

const criticalVoltageInput = ref(null);
const sleepIntervalInput = ref(null);
const emergencyIntervalInput = ref(null);
const groupCountInput = ref(null);

const localSettings = ref({
  critical_voltage: 3.0, sleep_interval: 600, emergency_sleep_interval: 3600,
  battery_type_id: 'li-ion-18650', bulb_type_id: 'classic',
  battery_group_config: { enabled: false, type: 'series', count: 1 }
});

const batteryTypes = computed(() => typesStore.batteryTypesForDropdownStore || []);
const bulbTypes = computed(() => typesStore.bulbTypesForDropdownStore || []);

const voltageRules = computed(() => {
  const batteryType = typesStore.getBatteryTypeByIdStore(localSettings.value.battery_type_id);
  const minV = batteryType?.specs?.minVoltage || 2.5;
  const maxV = batteryType?.specs?.maxVoltage || 4.3;
  return { critical_voltage: { min: minV, max: maxV, step: 0.1, enabled: true } };
});

watch(() => props.device, (newDevice) => {
  if (newDevice?.form_settings) {
    // ✅ Берём ВСЕ настройки из единого источника
    localSettings.value = {
      critical_voltage: newDevice.form_settings.critical_voltage ?? 3.0,
      sleep_interval: newDevice.form_settings.sleep_interval ?? 600,
      emergency_sleep_interval: newDevice.form_settings.emergency_sleep_interval ?? 3600,
      battery_type_id: newDevice.form_settings.battery_type_id ?? 'li-ion-18650',
      bulb_type_id: newDevice.form_settings.bulb_type_id ?? 'classic',
      power_supply_id: newDevice.form_settings.power_supply_id ?? 'standard',
      battery_group_config: newDevice.form_settings.battery_group_config ?? { enabled: false, type: 'series', count: 1 },
      // Дополнительные настройки из JSON
      ...Object.fromEntries(
          Object.entries(newDevice.form_settings).filter(
              ([key]) => !['critical_voltage','sleep_interval','emergency_sleep_interval','battery_type_id','bulb_type_id','power_supply_id','battery_group_config'].includes(key)
          )
      ),
    };
  }
}, { immediate: true });

const clearFieldError = (field) => { if (validationErrors.value?.[field]) delete validationErrors.value[field]; };

const handleFieldChange = (field, val, min, max) => {
  clearFieldError(field);
  clearHints(field);
  handleInputChange(field, val, min, max);
};

const handleGroupConfigChange = (enabled) => {
  if (!enabled) {
    localSettings.value.battery_group_config.type = 'series';
    localSettings.value.battery_group_config.count = 1;
    clearFieldError('battery_group_config.type');
    clearFieldError('battery_group_config.count');
  }
};

const handleSave = async () => {
  loading.value = true;
  validationErrors.value = {};

  try {
    const validation = validateDeviceSettingsUtils(props.device.device_id, localSettings.value, typesStore);
    if (!validation.valid) {
      validationErrors.value = normalizeValidationErrorsUtils(
          validation.errors.reduce((acc, err, idx) => {
            const fieldMatch = err.match(/(?:Критическое напряжение|Интервал сна|Аварийный интервал|Тип аккумулятора|Тип лампы|Количество аккумуляторов)/i);
            const field = fieldMatch ? fieldMatch[0].toLowerCase().replace(/[^a-zа-яё0-9]/g, '_') : `field_${idx}`;
            acc[field] = [err];
            return acc;
          }, {})
      );
      ElNotification({ title: 'Ошибка валидации', message: validation.errors[0], type: 'warning', duration: 3000 });
      loading.value = false;
      return false;
    }

    const response = await deviceStore.updateDeviceSettingsStore(props.device.device_id, localSettings.value);
    if (response?.success) {
      ElNotification({ title: 'Успех', message: 'Настройки сохранены на сервере', type: 'success', duration: 2000 });
      emit('saved', response.data);
      return true;
    } else {
      validationErrors.value = normalizeValidationErrorsUtils(response?.errors || {});
      throw new Error(response?.message || 'Ошибка валидации');
    }
  } catch (err) {
    ElNotification({ title: 'Ошибка', message: err.message || 'Не удалось сохранить', type: 'error', duration: 3000 });
    emit('close');
    return false;
  } finally {
    loading.value = false;
  }
};

watch(() => localSettings.value, (newVal) => emit('update:settings', newVal), { deep: true });

onMounted(() => {
  if (criticalVoltageInput.value) registerInput('critical_voltage', criticalVoltageInput.value);
  if (sleepIntervalInput.value) registerInput('sleep_interval', sleepIntervalInput.value);
  if (emergencyIntervalInput.value) registerInput('emergency_sleep_interval', emergencyIntervalInput.value);
  if (groupCountInput.value) registerInput('battery_group_config.count', groupCountInput.value);
});
</script>

<style scoped>
.device-settings-form { padding: 4px 2px; font-size: 10px; }

/* ✅ Компактный хедер */
.form-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  padding: 4px 6px;
  background: #f5f7fa;
  border-radius: 4px;
}
.device-name {
  font-size: 10px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.device-type-badge {
  flex-shrink: 0;
  font-size: 9px;
  padding: 2px 6px;
}

/* ✅ Scroll Wrapper */
.form-scroll-wrapper {
  max-height: 420px;
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

/* === Switch === */
:deep(.compact-item .el-switch) { transform: scale(0.85); margin-left: 2px; }
:deep(.compact-item .el-switch__core) { width: 28px; height: 14px; }
:deep(.compact-item .el-switch__label) { font-size: 8px; }

/* === Form Tips === */
.form-tip { font-size: 8px; color: #909399; margin-top: 2px; line-height: 1.2; padding-left: 2px; }
.form-tip.disabled-tip { color: #c0c4cc; font-style: italic; }

/* === Actions === */
:deep(.compact-actions) { margin-bottom: 0; margin-top: 6px; }
:deep(.compact-actions .el-button) { font-size: 10px; padding: 4px 8px; height: 24px; }

/* === Error States === */
:deep(.el-form-item.is-error .el-input__wrapper), :deep(.el-form-item.is-error .el-select__wrapper) { box-shadow: 0 0 0 1px #f56c6c inset; }

/* === Boundary Hint === */
:deep(.boundary-hint) {
  position: absolute; right: 0; background: #fef0f0; border: 1px solid #f56c6c; border-radius: 4px;
  padding: 4px 8px; font-size: 9px; color: #f56c6c; font-weight: 500; white-space: nowrap; z-index: 1000;
  pointer-events: none; box-shadow: 0 2px 8px rgba(0,0,0,0.1); animation: fadeInHint 0.15s ease;
}
:deep(.boundary-hint--min) { bottom: -26px; background: #fdf6ec; border-color: #e6a23c; color: #e6a23c; }
:deep(.boundary-hint--max) { top: -26px; }
@keyframes fadeInHint { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeOutHint { from { opacity: 1; } to { opacity: 0; } }

/* === Mobile === */
@media (max-width: 480px) {
  :deep(.boundary-hint) { font-size: 8px; padding: 3px 6px; max-width: 200px; white-space: normal; }
  :deep(.boundary-hint--min) { bottom: -32px; } :deep(.boundary-hint--max) { top: -32px; }
}

.full-width { width: 100%; }
</style>
