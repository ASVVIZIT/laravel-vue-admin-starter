<template>
  <el-dialog
      v-model="localVisible"
      :title="editingCompany ? COMPANY_FORM_MESSAGES.TITLE_EDIT : COMPANY_FORM_MESSAGES.TITLE_CREATE"
      :width="COMPANY_FORM_UI.DIALOG_WIDTH"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="company-form-dialog"
      :show-close="true"
      :destroy-on-close="true"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-width="COMPANY_FORM_UI.LABEL_WIDTH"
        :label-position="COMPANY_FORM_UI.LABEL_POSITION"
        :size="COMPANY_FORM_UI.FORM_SIZE"
    >
      <el-form-item
          :label="getFieldLabel('name', 'company')"
          prop="name"
      >
        <el-input
            v-model="formData.name"
            :placeholder="COMPANY_FORM_FIELDS.NAME.placeholder"
            :maxlength="COMPANY_FORM_FIELDS.NAME.maxLength"
            :disabled="isFormDisabled"
            show-word-limit
            :clearable="true"
        />
      </el-form-item>

      <div class="form-row-inline">
        <el-form-item
            v-if="editingCompany"
            :label="getFieldLabel('id', 'company')"
            prop="id"
            class="form-item-inline"
        >
          <el-input
              v-model="formData.id"
              disabled
              class="id-input"
          />
        </el-form-item>

        <el-form-item
            :label="getFieldLabel('settings.icon', 'company')"
            class="form-item-inline"
        >
          <el-select
              v-model="formData.settings.icon"
              :placeholder="COMPANY_FORM_FIELDS.ICON.placeholder"
              :clearable="COMPANY_FORM_FIELDS.ICON.clearable"
              filterable
              class="icon-select"
              @clear="onIconClear"
          >
            <el-option
                v-for="icon in props.iconOptions"
                :key="icon.value"
                :label="icon.label"
                :value="icon.value"
            >
              <span class="icon-option">
                <el-icon :size="COMPANY_TABLE_UI.ICON_SELECT_SIZE" :color="COLORS.PRIMARY">
                  <component :is="getIconComponent(icon.value)" />
                </el-icon>
                <span>{{ icon.label }}</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </div>

      <el-form-item
          :label="getFieldLabel('description', 'company')"
          prop="description"
      >
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="COMPANY_FORM_FIELDS.DESCRIPTION.rows"
            :placeholder="COMPANY_FORM_FIELDS.DESCRIPTION.placeholder"
            :disabled="isFormDisabled"
            :maxlength="COMPANY_FORM_FIELDS.DESCRIPTION.maxLength"
            show-word-limit
            :resize="COMPANY_FORM_UI.FORM_TEXTAREA_RESIZE || 'vertical'"
        />
      </el-form-item>

      <el-form-item
          :label="getFieldLabel('address', 'company')"
          prop="address"
      >
        <el-input
            v-model="formData.address"
            :placeholder="COMPANY_FORM_FIELDS.ADDRESS.placeholder"
            :disabled="isFormDisabled"
            :maxlength="COMPANY_FORM_FIELDS.ADDRESS.maxLength"
            show-word-limit
            :clearable="true"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button
            @click="handleCancel"
            :disabled="isFormDisabled"
        >
          {{ COMPANY_FORM_MESSAGES.CANCEL }}
        </el-button>
        <el-button
            type="primary"
            @click="handleSubmit"
            :loading="isFormLoading"
        >
          {{ editingCompany ? COMPANY_FORM_MESSAGES.SUBMIT_EDIT : COMPANY_FORM_MESSAGES.SUBMIT_CREATE }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useCompanyStore } from '@/components/ContactManagement/CompanyContactChannels/store/companyStore';
import {
  COMPANY_FORM_PROPS_CONFIG,
  COMPANY_FORM_UI,
  COMPANY_FORM_FILTERS_UI,
  COMPANY_FORM_FIELDS,
  COMPANY_FORM_MESSAGES,
  COMPANY_FORM_VALIDATION,
  getDefaultCompanyFormValidation,
  getInitialCompanyFormState,
  getFieldLabel,
  BREAKPOINTS,
  ANIMATIONS,
  TIMINGS,
  COLORS,
  COMPANY_TABLE_UI,
  EDITABLE_CELL_UI,
} from '../../config/appConfigIndex.js';

