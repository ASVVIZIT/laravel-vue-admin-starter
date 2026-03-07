<template>
  <el-dialog
      v-model="localVisible"
      :title="settingsConfig.TITLE"
      :width="SETTINGS_MODAL_ENTITY_UI.DIALOG_WIDTH"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="settings-modal-entity"
      :show-close="true"
      :destroy-on-close="true"
  >
    <el-form
        ref="formRef"
        :model="localSettings"
        label-width="50%"
        size="small"
    >
      <!-- ✅ ГЕНЕРАЦИЯ ПОЛЕЙ ИЗ КОНФИГА -->
      <el-form-item
          v-for="(field, fieldKey) in settingsConfig.FIELDS"
          :key="fieldKey"
          :label="field.label"
          :prop="field.key"
          class="settings-form-item"
      >
        <el-tooltip
            :content="field.tooltip"
            placement="top"
            :show-after="TIMINGS.TOOLTIP_DELAY"
            :hide-after="TIMINGS.TOOLTIP_HIDE_DELAY"
        >
          <div class="field-content-wrapper">
            <!-- ✅ VALUE WRAPPER — ICON + INPUT В ОДНОЙ СТРОКЕ -->
            <div class="field-value-wrapper">
              <!-- ✅ ICON — СЛЕВА ОТ INPUT -->
              <el-icon
                  v-if="field.icon"
                  :size="SETTINGS_MODAL_ENTITY_UI.ICON_SIZE"
                  :color="COLORS.INFO"
                  class="field-value-icon"
                  :title="field.tooltip"
              >
                <component :is="getIconComponent(field.icon)" />
              </el-icon>

              <!-- ✅ SELECT -->
              <el-select
                  v-if="field.type === SETTINGS_FIELD_TYPES.SELECT"
                  v-model="localSettings[field.key]"
                  :placeholder="field.label"
                  class="settings-select"
                  :disabled="props.isSaving"
                  size="small"
              >
                <el-option
                    v-for="option in field.options"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                />
              </el-select>

              <!-- ✅ NUMBER -->
              <el-input-number
                  v-else-if="field.type === SETTINGS_FIELD_TYPES.NUMBER"
                  v-model="localSettings[field.key]"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step || 1"
                  class="settings-number"
                  :disabled="props.isSaving"
                  size="small"
              />

              <!-- ✅ SWITCH -->
              <el-switch
                  v-else-if="field.type === SETTINGS_FIELD_TYPES.SWITCH"
                  v-model="localSettings[field.key]"
                  class="settings-switch"
                  :disabled="props.isSaving"
                  size="small"
              />

              <!-- ✅ CHECKBOX GROUP -->
              <div
                  v-else-if="field.type === SETTINGS_FIELD_TYPES.CHECKBOX_GROUP"
                  class="checkbox-group-wrapper"
              >
                <el-checkbox-group
                    v-model="localSettings[field.key]"
                    class="settings-checkbox-group"
                >
                  <el-checkbox
                      v-for="option in field.options"
                      :key="option.value"
                      :label="option.value"
                      :disabled="props.isSaving"
                      class="settings-checkbox"
                      size="small"
                  >
                    {{ option.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>

              <!-- ✅ TEXT INPUT -->
              <el-input
                  v-else-if="field.type === SETTINGS_FIELD_TYPES.TEXT"
                  v-model="localSettings[field.key]"
                  :placeholder="field.placeholder"
                  class="settings-input"
                  :disabled="props.isSaving"
                  size="small"
                  clearable
              />
            </div>

            <!-- ✅ HINT — ПОД VALUE (Info Icon + Текст) -->
            <div v-if="field.hint" class="field-hint-wrapper">
              <el-icon :size="10" :color="SETTINGS_MODAL_ENTITY_UI.HINT_COLOR" class="hint-icon">
                <InfoFilled />
              </el-icon>
              <span class="hint-text">{{ field.hint }}</span>
            </div>
          </div>
        </el-tooltip>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button
            type="warning"
            :icon="RefreshLeft"
            @click="handleReset"
            :disabled="props.isSaving"
            size="small"
        >
          {{ settingsConfig.BUTTONS.RESET }}
        </el-button>
        <el-button
            @click="handleCancel"
            :disabled="props.isSaving"
            size="small"
        >
          {{ settingsConfig.BUTTONS.CANCEL }}
        </el-button>
        <el-button
            type="primary"
            :icon="Check"
            @click="handleSave"
            :loading="props.isSaving"
            size="small"
        >
          {{ settingsConfig.BUTTONS.SAVE }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * ============================================================================
 * SETTINGS MODAL ENTITY — УНИВЕРСАЛЬНЫЙ КОМПОНЕНТ НАСТРОЕК СУЩНОСТЕЙ
 * ============================================================================
 * 📁 Путь: components/Common/SettingsModalEntity.vue
 * ✅ Используется: ChannelList.vue, CompanyList.vue
 * ✅ Безопасно менять — влияет только на форму настроек
 * ✅ Зависит от: config/common/appConfigSettingsModalEntity.js
 * ============================================================================
 */

import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Check, RefreshLeft, InfoFilled, DataLine, Document, Sort, Picture, View, Connection, CircleCheck, OfficeBuilding, Search } from '@element-plus/icons-vue';
import {
  getEntitySettingsConfig,
  getDefaultEntitySettings,
  loadEntitySettings,
  saveEntitySettings,
  resetEntitySettings,
  initializeVisibleColumnsOptions,
  initializeCompanyFilterOptions,
  SETTINGS_FIELD_TYPES,
  SETTINGS_MODAL_ENTITY_UI,
} from '@/components/ContactManagement/CompanyContactChannels/config/appConfigIndex.js';
import {
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
} from '@/components/ContactManagement/CompanyContactChannels/config/appConfigIndex.js';
import { useCompanyStore } from '@/components/ContactManagement/CompanyContactChannels/store/companyStore.js';

// ============================================================================
// PROPS
// ============================================================================
const props = defineProps({
  visible: { type: Boolean, default: false },
  entityType: { type: String, default: 'company', validator: v => ['company', 'channel'].includes(v) },
  isSaving: { type: Boolean, default: false },
});

// ============================================================================
// EMITS
// ============================================================================
const emit = defineEmits(['update:visible', 'save', 'cancel', 'reset']);

// ============================================================================
// STATE
// ============================================================================
const formRef = ref(null);
const localSettings = ref({});

const companyStore = useCompanyStore();

// ============================================================================
// ICON MAP — ВСЕ ИКОНКИ
// ============================================================================
const iconMap = {
  DataLine,
  Document,
  Sort,
  Picture,
  View,
  Connection,
  CircleCheck,
  OfficeBuilding,
  Search,
  InfoFilled,
};

function getIconComponent(iconName) {
  const icon = iconMap[iconName];
  return icon || null;
}

// ============================================================================
// COMPUTED
// ============================================================================
const localVisible = computed({
  get: () => props.visible,
  set: (val) => {
    emit('update:visible', val);
  },
});

const settingsConfig = computed(() => {
  const config = getEntitySettingsConfig(props.entityType);
  return config;
});

// ============================================================================
// WATCH
// ============================================================================
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadSettings();
  }
});

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  console.log('🔵 [SettingsModalEntity] Component mounted');
  initializeVisibleColumnsOptions(props.entityType);
});

