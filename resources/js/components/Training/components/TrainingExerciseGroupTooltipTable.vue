<template>
  <div
      class="sets-group-tooltip-trigger"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @mousemove="onMouseMove"
  >
    <slot />

    <Teleport to="body">
      <transition name="fade">
        <div
            v-if="visible && entities.length"
            class="sets-group-tooltip"
            :style="tooltipStyle"
        >
          <div class="tooltip-header">
            <el-icon><DataLine /></el-icon>
            <span>{{ entityLabel }} ({{ entities.length }})</span>
          </div>
          <div class="tooltip-divider"></div>
          <div class="tooltip-body">
            <div v-for="(entity, i) in entities" :key="i" class="tooltip-row">
              <span class="entity-bullet">•</span>
              <span class="entity-name">{{ entity }}</span>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { DataLine } from '@element-plus/icons-vue'

const props = defineProps({
  entities: { type: Array, default: () => [] },
  entityLabel: { type: String, default: 'Упражнения' }
})

const visible = ref(false)
const cursorPos = ref({ x: 0, y: 0 })

const tooltipStyle = computed(() => {
  const offset = 12
  return {
    left: `${cursorPos.value.x + offset}px`,
    top: `${cursorPos.value.y - 40}px`,
    zIndex: 3000
  }
})

const onMouseEnter = () => { visible.value = true }
const onMouseLeave = () => { visible.value = false }
const onMouseMove = (e) => {
  cursorPos.value = { x: e.clientX, y: e.clientY }
}
</script>

<style scoped>
.sets-group-tooltip-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: help;
  position: relative;
}

.sets-group-tooltip {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  padding: 4px 6px;
  min-width: 140px;
  max-width: 240px;
  font-size: 10px;
  pointer-events: none;
  animation: fadeIn 0.15s ease;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 4px;
  margin-bottom: 4px;
  border-bottom: 1px dashed #ebeef5;
  color: #606266;
  font-weight: 500;
  font-size: 11px;
}

.tooltip-header .el-icon { font-size: 11px; color: #409eff; }

.tooltip-divider {
  height: 1px;
  background: #ebeef5;
  margin: 2px 0;
}

.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 200px;
  overflow-y: auto;
}

.tooltip-row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  padding: 1px 4px;
  color: #606266;
  transition: background 0.1s ease;
}

.tooltip-row:hover {
  background: #f5f7fa;
  border-radius: 2px;
}

.entity-bullet {
  color: #409eff;
  font-weight: 600;
  flex-shrink: 0;
  line-height: 1.4;
}

.entity-name {
  word-break: break-word;
  color: #303133;
  line-height: 1.4;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
