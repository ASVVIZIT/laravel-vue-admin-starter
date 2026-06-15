<template>
  <footer class="footer">
    <div class="footer-content">
      <p>Разработано с ❤️ на <strong>Laravel + Vue 3</strong></p>
      <p class="copyright">© {{ year }} {{ appName }} · by ASV</p>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  appName: { type: String, default: 'FenixPortal' },
  year: { type: Number, default: new Date().getFullYear() }
})
</script>

<style scoped>
.footer {
  text-align: center;
  padding: 40px 0 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.footer p {
  margin: 4px 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.copyright {
  font-size: 12px !important;
  opacity: 0.7;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
