<template>
  <el-dialog
      v-model="localVisible"
      :title="currentChannel ? CHANNEL_FORM_MESSAGES.TITLE_EDIT : CHANNEL_FORM_MESSAGES.TITLE_CREATE"
      :width="CHANNEL_FORM_UI.DIALOG_WIDTH"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="channel-form-dialog"
      :show-close="true"
      :destroy-on-close="true"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-width="CHANNEL_FORM_UI.LABEL_WIDTH"
        :label-position="CHANNEL_FORM_UI.LABEL_POSITION"
        :size="CHANNEL_FORM_UI.FORM_SIZE"
    >
      <!-- ✅ КОМПАНИЯ (ОБЯЗАТЕЛЬНО ПРИ СОЗДАНИИ) -->
      <el-form-item
          label="Компания"
          prop="company_id"
          v-if="!currentChannel"
      >
        <el-select
            v-model="formData.company_id"
            placeholder="Выберите компанию"
            :disabled="isFormDisabled || !props.companies?.length"
            filterable
            clearable
            class="form-select"
        >
          <el-option
              v-for="company in props.companies"
              :key="company.id"
              :label="company.name"
              :value="company.id"
          />
        </el-select>

        <!-- ✅ ПОДСКАЗКА ЕСЛИ КОМПАНИИ НЕ ЗАГРУЖЕНЫ -->
        <div v-if="!props.companies?.length" class="form-hint">
          ⚠️ Компании загружаются...
        </div>
      </el-form-item>

      <!-- ✅ TYPE -->
      <el-form-item
          :label="CHANNEL_FORM_FIELDS.TYPE.label"
          prop="type"
      >
        <el-select
            v-model="formData.type"
            :placeholder="CHANNEL_FORM_FIELDS.TYPE.placeholder"
            :disabled="isFormDisabled"
            class="form-select"
            @change="handleTypeChange"
        >
          <el-option
              v-for="option in channelTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
          />
        </el-select>
      </el-form-item>

      <!-- ✅ TITLE -->
      <el-form-item
          :label="CHANNEL_FORM_FIELDS.TITLE.label"
          prop="title"
      >
        <el-input
            v-model="formData.title"
            :placeholder="CHANNEL_FORM_FIELDS.TITLE.placeholder"
            :maxlength="CHANNEL_FORM_FIELDS.TITLE.maxLength"
            :disabled="isFormDisabled"
            show-word-limit
            :clearable="true"
        />
      </el-form-item>

      <!-- ✅ DESCRIPTION -->
      <el-form-item
          :label="CHANNEL_FORM_FIELDS.DESCRIPTION.label"
          prop="description"
      >
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="CHANNEL_FORM_FIELDS.DESCRIPTION.rows"
            :placeholder="CHANNEL_FORM_FIELDS.DESCRIPTION.placeholder"
            :disabled="isFormDisabled"
            :maxlength="CHANNEL_FORM_FIELDS.DESCRIPTION.maxLength"
            show-word-limit
            :resize="CHANNEL_FORM_UI.FORM_TEXTAREA_RESIZE || 'vertical'"
        />
      </el-form-item>

      <!-- ✅ LOGO URL -->
      <el-form-item
          :label="CHANNEL_FORM_FIELDS.LOGO_URL.label"
          prop="logo_url"
      >
        <el-input
            v-model="formData.logo_url"
            :placeholder="CHANNEL_FORM_FIELDS.LOGO_URL.placeholder"
            :disabled="isFormDisabled"
            :clearable="true"
        />
      </el-form-item>

      <!-- ✅ URL -->
      <el-form-item
          :label="CHANNEL_FORM_FIELDS.URL.label"
          prop="url"
          v-if="showUrlField"
      >
        <el-input
            v-model="formData.url"
            :placeholder="CHANNEL_FORM_FIELDS.URL.placeholder"
            :disabled="isFormDisabled"
            :clearable="true"
        />
      </el-form-item>

      <!-- ✅ IDENTIFIER -->
      <el-form-item
          :label="CHANNEL_FORM_FIELDS.IDENTIFIER.label"
          prop="identifier"
          v-if="showIdentifierField"
      >
        <el-input
            v-model="formData.identifier"
            :placeholder="CHANNEL_FORM_FIELDS.IDENTIFIER.placeholder"
            :disabled="isFormDisabled"
            :maxlength="CHANNEL_FORM_FIELDS.IDENTIFIER.maxLength"
            :clearable="true"
        />
      </el-form-item>

      <!-- ✅ METADATA (JSON) -->
      <el-form-item
          :label="CHANNEL_FORM_FIELDS.METADATA.label"
          prop="metadata"
          v-if="showMetadataField"
      >
        <el-input
            v-model="metadataString"
            type="textarea"
            :rows="3"
            placeholder="JSON метаданные"
            :disabled="isFormDisabled"
            @blur="parseMetadata"
        />
        <div class="form-hint">Например: {"coordinates": {"lat": 55.75, "lng": 37.61}}</div>
      </el-form-item>

      <!-- ✅ ORDER COLUMN -->
      <el-form-item
          :label="CHANNEL_FORM_FIELDS.ORDER_COLUMN.label"
          prop="order_column"
      >
        <el-input-number
            v-model="formData.order_column"
            :min="0"
            :disabled="isFormDisabled"
            controls-position="right"
        />
      </el-form-item>

      <!-- ✅ IS ACTIVE -->
      <el-form-item
          :label="CHANNEL_FORM_FIELDS.IS_ACTIVE.label"
          prop="is_active"
      >
        <el-switch
            v-model="formData.is_active"
            :disabled="isFormDisabled"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button
            @click="handleCancel"
            :disabled="isFormDisabled"
        >
          {{ CHANNEL_FORM_MESSAGES.CANCEL }}
        </el-button>
        <el-button
            type="primary"
            @click="handleSubmit"
            :loading="isFormLoading"
        >
          {{ currentChannel ? CHANNEL_FORM_MESSAGES.SUBMIT_EDIT : CHANNEL_FORM_MESSAGES.SUBMIT_CREATE }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
/**
 * ============================================================================
 * CHANNEL FORM — ФОРМА СОЗДАНИЯ/РЕДАКТИРОВАНИЯ КАНАЛА
 * ============================================================================
 * 📁 Путь: components/Admin/ChannelForm.vue
 * ✅ Используется: ChannelList.vue
 * ✅ Безопасно менять — влияет только на форму канала
 * ============================================================================
 */

import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  CHANNEL_FORM_PROPS_CONFIG,
  CHANNEL_FORM_UI,
  CHANNEL_FORM_FIELDS,
  CHANNEL_FORM_MESSAGES,
  CHANNEL_FORM_FIELD_LABELS,
  CHANNEL_FORM_VALIDATION,
  getDefaultChannelFormValidation,
  getInitialChannelFormState,
  CHANNEL_TYPES,
  CHANNEL_TYPE_LABELS,
  CHANNEL_TYPE_FIELD_CONFIG,
  hasUrlField,
  hasIdentifierField,
  hasMetadataField,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
  validateField,
  validateUrlByType,
  validateIdentifierByType,
} from '@/components/ContactManagement/CompanyContactChannels/config/appConfigIndex.js';

