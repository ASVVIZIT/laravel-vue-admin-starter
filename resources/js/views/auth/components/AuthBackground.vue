<template>
  <div className="auth-background">
    <div className="circle circle-1" :class="`mode-${safeMode}`"/>
    <div className="circle circle-2" :class="`mode-${safeMode}`"/>
    <div className="circle circle-3" :class="`mode-${safeMode}`"/>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {VALID_LOGIN_TYPES} from '@/utils/auth'

const props = defineProps({
  mode: {type: String, default: 'user'}
})

const safeMode = computed(() => {
  return VALID_LOGIN_TYPES.includes(props.mode) ? props.mode : 'user'
})
</script>

<style scoped>
.auth-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
  filter: blur(60px);
  transition: background 0.8s ease;
  animation: float 12s infinite ease-in-out;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  right: -50px;
  animation-delay: -4s;
}

.circle-3 {
  width: 250px;
  height: 250px;
  top: 50%;
  left: 50%;
  animation-delay: -8s;
}

.circle.mode-user {
  background: #1890ff;
}

.circle.mode-admin {
  background: #ff4d4f;
}

.circle.mode-tester {
  background: #faad14;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
}
</style>
