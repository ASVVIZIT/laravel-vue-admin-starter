<template>
  <div class="auth-page" :class="`theme-${safeMode}`">
    <div class="auth-container">
      <!-- ЛЕВАЯ КОЛОНКА: Картинка/Код -->
      <div class="auth-image" :style="bgStyle">
        <div class="photo-credit">
          <span>Powered by ASV</span>
        </div>
        <div class="mode-badge" :class="`mode-${safeMode}`" v-if="showModeSwitcher">
          <span class="mode-icon">{{ currentModeData.icon }}</span>
          <span class="mode-label">{{ currentModeData.label }}</span>
        </div>
      </div>

      <!-- ПРАВАЯ КОЛОНКА: Форма -->
      <div class="auth-content">
        <!-- Заголовок -->
        <div class="title-wrap">
          <div class="brand-logo">
            <span class="logo-icon">🔥</span>
            <span class="logo-text">FENIX PORTAL</span>
          </div>
          <h1 class="main-title">Fenix Portal</h1>
          <p class="sub-heading">{{ currentPageSubtitle }}</p>
        </div>

        <!-- Переключатель режимов -->
        <div v-if="showModeSwitcher" class="mode-switcher-wrapper">
          <div class="mode-switcher">
            <button
                v-for="mode in availableModes"
                :key="mode.value"
                :class="['mode-btn', { active: safeMode === mode.value }]"
                @click="handleModeChange(mode.value)"
            >
              <span class="mode-btn-icon">{{ mode.icon }}</span>
              <span class="mode-btn-label">{{ $t(mode.label) }}</span>
            </button>
          </div>
        </div>

        <!-- Плавная смена формы -->
        <transition name="fade-slide" mode="out-in">
          <div class="form-wrapper" :key="currentRouteName">
            <router-view />
          </div>
        </transition>

        <!-- Футер -->
        <div class="auth-footer" v-if="showFooter">
          <p class="footer-text">{{ currentModeData.footerText }}</p>
        </div>
      </div>
    </div>

    <AuthBackground :mode="safeMode" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { VALID_LOGIN_TYPES } from '@/utils/auth'
import { detectBasePath, getTypeFromBase } from '@/utils/detectBasePath'
import AuthBackground from '../components/AuthBackground.vue'

import bgUser from '@/assets/login/background.jpg'
import bgAdmin from '@/assets/login/background.jpg'
import bgTester from '@/assets/login/background.jpg'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const availableModes = [
  { value: 'user',   label: 'Пользователь', icon: '👤' },
  { value: 'admin',  label: 'Администратор', icon: '🔐' },
  { value: 'tester', label: 'Тестировщик', icon: '🧪' }
]

const modeConfigs = {
  user: {
    subtitle: 'Вход в систему',
    footerText: 'Обычный доступ к порталу',
    icon: '👤',
    label: 'Пользователь',
    primaryColor: '#1890ff',
    bgImage: bgUser
  },
  admin: {
    subtitle: 'Панель администратора',
    footerText: 'Требуется повышенная авторизация',
    icon: '🔐',
    label: 'Администратор',
    primaryColor: '#ff4d4f',
    bgImage: bgAdmin
  },
  tester: {
    subtitle: 'Режим тестирования',
    footerText: 'Используйте тестовые учётные данные',
    icon: '🧪',
    label: 'Тестировщик',
    primaryColor: '#faad14',
    bgImage: bgTester
  }
}

const pageConfigs = {
  'Login': { getSubtitle: () => modeConfigs[authStore.loginType]?.subtitle || 'Вход в систему' },
  'AdminLogin': { getSubtitle: () => 'Панель администратора' },
  'TesterLogin': { getSubtitle: () => 'Режим тестирования' },
  'ForgotPassword': { getSubtitle: () => 'Восстановление пароля' },
  'ResetPassword': { getSubtitle: () => 'Установка нового пароля' },
  'Register': { getSubtitle: () => 'Создание аккаунта' },
  'EmailVerification': { getSubtitle: () => 'Подтверждение email' },
  'AuthRedirect': { getSubtitle: () => 'Перенаправление...' }
}

