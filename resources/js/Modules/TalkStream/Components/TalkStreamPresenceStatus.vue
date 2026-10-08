<template>
  <div
      v-if="text"
      class="presence-status"
      :class="rootClasses"
      aria-live="polite"
  >
    <span class="presence-status__text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import type {
  PresenceTone,
  PresenceVariant,
} from '@/modules/TalkStream/types/presence'

/**
 * Чисто презентационный компонент.
 *
 * Он НЕ должен:
 *   - читать сторы;
 *   - ходить в API;
 *   - форматировать даты;
 *   - решать приоритет статусов.
 *
 * Получает готовый text/tone и просто рисует.
 */
const props = withDefaults(defineProps<{
  text: string
  tone?: PresenceTone
  variant?: PresenceVariant
}>(), {
  tone: 'unknown',
  variant: 'header',
})

const rootClasses = computed(() => {
  return [
    `presence-status--${props.variant}`,
    `presence-status--${props.tone}`,
  ]
})
</script>

<style scoped lang="scss">
.presence-status {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  line-height: 1.15;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.presence-status__text {
  overflow: hidden;
  text-overflow: ellipsis;
}

.presence-status--header {
  font-size: 0.72rem;
}

.presence-status--list {
  font-size: 0.58rem;
}

.presence-status--compact {
  font-size: 0.52rem;
}

.presence-status--typing {
  color: #16a34a;
  font-weight: 600;
}

.presence-status--online {
  color: #16a34a;
}

.presence-status--away {
  color: #d97706;
}

.presence-status--dnd {
  color: #dc2626;
}

.presence-status--invisible,
.presence-status--offline,
.presence-status--unknown {
  color: #94a3b8;
}
</style>
