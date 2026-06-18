<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const hash = window.location.search.slice(1);
  if (window.localStorage && hash) {
    window.localStorage.setItem('x-admin-oauth-code', hash);
    window.close();
  }
});
</script>

<template>
  <div class="auth-redirect">
    <p>Redirecting...</p>
  </div>
</template>

<style scoped>
.auth-redirect {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #888;
}
</style>