// ============================================================================
// PROPS
// ============================================================================
const props = defineProps({
  ...CHANNEL_FORM_PROPS_CONFIG,
});

// ============================================================================
// EMITS
// ============================================================================
const emit = defineEmits(['update:visible', 'submit', 'cancel']);

// ============================================================================
// STATE
// ============================================================================
const formRef = ref(null);
const formData = ref(getInitialChannelFormState(props.companyId));
const metadataString = ref('');

// ============================================================================
// COMPUTED
// ============================================================================
const localVisible = computed({
  get: () => props.visible,
  set: (val) => {
    emit('update:visible', val);
  },
});

const currentChannel = computed(() => props.channel);

// ✅ ПРАВИЛА ВАЛИДАЦИИ (ИСПРАВЛЕНО!)
const formRules = computed(() => {
  const rules = getDefaultChannelFormValidation();

  // ✅ УБРАТЬ required для company_id при редактировании
  if (currentChannel.value) {
    delete rules.company_id;
  }

  // ✅ УБРАТЬ min валидацию для order_column (0 — валидное значение!)
  // Element Plus некорректно обрабатывает min: 0
  if (rules.order_column) {
    rules.order_column = rules.order_column.filter(rule => {
      // Оставляем type валидацию, убираем min
      return !rule.hasOwnProperty('min');
    });
  }

  return rules;
});

