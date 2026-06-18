<template>
  <div class="auth-page" :class="`theme-${safeMode}`">
    <div class="auth-container">
      <!-- ЛЕВАЯ КОЛОНКА: Картинка -->
      <div class="auth-image" :style="bgStyle">
        <div class="photo-credit">
          <span>Powered by ASV</span>
        </div>
        <div class="mode-badge" :class="`mode-${safeMode}`">
          <span class="mode-icon">{{ currentModeData.icon }}</span>
          <span class="mode-label">{{ currentModeData.label }}</span>
        </div>
      </div>

      <!-- ПРАВАЯ КОЛОНКА: Форма -->
      <div class="auth-content">
        <div class="title-wrap">
          <h3 class="title">
            <img class="logo" alt="Fenix Portal" :src="logo" />
            {{ currentModeData.title }}
            <LangSelect class="set-language" />
          </h3>
          <p class="sub-heading">{{ currentModeData.subtitle }}</p>
        </div>

        <!-- Переключатель режимов -->
        <ModeSwitcher
            v-model="safeMode"
            :modes="availableModes"
            @change="handleModeChange"
        />

        <!-- 🔥 Плавная смена формы через transition -->
        <transition name="fade-slide" mode="out-in">
          <div class="form-wrapper" :key="safeMode">
            <router-view />
          </div>
        </transition>

        <div class="auth-footer">
          <p class="footer-text">{{ currentModeData.footerText }}</p>
        </div>
      </div>
    </div>

    <AuthBackground :mode="safeMode" />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { VALID_LOGIN_TYPES } from '@/utils/auth'
import { detectBasePath, getTypeFromBase, getBaseForType } from '@/utils/detectBasePath'
import ModeSwitcher from '../components/ModeSwitcher.vue'
import AuthBackground from '../components/AuthBackground.vue'
import LangSelect from '@components/LangSelect/LangSelect.vue'

import logo from '@/assets/login/logo.svg'
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
    title: 'Fenix Portal',
    subtitle: 'Вход в систему',
    footerText: 'Обычный доступ к порталу',
    icon: '👤',
    label: 'Пользователь',
    primaryColor: '#1890ff',
    bgImage: bgUser
  },
  admin: {
    title: 'Fenix Portal',
    subtitle: 'Панель администратора',
    footerText: 'Требуется повышенная авторизация',
    icon: '🔐',
    label: 'Администратор',
    primaryColor: '#ff4d4f',
    bgImage: bgAdmin
  },
  tester: {
    title: 'Fenix Portal',
    subtitle: 'Режим тестирования',
    footerText: 'Используйте тестовые учётные данные',
    icon: '🧪',
    label: 'Тестировщик',
    primaryColor: '#faad14',
    bgImage: bgTester
  }
}

// 🔥 Читаем тип из URL (при прямом заходе) ИЛИ из store (при переключении)
const safeMode = computed({
  get: () => {
    // При прямом заходе — читаем из URL
    const basePath = detectBasePath()
    const typeFromUrl = getTypeFromBase(basePath)

    // Если в store уже установлен тип (переключили слайдером) — используем его
    if (VALID_LOGIN_TYPES.includes(authStore.loginType)) {
      return authStore.loginType
    }

    return VALID_LOGIN_TYPES.includes(typeFromUrl) ? typeFromUrl : 'user'
  },
  set: (val) => {
    if (VALID_LOGIN_TYPES.includes(val)) {
      authStore.setLoginType(val)
    }
  }
})

const currentModeData = computed(() => {
  return modeConfigs[safeMode.value] || modeConfigs.user
})

const bgStyle = computed(() => ({
  backgroundImage: `url(${currentModeData.value.bgImage})`
}))

// 🔥 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: НЕ меняем URL при переключении слайдером!
const handleModeChange = (mode) => {
  if (!VALID_LOGIN_TYPES.includes(mode)) {
    console.warn('[AuthLayout] Invalid mode:', mode)
    return
  }

  if (mode === safeMode.value) return

  // Просто меняем тип в store — форма перерисуется через transition
  authStore.setLoginType(mode, true)
  console.log(`[AuthLayout] ✅ Mode changed to: ${mode} (without URL change)`)
}

// Синхронизация при монтировании
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
  background-color: #054b5d;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
  transition: background-color 0.6s ease;
}

