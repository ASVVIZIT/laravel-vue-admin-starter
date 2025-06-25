<template>
  <transition name="fade">
    <div v-show="visible" class="loading-indicator">
      <div class="spinner"></div>
      <div class="loading-text">{{ text }}</div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, computed, onMounted } from 'vue'
import { getLoadingState } from '@/modules/TalkStream/Composables/useLoading'
import logger from '@/modules/TalkStream/utils/logger'

const props = defineProps({
  target: {
    type: String,
    default: 'global'
  },
  text: {
    type: String,
    default: 'Загрузка...'
  }
})

const visible = computed(() => {
  const state = getLoadingState(props.target)
  logger.debug(`[LoadingIndicator] ${props.target}: ${state ? 'показываем' : 'скрываем'}`)
  return state
})

onMounted(() => {
  logger.info(`[LoadingIndicator] Инициализирован для: ${props.target}`)
})
</script>

<style lang="scss" scoped>
.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
  user-select: none;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-left-color: #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 0.7rem;
  color: #333;
  font-weight: bold;
  letter-spacing: 0.5px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
