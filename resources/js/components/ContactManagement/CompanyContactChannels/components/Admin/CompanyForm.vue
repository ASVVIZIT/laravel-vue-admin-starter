<template>
  <el-dialog
      v-model="localVisible"
      :title="company ? 'Редактировать компанию' : 'Создать компанию'"
      width="50%"
      @closed="resetForm"
      destroy-on-close
  >
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        v-loading="loading"
    >
      <el-form-item label="Название" prop="name">
        <el-input
            v-model="form.name"
            maxlength="255"
            show-word-limit
            :disabled="loading"
            placeholder="Введите название компании"
        />
      </el-form-item>

      <el-form-item label="Иконка" prop="settings.icon">
        <el-select
            v-model="form.settings.icon"
            clearable
            filterable
            placeholder="Выберите иконку"
            :disabled="loading"
            style="width: 100%"
        >
          <el-option
              v-for="option in iconOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
          >
            <div class="icon-option">
              <component :is="getIconComponent(option.value)" class="option-icon" />
              <span>{{ option.label }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="Описание" prop="description">
        <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="1000"
            show-word-limit
            :disabled="loading"
            placeholder="Введите описание (необязательно)"
        />
      </el-form-item>

      <el-form-item label="Адрес" prop="address">
        <el-input
            v-model="form.address"
            maxlength="500"
            show-word-limit
            :disabled="loading"
            placeholder="Введите адрес (необязательно)"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="localVisible = false" :disabled="loading">Отмена</el-button>
        <el-button type="primary" @click="submitForm" :loading="loading">
          {{ company ? 'Сохранить' : 'Создать' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { getIconMap } from '../../utils/iconConfig.js';
import { useFenixIconsStore } from '@components/FenixIconVue/store/fenixIconsStore.js';

const props = defineProps({
  visible: { type: Boolean, default: false },
  company: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  iconOptions: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:visible', 'submit']);
const fenixIconStore = useFenixIconsStore();
const formRef = ref(null);
const localVisible = ref(props.visible);
const iconMap = getIconMap(fenixIconStore);

// ============================================================================
// СОСТОЯНИЕ ФОРМЫ
// ============================================================================

const form = reactive({
  name: '',
  settings: { icon: 'el-icon-office-building' },
  description: '',
  address: ''
});

// ============================================================================
// ПРАВИЛА ВАЛИДАЦИИ
// ============================================================================

const rules = {
  name: [
    {
      required: true,
      message: 'Название компании обязательно',
      trigger: ['blur', 'change']
    },
    {
      min: 2,
      max: 255,
      message: 'Название должно быть от 2 до 255 символов',
      trigger: ['blur', 'change']
    }
  ],
  'settings.icon': [
    {
      required: true,
      message: 'Иконка обязательна',
      trigger: 'change'
    }
  ],
  description: [
    {
      max: 1000,
      message: 'Описание не должно превышать 1000 символов',
      trigger: 'blur'
    }
  ],
  address: [
    {
      max: 500,
      message: 'Адрес не должен превышать 500 символов',
      trigger: 'blur'
    }
  ]
};

// ============================================================================
// СИНХРОНИЗАЦИЯ VISIBLE И ЗАПОЛНЕНИЕ ФОРМЫ
// ============================================================================

watch(() => props.visible, (newVal) => {
  localVisible.value = newVal;
  if (newVal && props.company) {
    nextTick(() => {
      form.name = props.company.name || '';
      form.settings.icon = props.company.settings?.icon || 'el-icon-office-building';
      form.description = props.company.description || '';
      form.address = props.company.address || '';
    });
  }
});

// ============================================================================
// ПОЛУЧЕНИЕ КОМПОНЕНТА ИКОНКИ
// ============================================================================

const getIconComponent = (iconString) => {
  const mappedComponent = iconMap[iconString];
  return mappedComponent || iconMap['default'];
};

// ============================================================================
// СБРОС ФОРМЫ
// ============================================================================

const resetForm = () => {
  if (formRef.value) {
    formRef.value.clearValidate();
    formRef.value.resetFields();
  }
  form.name = '';
  form.settings.icon = 'el-icon-office-building';
  form.description = '';
  form.address = '';
};

// ============================================================================
// ОТПРАВКА ФОРМЫ С ОБРАБОТКОЙ ОШИБОК
// ============================================================================

const submitForm = async () => {
  if (!formRef.value) {
    console.error('[CompanyForm] formRef is not available');
    ElMessage.error('Ошибка формы. Попробуйте ещё раз.');
    return;
  }

  console.log('[CompanyForm] submitForm called');

  try {
    await formRef.value.validate();
    console.log('[CompanyForm] Validation passed');

    emit('submit', {
      name: form.name,
      settings: { icon: form.settings.icon },
      description: form.description,
      address: form.address
    });

  } catch (error) {
    console.log('[CompanyForm] Validation failed:', error);

    if (error.fields) {
      const firstErrorField = Object.keys(error.fields)[0];
      const firstErrorMessage = error.fields[firstErrorField][0]?.message || 'Ошибка валидации';

      console.log('[CompanyForm] First error field:', firstErrorField);
      console.log('[CompanyForm] First error message:', firstErrorMessage);

      ElMessage.warning({
        message: firstErrorMessage,
        type: 'warning',
        duration: 3000,
      });

      nextTick(() => {
        const errorInput = document.querySelector(`.el-form-item.is-error input, .el-form-item.is-error textarea`);
        if (errorInput) {
          errorInput.focus();
        }
      });
    } else {
      ElMessage.warning({
        message: 'Пожалуйста, заполните все обязательные поля',
        type: 'warning',
        duration: 3000,
      });
    }
  }
};
</script>

<style scoped>
/* ============================================================================
   DIALOG FOOTER
   ============================================================================ */
.dialog-footer button:first-child {
  margin-right: 10px;
}

/* ============================================================================
   ICON OPTIONS
   ============================================================================ */
.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  width: 16px;
  height: 16px;
  color: #409EFF;
}

/* ============================================================================
   ERROR STYLES
   ============================================================================ */
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}

:deep(.el-form-item__error) {
  font-size: 8px;
  padding-top: 0px;
  line-height: 1.0;
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  max-width: 100%;
  overflow-wrap: break-word;
  -webkit-hyphens: auto;
  hyphens: auto;
}

/* ============================================================================
   ADAPTIVE FOR NARROW MODALS
   ============================================================================ */
:deep(.el-dialog--small .el-form-item__error),
:deep(.el-dialog[style*="width: 30%"] .el-form-item__error),
:deep(.el-dialog[style*="width: 40%"] .el-form-item__error) {
  font-size: 8px;
  line-height: 1.0;
}

:deep(.el-dialog--small .el-form-item),
:deep(.el-dialog[style*="width: 30%"] .el-form-item),
:deep(.el-dialog[style*="width: 40%"] .el-form-item) {
  margin-bottom: 14px;
}

:deep(.el-dialog--small .el-form-item__label),
:deep(.el-dialog[style*="width: 30%"] .el-form-item__label),
:deep(.el-dialog[style*="width: 40%"] .el-form-item__label) {
  font-size: 12px;
  padding-right: 8px;
}

:deep(.el-dialog--small .el-input__inner),
:deep(.el-dialog[style*="width: 30%"] .el-input__inner),
:deep(.el-dialog[style*="width: 40%"] .el-input__inner) {
  font-size: 12px;
}
</style>
