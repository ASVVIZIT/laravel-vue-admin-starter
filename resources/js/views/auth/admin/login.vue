<template>
  <div class="login-form-container">
    <DynamicAuthForm
        :config="formConfig"
        :loading="loading"
        @submit="handleLogin"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import DynamicAuthForm from '../components/DynamicAuthForm.vue'
import { useAuthStore } from '@/store/authStore'
import { getFormConfig } from '../configs/formConfigs'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formConfig = getFormConfig('user')
const loading = ref(false)

const handleLogin = async (formData) => {
  if (loading.value) return
  loading.value = true

  try {
    await authStore.login(formData, 'user')
    ElMessage.success(t('login.loginSuccess'))

    const redirectPath = route.query.redirect
        ? decodeURIComponent(route.query.redirect)
        : '/dashboard'

    router.replace(redirectPath)
  } catch (error) {
    ElMessage.error(error?.response?.data?.error || t('login.loginFailed'))
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-form-container {
  width: 100%;
}

// Стили полей ввода
:deep(.el-input__wrapper) {
  background: #283443 !important;
  box-shadow: none !important;
  border-radius: 6px;
  height: 46px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(24, 144, 255, 0.4);
    background: #2d3a4b !important;
  }

  &.is-focus {
    border-color: #1890ff !important;
    box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.15) !important;
  }
}

:deep(.el-input__inner) {
  background: transparent !important;
  border: none !important;
  color: #eee !important;
  height: 46px;
  font-size: 14px;

  &::placeholder {
    color: #6b7a8d !important;
  }

  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px #283443 inset !important;
    -webkit-text-fill-color: #eee !important;
  }
}

:deep(.el-input__prefix),
:deep(.el-input__suffix) {
  color: #6b7a8d !important;
}

// Кнопка отправки
:deep(.el-button--primary) {
  width: 100%;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

// Валидация
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
</style>
