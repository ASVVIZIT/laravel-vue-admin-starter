<template>
  <div class="landing-settings-page">
    <!-- Подключаем основной компонент настроек -->
    <LandingSiteSettingsModeSwitcher />
  </div>
</template>

<script setup>
// Импортируем рефакторенный компонент из папки components
import LandingSiteSettingsModeSwitcher from '@/components/SiteSettings/LandingSiteSettings/LandingSiteSettingsModeSwitcher.vue'
</script>

<style scoped>
.landing-settings-page {
  /* Опционально: добавляем отступы, если они не предусмотрены внутри самого компонента или Layout */
  padding: 4px;
  width: 100%;
  height: 100%;
}
</style>
