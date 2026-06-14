<template>
  <div class="animated-bg">
    <div
        v-for="orb in orbs"
        :key="orb.id"
        class="gradient-orb"
        :class="`orb-${orb.id}`"
        :style="{
        width: orb.size + 'px',
        height: orb.size + 'px',
        background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
        top: orb.top,
        left: orb.left,
        bottom: orb.bottom,
        right: orb.right,
        animationDelay: orb.delay
      }"
    ></div>
  </div>
</template>

<script setup>
const orbs = [
  { id: 1, size: 500, color: '#ff6b35', top: '-100px', left: '-100px', delay: '0s' },
  { id: 2, size: 600, color: '#f7931e', bottom: '-200px', right: '-200px', delay: '7s' },
  { id: 3, size: 400, color: '#ff4757', top: '50%', left: '50%', delay: '14s' }
]
</script>

<style scoped>
.animated-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
  animation: float 20s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(100px, -50px) scale(1.1); }
  66% { transform: translate(-50px, 100px) scale(0.9); }
}
</style>
