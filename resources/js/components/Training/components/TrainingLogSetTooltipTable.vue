<template>
  <div
      class="sets-tooltip-trigger"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @mousemove="onMouseMove"
  >
    <slot />

    <Teleport to="body">
      <transition name="fade">
        <div
            v-if="visible && overflowSets.length"
            class="sets-tooltip"
            :style="tooltipStyle"
        >
          <div class="tooltip-header">
            <el-icon><List /></el-icon>
            <span>Остальные подходы</span>
          </div>
          <div class="tooltip-body">
            <div v-for="(set, i) in overflowSets" :key="i" class="tooltip-set-row">
              <span class="set-index">#{{ startIndex + i + 1 }}</span>
              <span class="set-value">{{ formatSetPreview(set, exerciseType) }}</span>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { List } from '@element-plus/icons-vue'
import { formatSetPreview } from '@components/Training/utils/trainingFormattersUtils.js'

const props = defineProps({
  allSets: { type: Array, required: true },
  visibleCount: { type: Number, default: 3 },
  exerciseType: { type: String, default: 'bodyweight' }
})

const visible = ref(false)
const cursorPos = ref({ x: 0, y: 0 })

const overflowSets = computed(() => props.allSets?.slice(props.visibleCount) || [])
const startIndex = computed(() => props.visibleCount)

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
.sets-tooltip-trigger { display: inline; position: relative; }

.sets-tooltip {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  padding: 4px 6px;
  min-width: 100px;
  max-width: 180px;
  font-size: 9px;
  pointer-events: none;
  animation: fadeIn 0.15s ease;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 3px;
  padding-bottom: 4px;
  margin-bottom: 4px;
  border-bottom: 1px dashed #ebeef5;
  color: #606266;
  font-weight: 500;
  font-size: 10px;
}

.tooltip-header .el-icon { font-size: 11px; color: #409eff; }

.tooltip-body { display: flex; flex-direction: column; gap: 2px; }

.tooltip-set-row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 1px 4px;
  color: #606266;
}

.tooltip-set-row:hover {
  background: #f5f7fa;
  border-radius: 2px;
}

.set-index { color: #909399; font-weight: 500; min-width: 20px; }
.set-value { font-weight: 500; color: #303133; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