const companyStore = useCompanyStore();

const props = defineProps({...COMPANY_FORM_PROPS_CONFIG});

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref(null);

const localVisible = computed({
  get: () => props.visible,
  set: (val) => {
    emit('update:visible', val);
  },
});

const editingCompany = computed(() => props.company);
const formRules = getDefaultCompanyFormValidation();

const formData = ref(getInitialCompanyFormState());

const isUsingStore = computed(() => props.useStore && companyStore);

const isFormLoading = computed(() => {
  if (isUsingStore.value) {
    return companyStore.loading;
  }
  return props.loading;
});

const isFormDisabled = computed(() => {
  return isFormLoading.value || props.disabled;
});

const getIconComponent = (iconKey) => {
  if (!props.iconMap || !iconKey) return null;
  return props.iconMap[iconKey];
};

const onIconClear = () => {
  console.log('🎨 [CompanyForm] Icon cleared');
  formData.value.settings.icon = '';
};

watch(() => props.company, (newVal) => {
  console.log('[CompanyForm] watch company:', newVal);
  if (newVal) {
    formData.value = {
      id: newVal.id || '',
      name: newVal.name || '',
      description: newVal.description || '',
      address: newVal.address || '',
      settings: {
        icon: newVal.settings?.icon || newVal.icon || '',
      },
    };
  } else {
    formData.value = getInitialCompanyFormState();
  }
}, { immediate: true });

const handleCancel = () => {
  console.log('[CompanyForm] handleCancel');
  if (formRef.value) {
    formRef.value.resetFields();
  }
  emit('update:visible', false);
};

const handleSubmit = async () => {
  console.log('[CompanyForm] handleSubmit: START');
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    console.log('[CompanyForm] handleSubmit: VALIDATE', { valid });
    if (valid) {
      try {
        const submitData = {
          name: formData.value.name,
          description: formData.value.description,
          address: formData.value.address,
          settings: {
            icon: formData.value.settings?.icon || '',
          },
        };

        console.log('[CompanyForm] submitData:', submitData);

        if (isUsingStore.value) {
          if (editingCompany.value) {
            await companyStore.updateCompany(editingCompany.value.id, submitData);
            ElMessage.success(COMPANY_FORM_MESSAGES.SUCCESS_COMPANY_UPDATED);
          } else {
            await companyStore.createCompany(submitData);
            ElMessage.success(COMPANY_FORM_MESSAGES.SUCCESS_COMPANY_CREATED);
          }
          emit('update:visible', false);
        } else {
          console.log('[CompanyForm] EMIT SUBMIT:', submitData);
          emit('submit', submitData);
        }
      } catch (error) {
        console.error('[CompanyForm] handleSubmit: ERROR', error);
        if (isUsingStore.value && companyStore.error) {
          ElMessage.error(`Ошибка: ${companyStore.error}`);
        } else {
          ElMessage.error(`Ошибка сохранения: ${error.message}`);
        }
      }
    } else {
      console.warn('[CompanyForm] handleSubmit: VALIDATION FAILED');
      ElMessage.warning(COMPANY_FORM_MESSAGES.FIELD_REQUIRED(getFieldLabel('name', 'company')));
    }
  });
};
</script>

<style scoped>
/* ============================================================================
   DIALOG
   ============================================================================ */
.company-form-dialog :deep(.el-dialog__body) {
  padding: v-bind('COMPANY_FORM_UI.DIALOG_BODY_PADDING');
}

.company-form-dialog :deep(.el-dialog__header) {
  padding: v-bind('COMPANY_FORM_UI.DIALOG_HEADER_PADDING') !important;
  border-bottom: 1px solid v-bind('COMPANY_FORM_UI.DIALOG_HEADER_BORDER_COLOR');
}

