<template>
  <div class="split-pane-advanced" ref="container">
    <div class="pane-left" :style="{ width: leftWidth + 'px' }">
      <slot name="left" />
    </div>

    <div
        class="splitter"
        @mousedown="startResize"
    >
      <div class="splitter-content">
        <span class="splitter-icon">⋮⋮</span>
      </div>
    </div>

    <div class="pane-right" :style="{ width: rightWidth + 'px' }">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  initialSplit: { type: Number, default: 400 },
  minLeft: { type: Number, default: 200 },
  minRight: { type: Number, default: 300 }
})

const container = ref(null)
const leftWidth = ref(props.initialSplit)
const rightWidth = ref(0)
const isResizing = ref(false)
const containerWidth = ref(0)

onMounted(() => {
  updateContainerWidth()
  window.addEventListener('resize', updateContainerWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerWidth)
})

function updateContainerWidth() {
  if (container.value) {
    containerWidth.value = container.value.offsetWidth
    rightWidth.value = containerWidth.value - leftWidth.value - 8
  }
}

function startResize(e) {
  isResizing.value = true
  document.addEventListener('mousemove', resize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  e.preventDefault()
}

function resize(e) {
  if (!isResizing.value || !container.value) return

  const newLeftWidth = e.clientX - container.value.getBoundingClientRect().left
  const newRightWidth = containerWidth.value - newLeftWidth - 8

  if (newLeftWidth >= props.minLeft && newRightWidth >= props.minRight) {
    leftWidth.value = newLeftWidth
    rightWidth.value = newRightWidth
  }
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', resize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
}
</script>

<style scoped>
.split-pane-advanced {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

.pane-left, .pane-right {
  overflow: auto;
}

.splitter {
  width: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.splitter:hover {
  background: rgba(59, 130, 246, 0.4);
}

.splitter-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

.splitter-icon {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 2px;
}

.splitter:hover .splitter-icon {
  color: #fff;
}
</style>
