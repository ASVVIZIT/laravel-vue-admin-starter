<template>
  <header class="hero">
    <BaseBadge variant="brand" size="lg" icon="🔥">
      <span style="letter-spacing: 4px;">FENIX</span>
    </BaseBadge>

    <h1 class="main-title">
      <span class="title-gradient">FenixPortal</span>
    </h1>

    <p class="subtitle">{{ subtitle }}</p>

    <BaseBadge :pulse="true" variant="success" size="md">
      {{ stageText }}
    </BaseBadge>
  </header>
</template>

<script setup>
import BaseBadge from '../ui/BaseBadge.vue'

defineProps({
  subtitle: {
    type: String,
    default: 'Публичная часть сайта находится в активной разработке'
  },
  stageText: {
    type: String,
    default: 'Стадия 1 из 3 — Архитектура'
  }
})
</script>

<style scoped>
.hero {
  text-align: center;
  margin-bottom: 80px;
  animation: fadeInDown 0.8s ease-out;
}

.main-title {
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 900;
  margin: 32px 0 24px;
  line-height: 1;
  letter-spacing: -2px;
}

.title-gradient {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff4757 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradientShift 5s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px;
  font-weight: 300;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
