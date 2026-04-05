<template>
  <div class="device-status" :class="statusClass">
    <div class="status-indicator"></div>
    <span class="status-text">{{ statusText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    default: 'OFF',
    validator: (value) => ['ON', 'OFF', 'SLEEPING', 'ERROR'].includes(value)
  }
});

const statusClass = computed(() => ({
  'device-status--on': props.status === 'ON',
  'device-status--off': props.status === 'OFF',
  'device-status--sleeping': props.status === 'SLEEPING',
  'device-status--error': props.status === 'ERROR'
}));

const statusText = computed(() => ({
  'ON': 'Вкл',
  'OFF': 'Выкл',
  'SLEEPING': 'Сон',
  'ERROR': 'Ошб'
}[props.status] || 'N/A'));
</script>

<style scoped>
.device-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-text {
  white-space: nowrap;
}

.device-status--on {
  background-color: #f0f9ec;
  color: #67c23a;
}

.device-status--on .status-indicator {
  background-color: #67c23a;
}

.device-status--off {
  background-color: #f5f7fa;
  color: #909399;
}

.device-status--off .status-indicator {
  background-color: #909399;
  animation: none;
}

.device-status--sleeping {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.device-status--sleeping .status-indicator {
  background-color: #e6a23c;
  animation: pulse-slow 3s infinite;
}

.device-status--error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.device-status--error .status-indicator {
  background-color: #f56c6c;
  animation: pulse-fast 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes pulse-fast {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
