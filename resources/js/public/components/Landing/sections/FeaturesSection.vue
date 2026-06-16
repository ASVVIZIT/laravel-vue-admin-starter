<template>
  <section class="features-section">
    <SectionTitle icon="✨">Что уже работает</SectionTitle>

    <div class="features-grid">
      <FeatureCard
          v-for="feature in features"
          :key="feature.title"
          v-bind="feature"
      />
    </div>
  </section>
</template>

<script setup>
import SectionTitle from '../ui/SectionTitle.vue'
import FeatureCard from '../widgets/FeatureCard.vue'
import { featuresList } from '../data/features.js'

defineProps({
  features: {
    type: Array,
    default: () => featuresList
  }
})
</script>

<style scoped>
.features-section {
  margin-bottom: 80px;
  animation: fadeInUp 0.8s ease-out 0.5s both;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
