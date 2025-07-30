<template>
  <div class="fenix-video-message-main">
    <div class="fenix-video-messages-header" v-if="messages.length > 0">
      <button class="fenix-close-all" @click="clear">
        Закрыть все
      </button>
    </div>

    <div class="fenix-video-messages-wrapper"
         @mouseenter="hovering = true"
         @mouseleave="hovering = false">
      <transition-group
          ref="messagesContainer"
          name="fenix-video-message"
          tag="div"
          class="fenix-video-messages"
          @scroll="handleScroll"
      >
        <div
            v-for="message in messages"
            :key="message.id"
            :class="['fenix-video-message', `fenix-video-message--${message.type}`, {
              'fenix-video-message--debug': message.debug
            }]"
            :data-id="message.id"
        >
          <div class="fenix-video-message__content-wrapper">
            <div class="fenix-video-message__icon">
              <span v-if="message.type === 'success'">✓ </span>
              <span v-else-if="message.type === 'warning'">⚠ </span>
              <span v-else-if="message.type === 'error'">✕ </span>
              <span v-else-if="message.type === 'debug'">🐞 </span>
              <span v-else>ℹ </span>
            </div>

            <div class="fenix-video-message__content">
              <div class="fenix-video-message__title">
                {{ message.title }}
                <span v-if="message.debug" class="fenix-video-message__debug-tag">DEBUG</span>
              </div>
              <div class="fenix-video-message__text">{{ message.content }}</div>

              <div v-if="!message.persistent && message.duration > 0" class="fenix-video-message__timer-info">
                <div class="fenix-video-message__timer">
                  <div class="fenix-video-message__timer-bar" :style="{ width: message.progress + '%' }"></div>
                </div>
                <div class="fenix-video-message__timer-label">
                  Закроется через {{ Math.ceil(message.duration / 1000) }} сек
                </div>
              </div>

              <div v-else-if="!message.persistent" class="fenix-video-message__timer-label">
                Сообщение закроется после вашего действия
              </div>
            </div>

            <button class="fenix-video-message__close" @click="removeMessage(message.id)">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
      </transition-group>
    </div>

    <div class="fenix-scroll-controls" v-show="hovering && showScrollButtons">
      <button
          v-if="scrollTop > 0"
          class="scroll-button scroll-top"
          @click="scrollToTop"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M5 12L12 5L19 12M12 19V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <button
          v-if="!isScrolledToBottom"
          class="scroll-button scroll-bottom"
          @click="scrollToBottom"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12L12 19L5 12M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted, computed, nextTick, onMounted, watch } from 'vue';

const props = defineProps({
  animationMode: {
    type: String,
    default: 'inside'
  },
  animationSpeed: {
    type: Number,
    default: 300
  }
});

const messages = ref([]);
let id = 0;

const messagesContainer = ref(null);
const scrollTop = ref(0);
const scrollHeight = ref(0);
const clientHeight = ref(0);
const scrollThreshold = 50; // Порог для определения "внизу" контейнера
const hovering = ref(false);

const showScrollButtons = computed(() => {
  if (!messagesContainer.value?.$el) return false;
  return messagesContainer.value.$el.scrollHeight > messagesContainer.value.$el.clientHeight;
});

const isScrolledToBottom = computed(() => {
  if (!messagesContainer.value?.$el) return true;
  const el = messagesContainer.value.$el;
  return el.scrollTop + el.clientHeight >= el.scrollHeight - scrollThreshold;
});

const handleScroll = (e) => {
  if (!e.target) return;
  scrollTop.value = e.target.scrollTop;
  scrollHeight.value = e.target.scrollHeight;
  clientHeight.value = e.target.clientHeight;
};

const scrollToTop = () => {
  if (messagesContainer.value?.$el) {
    messagesContainer.value.$el.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value?.$el) {
    const el = messagesContainer.value.$el;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }
};

watch(messages, () => {
  nextTick(() => {
    if (messagesContainer.value?.$el) {
      const container = messagesContainer.value.$el;
      scrollHeight.value = container.scrollHeight;
      clientHeight.value = container.clientHeight;

      // Плавное скроллирование к низу только если пользователь уже был внизу
      if (isScrolledToBottom.value) {
        container.scrollTop = container.scrollHeight;
      }
    }
  });
}, { deep: true });

onMounted(() => {
  if (messagesContainer.value?.$el) {
    const container = messagesContainer.value.$el;
    scrollHeight.value = container.scrollHeight;
    clientHeight.value = container.clientHeight;
  }
});

const addMessage = (content, type = 'info', duration = 3000, persistent = false, debug = false) => {
  const messageId = id++;

  // Фиксированные сообщения при duration=0
  if (duration === 0) {
    persistent = true;
  } else if (duration > 60000) {
    persistent = true;
  }

  const titles = {
    success: 'Успешно!',
    warning: 'Внимание!',
    error: 'Ошибка!',
    info: 'Информация',
    debug: 'Отладка'
  };

  const newMessage = reactive({
    id: messageId,
    content,
    type,
    title: titles[type] || type.charAt(0).toUpperCase() + type.slice(1),
    duration,
    persistent,
    debug,
    progress: 100,
    timer: null,
    progressInterval: null
  });

  messages.value.push(newMessage);

  // Запускаем таймер только для нефиксированных сообщений
  if (!persistent && duration > 0) {
    const startTime = Date.now();

    newMessage.progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = duration - elapsed;
      newMessage.progress = (remaining / duration) * 100;

      if (remaining <= 0) {
        removeMessage(messageId);
      }
    }, 50);

    newMessage.timer = setTimeout(() => {
      removeMessage(messageId);
    }, duration);
  }
};

