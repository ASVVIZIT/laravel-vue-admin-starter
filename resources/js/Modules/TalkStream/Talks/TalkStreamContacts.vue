<template>
  <div class="contacts-container">
    <div class="contacts-container-header">
      <span>Общий список пользователей</span>
    </div>
    <!-- Обёртка для прокрутки -->
    <div class="contacts-wrap">
      <!-- Список всех пользователей -->
      <ul class="contact-list">
        <ContactItemWrapper
            v-for="contact in contacts"
            :key="contact.id"
            :contact="contact"
            @select="selectContact"
            @add-friend="sendRequest"
            @accept-request="acceptRequest"
        />
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userStore } from '@/store/userStore'
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { friendStore } from '@/modules/TalkStream/Stores/friendStore'
import ContactItemWrapper from '@/modules/TalkStream/Components/ContactItemWrapper.vue'

const props = defineProps(['contacts', 'isLoadingContacts'])
const emit = defineEmits(['select', 'add-friend', 'accept-request'])

const router = useRouter()
const useUserStore = userStore()
const contactStore = useContactStore()
const useFriendStore = friendStore()

const route = useRoute()

const contacts = computed(() => contactStore.contacts)
const currentMode = ref(route.params.mode || 'chat')

function selectContact(contact) {
  emit('select', contact)
}

function sendRequest(contact) {
  useFriendStore.sendRequest(contact.id)
  emit('add-friend', contact)
}

function acceptRequest(contact) {
  useFriendStore.acceptRequest(contact.id)
  emit('accept-request', contact)
}

function switchMode(mode) {
  currentMode.value = mode
}
</script>

<style scoped lang="scss">
.contacts-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 140px;
  max-width: 210px;
  height: calc(100vh - 130px);
  transition: all 0.2s ease;
  overflow: hidden;
}

.contacts-container-header {
  height: 30px; /* Фиксированная высота */
  min-height: 30px; /* Гарантирует минимальную высоту */
  display: flex;
  align-items: center; /* Вертикальное выравнивание */
  justify-content: center; /* Горизонтальное выравнивание */
  width: 100%; /* Занимает всю ширину */
  font-size: .7rem;
  /* Добавьте это для предотвращения сжатия: */
  flex-shrink: 0;
  box-sizing: border-box;
}

/* Остальные стили без изменений */
.mode-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.contacts-wrap {
  flex-grow: 1;
  overflow-y: auto;
  max-height: calc(100vh - 160px);
  /* Добавьте это: */
  min-height: 0; /* Разрешает сжатие */
}

.contact-list {
  list-style: none;
  padding-top: 4px;
  padding-left: 2px;
  padding-bottom: 4px;
  margin-right: 4px;
}
</style>
