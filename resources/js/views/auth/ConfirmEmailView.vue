<template>
  <div class="auth-standalone-page">
    <div class="auth-card">
      <div class="icon" :class="status">
        <el-icon v-if="status === 'loading'" class="is-loading" :size="40"><Loading /></el-icon>
        <el-icon v-else-if="status === 'success'" :size="40"><CircleCheckFilled /></el-icon>
        <el-icon v-else :size="40"><CircleCloseFilled /></el-icon>
      </div>

      <h1 class="title">{{ title }}</h1>
      <p class="message">{{ message }}</p>

      <el-button
          v-if="status !== 'loading'"
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Loading, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import request from '@/utils/request'

const route = useRoute()
const { t } = useI18n()

const status = ref('loading')
const serverMessage = ref('')

const title = computed(() => {
  if (status.value === 'loading') return t('auth.confirmEmail.processingTitle') || 'Подтверждение...'
  if (status.value === 'success') return t('auth.confirmEmail.successTitle') || 'Email успешно подтверждён!'
  return t('auth.confirmEmail.errorTitle') || 'Ошибка подтверждения'
})

const message = computed(() => {
  if (status.value === 'loading') return t('auth.confirmEmail.processingMessage') || 'Пожалуйста, подождите, идёт проверка ссылки...'
  return serverMessage.value || (
      status.value === 'success'
          ? (t('auth.confirmEmail.successMessage') || 'Ваш email подтверждён. Теперь вы можете войти в систему.')
          : (t('auth.confirmEmail.errorMessage') || 'Ссылка недействительна или срок её действия истёк.')
  )
})

onMounted(async () => {
  const { type, token } = route.params
  try {
    const url = type === 'old'
        ? `/users/confirm-old-email/${token}`
        : `/users/confirm-new-email/${token}`
    const res = await request({ url, method: 'get' })
    status.value = 'success'
    serverMessage.value = res?.message || ''
  } catch (error) {
    status.value = 'error'
    serverMessage.value = error.response?.data?.message || ''
  }
})
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

.title { font-size: 26px; font-weight: 700; color: #1a202c; margin: 0 0 16px; line-height: 1.3; }
.message { font-size: 16px; color: #4a5568; line-height: 1.6; margin: 0 0 32px; }

.footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  .footer-text {
    font-size: 14px;
    color: #718096;
    a { color: #667eea; text-decoration: none; &:hover { text-decoration: underline; } }
  }
}
</style>