.company-form-dialog :deep(.el-dialog__title) {
  font-size: v-bind('COMPANY_FORM_UI.DIALOG_TITLE_FONT_SIZE');
  font-weight: v-bind('COMPANY_FORM_UI.DIALOG_TITLE_FONT_WEIGHT');
  color: v-bind('COMPANY_FORM_UI.DIALOG_TITLE_COLOR');
}

/* ============================================================================
   FORM ITEMS
   ============================================================================ */
.company-form-dialog :deep(.el-form-item) {
  margin-bottom: v-bind('COMPANY_FORM_UI.FORM_ITEM_MARGIN_BOTTOM');
  transition: margin-bottom v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.company-form-dialog :deep(.el-form-item__label) {
  font-size: v-bind('COMPANY_FORM_UI.FORM_LABEL_FONT_SIZE');
  font-weight: v-bind('COMPANY_FORM_UI.FORM_LABEL_FONT_WEIGHT');
  color: v-bind('COMPANY_FORM_UI.FORM_LABEL_COLOR');
  margin-bottom: v-bind('COMPANY_FORM_UI.FORM_LABEL_MARGIN_BOTTOM');
}

/* ============================================================================
   INPUT / SELECT / TEXTAREA — DESKTOP
   ============================================================================ */
.company-form-dialog :deep(.el-input__wrapper),
.company-form-dialog :deep(.el-textarea__inner) {
  font-size: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_FONT_SIZE') !important;
  height: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_HEIGHT') !important;
  min-height: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_HEIGHT') !important;
  padding: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_PADDING') !important;
  border-radius: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_BORDER_RADIUS') !important;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.company-form-dialog :deep(.el-input__wrapper:hover),
.company-form-dialog :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.company-form-dialog :deep(.el-input__wrapper.is-focus),
.company-form-dialog :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px v-bind('COLORS.PRIMARY') inset;
}

.company-form-dialog :deep(.el-input__inner) {
  height: v-bind('COMPANY_FORM_FILTERS_UI.INNER_HEIGHT') !important;
  line-height: v-bind('COMPANY_FORM_FILTERS_UI.INNER_LINE_HEIGHT') !important;
  font-size: v-bind('COMPANY_FORM_FILTERS_UI.INNER_FONT_SIZE') !important;
}

.company-form-dialog :deep(.el-textarea__inner) {
  resize: vertical;
  min-height: v-bind('COMPANY_FORM_UI.FORM_TEXTAREA_MIN_HEIGHT');
  font-size: v-bind('COMPANY_FORM_FILTERS_UI.INNER_FONT_SIZE') !important;
}

/* ============================================================================
   ICON SELECT — DESKTOP
   ============================================================================ */
.company-form-dialog .icon-select :deep(.el-select__wrapper) {
  height: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_HEIGHT') !important;
  min-height: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_HEIGHT') !important;
  font-size: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_FONT_SIZE') !important;
  padding: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_PADDING') !important;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: v-bind('COMPANY_FORM_FILTERS_UI.ICON_OPTION_GAP');
  line-height: 1;
}

.icon-option :deep(.el-icon) {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ============================================================================
   DROPDOWN — DESKTOP
   ============================================================================ */
:deep(.el-select-dropdown__item) {
  padding: v-bind('COMPANY_FORM_FILTERS_UI.DROPDOWN_PADDING');
  height: v-bind('COMPANY_FORM_FILTERS_UI.DROPDOWN_HEIGHT') !important;
  line-height: v-bind('COMPANY_FORM_FILTERS_UI.DROPDOWN_LINE_HEIGHT') !important;
  font-size: v-bind('COMPANY_FORM_FILTERS_UI.DROPDOWN_FONT_SIZE') !important;
  transition: background-color v-bind('ANIMATIONS.TRANSITION_FAST') v-bind('ANIMATIONS.EASING_EASE');
}

:deep(.el-select-dropdown__item:hover) {
  background-color: v-bind('COMPANY_FORM_UI.FORM_DROPDOWN_HOVER_BACKGROUND');
}

:deep(.el-select-dropdown__item.selected) {
  color: v-bind('COLORS.PRIMARY');
  font-weight: 600;
  background-color: v-bind('COMPANY_FORM_UI.FORM_DROPDOWN_SELECTED_BACKGROUND');
}

/* ============================================================================
   FORM ROW
   ============================================================================ */
.form-row-inline {
  display: flex;
  align-items: flex-start;
  gap: v-bind('COMPANY_FORM_FILTERS_UI.ROW_GAP');
  margin-bottom: v-bind('COMPANY_FORM_UI.FORM_ROW_MARGIN_BOTTOM');
}

.form-item-inline {
  flex: 1;
  margin-bottom: 0 !important;
}

.form-item-inline :deep(.el-form-item__label) {
  font-size: v-bind('COMPANY_FORM_UI.FORM_LABEL_FONT_SIZE');
  font-weight: v-bind('COMPANY_FORM_UI.FORM_LABEL_FONT_WEIGHT');
  color: v-bind('COMPANY_FORM_UI.FORM_LABEL_COLOR');
  margin-bottom: v-bind('COMPANY_FORM_UI.FORM_LABEL_MARGIN_BOTTOM');
}

/* ============================================================================
   ID INPUT
   ============================================================================ */
.id-input :deep(.el-input__wrapper) {
  background-color: v-bind('COMPANY_FORM_UI.FORM_ID_INPUT_BACKGROUND');
  cursor: not-allowed;
}

.id-input :deep(.el-input__inner) {
  color: v-bind('COMPANY_FORM_UI.FORM_ID_INPUT_COLOR');
  font-weight: v-bind('COMPANY_FORM_UI.FORM_ID_INPUT_FONT_WEIGHT');
}

/* ============================================================================
   FOOTER — DESKTOP
   ============================================================================ */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: v-bind('COMPANY_FORM_UI.FORM_FOOTER_GAP');
  padding-top: v-bind('COMPANY_FORM_UI.FORM_FOOTER_PADDING_TOP');
}

.company-form-dialog .dialog-footer .el-button {
  min-width: v-bind('COMPANY_FORM_UI.FORM_FOOTER_BUTTON_MIN_WIDTH') !important;
  height: v-bind('COMPANY_FORM_FILTERS_UI.BUTTON_HEIGHT') !important;
  min-height: v-bind('COMPANY_FORM_FILTERS_UI.BUTTON_HEIGHT') !important;
  font-size: v-bind('COMPANY_FORM_FILTERS_UI.BUTTON_FONT_SIZE') !important;
  padding: v-bind('COMPANY_FORM_UI.BUTTON_PADDING') !important;
  transition: all v-bind('ANIMATIONS.TRANSITION_NORMAL') v-bind('ANIMATIONS.EASING_EASE');
}

.dialog-footer .el-button:hover:not(:disabled) {
  transform: scale(1.05);
}

/* ============================================================================
   ANIMATIONS
   ============================================================================ */
.company-form-dialog :deep(.el-dialog) {
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

.company-form-dialog :deep(.el-overlay) {
  animation: overlayFadeIn v-bind('TIMINGS.MODAL_ANIMATION') v-bind('ANIMATIONS.EASING_EASE');
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ============================================================================
   ERRORS — В SCOPED (для обёртки input)
   ============================================================================ */
.company-form-dialog :deep(.el-form-item.is-error .el-input__wrapper),
.company-form-dialog :deep(.el-form-item.is-error .el-textarea__inner) {
  box-shadow: 0 0 0 1px v-bind('EDITABLE_CELL_UI.ERROR_COLOR') inset !important;
}

.company-form-dialog :deep(.el-form-item.is-success .el-input__wrapper) {
  box-shadow: 0 0 0 1px v-bind('COLORS.SUCCESS') inset !important;
}

/* ============================================================================
   АДАПТИВ — XXXL (≤1920px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XXXL')) {
  .company-form-dialog :deep(.el-dialog) {
    width: v-bind('COMPANY_FORM_UI.DIALOG_WIDTH_TABLET') !important;
  }
  .form-row-inline {
    flex-direction: row;
    gap: v-bind('COMPANY_FORM_FILTERS_UI.ROW_GAP_TABLET');
  }
}

/* ============================================================================
   АДАПТИВ — XL (≤1400px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XL')) {
  .company-form-dialog :deep(.el-dialog) {
    width: v-bind('COMPANY_FORM_UI.DIALOG_WIDTH_MOBILE') !important;
    margin: 10px auto;
  }
  .form-row-inline {
    flex-direction: column;
    gap: v-bind('COMPANY_FORM_FILTERS_UI.ROW_GAP_MOBILE');
  }
  .form-item-inline {
    width: 100%;
  }
  .dialog-footer {
    flex-direction: column;
    gap: v-bind('COMPANY_FORM_UI.FORM_FOOTER_GAP_MOBILE');
  }
  .dialog-footer .el-button {
    width: 100%;
  }

  .company-form-dialog :deep(.el-input__wrapper),
  .company-form-dialog :deep(.el-textarea__inner) {
    height: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_HEIGHT_MOBILE') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_FONT_SIZE_MOBILE') !important;
  }

  .company-form-dialog :deep(.el-input__inner) {
    height: v-bind('COMPANY_FORM_FILTERS_UI.INNER_HEIGHT_MOBILE') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.INNER_FONT_SIZE_MOBILE') !important;
  }

  .company-form-dialog .icon-select :deep(.el-select__wrapper) {
    height: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_HEIGHT_MOBILE') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_FONT_SIZE_MOBILE') !important;
  }

  :deep(.el-select-dropdown__item) {
    height: v-bind('COMPANY_FORM_FILTERS_UI.DROPDOWN_HEIGHT_MOBILE') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.DROPDOWN_FONT_SIZE_MOBILE') !important;
  }

  .icon-option :deep(.el-icon) {
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.ICON_OPTION_FONT_SIZE_MOBILE');
  }
}

/* ============================================================================
   АДАПТИВ — XS (≤576px)
   ============================================================================ */
@media (max-width: v-bind('BREAKPOINTS.XS')) {
  .company-form-dialog :deep(.el-dialog) {
    width: v-bind('COMPANY_FORM_UI.DIALOG_WIDTH_SMALL') !important;
    margin: 5px auto;
  }
  .company-form-dialog :deep(.el-dialog__body) {
    padding: v-bind('COMPANY_FORM_UI.DIALOG_BODY_PADDING_SMALL');
  }
  .company-form-dialog :deep(.el-form-item__label) {
    font-size: v-bind('COMPANY_FORM_UI.FORM_LABEL_FONT_SIZE_SMALL');
  }

  .company-form-dialog :deep(.el-input__wrapper),
  .company-form-dialog :deep(.el-textarea__inner) {
    height: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_HEIGHT_SMALL') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_FONT_SIZE_SMALL') !important;
  }

  .company-form-dialog :deep(.el-input__inner) {
    height: v-bind('COMPANY_FORM_FILTERS_UI.INNER_HEIGHT_SMALL') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.INNER_FONT_SIZE_SMALL') !important;
  }

  :deep(.el-select-dropdown__item) {
    height: v-bind('COMPANY_FORM_FILTERS_UI.DROPDOWN_HEIGHT_SMALL') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.DROPDOWN_FONT_SIZE_SMALL') !important;
  }

  .icon-option :deep(.el-icon) {
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.ICON_OPTION_FONT_SIZE_SMALL');
  }

  .dialog-footer .el-button {
    min-width: auto;
    padding: 8px 12px;
  }
}

/* ============================================================================
   TOUCH DEVICES — ТОЛЬКО ЕСЛИ ЭКРАН МАЛЕНЬКИЙ (≤576px)
   ============================================================================ */
@media (hover: none) and (pointer: coarse) and (max-width: v-bind('BREAKPOINTS.XS')) {
  .company-form-dialog .dialog-footer .el-button {
    min-height: v-bind('COMPANY_FORM_FILTERS_UI.BUTTON_HEIGHT_TOUCH') !important;
    height: v-bind('COMPANY_FORM_FILTERS_UI.BUTTON_HEIGHT_TOUCH') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.BUTTON_FONT_SIZE_TOUCH') !important;
    padding: 10px 16px !important;
  }

  .company-form-dialog :deep(.el-input__wrapper),
  .company-form-dialog :deep(.el-textarea__inner) {
    height: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_HEIGHT_TOUCH') !important;
    min-height: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_HEIGHT_TOUCH') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_FONT_SIZE_TOUCH') !important;
  }

  .company-form-dialog :deep(.el-input__inner) {
    height: v-bind('COMPANY_FORM_FILTERS_UI.INNER_HEIGHT_TOUCH') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.INNER_FONT_SIZE_TOUCH') !important;
  }

  .company-form-dialog .icon-select :deep(.el-select__wrapper) {
    height: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_HEIGHT_TOUCH') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_FONT_SIZE_TOUCH') !important;
  }

  :deep(.el-select-dropdown__item) {
    height: v-bind('COMPANY_FORM_FILTERS_UI.DROPDOWN_HEIGHT_TOUCH') !important;
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.DROPDOWN_FONT_SIZE_TOUCH') !important;
  }

  .icon-option :deep(.el-icon) {
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.ICON_OPTION_FONT_SIZE_TOUCH');
  }

  .company-form-dialog :deep(.el-form-item__label) {
    font-size: v-bind('COMPANY_FORM_FILTERS_UI.WRAPPER_FONT_SIZE_TOUCH') !important;
  }
}
</style>