.auth-container {
  background: $bg;
  width: 100%;
  max-width: 1120px;
  min-height: 590px;
  display: grid;
  grid-template-columns: 1fr 480px;
  transition: all 0.3s ease-in-out;
  position: relative;
  z-index: 1;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.auth-image {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  background-color: #303c4b;
  background-position: 50%;
  background-size: cover;
  background-repeat: no-repeat;
  min-height: 400px;
  position: relative;
  transition: background-image 0.6s ease;

  .photo-credit {
    align-self: flex-end;
    background-color: rgba(255, 255, 255, 0.8);
    margin: 10px;
    padding: 5px 8px;
    border-radius: 4px;

    span {
      margin: 0;
      font-size: 12px;
      color: #333;
    }
  }
}

.mode-badge {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin: 10px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  font-weight: 600;
  transition: all 0.3s ease;

  &.mode-user   { background: rgba(24, 144, 255, 0.9); color: #fff; }
  &.mode-admin  { background: rgba(255, 77, 79, 0.9); color: #fff; }
  &.mode-tester { background: rgba(250, 173, 20, 0.9); color: #fff; }

  .mode-icon { font-size: 20px; }
  .mode-label { font-size: 14px; }
}

.auth-content {
  padding: 40px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow-y: auto;
}

.title-wrap {
  margin-bottom: 20px;
  position: relative;

  .logo {
    display: block;
    width: 100%;
    max-width: 200px;
    height: auto;
    margin: 0 auto 20px;
  }

  .title {
    font-size: 24px;
    color: $textColor;
    margin: 0 0 10px 0;
    text-align: center;
    font-weight: bold;
  }

  .sub-heading {
    font-size: 14px;
    color: $dark_gray;
    text-align: center;
    margin: 0;
  }

  .set-language {
    color: $textColor;
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
  }
}

// 🔥 Плавная анимация смены формы
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
  margin-top: 20px;

  :deep(.login),
  :deep(.admin-login),
  :deep(.tester-login) {
    height: auto;
    background: transparent;
    display: block;
  }

  :deep(.login-container),
  :deep(.admin-login),
  :deep(.tester-login) {
    background: transparent !important;
    width: 100% !important;
    max-width: 100% !important;
    min-height: auto !important;
    display: block !important;
    grid-template-columns: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  :deep(.login-form),
  :deep(.admin-login form),
  :deep(.tester-login form) {
    min-width: auto !important;
    padding: 0 !important;
    width: 100%;
  }

  :deep(.login-image) {
    display: none !important;
  }

  :deep(.title-wrap) {
    display: none !important;
  }
}

.auth-footer {
  margin-top: 20px;
  text-align: center;

  .footer-text {
    font-size: 12px;
    color: $dark_gray;
    margin: 0;
  }
}

// Акцентные цвета
.auth-page.theme-user .auth-content :deep(.el-button--primary) {
  background: #1890ff;
  border-color: #1890ff;
  &:hover { background: #40a9ff; border-color: #40a9ff; }
}

.auth-page.theme-admin .auth-content :deep(.el-button--primary) {
  background: #ff4d4f;
  border-color: #ff4d4f;
  &:hover { background: #ff7875; border-color: #ff7875; }
}

.auth-page.theme-tester .auth-content :deep(.el-button--primary) {
  background: #faad14;
  border-color: #faad14;
  &:hover { background: #ffc53d; border-color: #ffc53d; }
}

// Адаптивность
@media (max-width: 1200px) {
  .auth-container {
    max-width: 900px;
    grid-template-columns: 1fr 400px;
  }
  .auth-content { padding: 30px 40px; }
}

@media (max-width: 900px) {
  .auth-container {
    grid-template-columns: 1fr;
    max-width: 500px;
    min-height: auto;
  }
  .auth-image { min-height: 200px; max-height: 250px; }
  .auth-content { padding: 30px 20px; }
}

@media (max-width: 600px) {
  .auth-page { padding: 10px; }
  .auth-container { max-width: 100%; border-radius: 0; }
  .auth-image { min-height: 150px; max-height: 180px; }
  .auth-content { padding: 20px 15px; }
  .title-wrap .title { font-size: 20px; }
  .mode-badge {
    padding: 8px 12px;
    .mode-icon { font-size: 16px; }
    .mode-label { font-size: 12px; }
  }
}
</style>
