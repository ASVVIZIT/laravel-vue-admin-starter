<template>
  <div class="landingPage">
    <AnimatedBackground />
    <div class="landingContent">
      <DynamicBlockRenderer
          v-for="block in blocks"
          :key="block.id"
          :block="block"
      />
    </div>
  </div>
</template>

<script setup>
import { mockLanding } from './config/mockLanding'
import DynamicBlockRenderer from './common/DynamicBlockRenderer.vue'
import AnimatedBackground from './common/AnimatedBackground.vue'

const blocks = mockLanding.blocks
    .filter(b => b.enabled)
    .sort((a, b) => a.order - b.order)
</script>

<style scoped>
.landingPage {
  min-height: 100vh;
  background: #0a0e27;
  color: #fff;
  position: relative;
}
.landingContent {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 4px;
}
</style>
