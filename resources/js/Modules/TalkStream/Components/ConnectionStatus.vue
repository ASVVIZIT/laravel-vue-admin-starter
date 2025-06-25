<script setup>
import { useTalkStreamStore } from '@/Modules/TalkStream/Stores/talkStreamStore';

const talkStream = useTalkStreamStore();
</script>

<template>
  <div class="connection-status">
    <div v-if="talkStream.isConnected" class="status connected">
      <span class="indicator"></span>Server Online
    </div>

    <div v-else-if="talkStream.connectionError" class="status error">
      <span class="indicator"></span>
      Server Connection error: {{ talkStream.connectionError || 'Unknown error' }}
      <button @click="talkStream.forceReconnect">Server Retry</button>
    </div>

    <div v-else class="status connecting">
      <span class="indicator"></span>
      Server Connecting...
    </div>
  </div>
</template>

<style lang="scss" scoped>
.connection-status {
  position: fixed;
  bottom: 8px;
  right: 24px;
  padding: 6px 10px;
  background: #f3efef;
  border-radius: 8px;
  box-shadow: 3px 3px 7px 1px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  display: flex;
  align-items: center;
  z-index: 1000;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.connected .indicator {
  background-color: #10b981;
}

.connecting .indicator {
  background-color: #f59e0b;
  animation: pulse 1.5s infinite;
}

.error .indicator {
  background-color: #ef4444;
}

button {
  margin-left: 12px;
  padding: 4px 8px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #e5e7eb;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