const isFormLoading = computed(() => {
  return props.loading;
});

const isFormDisabled = computed(() => {
  return isFormLoading.value || props.disabled;
});

const channelTypeOptions = Object.entries(CHANNEL_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// ✅ ПОЛЯ КОТОРЫЕ ПОКАЗЫВАЮТСЯ В ЗАВИСИМОСТИ ОТ ТИПА (ИСПОЛЬЗУЕМ КОНФИГ!)
const showUrlField = computed(() => {
  return hasUrlField(formData.value.type);
});

const showIdentifierField = computed(() => {
  return hasIdentifierField(formData.value.type);
});

const showMetadataField = computed(() => {
  return hasMetadataField(formData.value.type);
});

// ============================================================================
// WATCH — CHANNEL (ИСПРАВЛЕНО!)
// ============================================================================
watch(() => props.channel, (newVal) => {
  if (newVal) {
    formData.value = {
      company_id: newVal.company_id || null,
      type: newVal.type || '',
      title: newVal.title || '',
      description: newVal.description || '',
      logo_url: newVal.logo_url || '',
      url: newVal.url || '',
      identifier: newVal.identifier || '',
      metadata: newVal.metadata || {},
      order_column: newVal.order_column !== undefined ? newVal.order_column : 0,
      is_active: newVal.is_active !== undefined ? newVal.is_active : true,
    };

    // ✅ METADATA TO STRING
    if (newVal.metadata && typeof newVal.metadata === 'object') {
      metadataString.value = JSON.stringify(newVal.metadata, null, 2);
    } else {
      metadataString.value = '';
    }
  } else {
    formData.value = getInitialChannelFormState(props.companyId);
    metadataString.value = '';
  }
}, { immediate: true });

// ============================================================================
// HANDLE TYPE CHANGE
// ============================================================================
function handleTypeChange() {
  // Сбросить поля которые не нужны для нового типа
  if (!showUrlField.value) {
    formData.value.url = '';
  }
  if (!showIdentifierField.value) {
    formData.value.identifier = '';
  }
}

// ============================================================================
// PARSE METADATA
// ============================================================================
function parseMetadata() {
  if (!metadataString.value) {
    formData.value.metadata = {};
    return;
  }

  try {
    formData.value.metadata = JSON.parse(metadataString.value);
  } catch (e) {
    ElMessage.warning(CHANNEL_FORM_MESSAGES.METADATA_INVALID_JSON);
  }
}

// ============================================================================
// HANDLE CANCEL
// ============================================================================
function handleCancel() {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  emit('cancel');
  localVisible.value = false;
}

// ============================================================================
// CONVERT FIELD NAME TO HUMAN READABLE
// ============================================================================
function convertFieldName(fieldName) {
  const customNames = {
    'order_column': CHANNEL_FORM_FIELD_LABELS.ORDER_COLUMN,
    'orderColumn': CHANNEL_FORM_FIELD_LABELS.ORDER_COLUMN,
    'company_id': CHANNEL_FORM_FIELD_LABELS.COMPANY,
    'companyId': CHANNEL_FORM_FIELD_LABELS.COMPANY,
    'is_active': CHANNEL_FORM_FIELD_LABELS.IS_ACTIVE,
    'isActive': CHANNEL_FORM_FIELD_LABELS.IS_ACTIVE,
    'logo_url': CHANNEL_FORM_FIELD_LABELS.LOGO_URL,
    'logoUrl': CHANNEL_FORM_FIELD_LABELS.LOGO_URL,
  };

  if (customNames[fieldName]) {
    return customNames[fieldName];
  }

  // Конвертировать snake_case в читаемый формат
  return fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
}

// ============================================================================
// HANDLE SUBMIT (ИСПРАВЛЕНО!)
// ============================================================================
async function handleSubmit() {
  if (!formRef.value) return;

  // ✅ ПРОВЕРКА COMPANY_ID ПРИ СОЗДАНИИ
  if (!currentChannel.value && !formData.value.company_id) {
    ElMessage.warning('Выберите компанию');
    return;
  }

  try {
    await formRef.value.validate();

    // ✅ ДОБАВИТЬ ЛОГ — ЧТО ОТПРАВЛЯЕМ
    console.log('🔵 [ChannelForm] Submit data:', {
      company_id: formData.value.company_id,
      company_id_type: typeof formData.value.company_id,
      company_id_empty: formData.value.company_id === '' || formData.value.company_id === null || formData.value.company_id === undefined,
      order_column: formData.value.order_column,
      order_column_type: typeof formData.value.order_column,
      fullData: formData.value
    });

    const submitData = {
      ...formData.value,
      metadata: formData.value.metadata,
    };

    emit('submit', submitData);
  } catch (error) {
    const firstErrorField = Object.keys(error.fields || {})[0];

    if (firstErrorField) {
      const fieldLabelMap = {
        'company_id': CHANNEL_FORM_FIELD_LABELS.COMPANY,
        'companyId': CHANNEL_FORM_FIELD_LABELS.COMPANY,
        'type': CHANNEL_FORM_FIELD_LABELS.TYPE,
        'title': CHANNEL_FORM_FIELD_LABELS.TITLE,
        'description': CHANNEL_FORM_FIELD_LABELS.DESCRIPTION,
        'logo_url': CHANNEL_FORM_FIELD_LABELS.LOGO_URL,
        'logoUrl': CHANNEL_FORM_FIELD_LABELS.LOGO_URL,
        'url': CHANNEL_FORM_FIELD_LABELS.URL,
        'identifier': CHANNEL_FORM_FIELD_LABELS.IDENTIFIER,
        'metadata': CHANNEL_FORM_FIELD_LABELS.METADATA,
        'order_column': CHANNEL_FORM_FIELD_LABELS.ORDER_COLUMN,
        'orderColumn': CHANNEL_FORM_FIELD_LABELS.ORDER_COLUMN,
        'is_active': CHANNEL_FORM_FIELD_LABELS.IS_ACTIVE,
        'isActive': CHANNEL_FORM_FIELD_LABELS.IS_ACTIVE,
      };

      const fieldLabel = fieldLabelMap[firstErrorField]
          || convertFieldName(firstErrorField);

      const errorMessage = error.fields[firstErrorField]?.[0]?.message
          || CHANNEL_FORM_MESSAGES.FIELD_REQUIRED(fieldLabel);

      ElMessage.warning(errorMessage);
      console.log('🔴 [ChannelForm] Validation failed:', {
        field: firstErrorField,
        message: errorMessage
      });
    } else {
      ElMessage.warning('Проверьте правильность заполнения формы');
    }
  }
}
</script>

<style scoped>
/**
 * ============================================================================
 * STYLES
 * ============================================================================
 */
.channel-form-dialog :deep(.el-dialog__body) {
  padding: v-bind('CHANNEL_FORM_UI.DIALOG_BODY_PADDING');
}

.channel-form-dialog :deep(.el-dialog__header) {
  padding: v-bind('CHANNEL_FORM_UI.DIALOG_HEADER_PADDING') !important;
  border-bottom: 1px solid v-bind('CHANNEL_FORM_UI.DIALOG_HEADER_BORDER_COLOR');
}

.channel-form-dialog :deep(.el-dialog__title) {
  font-size: v-bind('CHANNEL_FORM_UI.DIALOG_TITLE_FONT_SIZE');
  font-weight: v-bind('CHANNEL_FORM_UI.DIALOG_TITLE_FONT_WEIGHT');
  color: v-bind('CHANNEL_FORM_UI.DIALOG_TITLE_COLOR');
}

/* ============================================================================
   FORM ITEMS
   ============================================================================ */
.channel-form-dialog :deep(.el-form-item) {
  margin-bottom: v-bind('CHANNEL_FORM_UI.FORM_ITEM_MARGIN_BOTTOM');
  transition: margin-bottom v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.channel-form-dialog :deep(.el-form-item__label) {
  font-size: v-bind('CHANNEL_FORM_UI.FORM_LABEL_FONT_SIZE');
  font-weight: v-bind('CHANNEL_FORM_UI.FORM_LABEL_FONT_WEIGHT');
  color: v-bind('CHANNEL_FORM_UI.FORM_LABEL_COLOR');
  margin-bottom: v-bind('CHANNEL_FORM_UI.FORM_LABEL_MARGIN_BOTTOM');
}

/* ============================================================================
   INPUT / SELECT / TEXTAREA
   ============================================================================ */
.channel-form-dialog :deep(.el-input__wrapper),
.channel-form-dialog :deep(.el-textarea__inner) {
  font-size: 13px;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.channel-form-dialog :deep(.el-input__wrapper:hover),
.channel-form-dialog :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.channel-form-dialog :deep(.el-input__wrapper.is-focus),
.channel-form-dialog :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

/* ============================================================================
   SELECT
   ============================================================================ */
.form-select {
  width: 100%;
}

/* ============================================================================
   HINT
   ============================================================================ */
.form-hint {
  font-size: 10px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.3;
}

/* ============================================================================
   FOOTER
   ============================================================================ */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: v-bind('CHANNEL_FORM_UI.FORM_FOOTER_GAP');
  padding-top: v-bind('CHANNEL_FORM_UI.FORM_FOOTER_PADDING_TOP');
}

.channel-form-dialog .dialog-footer .el-button {
  min-width: v-bind('CHANNEL_FORM_UI.FORM_FOOTER_BUTTON_MIN_WIDTH') !important;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.dialog-footer .el-button:hover:not(:disabled) {
  transform: scale(1.05);
}

/* ============================================================================
   ANIMATIONS
   ============================================================================ */
.channel-form-dialog :deep(.el-dialog) {
  animation: dialogFadeIn v-bind('TIMINGS.MODAL_ANIMATION') v-bind('ANIMATIONS.EASING_EASE_OUT');
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================================================
   ERRORS
   ============================================================================ */
.channel-form-dialog :deep(.el-form-item.is-error .el-input__wrapper),
.channel-form-dialog :deep(.el-form-item.is-error .el-textarea__inner) {
  box-shadow: 0 0 0 1px v-bind('COLORS.DANGER') inset !important;
}

.channel-form-dialog :deep(.el-form-item.is-success .el-input__wrapper) {
  box-shadow: 0 0 0 1px v-bind('COLORS.SUCCESS') inset !important;
}

/* ============================================================================
   АДАПТИВ
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .channel-form-dialog :deep(.el-dialog) {
    width: v-bind('CHANNEL_FORM_UI.DIALOG_WIDTH_MOBILE') !important;
  }

  .dialog-footer {
    flex-direction: column;
    gap: v-bind('CHANNEL_FORM_UI.FORM_FOOTER_GAP_MOBILE');
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}

@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .channel-form-dialog :deep(.el-dialog) {
    width: v-bind('CHANNEL_FORM_UI.DIALOG_WIDTH_SMALL') !important;
  }

  .channel-form-dialog :deep(.el-dialog__body) {
    padding: v-bind('CHANNEL_FORM_UI.DIALOG_BODY_PADDING_SMALL');
  }
}
</style>
