<template>
  <el-button @click="testSocket">Проверить WebSocket</el-button>
</template>

<script setup>
import { testWebSocketConnection } from '@/utils/socketTester';

const testSocket = () => {
  testWebSocketConnection();
};
</script>
