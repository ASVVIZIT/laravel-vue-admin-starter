<template>
  <transition name="lt-fade">
    <span v-show="visible" class="lt-inline" :style="cssVars">
      <span class="lt-inline-spinner"></span>
      <span v-if="text" class="lt-inline-text">{{ text }}</span>
    </span>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getLoadingState } from '@/modules/TalkStream/Composables/useLoading'
import logger from '@/modules/TalkStream/utils/logger'
import { loadingConfig } from '@/modules/TalkStream/config/loading'

const props = defineProps({
  target: { type: String, default: 'global' },
  text: { type: String, default: '' }
})

const visible = computed(() => {
  const state = getLoadingState(props.target)
  logger.debug(`[LoadingIndicatorInline] ${props.target}: ${state ? 'показываем' : 'скрываем'}`)
  return state
})

// Токены inline заданы в конфиге полностью (компонент пишется с нуля),
// поэтому здесь нет TODO - значения известны по построению.
const cssVars = computed(() => {
  const sp = loadingConfig.variants.inline.spinner
  const placement = loadingConfig.variants.inline.labelPlacement
  return {
    '--lt-size': `${sp.size}px`,
    '--lt-border': `${sp.border}px`,
    '--lt-track': sp.track ?? 'transparent',
    '--lt-tone': sp.tone ?? 'currentColor',
    '--lt-text-size': sp.textSize ?? '0.7rem',
    '--lt-text-color': sp.textColor ?? 'inherit',
    '--lt-gap': `${sp.labelGap}px`,
    '--lt-direction': placement === 'left' ? 'row-reverse' : 'row'
  } as Record<string, string>
})
</script>

<style scoped lang="scss">
.lt-inline {
  display: inline-flex;
  align-items: center;
  gap: var(--lt-gap);
  flex-direction: var(--lt-direction);
  vertical-align: middle;
  line-height: 1;
}

.lt-inline-spinner {
  width: var(--lt-size);
  height: var(--lt-size);
  border: var(--lt-border) solid var(--lt-track);
  border-top-color: var(--lt-tone);
  border-radius: 50%;
  animation: lt-spin 0.8s linear infinite;
  flex-shrink: 0;
}

.lt-inline-text {
  font-size: var(--lt-text-size);
  color: var(--lt-text-color);
  white-space: nowrap;
}

@keyframes lt-spin {
  to { transform: rotate(360deg); }
}

.lt-fade-enter-active,
.lt-fade-leave-active {
  transition: opacity 0.15s ease;
}

.lt-fade-enter-from,
.lt-fade-leave-to {
  opacity: 0;
}
</style>
