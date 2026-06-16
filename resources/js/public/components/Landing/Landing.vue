<template>
  <div class="public-app">
    <AnimatedBackground />

    <div class="content-wrapper">
      <HeroSection />

      <CountdownSection target-date="25.11.2026" />

      <ProgressSection />

      <TechStackSection />

      <FeaturesSection />

      <FooterSection />
    </div>
  </div>
</template>

<script setup>
import {
  AnimatedBackground,
  HeroSection,
  CountdownSection,
  ProgressSection,
  TechStackSection,
  FeaturesSection,
  FooterSection
} from './index.js'
</script>

<style scoped>
.public-app {
  min-height: 100vh;
  background: #0a0e27;
  color: #fff;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px;
}
</style>
