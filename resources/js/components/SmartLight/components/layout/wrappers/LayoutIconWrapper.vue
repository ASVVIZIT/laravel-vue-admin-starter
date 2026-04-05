<template>
  <div class="icon-layout-wrapper" :class="wrapperClass">
    <el-icon :size="size" :color="color">
      <component :is="icon" />
    </el-icon>
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon: { type: Object, required: true },
  size: { type: Number, default: 16 },
  color: { type: String, default: '#409EFF' },
  vertical: { type: Boolean, default: false }
});

const wrapperClass = computed(() => ({
  'icon-layout-wrapper--vertical': props.vertical,
  'icon-layout-wrapper--horizontal': !props.vertical
}));
</script>

<style scoped>
.icon-layout-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-layout-wrapper--vertical {
  flex-direction: column;
}

.icon-layout-wrapper--horizontal {
  flex-direction: row;
}
</style>
