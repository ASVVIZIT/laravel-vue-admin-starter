<template>
  <section class="heroSection">
    <div class="heroContent" :style="{ textAlign: settings.textAlign }">
      <div v-if="settings.stageBadgeEnabled" class="logoBadge">
        <span class="logoIcon">{{ settings.logoIcon }}</span>
        <span class="logoText">{{ settings.logoText }}</span>
      </div>
      <h1 class="mainTitle">
        <span class="titleGradient">{{ settings.title }}</span>
      </h1>
      <p class="subtitle">{{ settings.subtitle }}</p>
      <div v-if="settings.stageBadgeEnabled" class="stageBadge">
        <span class="pulseDot"></span>
        <span>{{ settings.stageBadge }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  settings: { type: Object, default: () => ({}) },
  blockId: String
})
</script>

<style scoped>
.heroSection {
  margin-bottom: 4px;
  animation: fadeInDown 0.8s ease-out;
}
.heroContent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.logoBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 100px;
}
.logoIcon { font-size: 20px; }
.logoText {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--primary-color, #ff6b35);
}
.mainTitle {
  font-size: clamp(32px, 6vw, 64px);
  font-weight: 900;
  margin: 0;
  line-height: 1;
  letter-spacing: -1px;
}
.titleGradient {
  background: linear-gradient(135deg, var(--primary-color, #ff6b35), var(--secondary-color, #f7931e), var(--accent-color, #ff4757));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 5s ease infinite;
  background-size: 200% 200%;
}
.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 300;
}
.stageBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  font-size: 12px;
}
.pulseDot {
  width: 6px;
  height: 6px;
  background: #00d084;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
