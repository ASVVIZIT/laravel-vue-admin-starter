<!-- resources/js/modules/TalkStream/Components/UI/Loading/LoadingIndicatorInline.vue -->

<template>
  <transition name="lt-fade">
    <span v-show="isVisible" class="lt-inline" :style="cssVars">
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
  target: {
    type: String,
    default: 'global'
  },
  text: {
    type: String,
    default: ''
  },
  manual: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const isVisible = computed(() => {
  const state = props.manual
      ? Boolean(props.visible)
      : getLoadingState(props.target)

  logger.debug(`[LoadingIndicatorInline] ${props.target}: ${state ? 'показываем' : 'скрываем'}`)

  return state
})

/**
 * CSS custom properties из конфига.
 *
 * Числовые поля SpinnerTokens типизированы как number | null, потому что
 * варианты default/small в config/loading.ts пока содержат null (TODO Пасс C).
 * У inline значения конкретные, но компилятор не сужает тип по ключу варианта.
 * Фолбэки ниже зеркалят числа из loadingConfig.variants.inline.spinner:
 * если конфиг когда-нибудь обнулит поле, компонент покажет разумный дефолт
 * вместо строки "nullpx" в DOM. Источник истины остаётся конфиг — фолбэк
 * здесь только защита типов и рантайма.
 *
 * В inline-режиме директива НЕ управляет opacity контейнера (в отличие от
 * overlay), поэтому <transition name="lt-fade"> здесь — единственный владелец
 * анимации появления/исчезновения. Убирать его нельзя.
 */
const cssVars = computed(() => {
  const sp = loadingConfig.variants.inline.spinner
  const placement = loadingConfig.variants.inline.labelPlacement

  return {
    '--lt-size': `${sp.size ?? 16}px`,
    '--lt-border': `${sp.border ?? 2}px`,
    '--lt-track': sp.track ?? 'transparent',
    '--lt-tone': sp.tone ?? 'currentColor',
    '--lt-text-size': sp.textSize ?? '0.7rem',
    '--lt-text-color': sp.textColor ?? 'inherit',
    '--lt-gap': `${sp.labelGap ?? 6}px`,
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
  to {
    transform: rotate(360deg);
  }
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