const removeMessage = (id) => {
  const messageIndex = messages.value.findIndex(msg => msg.id === id);
  if (messageIndex !== -1) {
    const message = messages.value[messageIndex];

    if (message.timer) clearTimeout(message.timer);
    if (message.progressInterval) clearInterval(message.progressInterval);

    messages.value.splice(messageIndex, 1);
  }
};

const clear = () => {
  messages.value.forEach(msg => {
    if (msg.timer) clearTimeout(msg.timer);
    if (msg.progressInterval) clearInterval(msg.progressInterval);
  });
  messages.value = [];
};

defineExpose({
  success: (content, duration, persistent, debug) => addMessage(content, 'success', duration, persistent, debug),
  warning: (content, duration, persistent, debug) => addMessage(content, 'warning', duration, persistent, debug),
  error: (content, duration, persistent, debug) => addMessage(content, 'error', duration, persistent, debug),
  info: (content, duration, persistent, debug) => addMessage(content, 'info', duration, persistent, debug),
  debug: (content, duration, persistent) => addMessage(content, 'debug', duration, persistent, true),
  clear,
  scrollToBottom,
  messages
});

onUnmounted(() => {
  messages.value.forEach(msg => {
    if (msg.timer) clearTimeout(msg.timer);
    if (msg.progressInterval) clearInterval(msg.progressInterval);
  });
});
</script>

<style>
.fenix-video-message-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.fenix-video-messages-header {
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
  margin-bottom: 6px;
}

.fenix-video-messages-wrapper {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.fenix-video-messages {
  height: 100%;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 3px;
  padding-bottom: 2px;
  box-sizing: border-box;
}

.fenix-scroll-controls {
  position: absolute;
  right: 6px;
  top: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 30;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.fenix-scroll-controls:hover {
  opacity: 1;
}

.fenix-close-all {
  width: 100%;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  position: sticky;
  top: 0;
  z-index: 10;
}

.fenix-close-all:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}

.fenix-video-message {
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  transition: all 0.3s ease;
  overflow: hidden;
  color: #fff;
  position: relative;
  border-left: 4px solid rgba(255,255,255,0.3);
  min-height: max-content;
  height: auto !important;
}

.fenix-video-message--success { background-color: #67c23a; border-left-color: #4b8b2a; }
.fenix-video-message--warning { background-color: #e6a23c; border-left-color: #c78a2a; }
.fenix-video-message--error { background-color: #f56c6c; border-left-color: #d64545; }
.fenix-video-message--info { background-color: #409eff; border-left-color: #2a7ad1; }
.fenix-video-message--debug { background-color: #6c757d; border-left-color: #495057; }

.fenix-video-message__content-wrapper {
  display: flex;
  width: 100%;
  gap: 10px;
  align-items: flex-start;
}

.fenix-video-message__icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 3px;
}

.fenix-video-message__content {
  flex-grow: 1;
  font-size: 14px;
  line-height: 1.5;
  min-width: 0;
}

.fenix-video-message__title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.fenix-video-message__debug-tag {
  background: rgba(0,0,0,0.2);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: normal;
}

.fenix-video-message__text {
  margin-bottom: 10px;
  word-break: break-word;
  line-height: 1.4;
}

.fenix-video-message__timer-info {
  margin-top: 10px;
}

.fenix-video-message__timer {
  background: rgba(0,0,0,0.15);
  border-radius: 3px;
  height: 4px;
  position: relative;
  overflow: hidden;
  margin-bottom: 6px;
}

.fenix-video-message__timer-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255,255,255,0.5);
  transition: width 0.05s linear;
}

.fenix-video-message__timer-label {
  font-size: 10px;
  opacity: 0.8;
  text-align: right;
  color: #f0f0f0;
}

.fenix-video-message__close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 6px;
  transition: color 0.2s, transform 0.2s;
}

.fenix-video-message__close:hover {
  color: white;
  transform: scale(1.1);
}

.fenix-video-message__close svg {
  display: block;
}

.fenix-video-message-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fenix-video-message-leave-active {
  transition: all 0.2s cubic-bezier(0.64, -0.28, 0.64, 0.83);
}

.fenix-video-message-enter-from,
.fenix-video-message-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fenix-animation-temp {
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 100000;
  border-radius: 8px;
  pointer-events: none;
  transform-origin: center;
  transition: transform 0.2s ease;
}

.fenix-video-messages::-webkit-scrollbar {
  width: 8px;
}

.fenix-video-messages::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.fenix-video-messages::-webkit-scrollbar-thumb {
  background: rgba(64, 158, 255, 0.7);
  border-radius: 4px;
}

.fenix-video-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 158, 255, 0.9);
}

.scroll-button {
  width: 24px;
  height: 24px;
  background: rgba(64, 158, 255, 0.85);
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  transition: all 0.2s;
}

.scroll-button:hover {
  background: rgba(64, 158, 255, 1);
  transform: scale(1.1);
}

.scroll-button svg {
  width: 12px;
  height: 12px;
}
</style>
