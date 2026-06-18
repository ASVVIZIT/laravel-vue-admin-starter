<template>
  <div class="reset-password">
    <div class="title-wrap">
      <h3 class="title">
        <Icon class-name="shield-lock" />
        {{ $t('auth.resetPasswordTitle') || 'Сброс пароля' }}
      </h3>
      <p class="subtitle">{{ $t('auth.resetPasswordSubtitle') || 'Введите новый пароль' }}</p>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" class="auth-form" @submit.prevent="handleSubmit">
      <el-form-item prop="email">
        <el-input v-model="form.email" :placeholder="$t('login.email') || 'Email'" type="email" disabled class="auth-input">
          <template #prefix>
            <Icon class-name="envelope" />
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input v-model="form.password" :placeholder="$t('login.password') || 'Пароль'" :type="showPassword ? 'text' : 'password'" class="auth-input">
          <template #prefix>
            <Icon class-name="shield-lock" />
          </template>
          <template #suffix>
            <span class="show-pwd" @click="showPassword = !showPassword">
              <Icon :class-name="showPassword ? 'eye-slash-fill' : 'eye-fill'" />
            </span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password_confirmation">
        <el-input v-model="form.password_confirmation" :placeholder="$t('login.confirmPassword') || 'Подтвердите пароль'" :type="showPassword ? 'text' : 'password'" class="auth-input">
          <template #prefix>
            <Icon class-name="shield-check" />
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" class="auth-submit-btn">
          {{ $t('auth.resetPassword') || 'Сбросить пароль' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import Icon from '@/components/Icon/Icon.vue'
import { resetPassword } from '@/api/auth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
  password_confirmation: '',
  token: ''
})

onMounted(() => {
  form.token = route.query.token || ''
  form.email = route.query.email || ''

  if (!form.token) {
    ElMessage.error(t('auth.invalidResetLink') || 'Неверная ссылка')
    router.push('/login')
  }
})

const rules = {
  email: [
    { required: true, message: () => t('validation.rules.email.required'), trigger: 'blur' },
    { type: 'email', message: () => t('validation.rules.email.type'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: () => t('validation.rules.password.required'), trigger: 'blur' },
    { min: 8, message: () => t('validation.rules.password.minLength'), trigger: 'blur' }
  ],
  password_confirmation: [
    { required: true, message: () => t('validation.rules.confirmPassword.required'), trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value !== form.password) {
          callback(new Error(t('validation.rules.confirmPassword.mismatched')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await resetPassword(form)
    ElMessage.success(t('auth.passwordResetSuccess') || 'Пароль сброшен')
    router.push('/login')
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || t('auth.resetFailed') || 'Ошибка')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.reset-password { width: 100%; }

.title-wrap {
  text-align: center;
  margin-bottom: 28px;

  .title {
    font-size: 22px;
    color: #eee;
    margin: 0 0 8px 0;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .subtitle {
    font-size: 13px;
    color: #889aa4;
    margin: 0;
  }
}

.auth-form { width: 100%; }

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

.show-pwd {
  cursor: pointer;
  color: #6b7a8d;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: #1890ff;
  }
}

.auth-submit-btn {
  width: 100%;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 6px;
  letter-spacing: 0.5px;
}
</style>
