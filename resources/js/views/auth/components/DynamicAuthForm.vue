<template>
  <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      class="dynamic-auth-form"
      @submit.prevent="handleSubmit"
  >
    <el-form-item
        v-for="field in safeFields"
        :key="field.name"
        :prop="field.name"
    >
      <el-input
          v-if="field.type === 'email' || field.type === 'text'"
          v-model="formData[field.name]"
          :placeholder="$t(field.placeholder)"
          :type="field.type"
          :maxlength="field.maxLength"
          clearable
          class="auth-input"
      >
        <template #prefix>
          <Icon :class-name="field.icon || 'circle'" />
        </template>
        <template #suffix v-if="field.showPasswordToggle">
          <span class="show-pwd" @click="togglePasswordVisibility(field.name)">
            <Icon :class-name="passwordVisibility[field.name] ? 'eye-slash-fill' : 'eye-fill'" />
          </span>
        </template>
      </el-input>

      <el-input
          v-else-if="field.type === 'password'"
          v-model="formData[field.name]"
          :placeholder="$t(field.placeholder)"
          :type="passwordVisibility[field.name] ? 'text' : 'password'"
          clearable
          class="auth-input"
      >
        <template #prefix>
          <Icon :class-name="field.icon || 'lock'" />
        </template>
        <template #suffix>
          <span class="show-pwd" @click="togglePasswordVisibility(field.name)">
            <Icon :class-name="passwordVisibility[field.name] ? 'eye-slash-fill' : 'eye-fill'" />
          </span>
        </template>
      </el-input>

      <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.name]"
          :placeholder="$t(field.placeholder)"
          class="auth-select"
          style="width: 100%;"
      >
        <el-option
            v-for="option in safeOptions(field)"
            :key="option.value"
            :value="option.value"
            :label="$t(option.label)"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-if="safeFeatures.rememberMe">
      <el-checkbox v-model="formData.remember">
        {{ $t('login.rememberMe') }}
      </el-checkbox>
    </el-form-item>

    <el-form-item v-if="safeButtons.length > 0">
      <el-button
          type="primary"
          native-type="submit"
          :loading="loading"
          :disabled="loading"
          class="auth-submit-btn"
      >
        {{ $t(safeButtons[0].label) }}
      </el-button>
    </el-form-item>

    <div v-if="safeLinks.length > 0" class="form-links">
      <template v-for="(link, index) in safeLinks" :key="index">
        <a v-if="link.path" href="#" class="form-link" @click.prevent="navigateTo(link.path)">
          {{ $t(link.label) }}
        </a>
        <span v-if="index < safeLinks.length - 1" class="divider">|</span>
      </template>
    </div>
  </el-form>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Icon from '@/components/Icon/Icon.vue';

const router = useRouter();
const { t } = useI18n();

const props = defineProps({
  config: { type: Object, required: true },
  loading: { type: Boolean, default: false }
});

const emit = defineEmits(['submit']);
const formRef = ref(null);
const formData = reactive({});
const passwordVisibility = reactive({});

const safeFields = computed(() => Array.isArray(props.config?.fields) ? props.config.fields : []);
const safeButtons = computed(() => Array.isArray(props.config?.buttons) ? props.config.buttons : []);
const safeLinks = computed(() => Array.isArray(props.config?.links) ? props.config.links : []);
const safeFeatures = computed(() => props.config?.features || { rememberMe: false });

const safeOptions = (field) => {
  if (!field || !Array.isArray(field.options)) return [];
  return field.options.filter(opt => opt && opt.value != null);
};

watch(() => props.config, (newConfig) => {
  if (!newConfig || !Array.isArray(newConfig.fields)) return;

  Object.keys(formData).forEach(key => delete formData[key]);
  Object.keys(passwordVisibility).forEach(key => delete passwordVisibility[key]);

  newConfig.fields.forEach(field => {
    if (!field?.name) return;
    formData[field.name] = field.defaultValue ?? '';
    if (field.type === 'password' || field.showPasswordToggle) {
      passwordVisibility[field.name] = false;
    }
  });

  if (newConfig.features?.rememberMe) formData.remember = false;
}, { immediate: true });

const formRules = computed(() => {
  const rules = {};
  safeFields.value.forEach(field => {
    if (!field?.name) return;
    const fieldRules = [];

    if (field.required) {
      fieldRules.push({ required: true, message: t('validation.general.required'), trigger: 'blur' });
    }

    if (field.validation) {
      if (field.validation.type === 'email') {
        fieldRules.push({
          validator: (_, value, callback) => {
            if (!value) { callback(); return; }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) callback(new Error(t(field.validation.message)));
            else callback();
          },
          trigger: 'blur'
        });
      }
      if (field.validation.minLength) {
        fieldRules.push({
          validator: (_, value, callback) => {
            if (!value) { callback(); return; }
            if (value.length < field.validation.minLength) callback(new Error(t(field.validation.message)));
            else callback();
          },
          trigger: 'blur'
        });
      }
    }
    rules[field.name] = fieldRules;
  });
  return rules;
});

const togglePasswordVisibility = (fieldName) => {
  if (fieldName) passwordVisibility[fieldName] = !passwordVisibility[fieldName];
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    emit('submit', { ...formData });
  } catch (error) {
    console.warn('Validation failed:', error?.message);
  }
};

const navigateTo = (path) => { if (path) router.push(path); };
defineExpose({ resetForm: () => formRef.value?.resetFields() });
</script>

<style lang="scss" scoped>
.dynamic-auth-form {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 20px;

  &.is-error {
    .el-input__wrapper {
      border-color: #ff4d4f !important;
      background: rgba(255, 77, 79, 0.08) !important;
    }
  }
}

:deep(.el-form-item__error) {
  color: #ff4d4f !important;
  background: transparent !important;
  padding: 4px 0 0 0 !important;
  font-size: 12px !important;
  line-height: 1.4 !important;
  font-weight: 400 !important;
  display: block !important;
}

.auth-input {
  width: 100%;

  :deep(.el-input__wrapper) {
    background: #283443;
    box-shadow: none;
    border-radius: 6px;
    height: 46px;
    padding: 0 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(24, 144, 255, 0.4);
      background: #2d3a4b;
    }

    &.is-focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.15);
      background: #2d3a4b;
    }
  }

  :deep(.el-input__inner) {
    background: transparent;
    border: none;
    color: #eee !important;
    height: 46px;
    font-size: 14px;

    &::placeholder {
      color: #6b7a8d;
    }

    &:-webkit-autofill {
      -webkit-box-shadow: 0 0 0px 1000px #283443 inset !important;
      -webkit-text-fill-color: #eee !important;
    }
  }

  :deep(.el-input__prefix),
  :deep(.el-input__suffix) {
    color: #6b7a8d;
  }
}

.auth-select {
  width: 100%;

  :deep(.el-select__wrapper) {
    background: #283443;
    box-shadow: none;
    border-radius: 6px;
    height: 46px;
    padding: 0 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);

    &:hover {
      border-color: rgba(24, 144, 255, 0.4);
    }
  }

  :deep(.el-select__selected-item) {
    color: #eee;
  }
}

.show-pwd {
  cursor: pointer;
  color: #6b7a8d;
  &:hover { color: #1890ff; }
}

:deep(.el-button--primary) {
  width: 100%;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 6px;
}

.form-links {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  font-size: 14px;

  .form-link {
    color: #1890ff;
    text-decoration: none;
    &:hover { color: #40a9ff; text-decoration: underline; }
  }

  .divider { color: #4a5568; }
}
</style>
