<template>
  <router-view />
</template>

<script setup>
// Минимальный App.vue без ElementPlus конфигов
</script>

<style>
/* ✅ Глобальная плавная прокрутка */
html {
  scroll-behavior: smooth;
}

/* ✅ Убираем отступы по умолчанию */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ✅ Плавная прокрутка для всех элементов */
body {
  overflow-x: hidden;
  scroll-behavior: smooth;
}
</style>