// ============================================================================
// LOAD SETTINGS
// ============================================================================
function loadSettings() {
  // ✅ ИНИЦИАЛИЗИРУЕМ ОПЦИИ ВИДИМЫХ КОЛОНОК
  initializeVisibleColumnsOptions(props.entityType);

  // ✅ ИНИЦИАЛИЗИРУЕМ ОПЦИИ КОМПАНИЙ ДЛЯ ФИЛЬТРА (ДЛЯ КАНАЛОВ!)
  if (props.entityType === 'channel') {
    initializeCompanyFilterOptions(props.entityType, companyStore.allCompanies);
  }

  const defaults = getDefaultEntitySettings(props.entityType);
  const saved = loadEntitySettings(props.entityType);
  localSettings.value = { ...defaults, ...saved };

  console.log('🟢 [SettingsModalEntity] Settings loaded:', localSettings.value);
  console.log('🟢 [SettingsModalEntity] Fields:', settingsConfig.value.FIELDS);
}

// ============================================================================
// HANDLE SAVE
// ============================================================================
function handleSave() {
  console.log('🔵 [SettingsModalEntity] handleSave:', localSettings.value);

  const success = saveEntitySettings(props.entityType, localSettings.value);

  if (success) {
    emit('save', localSettings.value);
    ElMessage.success(settingsConfig.value.MESSAGES.SUCCESS);
    localVisible.value = false;
  } else {
    ElMessage.error('Ошибка сохранения настроек');
  }
}

