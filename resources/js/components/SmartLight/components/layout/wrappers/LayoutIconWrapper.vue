<template>
  <div class="layout-icon-wrapper" :class="wrapperClass" :style="wrapperStyle">
    <div class="icon-container" :style="iconContainerStyle">
      <el-icon :size="size" :color="color">
        <component :is="icon" />
      </el-icon>

      <!-- Слот для overlay (например, fill indicator) -->
      <slot name="overlay"></slot>

      <!-- Слот для badge (например, status indicator) -->
      <slot name="badge"></slot>
    </div>

    <!-- Слот для label/text -->
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon: { type: Object, required: true },
  size: { type: Number, default: 16 },
  color: { type: String, default: '#409EFF' },
  vertical: { type: Boolean, default: false },
  rotation: { type: Number, default: 0 },
  spin: { type: Boolean, default: false },
  spinDuration: { type: String, default: '2s' }
});

const wrapperClass = computed(() => ({
  'layout-icon-wrapper--vertical': props.vertical,
  'layout-icon-wrapper--horizontal': !props.vertical,
  'layout-icon-wrapper--spin': props.spin
}));

const wrapperStyle = computed(() => ({
  '--spin-duration': props.spinDuration
}));

const iconContainerStyle = computed(() => ({
  transform: `rotate(${props.rotation}deg)`,
  animation: props.spin ? `icon-spin ${props.spinDuration} linear infinite` : 'none'
}));
</script>

<style scoped>
.layout-icon-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.layout-icon-wrapper--vertical {
  flex-direction: column;
}

.layout-icon-wrapper--horizontal {
  flex-direction: row;
}

.icon-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.layout-icon-wrapper--spin .icon-container {
  animation: icon-spin v-bind(spinDuration) linear infinite;
}

@keyframes icon-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

:deep(.el-icon) {
  display: inline-flex;
}
</style>
