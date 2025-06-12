<template>
  <ElConfigProvider :locale="elementLocale" :key="configProviderKey">
    <router-view />
  </ElConfigProvider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import { ref, watch, onMounted } from 'vue'
import { useChatStore } from '@/Modules/TalkStream/Stores/chatStore'
import { useI18n } from 'vue-i18n'

const chat = useChatStore()
const { locale } = useI18n()
const configProviderKey = ref(0)
const elementLocale = ref(null)

// Импорт локалей
import('element-plus/dist/locale/ru.mjs').then(module => {
  elementLocale.value = module.default
})

watch(locale, (newLang) => {
  // Динамически загружаем локаль
  import(`element-plus/dist/locale/${newLang}.mjs`).then(module => {
    elementLocale.value = module.default
    configProviderKey.value++ // Принудительное обновление
  })
})
</script>