const currentRouteName = computed(() => route.name || 'default')

const showModeSwitcher = computed(() => !route.meta?.hideModeSwitcher)
const showFooter = computed(() => !route.meta?.hideFooter)

const currentPageSubtitle = computed(() => {
  const pageConfig = pageConfigs[route.name]
  return pageConfig?.getSubtitle ? pageConfig.getSubtitle() : ''
})

const safeMode = computed({
  get: () => {
    if (!showModeSwitcher.value) {
      return VALID_LOGIN_TYPES.includes(authStore.loginType) ? authStore.loginType : 'user'
    }
    const basePath = detectBasePath()
    const typeFromUrl = getTypeFromBase(basePath)
    return VALID_LOGIN_TYPES.includes(authStore.loginType) ? authStore.loginType : (VALID_LOGIN_TYPES.includes(typeFromUrl) ? typeFromUrl : 'user')
  },
  set: (val) => {
    if (VALID_LOGIN_TYPES.includes(val)) {
      authStore.setLoginType(val)
    }
  }
})

const currentModeData = computed(() => modeConfigs[safeMode.value] || modeConfigs.user)

const bgStyle = computed(() => ({
  backgroundImage: `url(${currentModeData.value.bgImage})`
}))

const handleModeChange = (mode) => {
  if (!VALID_LOGIN_TYPES.includes(mode) || mode === safeMode.value) return
  authStore.setLoginType(mode, true)
}

onMounted(() => {
  const basePath = detectBasePath()
  const typeFromUrl = getTypeFromBase(basePath)
  if (authStore.loginType !== typeFromUrl) {
    authStore.setLoginType(typeFromUrl, true)
  }
})
</script>

<style lang="scss" scoped>
$bg: #1d1b28;
$dark_gray: #889aa4;
$textColor: #eee;

.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 20px;
  position: relative;
  overflow-x: hidden;
}

.auth-container {
  background: rgba(29, 27, 40, 0.95);
  width: 100%;
  max-width: 1100px;
  min-height: 600px;
  display: grid;
  grid-template-columns: 1fr 480px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.auth-image {
  position: relative;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  min-height: 400px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
  }

  .photo-credit {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 12px;
    border-radius: 6px;
    z-index: 1;

    span {
      font-size: 12px;
      color: #333;
      font-weight: 500;
    }
  }
}

.mode-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  font-weight: 600;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &.mode-user   { background: rgba(24, 144, 255, 0.95); color: #fff; }
  &.mode-admin  { background: rgba(255, 77, 79, 0.95); color: #fff; }
  &.mode-tester { background: rgba(250, 173, 20, 0.95); color: #fff; }

  .mode-icon { font-size: 20px; }
  .mode-label { font-size: 14px; }
}

.auth-content {
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .logo-icon {
    font-size: 24px;
  }

  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: $textColor;
    letter-spacing: 1px;
  }
}

.title-wrap {
  text-align: center;
  margin-bottom: 35px;

  .main-title {
    font-size: 32px;
    color: $textColor;
    margin: 0 0 10px 0;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .sub-heading {
    font-size: 14px;
    color: $dark_gray;
    margin: 0;
  }
}

.mode-switcher-wrapper {
  margin-bottom: 30px;
}

.mode-switcher {
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.mode-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: $dark_gray;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: $textColor;
  }

  &.active {
    background: rgba(24, 144, 255, 0.15);
    color: #1890ff;
    border: 1px solid rgba(24, 144, 255, 0.3);
  }

  .mode-btn-icon {
    font-size: 24px;
  }

  .mode-btn-label {
    font-size: 12px;
    font-weight: 500;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.form-wrapper {
  margin-top: 10px;
}

.auth-footer {
  margin-top: 25px;
  text-align: center;

  .footer-text {
    font-size: 12px;
    color: $dark_gray;
    margin: 0;
  }
}

@media (max-width: 900px) {
  .auth-container {
    grid-template-columns: 1fr;
    max-width: 500px;
    min-height: auto;
  }

  .auth-image {
    display: none;
  }

  .auth-content {
    padding: 40px 30px;
  }
}
</style>
