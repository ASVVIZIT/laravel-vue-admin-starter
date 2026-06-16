<template>
  <div class="animated-bg">
    <div
        v-for="orb in orbs"
        :key="orb.id"
        class="gradient-orb"
        :style="orb.style"
    ></div>
  </div>
</template>

<script setup>
const orbs = [
  {
    id: 1,
    style: {
      background: 'radial-gradient(circle, #ff6b35 0%, transparent 70%)',
      top: '-100px',
      left: '-100px',
      animationDelay: '0s'
    }
  },
  {
    id: 2,
    style: {
      background: 'radial-gradient(circle, #f7931e 0%, transparent 70%)',
      bottom: '-200px',
      right: '-200px',
      animationDelay: '7s'
    }
  },
  {
    id: 3,
    style: {
      background: 'radial-gradient(circle, #ff4757 0%, transparent 70%)',
      top: '50%',
      left: '50%',
      animationDelay: '14s'
    }
  }
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
  width: 500px;
  height: 500px;
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