// ============================================================================
// HANDLE CANCEL
// ============================================================================
function handleCancel() {
  console.log('🔵 [SettingsModalEntity] handleCancel');
  emit('cancel');
  localVisible.value = false;
}

// ============================================================================
// HANDLE RESET
// ============================================================================
async function handleReset() {
  console.log('🔵 [SettingsModalEntity] handleReset');

  try {
    await ElMessageBox.confirm(
        settingsConfig.value.MESSAGES.RESET_CONFIRM,
        'Подтверждение',
        {
          confirmButtonText: 'Да',
          cancelButtonText: 'Нет',
          type: 'warning',
        }
    );

    const success = resetEntitySettings(props.entityType);

    if (success) {
      localSettings.value = getDefaultEntitySettings(props.entityType);
      emit('reset', localSettings.value);
      ElMessage.success(settingsConfig.value.MESSAGES.RESET_SUCCESS);
    } else {
      ElMessage.error('Ошибка сброса настроек');
    }
  } catch (e) {
    console.log('🔵 [SettingsModalEntity] Reset cancelled');
  }
}
</script>

<style scoped>
/**
 * ============================================================================
 * STYLES
 * ============================================================================
 */
.settings-modal-entity :deep(.el-dialog__body) {
  padding: 20px;
}

.settings-modal-entity :deep(.el-dialog__header) {
  padding: 16px 20px !important;
  border-bottom: 1px solid #EBEEF5;
}

.settings-modal-entity :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* ============================================================================
   FORM ITEMS — 50% LABEL / 50% VALUE
   ============================================================================ */
.settings-form-item {
  margin-bottom: v-bind('SETTINGS_MODAL_ENTITY_UI.FIELD_GAP');
}

.settings-form-item :deep(.el-form-item__label) {
  font-size: v-bind('SETTINGS_MODAL_ENTITY_UI.LABEL_FONT_SIZE');
  font-weight: v-bind('SETTINGS_MODAL_ENTITY_UI.LABEL_FONT_WEIGHT');
  color: #606266;
  width: 50% !important;
  max-width: 50% !important;
  flex: 0 0 50% !important;
  text-align: left;
  padding-right: 8px;
}

.settings-form-item :deep(.el-form-item__content) {
  width: 50% !important;
  max-width: 50% !important;
  flex: 0 0 50% !important;
  margin-left: 0 !important;
}

/* ============================================================================
   FIELD CONTENT WRAPPER
   ============================================================================ */
.field-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

/* ============================================================================
   FIELD VALUE WRAPPER — ICON + INPUT В ОДНОЙ СТРОКЕ
   ============================================================================ */
.field-value-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  width: 100%;
}

/* ✅ ICON — СЛЕВА ОТ INPUT */
.field-value-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  cursor: help;
  transition: opacity v-bind('ANIMATIONS.TRANSITION_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

.field-value-icon:hover {
  opacity: 1;
}

.settings-select,
.settings-number,
.settings-switch,
.settings-slider,
.settings-input {
  flex: 1;
  width: 100%;
}

.settings-select :deep(.el-select) {
  width: 100%;
}

.settings-number :deep(.el-input-number) {
  width: 100%;
}

.settings-input :deep(.el-input) {
  width: 100%;
}

.settings-slider {
  padding: 10px 0;
}

/* ============================================================================
   HINT WRAPPER — Info Icon + Текст (ПОД VALUE!)
   ============================================================================ */
.field-hint-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-top: 2px;
  padding-left: calc(14px + 6px);
}

