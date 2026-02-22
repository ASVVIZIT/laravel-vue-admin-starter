<template>
  <el-dialog
      v-model="localVisible"
      :title="dialogTitle"
      :width="COMPANY_FORM_UI.DIALOG_WIDTH"
      :close-on-click-modal="false"
      :close-on-press-escape="!loading"
      :show-close="!loading"
      @closed="resetForm"
      @open="onDialogOpen"
      class="company-form-dialog"
  >
    <div v-if="isEditMode && company" class="company-info">
      <el-tag type="info" size="small" effect="plain">
        <el-icon><InfoFilled /></el-icon>
        ID: {{ company.id }}
      </el-tag>
      <span v-if="company.name" class="company-name">{{ company.name }}</span>
    </div>

    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-width="COMPANY_FORM_UI.LABEL_WIDTH"
        :label-position="COMPANY_FORM_UI.LABEL_POSITION"
        :size="COMPANY_FORM_UI.FORM_SIZE"
        :disabled="loading"
    >
      <el-form-item
          :label="COMPANY_FORM_FIELDS.NAME.label"
          :prop="COMPANY_FORM_FIELDS.NAME.key"
      >
        <el-input
            v-model="formData.name"
            :placeholder="COMPANY_FORM_FIELDS.NAME.placeholder"
            :maxlength="COMPANY_FORM_FIELDS.NAME.maxLength"
            show-word-limit
            clearable
            :disabled="loading"
        />
      </el-form-item>

      <el-form-item
          :label="COMPANY_FORM_FIELDS.DESCRIPTION.label"
          :prop="COMPANY_FORM_FIELDS.DESCRIPTION.key"
      >
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="COMPANY_FORM_FIELDS.DESCRIPTION.rows"
            :placeholder="COMPANY_FORM_FIELDS.DESCRIPTION.placeholder"
            :maxlength="COMPANY_FORM_FIELDS.DESCRIPTION.maxLength"
            show-word-limit
            clearable
            :disabled="loading"
        />
      </el-form-item>

      <el-form-item
          :label="COMPANY_FORM_FIELDS.ADDRESS.label"
          :prop="COMPANY_FORM_FIELDS.ADDRESS.key"
      >
        <el-input
            v-model="formData.address"
            :placeholder="COMPANY_FORM_FIELDS.ADDRESS.placeholder"
            :maxlength="COMPANY_FORM_FIELDS.ADDRESS.maxLength"
            show-word-limit
            clearable
            :disabled="loading"
        />
      </el-form-item>

      <el-form-item
          :label="COMPANY_FORM_FIELDS.ICON.label"
          :prop="COMPANY_FORM_FIELDS.ICON.key"
      >
        <el-select
            v-model="formData.settings.icon"
            :placeholder="COMPANY_FORM_FIELDS.ICON.placeholder"
            :clearable="COMPANY_FORM_FIELDS.ICON.clearable"
            :style="{ width: COMPANY_FORM_UI.ICON_SELECT_WIDTH }"
            :disabled="loading"
            class="icon-select"
        >
          <el-option
              v-for="icon in iconOptions"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
          >
            <span class="icon-option">
              <el-icon :size="16">
                <component :is="getIconComponent(icon.value)" />
              </el-icon>
              <span class="icon-label">{{ icon.label }}</span>
            </span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel" :disabled="loading">
          {{ COMPANY_FORM_MESSAGES.CANCEL }}
        </el-button>
        <el-button
            type="primary"
            @click="handleSubmit"
            :loading="loading"
        >
          {{ isEditMode ? COMPANY_FORM_MESSAGES.SUBMIT_EDIT : COMPANY_FORM_MESSAGES.SUBMIT_CREATE }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { InfoFilled } from '@element-plus/icons-vue';
import {
  COMPANY_FORM_PROPS_CONFIG,
  COMPANY_FORM_UI,
  COMPANY_FORM_FIELDS,
  COMPANY_FORM_MESSAGES,
  getDefaultCompanyFormValidation,
  getInitialCompanyFormState,
} from '../../utils/paginationOptions.js';
import { getIconComponentByName } from '../../utils/iconConfig.js';

const props = defineProps({
  visible: COMPANY_FORM_PROPS_CONFIG.visible,
  company: COMPANY_FORM_PROPS_CONFIG.company,
  loading: COMPANY_FORM_PROPS_CONFIG.loading,
  iconOptions: COMPANY_FORM_PROPS_CONFIG.iconOptions,
});

const emit = defineEmits(['update:visible', 'submit']);

const formRef = ref(null);
const localVisible = ref(props.visible);

const initialState = getInitialCompanyFormState();
const formData = reactive({
  name: initialState.formData.name,
  description: initialState.formData.description,
  address: initialState.formData.address,
  settings: {
    icon: initialState.formData.settings.icon,
  },
});

const isEditMode = computed(() => {
  return props.company !== null && props.company !== undefined;
});

const dialogTitle = computed(() => {
  return isEditMode.value
      ? COMPANY_FORM_MESSAGES.TITLE_EDIT
      : COMPANY_FORM_MESSAGES.TITLE_CREATE;
});

const formRules = computed(() => {
  return getDefaultCompanyFormValidation();
});

const getIconComponent = (iconName) => {
  if (!iconName) {
    return getIconComponentByName('el-icon-link');
  }
  return getIconComponentByName(iconName);
};

const populateForm = (company) => {
  formData.name = company.name || '';
  formData.description = company.description || '';
  formData.address = company.address || '';
  formData.settings = {
    icon: company.settings?.icon || '',
  };

  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate();
    }
  });
};

