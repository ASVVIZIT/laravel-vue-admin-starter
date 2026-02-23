<template>
  <el-dialog
      v-model="localVisible"
      :title="editingCompany ? COMPANY_FORM_MESSAGES.TITLE_EDIT : COMPANY_FORM_MESSAGES.TITLE_CREATE"
      :width="COMPANY_FORM_UI.DIALOG_WIDTH"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="company-form-dialog"
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
            :disabled="props.loading"
            show-word-limit
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
            prop="settings.icon"
            class="form-item-inline"
        >
          <el-select
              v-model="formData.settings.icon"
              :placeholder="COMPANY_FORM_FIELDS.ICON.placeholder"
              :clearable="COMPANY_FORM_FIELDS.ICON.clearable"
              filterable
              class="icon-select"
          >
            <el-option
                v-for="icon in props.iconOptions"
                :key="icon.value"
                :label="icon.label"
                :value="icon.value"
            >
                            <span class="icon-option">
                                <el-icon :size="14" color="#409EFF">
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
            :disabled="props.loading"
            :maxlength="COMPANY_FORM_FIELDS.DESCRIPTION.maxLength"
            show-word-limit
        />
      </el-form-item>

      <el-form-item
          :label="getFieldLabel('address', 'company')"
          prop="address"
      >
        <el-input
            v-model="formData.address"
            :placeholder="COMPANY_FORM_FIELDS.ADDRESS.placeholder"
            :disabled="props.loading"
            :maxlength="COMPANY_FORM_FIELDS.ADDRESS.maxLength"
            show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button
            @click="handleCancel"
            :disabled="props.loading"
        >
          {{ COMPANY_FORM_MESSAGES.CANCEL }}
        </el-button>
        <el-button
            type="primary"
            @click="handleSubmit"
            :loading="props.loading"
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
import {
  COMPANY_FORM_PROPS_CONFIG,
  COMPANY_FORM_UI,
  COMPANY_FORM_FIELDS,
  COMPANY_FORM_MESSAGES,
  getDefaultCompanyFormValidation,
  getInitialCompanyFormState,
} from '../../utils/appConfig.js';
import { getFieldLabel } from '../../utils/fieldLabels.js';

const props = defineProps(COMPANY_FORM_PROPS_CONFIG);

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref(null);

const localVisible = computed({
  get: () => props.visible,
  set: (val) => {
    console.log('[CompanyForm] localVisible: SET', val);
    emit('update:visible', val);
  },
});

const editingCompany = computed(() => props.company);
const formRules = getDefaultCompanyFormValidation();
const initialState = getInitialCompanyFormState();

const formData = ref({
  ...initialState.formData,
});

const getIconComponent = (iconKey) => {
  if (!props.iconMap || !iconKey) return null;
  return props.iconMap[iconKey];
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
        icon: newVal.settings?.icon || '',
      },
    };
  } else {
    formData.value = {
      ...initialState.formData,
    };
  }
}, { immediate: true });

const handleCancel = () => {
  console.log('[CompanyForm] handleCancel');
  emit('update:visible', false);
};

const handleSubmit = async () => {
  console.log('[CompanyForm] handleSubmit: START');

  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    console.log('[CompanyForm] handleSubmit: VALIDATE', { valid });
    if (valid) {
      console.log('[CompanyForm] handleSubmit: EMIT SUBMIT', formData.value);
      emit('submit', formData.value);
    } else {
      console.warn('[CompanyForm] handleSubmit: VALIDATION FAILED');
      ElMessage.warning(COMPANY_FORM_MESSAGES.FIELD_REQUIRED(getFieldLabel('name', 'company')));
    }
  });
};
</script>

<style scoped>
.company-form-dialog :deep(.el-dialog__body) {
  padding: v-bind('COMPANY_FORM_UI.DIALOG_BODY_PADDING');
}

.company-form-dialog :deep(.el-form-item) {
  margin-bottom: v-bind('COMPANY_FORM_UI.FORM_ITEM_MARGIN_BOTTOM');
}

.company-form-dialog :deep(.el-form-item__label) {
  font-size: v-bind('COMPANY_FORM_UI.FORM_LABEL_FONT_SIZE');
  font-weight: v-bind('COMPANY_FORM_UI.FORM_LABEL_FONT_WEIGHT');
  color: v-bind('COMPANY_FORM_UI.FORM_LABEL_COLOR');
  margin-bottom: v-bind('COMPANY_FORM_UI.FORM_LABEL_MARGIN_BOTTOM');
}

.company-form-dialog :deep(.el-input__wrapper),
.company-form-dialog :deep(.el-textarea__inner) {
  font-size: v-bind('COMPANY_FORM_UI.FORM_INPUT_FONT_SIZE');
}

.company-form-dialog :deep(.el-textarea__inner) {
  resize: vertical;
  min-height: v-bind('COMPANY_FORM_UI.FORM_TEXTAREA_MIN_HEIGHT');
}

.form-row-inline {
  display: flex;
  align-items: flex-start;
  gap: v-bind('COMPANY_FORM_UI.FORM_ROW_GAP');
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

.id-input :deep(.el-input__wrapper) {
  background-color: v-bind('COMPANY_FORM_UI.FORM_ID_INPUT_BACKGROUND');
}

.id-input :deep(.el-input__inner) {
  color: v-bind('COMPANY_FORM_UI.FORM_ID_INPUT_COLOR');
  font-weight: v-bind('COMPANY_FORM_UI.FORM_ID_INPUT_FONT_WEIGHT');
}

.icon-select {
  width: 100%;
}

.icon-select :deep(.el-select__wrapper) {
  height: v-bind('COMPANY_FORM_UI.FORM_SELECT_HEIGHT');
}

.icon-option {
  display: flex;
  align-items: center;
  gap: v-bind('COMPANY_FORM_UI.FORM_ICON_OPTION_GAP');
  line-height: 1;
}

.icon-option :deep(.el-icon) {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-select-dropdown__item) {
  padding: v-bind('COMPANY_FORM_UI.FORM_DROPDOWN_ITEM_PADDING');
}

:deep(.el-select-dropdown__item.selected) {
  color: #409EFF;
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: v-bind('COMPANY_FORM_UI.FORM_FOOTER_GAP');
}

.dialog-footer .el-button {
  min-width: v-bind('COMPANY_FORM_UI.FORM_FOOTER_BUTTON_MIN_WIDTH');
}
</style>
