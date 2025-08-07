<template>
  <ElConfigProvider :locale="elementLocale" :key="configProviderKey">
    <router-view />
  </ElConfigProvider>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import {getCsrfToken, isLogged} from '@/utils/auth';
import { ElConfigProvider } from 'element-plus';
import { getActivePinia } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useTalkStreamStore } from '@/Modules/TalkStream/Stores/talkStreamStore';
import { userStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
const authStore = useAuthStore();

const { locale } = useI18n();
const configProviderKey = ref(0);
const elementLocale = ref(null);
const pinia = getActivePinia();

// Импорт локалей
import('element-plus/dist/locale/ru.mjs').then(module => {
  elementLocale.value = module.default;
})

const useUserStore = userStore();
const talkStreamStore = useTalkStreamStore();

onMounted(async () => {
  if (isLogged) {
    await getCsrfToken()
  }

  // При запуске приложения проверяем, залогинены ли мы
  if (authStore.token) {
    console.log('[App] Token found, checking authentication...');
    await authStore.checkAuth();
    // Если токен невалиден, checkAuth сам очистит состояние и куки
  } else {
    console.log('[App] No token found on startup.');
  }

  // Для отладки: проверка состояния хранилища
  console.log('TalkStream store state onMounted:', talkStreamStore.$state)

  if (useUserStore.token && !talkStreamStore.isConnected) {
    talkStreamStore.initWebSockets()

    // Debug connection
    setInterval(() => {
      console.log('Connection state:', talkStreamStore.isConnected);
    }, 5000);
    //console.log('window.getEchoInstance()', window.getEchoInstance?.())
    //console.log('pinia.state.value.talkStream', pinia.state.value.talkStream)
  }
})

// Отслеживание изменений токена авторизации
watch(
    () => useUserStore.token,
    (newToken, oldToken) => {
      if (newToken) {
        // Новый токен - инициализируем подключение
        talkStreamStore.initWebSockets()
      } else if (oldToken && !newToken) {
        // Токен удален - отключаем WebSocket
        talkStreamStore.disconnect()
      }
    }
)

// Отслеживание состояния авторизации
watch(
    () => useUserStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        talkStreamStore.initWebSockets()
      } else {
        talkStreamStore.disconnect()
      }
    }
)

// Отслеживание ошибок подключения
watch(
    () => talkStreamStore.connectionError,
    (error) => {
      if (error) {
        console.error('WebSocket connection error:', error)
        // Здесь можно добавить логику отображения ошибки в UI
      }
    }
)

// Отслеживание изменений локализации
watch(locale, (newLang) => {
  // Динамически загружаем локаль
  import(`element-plus/dist/locale/${newLang}.mjs`).then(module => {
    elementLocale.value = module.default
    configProviderKey.value++ // Принудительное обновление
  })
})

// Очистка перед уничтожением компонента
onBeforeUnmount(() => {
  console.log('TalkStream store state onBeforeUnmount:')
  talkStreamStore.disconnect()
})
</script>
