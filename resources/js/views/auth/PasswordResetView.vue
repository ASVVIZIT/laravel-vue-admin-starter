<template>
  <div class="auth-standalone-page">
    <div class="auth-card">
      <div v-if="status !== 'form'" class="icon" :class="status">
        <el-icon v-if="status === 'loading'" class="is-loading" :size="40"><Loading /></el-icon>
        <el-icon v-else-if="status === 'success'" :size="40"><CircleCheckFilled /></el-icon>
        <el-icon v-else :size="40"><CircleCloseFilled /></el-icon>
      </div>

      <h1 class="title">{{ title }}</h1>
      <p class="message">{{ message }}</p>

      <el-form
          v-if="status === 'form'"
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="submit"
      >
        <el-form-item :label="$t('auth.passwordResetByToken.newPassword') || 'Новый пароль'" prop="password">
          <el-input
              v-model="form.password"
              type="password"
              show-password
              :placeholder="$t('auth.passwordResetByToken.newPasswordPlaceholder') || 'Минимум 6 символов'"
          />
        </el-form-item>
        <el-form-item :label="$t('auth.passwordResetByToken.confirmPassword') || 'Подтвердите пароль'" prop="password_confirmation">
          <el-input
              v-model="form.password_confirmation"
              type="password"
              show-password
              :placeholder="$t('auth.passwordResetByToken.confirmPasswordPlaceholder') || 'Повторите пароль'"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="submitting" @click="submit" style="width: 100%">
            {{ $t('auth.passwordResetByToken.submit') || 'Сбросить пароль' }}
          </el-button>
        </el-form-item>
      </el-form>

      <el-button
          v-if="status === 'success'"
          type="primary"
          size="large"
          @click="$router.push('/login')"
      >
        {{ $t('auth.goToLogin') || 'Перейти ко входу' }}
      </el-button>

      <div class="footer">
        <p class="footer-text">
          {{ $t('auth.contactSupport') || 'Вопросы?' }}
          <a href="mailto:DillerASV@yandex.ru">DillerASV@yandex.ru</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Loading, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import request from '@/utils/request'

const route = useRoute()
const { t } = useI18n()

const formRef = ref(null)
const status = ref('form') // form | loading | success | error
const submitting = ref(false)
const serverMessage = ref('')

const form = reactive({
  password: '',
  password_confirmation: '',
})

const rules = {
  password: [
    { required: true, message: t('validation.rules.password.required') || 'Пароль обязателен', trigger: 'blur' },
    { min: 6, message: t('validation.rules.password.minLength') || 'Минимум 6 символов', trigger: 'blur' },
  ],
  password_confirmation: [
    { required: true, message: t('validation.rules.confirmPassword.required') || 'Подтверждение обязательно', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) callback(new Error(t('validation.rules.confirmPassword.mismatched') || 'Пароли не совпадают'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}

const title = computed(() => {
  if (status.value === 'form') return t('auth.passwordResetByToken.title') || 'Сброс пароля'
  if (status.value === 'loading') return t('auth.passwordResetByToken.processingTitle') || 'Сброс...'
  if (status.value === 'success') return t('auth.passwordResetByToken.successTitle') || 'Пароль сброшен!'
  return t('auth.passwordResetByToken.errorTitle') || 'Ошибка сброса'
})

const message = computed(() => {
  if (status.value === 'form') return t('auth.passwordResetByToken.formMessage') || 'Введите новый пароль для вашего аккаунта'
  if (status.value === 'loading') return t('auth.passwordResetByToken.processingMessage') || 'Сохраняем новый пароль...'
  return serverMessage.value || (
      status.value === 'success'
          ? (t('auth.passwordResetByToken.successMessage') || 'Пароль успешно изменён. Теперь войдите с новым паролем.')
          : (t('auth.passwordResetByToken.errorMessage') || 'Ссылка недействительна или срок её действия истёк.')
  )
})

const submit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  status.value = 'loading'

  const { token } = route.params
  try {
    const res = await request({
      url: '/auth/reset-password',
      method: 'post',
      data: {
        token: token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      },
    })
    status.value = 'success'
    serverMessage.value = res?.message || res?.data?.message || ''
    ElMessage.success(res?.message || t('auth.passwordResetSuccess') || 'Пароль сброшен')
  } catch (error) {
    status.value = 'error'
    serverMessage.value = error.response?.data?.message || error.response?.data?.error || ''
    ElMessage.error(serverMessage.value)
    setTimeout(() => { status.value = 'form' }, 2000)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-standalone-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  padding: 48px 40px;
  text-align: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.icon {
  width: 88px;
  height: 88px;
  margin: 0 auto 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &.loading { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #667eea; }
  &.success { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); color: #fff; }
  &.error   { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #fff; }
}

.title {
  font-size: 26px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 16px;
  line-height: 1.3;
}

.message {
  font-size: 16px;
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 24px;
}

/* Форма сброса пароля */
:deep(.el-form) {
  text-align: left;
  width: 100%;
  margin-bottom: 16px;

  .el-form-item__label {
    font-weight: 600;
    color: #1a202c;
  }
}

.footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;

  .footer-text {
    font-size: 14px;
    color: #718096;

    a {
      color: #667eea;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
