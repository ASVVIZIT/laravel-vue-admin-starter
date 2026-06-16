<template>
  <div class="split-pane" ref="container">
    <div class="pane-left" :style="{ width: leftWidth + '%' }">
      <slot name="left" />
    </div>

    <div
        class="splitter"
        @mousedown="startResize"
        @touchstart="startResize"
    >
      <div class="splitter-handle">
        <div class="splitter-line"></div>
        <div class="splitter-line"></div>
        <div class="splitter-line"></div>
      </div>
    </div>

    <div class="pane-right" :style="{ width: rightWidth + '%' }">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  initialSplit: { type: Number, default: 40 },
  minLeft: { type: Number, default: 20 },
  minRight: { type: Number, default: 30 }
})

const container = ref(null)
const leftWidth = ref(props.initialSplit)
const rightWidth = ref(100 - props.initialSplit)
const isResizing = ref(false)

function startResize(e) {
  isResizing.value = true
  document.addEventListener('mousemove', resize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', resize, { passive: false })
  document.addEventListener('touchend', stopResize)
  e.preventDefault()
}

function resize(e) {
  if (!isResizing.value || !container.value) return

  const containerRect = container.value.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const newLeftWidth = ((clientX - containerRect.left) / containerRect.width) * 100

  if (newLeftWidth >= props.minLeft && newLeftWidth <= (100 - props.minRight)) {
    leftWidth.value = newLeftWidth
    rightWidth.value = 100 - newLeftWidth
  }
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', resize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', resize)
  document.removeEventListener('touchend', stopResize)
}
</script>

<style scoped>
.split-pane {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
}

.pane-left, .pane-right {
  overflow: hidden;
}

.splitter {
  width: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  z-index: 10;
}

.splitter:hover {
  background: rgba(245, 158, 11, 0.3);
}

.splitter:active {
  background: rgba(245, 158, 11, 0.5);
}

.splitter-handle {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 20px 0;
}

.splitter-line {
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.splitter:hover .splitter-line {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.splitter:active .splitter-line {
  background: #fff;
}
</style>
