<template>
  <div class="light-bulb" :class="statusClass" :device-id="deviceId">
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: value => ['ON', 'OFF', 'SLEEPING', 'FULL_ON'].includes(value)
  },
  intensity: {
    type: Number,
    default: 100
  },
  deviceId: {
    type: String,
    required: true
  },
  show3D: {
    type: Boolean,
    default: true
  }
});

const statusClass = computed(() => `bulb-status-${props.status.toLowerCase()}`);
</script>

<style scoped>
.light-bulb {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
