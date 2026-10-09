<template>
  <div class="contacts-container">
    <div class="contacts-container-header">
      <span>Общий список пользователей</span>
    </div>

    <div
        ref="contactsWrap"
        class="contacts-wrap"
        v-loading-talkstream-small.contacts
        @mousedown="onInteractionStart"
        @touchstart.passive="onInteractionStart"
        @wheel.passive="cancelScrollLock"
        @touchmove.passive="cancelScrollLock"
    >
      <ul v-if="friendStore._initialized" class="contact-list">
        <ContactItemWrapper
            v-for="contact in contacts"
            :key="contact.id"
            :contact="contact"
            @select="handleSelect"
            @add-friend="handleAddFriend"
            @accept-request="handleAcceptRequest"
        />
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useContactStore } from '@/modules/TalkStream/Stores/contactStore'
import { useFriendStore } from '@/modules/TalkStream/Stores/friendStore'
import ContactItemWrapper from '@modules/TalkStream/Components/Contacts/ContactItemWrapper.vue'

import type { Contact } from '@/modules/TalkStream/Types/talkStreamType'

const emit = defineEmits<{
  select: [contact: Contact]
}>()

const contactStore = useContactStore()
const friendStore = useFriendStore()

const contactsWrap = ref<HTMLElement | null>(null)

const contacts = computed<Contact[]>(() => contactStore.contacts)

/**
 * Кратковременная защита от прыжка скролла при выборе контакта.
 *
 * Почему это нужно:
 *   - Vue обновляет класс selectedContact;
 *   - браузер может пересчитать scroll anchoring;
 *   - фокус/клик может вызвать scrollIntoView;
 *   - на нижней части списка это выглядит как резкий прыжок ползунка вверх.
 *
 * Мы на короткое время фиксируем scrollTop именно списка контактов.
 * Если пользователь сам крутит колесо/палец — lock сразу отменяется.
 */
const SCROLL_LOCK_MS = 450

let scrollLockUntil = 0
let lockedScrollTop = 0
let rafId = 0
let observer: MutationObserver | null = null

function cancelScrollLock(): void {
  scrollLockUntil = 0

  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

function keepScrollLocked(): void {
  const el = contactsWrap.value

  if (!el) {
    rafId = 0
    return
  }

  if (Date.now() > scrollLockUntil) {
    rafId = 0
    return
  }

  if (Math.abs(el.scrollTop - lockedScrollTop) > 0.5) {
    el.scrollTop = lockedScrollTop
  }

  rafId = requestAnimationFrame(keepScrollLocked)
}

function lockListScroll(): void {
  const el = contactsWrap.value

  if (!el) {
    return
  }

  lockedScrollTop = el.scrollTop
  scrollLockUntil = Date.now() + SCROLL_LOCK_MS

  if (!rafId) {
    rafId = requestAnimationFrame(keepScrollLocked)
  }
}

function onInteractionStart(event: Event): void {
  const target = event.target as HTMLElement | null

  // Фиксируем скролл только если взаимодействие началось внутри контакта,
  // а не на самом скроллбаре/фонe контейнера.
  if (target?.closest('.contact-item')) {
    lockListScroll()
  }
}

function handleSelect(contact: Contact): void {
  lockListScroll()

  contactStore.selectContact(contact)
  emit('select', contact)
}

async function handleAddFriend(contact: Contact): Promise<void> {
  lockListScroll()
  await friendStore.sendRequest(contact.id)
}

async function handleAcceptRequest(contact: Contact): Promise<void> {
  lockListScroll()

  const req = friendStore.incomingRequests.find(r => r.user_id === contact.id)

  if (req) {
    await friendStore.acceptRequest(req.id)
  }
}

onMounted(() => {
  const el = contactsWrap.value

  if (!el || typeof MutationObserver === 'undefined') {
    return
  }

  /**
   * Дополнительно страхуемся от DOM-мутаций внутри списка.
   * Если в период lock браузер пытается сдвинуть scrollTop — возвращаем.
   */
  observer = new MutationObserver(() => {
    if (Date.now() <= scrollLockUntil) {
      el.scrollTop = lockedScrollTop
    }
  })

  observer.observe(el, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  })
})

onBeforeUnmount(() => {
  cancelScrollLock()

  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped lang="scss">
.contacts-container {
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;

  transition: all 0.2s ease;
  overflow: hidden;
}

.contacts-container-header {
  flex: 0 0 30px;

  height: 30px;
  min-height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;

  font-size: 0.7rem;
  font-weight: 600;
  color: #555;

  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;

  box-sizing: border-box;
}

.contacts-wrap {
  position: relative;

  flex: 1 1 auto;

  min-height: 0;
  min-width: 0;
  width: 100%;

  overflow-y: auto;
  overflow-x: hidden;

  /*
   * Критично:
   * отключаем scroll anchoring внутри списка контактов.
   */
  overflow-anchor: none;

  /*
   * Не даём скроллу "пробрасываться" наружу.
   */
  overscroll-behavior: contain;

  /*
   * Резервируем место под скроллбар, чтобы появление/исчезновение
   * ползунка не меняло ширину контента и не дёргало layout.
   */
  scrollbar-gutter: stable;

  background-color: #fff;
}

.contact-list {
  list-style: none;

  margin: 0;
  padding: 4px 4px 4px 2px;

  /*
   * Изолируем layout списка.
   */
  contain: layout style;
}

.contacts-wrap::-webkit-scrollbar {
  width: 6px;
}

.contacts-wrap::-webkit-scrollbar-track {
  background: transparent;
}

.contacts-wrap::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}

.contacts-wrap::-webkit-scrollbar-thumb:hover {
  background-color: #aaa;
}
</style>
