<template>
  <div
      class="light-bulb"
      :class="statusClass"
      :device-id="deviceId"
  >
    <!-- Содержимое будет переопределено в дочерних компонентах -->
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

// Вычисляем класс состояния
const statusClass = computed(() => {
  return `bulb-status-${props.status.toLowerCase()}`;
});
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

/* Стили для состояния ON */
.bulb-status-on {
  /* Унаследовано в дочерних компонентах */
}

/* Стили для состояния OFF */
.bulb-status-off {
  /* Унаследовано в дочерних компонентах */
}

/* Стили для состояния SLEEPING */
.bulb-status-sleeping {
  /* Унаследовано в дочерних компонентах */
}
</style>