<style>
/* ============================================================================
   GLOBAL STYLES — DESKTOP (МАКСИМАЛЬНАЯ СПЕЦИФИЧНОСТЬ!)
   ============================================================================ */
.company-form-dialog .el-form-item--small .el-form-item__label {
  height: 14px !important;
  line-height: 14px !important;
  min-height: 14px !important;
  max-height: 14px !important;
  font-size: 14px !important;
  margin-bottom: 2px !important;
}

.company-form-dialog .el-form-item {
  /* margin-bottom удалено — используется из scoped styles */
}

.company-form-dialog .el-form-item .el-select .el-select__wrapper,
.company-form-dialog .icon-select .el-select__wrapper {
  height: 20px !important;
  min-height: 20px !important;
  max-height: 20px !important;
  font-size: 11px !important;
  padding: 0 6px !important;
}

.company-form-dialog .el-form-item .el-input__inner,
.company-form-dialog .icon-select .el-input__inner {
  height: 18px !important;
  font-size: 11px !important;
  line-height: 18px !important;
}

.company-form-dialog .el-button {
  height: 30px !important;
  min-height: 30px !important;
  font-size: 10px !important;
  padding: 5px 10px !important;
}

/* ============================================================================
   ERRORS — ГЛОБАЛЬНО (ПЕРЕБИВАЕМ ELEMENT PLUS!)
   ============================================================================ */
.company-form-dialog .el-form-item__error {
  color: #F56C6C !important;
  font-size: 10px !important;
  padding-top: 2px !important;
}

/* ============================================================================
   MOBILE (≤768px)
   ============================================================================ */
@media (max-width: 768px) {
  .company-form-dialog .el-form-item__label {
    height: 12px !important;
    line-height: 12px !important;
    font-size: 11px !important;
  }

  .company-form-dialog .el-form-item .el-select .el-select__wrapper,
  .company-form-dialog .icon-select .el-select__wrapper {
    height: 22px !important;
  }

  .company-form-dialog .el-button {
    height: 32px !important;
  }
}

/* ============================================================================
   TOUCH — ТОЛЬКО ЕСЛИ ЭКРАН МАЛЕНЬКИЙ (≤576px)
   ============================================================================ */
@media (hover: none) and (pointer: coarse) and (max-width: 576px) {
  .company-form-dialog .el-form-item .el-select .el-select__wrapper,
  .company-form-dialog .icon-select .el-select__wrapper {
    height: 32px !important;
    font-size: 14px !important;
  }

  .company-form-dialog .el-button {
    height: 36px !important;
  }
}
</style>