.hint-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.hint-text {
  flex: 1;
  font-size: v-bind('SETTINGS_MODAL_ENTITY_UI.HINT_FONT_SIZE');
  color: v-bind('SETTINGS_MODAL_ENTITY_UI.HINT_COLOR');
  line-height: v-bind('SETTINGS_MODAL_ENTITY_UI.HINT_LINE_HEIGHT');
  word-wrap: break-word;
}

/* ============================================================================
   CHECKBOX GROUP
   ============================================================================ */
.checkbox-group-wrapper {
  width: 100%;
  padding: 4px 0;
}

.settings-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: v-bind('SETTINGS_MODAL_ENTITY_UI.CHECKBOX_GAP');
  width: 100%;
}

.settings-checkbox {
  font-size: v-bind('SETTINGS_MODAL_ENTITY_UI.CHECKBOX_FONT_SIZE');
  flex: 0 0 auto;
  white-space: nowrap;
  margin-right: 0 !important;
}

.settings-checkbox :deep(.el-checkbox__label) {
  font-size: v-bind('SETTINGS_MODAL_ENTITY_UI.CHECKBOX_FONT_SIZE');
  color: #606266;
  line-height: 1.4;
  padding-left: 4px;
}

/* ============================================================================
   FOOTER
   ============================================================================ */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: v-bind('SETTINGS_MODAL_ENTITY_UI.BUTTON_GAP');
  padding-top: 12px;
}

.dialog-footer .el-button {
  min-width: v-bind('SETTINGS_MODAL_ENTITY_UI.BUTTON_MIN_WIDTH');
}

/* ============================================================================
   АДАПТИВ
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .settings-modal-entity :deep(.el-dialog) {
    width: v-bind('SETTINGS_MODAL_ENTITY_UI.DIALOG_WIDTH_MOBILE') !important;
  }

  .settings-form-item :deep(.el-form-item__label) {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
    margin-bottom: 8px !important;
  }

  .settings-form-item :deep(.el-form-item__content) {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  .field-hint-wrapper {
    padding-left: 0;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .settings-modal-entity :deep(.el-dialog) {
    width: v-bind('SETTINGS_MODAL_ENTITY_UI.DIALOG_WIDTH_SMALL') !important;
  }

  .dialog-footer {
    flex-direction: column;
  }

  .dialog-footer .el-button {
    width: 100%;
  }

  .field-hint-wrapper {
    padding-left: 0;
  }
}
</style>

<!-- ============================================================================
     GLOBAL STYLES — ЧЕКБОКСЫ 15px
     ============================================================================ -->
<style>
.settings-modal-entity .el-checkbox.el-checkbox--small {
  height: 15px !important;
  line-height: 15px !important;
  margin-right: 4px !important;
}

.settings-modal-entity .el-checkbox.el-checkbox--small .el-checkbox__label {
  font-size: 11px !important;
  line-height: 15px !important;
  padding-left: 4px !important;
}

.settings-modal-entity .el-checkbox.el-checkbox--small .el-checkbox__input {
  height: 15px !important;
  width: 15px !important;
}

.settings-modal-entity .el-checkbox.el-checkbox--small .el-checkbox__inner {
  height: 13px !important;
  width: 13px !important;
}

.settings-modal-entity .el-checkbox {
  margin-right: 4px !important;
}

.settings-modal-entity .el-checkbox-group {
  line-height: 15px !important;
}

/* ✅ ICON DISPLAY */
.settings-modal-entity .field-value-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* ✅ HINT DISPLAY */
.settings-modal-entity .field-hint-wrapper {
  display: flex !important;
  align-items: flex-start !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.settings-modal-entity .field-hint-wrapper .hint-text {
  display: inline !important;
  visibility: visible !important;
  opacity: 1 !important;
}
</style>
