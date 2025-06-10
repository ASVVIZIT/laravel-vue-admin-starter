<template>
  <div class="chat-container">
    <el-card>
      <template #header>
        <div class="chat-header">
          <h3>Общий чат</h3>
          <el-tag :type="connectionStatus === 'Подключено!' ? 'success' : 'danger'">
            {{ connectionStatus }}
          </el-tag>
        </div>
      </template>

      <div class="chat-messages" ref="messagesContainer">
        <div
            v-for="msg in messageStore.messages"
            :key="msg.id"
            class="message"
            :class="{
            'sent': msg.sender_id === useUserStore.id,
            'received': msg.sender_id !== useUserStore.id
          }"
        >
          <div class="message-sender">{{ msg.sender?.name || 'Unknown' }}</div>
          <div class="message-content">{{ msg.message }}</div>
          <div class="message-time">{{ formatTime(msg.created_at) }}</div>
          <div v-if="msg.is_optimistic" class="message-status">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
        </div>
      </div>

      <div class="message-input">
        <el-input
            v-model="newMessage"
            placeholder="Введите сообщение..."
            @keyup.enter="sendMessage"
            :disabled="messageStore.loading"
        >
          <template #append>
            <el-button
                type="primary"
                :icon="SetUp"
                @click="sendMessage"
                :disabled="!newMessage.trim() || messageStore.loading"
                :loading="messageStore.loading"
            />
          </template>
        </el-input>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance, nextTick } from 'vue';
import { format } from 'date-fns';
import { SetUp, Loading } from '@element-plus/icons-vue';
import { userStore } from '@/store/user';
import { messageStore } from '@/store/GlobalChat/messageStore';
import axios from 'axios';

const appInstance = getCurrentInstance();
const $echo = appInstance.appContext.config.globalProperties.$echo;
const messagesContainer = ref(null);

const useUserStore = userStore();
const useMessageStore = messageStore();
const newMessage = ref('');
const connectionStatus = ref('Подключение...');

const formatTime = (dateString) => {
  try {
    return format(new Date(dateString), 'HH:mm');
  } catch (e) {
    console.error('Ошибка форматирования даты:', e);
    return '';
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  let tempId = Date.now();

  try {
    const optimisticMessage = {
      id: tempId,
      sender_id: useUserStore.id,
      sender: { name: useUserStore.name },
      message: newMessage.value,
      created_at: new Date().toISOString(),
      is_optimistic: true
    };

    useMessageStore.addMessage(optimisticMessage);
    scrollToBottom();

    await useMessageStore.sendMessage({
      receiver_id: 2,
      message: newMessage.value
    });

    newMessage.value = '';
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    useMessageStore.removeOptimisticMessage(tempId);
  }
};

onMounted(async () => {

  await useMessageStore.fetchMessages();
  scrollToBottom();

  if (!$echo) {
    connectionStatus.value = 'Echo не инициализирован!';
    return;
  }

  // Подписка на события соединения
  $echo.connector.connection.bind('connected', () => {
    connectionStatus.value = 'Подключено!';
  });

  $echo.connector.connection.bind('disconnected', () => {
    connectionStatus.value = 'Отключено!';
  });

  $echo.connector.connection.bind('error', (error) => {
    console.error('Ошибка подключения Echo:', error);
    connectionStatus.value = 'Ошибка подключения';
  });

  // Подписка на канал чата
  const channel = $echo.private(`chat.${useUserStore.id}`);

  channel.listen('NewMessageEvent', (event) => {
    useMessageStore.addMessage(event.message);
    scrollToBottom();
  });

  // Инициируем подключение
  $echo.connect();
});

onBeforeUnmount(() => {
  if ($echo) {
    $echo.disconnect();
  }
});
</script>
<style scoped>
/* Стили остаются без изменений */
.chat-container {
  margin: 0 auto;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-messages {
  height: calc(100vh - 280px);
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  max-width: 80%;
  position: relative;
}

.message-sender {
  font-weight: bold;
  font-size: 0.85rem;
  margin-bottom: 5px;
}

.message-content {
  padding: 8px 12px;
  border-radius: 12px;
  display: inline-block;
}

.message-time {
  font-size: 0.75rem;
  color: #909399;
  text-align: right;
  margin-top: 5px;
}

.message-status {
  position: absolute;
  right: 5px;
  bottom: 5px;
}

.sent {
  align-self: flex-end;
  text-align: right;
}

.sent .message-content {
  background-color: #409eff;
  color: white;
}

.received {
  align-self: flex-start;
  text-align: left;
}

.received .message-content {
  background-color: #f5f7fa;
  color: #606266;
}

.message-input {
  display: flex;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
