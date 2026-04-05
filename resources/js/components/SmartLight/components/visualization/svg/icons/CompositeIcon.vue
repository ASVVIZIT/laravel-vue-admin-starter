<template>
  <div class="composite-icon" :style="{ width: size, height: size }">
    <LayoutIconWrapper
        :icon="iconComponent"
        :size="iconSize"
        :color="color"
        :rotation="rotation"
        :spin="spin"
        :spin-duration="spinDuration"
        :vertical="vertical"
    >
      <!-- Overlay slot -->
      <template #overlay>
        <slot name="overlay"></slot>
      </template>

      <!-- Badge slot -->
      <template #badge>
        <slot name="badge"></slot>
      </template>

      <!-- Label slot -->
      <slot name="label"></slot>
    </LayoutIconWrapper>
  </div>
</template>

<script setup>
import LayoutIconWrapper from '@components/SmartLight/components/layout/wrappers/LayoutIconWrapper.vue';

const props = defineProps({
  icon: { type: Object, required: true },
  size: { type: String, default: '32px' },
  iconSize: { type: Number, default: 24 },
  color: { type: String, default: '#409EFF' },
  rotation: { type: Number, default: 0 },
  spin: { type: Boolean, default: false },
  spinDuration: { type: String, default: '2s' },
  vertical: { type: Boolean, default: false }
});

const iconComponent = props.icon;
</script>

<style scoped>
.composite-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
