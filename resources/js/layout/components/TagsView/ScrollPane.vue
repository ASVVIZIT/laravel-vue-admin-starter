<template>
  <div>
    <el-scrollbar
        ref="scrollContainer"
        :vertical="false"
        class="scroll-container"
        @wheel.native.prevent="handleWheelScroll"
        role="region"
        aria-label="Панель горизонтальной прокрутки"
    >
      <slot />
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const emit = defineEmits(['scroll'])
const scrollContainer = ref(null)
const scrollWrapper = ref(null)
const resizeObserver = ref(null)
const currentActiveTag = ref(null)
const isDev = process.env.NODE_ENV === 'development'

const getScrollWrapper = () => {
  isDev && console.log('[ScrollPane] Получение wrapRef')
  return scrollContainer.value?.wrapRef
}

const updateScrollPosition = (tag) => {
  if (!scrollWrapper.value || !tag?.$el) {
    isDev && console.warn('[ScrollPane] Элементы недоступны')
    return
  }

  const container = scrollContainer.value?.$el
  const tagEl = tag.$el
  const containerWidth = container.offsetWidth
  const tagWidth = tagEl.offsetWidth
  const tagLeft = tagEl.offsetLeft
  const maxScroll = scrollWrapper.value.scrollWidth - containerWidth

  const targetPosition = Math.max(0, Math.min(
      tagLeft - (containerWidth - tagWidth) / 2,
      maxScroll
  ))

  scrollWrapper.value.scrollTo({ left: targetPosition, behavior: 'smooth' })
}

const moveToTarget = (tag) => {
  if (!tag?.$el || !document.contains(tag.$el)) {
    isDev && console.error('[ScrollPane] Невалидный тег:', tag)
    return
  }

  if (resizeObserver.value) resizeObserver.value.disconnect()

  currentActiveTag.value = tag
  resizeObserver.value = new ResizeObserver(() => updateScrollPosition(tag))
  resizeObserver.value.observe(tag.$el)
  updateScrollPosition(tag)
}

const handleWheelScroll = (e) => {
  if (!scrollWrapper.value) return
  const delta = e.deltaY ? -e.deltaY * 2 : e.wheelDelta / 2
  scrollWrapper.value.scrollLeft += delta
}

const emitScroll = () => emit('scroll')

onMounted(async () => {
  await nextTick()
  scrollWrapper.value = getScrollWrapper()
  if (scrollWrapper.value) {
    scrollWrapper.value.addEventListener('scroll', emitScroll, { passive: true })
  }
})

onBeforeUnmount(() => {
  if (scrollWrapper.value) scrollWrapper.value.removeEventListener('scroll', emitScroll)
  if (resizeObserver.value) resizeObserver.value.disconnect()
})

defineExpose({ moveToTarget })
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  background: #304156;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  :deep(.el-scrollbar__bar) {
    bottom: 0;
    height: 6px;
    background-color: rgba(200, 200, 200, 0.3);
    transition: height 0.2s;

    &:hover {
      height: 10px;
      background-color: rgba(150, 150, 150, 0.5);
    }
  }

  :deep(.el-scrollbar__wrap) {
    scroll-behavior: smooth;
    height: 40px;
    padding: 3px 0;
    margin-bottom: -6px;
    overflow-x: auto;
    overflow-y: hidden;

    [aria-hidden="true"] {
      display: none;
    }
  }

  :deep(.el-scrollbar__thumb) {
    background-color: rgba(100, 100, 100, 0.4);
    border-radius: 3px;

    &:hover {
      background-color: rgba(80, 80, 80, 0.6);
    }
  }

  :deep(.el-scrollbar__view) {
    display: inline-flex !important;
    align-items: center;
    gap: 2px;
  }
}
</style>
