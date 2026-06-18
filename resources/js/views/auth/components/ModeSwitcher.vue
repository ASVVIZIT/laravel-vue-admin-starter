<template>
  <div class="mode-switcher">
    <div class="switcher-track">
      <div class="switcher-slider" :style="sliderStyle" />

      <button
          v-for="mode in safeModes"
          :key="mode.value"
          class="switcher-button"
          :class="{ active: safeValue === mode.value }"
          @click="handleClick(mode.value)"
          type="button"
      >
        <span class="mode-icon">{{ mode.icon || '•' }}</span>
        <span class="mode-label">{{ mode.label || mode.value }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: 'user' },
  modes: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'change'])

const safeModes = computed(() => {
  return Array.isArray(props.modes)
      ? props.modes.filter(m => m && m.value)
      : []
})

const safeValue = computed(() => {
  return props.modelValue || 'user'
})

// P1: Защита от -1
const activeIndex = computed(() => {
  const idx = safeModes.value.findIndex(m => m.value === safeValue.value)
  return idx >= 0 ? idx : 0
})

const sliderWidth = computed(() => {
  const len = safeModes.value.length
  return len > 0 ? 100 / len : 100
})

const sliderStyle = computed(() => ({
  width: `calc(${sliderWidth.value}% - 8px)`,
  transform: `translateX(calc(${activeIndex.value * 100}% + ${activeIndex.value * 8}px))`
}))

const handleClick = (value) => {
  if (!value || value === safeValue.value) return
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.mode-switcher { margin-bottom: 20px; }

.switcher-track {
  position: relative;
  display: flex;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 4px;
  overflow: hidden;
}

.switcher-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  height: calc(100% - 8px);
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.switcher-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.mode-icon {
  font-size: 22px;
  transition: transform 0.3s ease;
}

.switcher-button.active .mode-icon {
  transform: scale(1.25);
}

.mode-label {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.switcher-button.active .mode-label { color: #1890ff; }
.switcher-button:hover:not(.active) .mode-label { color: #555; }
</style>