const resetFormData = () => {
  formData.name = '';
  formData.description = '';
  formData.address = '';
  formData.settings = {
    icon: '',
  };
};

const onDialogOpen = () => {
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

const resetForm = () => {
  resetFormData();
  if (formRef.value) {
    formRef.value.clearValidate();
  }
  emit('update:visible', false);
};

const handleCancel = () => {
  if (props.loading) return;
  resetForm();
};

const handleSubmit = async () => {
  if (props.loading) return;

  if (!formRef.value) {
    console.error('[CompanyForm] formRef is null');
    return;
  }

  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      const submitData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        settings: {
          icon: formData.settings.icon,
        },
      };

      emit('submit', submitData);
    } else {
      console.warn('[CompanyForm] Validation failed:', fields);
      if (fields) {
        const firstError = Object.keys(fields)[0];
        if (firstError && formRef.value.scrollToField) {
          formRef.value.scrollToField(firstError);
        }
      }
      return false;
    }
  });
};

watch(() => props.visible, (newVal) => {
  localVisible.value = newVal;
});

watch(localVisible, (newVal) => {
  if (!newVal && props.visible) {
    emit('update:visible', false);
  }
});

watch(() => props.company, (newCompany) => {
  nextTick(() => {
    if (newCompany) {
      populateForm(newCompany);
    } else {
      resetFormData();
    }
  });
}, { deep: true });

watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (props.company) {
        populateForm(props.company);
      } else {
        resetFormData();
      }
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    });
  }
});
</script>

<style scoped>
.company-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin: -10px -10px 16px -10px;
  background-color: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  white-space: nowrap;
  overflow: hidden;
}

.company-info :deep(.el-tag) {
  height: 20px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 500;
}

.company-info :deep(.el-tag .el-icon) {
  margin-right: 4px;
  font-size: 12px;
}

.company-name {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.dialog-footer .el-button {
  min-width: 80px;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-option .el-icon {
  flex-shrink: 0;
}

.icon-option .icon-label {
  font-size: 12px;
  color: #606266;
}

.icon-select :deep(.el-select__wrapper) {
  border-radius: 4px;
}

:deep(.el-dialog__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #EBEEF5;
}

:deep(.el-dialog__title) {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 16px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}

:deep(.el-dialog__footer) {
  padding: 10px 16px 14px;
  border-top: 1px solid #EBEEF5;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}

:deep(.el-form.is-disabled .el-input__inner),
:deep(.el-form.is-disabled .el-textarea__inner),
:deep(.el-form.is-disabled .el-select__wrapper) {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

:deep(.el-form-item.is-error .el-input__wrapper),
:deep(.el-form-item.is-error .el-textarea__wrapper),
:deep(.el-form-item.is-error .el-select__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.el-form-item__error) {
  font-size: 11px;
  padding-top: 4px;
}
</style>
