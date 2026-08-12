<template>
  <div class="forgot-password">
    <div class="title-wrap">
      <h3 class="title">
        <Icon class-name="key" />
        {{ $t('auth.forgotPasswordTitle') || 'Забыли пароль?' }}
      </h3>
      <p class="subtitle">{{ $t('auth.forgotPasswordSubtitle') || 'Введите email и мы отправим ссылку для сброса' }}</p>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" class="auth-form" @submit.prevent="handleSubmit">
      <el-form-item prop="email">
        <el-input v-model="form.email" :placeholder="$t('login.email') || 'Email'" type="email" clearable class="auth-input">
          <template #prefix>
            <Icon class-name="envelope" />
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" :disabled="loading || sent" class="auth-submit-btn">
          {{ sent ? ($t('auth.emailSent') || 'Письмо отправлено!') : ($t('auth.sendResetLink') || 'Отправить ссылку') }}
        </el-button>
      </el-form-item>
    </el-form>

    <div v-if="sent" class="success-message">
      <Icon class-name="check-circle" />
      <p class="success-text">{{ $t('auth.resetLinkSentGeneric') }}</p>
      <p class="success-hint">{{ $t('auth.resetLinkSentHint') }}</p>
    </div>

    <div class="form-links">
      <a href="#" @click.prevent="goBack">
        <Icon class-name="arrow-left" />
        {{ $t('auth.backToLogin') || 'Вернуться к входу' }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import Icon from '@/components/Icon/Icon.vue'
import { forgotPassword } from '@/api/auth'

const { t } = useI18n()
const router = useRouter()

const formRef = ref(null)
const loading = ref(false)
const sent = ref(false)

const form = reactive({ email: '' })

const rules = {
  email: [
    { required: true, message: () => t('validation.rules.email.required'), trigger: 'blur' },
    { type: 'email', message: () => t('validation.rules.email.type'), trigger: 'blur' }
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
    // 🔒 Отправляем запрос, но НЕ анализируем ответ (безопасность)
    // Бэкенд всегда возвращает success, чтобы не раскрывать существование email
    await forgotPassword({ email: form.email })
  } catch (error) {
    // 🔒 Даже при ошибке сети — показываем универсальное сообщение
    console.warn('[ForgotPassword] Request failed:', error?.message)
  } finally {
    // 🔒 ВСЕГДА показываем success-экран (не раскрываем существование email)
    sent.value = true
    ElMessage.success(t('auth.resetLinkSentGeneric'))
    loading.value = false
  }
}

const goBack = () => router.push('/login')
</script>

<style lang="scss" scoped>
.forgot-password { width: 100%; }

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

  :deep(.el-input__prefix) {
    color: #6b7a8d;
    margin-right: 10px;
    display: flex;
    align-items: center;
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

.success-message {
  background: rgba(82, 196, 26, 0.1);
  border: 1px solid rgba(82, 196, 26, 0.3);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  margin: 16px 0;
  color: #52c41a;

  .bi {
    font-size: 24px;
    margin-bottom: 8px;
    display: block;
  }

  p {
    margin: 0;
    font-size: 13px;
  }

  .success-text {
    font-weight: 500;
    margin-bottom: 6px;
  }

  .success-hint {
    font-size: 12px;
    opacity: 0.8;
    line-height: 1.4;
  }
}

.form-links {
  margin-top: 20px;
  text-align: center;

  a {
    color: #1890ff;
    text-decoration: none;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s;

    &:hover {
      color: #40a9ff;
      text-decoration: underline;
    }
  }
}
</style>
