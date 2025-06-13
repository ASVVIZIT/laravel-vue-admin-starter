<template>
  <div class="talkstream-container">
    <!-- Панель контактов -->
    <TalkStreamContacts />

    <!-- Панель чата -->
    <div class="talkstream-chat">
      <TalkStreamHeader />
      <TalkStreamHistory />
      <TalkStreamSender />
    </div>
  </div>
</template>

<script setup>
import TalkStreamContacts from './TalkStreamContacts.vue'
import TalkStreamHeader from './TalkStreamHeader.vue'
import TalkStreamHistory from './TalkStreamHistory.vue'
import TalkStreamSender from './TalkStreamSender.vue'
</script>

<style scoped lang="scss">
.talkstream-container {
  display: flex;
  height: calc(100vh - 220px);
  width: 100%;
  overflow: hidden;
}

.talkstream-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-left: 1px solid #eaeaea;
}
</style>
