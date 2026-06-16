<template>
  <section class="featuresSection">
    <div class="sectionHeader">
      <span class="sectionIcon">✨</span>
      <h2 class="sectionTitle">{{ settings.title }}</h2>
    </div>
    <div class="featuresGrid" :style="{ gridTemplateColumns: `repeat(${settings.columns || 3}, 1fr)` }">
      <LandingFeatureCard v-for="item in settings.items" :key="item.title" v-bind="item" />
    </div>
  </section>
</template>

<script setup>
import LandingFeatureCard from '../common/LandingFeatureCard.vue'

defineProps({
  settings: { type: Object, default: () => ({}) },
  blockId: String
})
</script>

<style scoped>
.featuresSection {
  margin-bottom: 4px;
  animation: fadeInUp 0.8s ease-out 0.5s both;
}
.sectionHeader {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
  margin-bottom: 4px;
}
.sectionIcon { font-size: 28px; }
.sectionTitle {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.featuresGrid {
  display: grid;
  gap: 4px;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
