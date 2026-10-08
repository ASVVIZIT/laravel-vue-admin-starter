<template>
  <li
      class="contact-item"
      :class="{
        online: computedOnline,
        friend: isFriend,
        selectedContact: isSelected
      }"
      @click="handleSelect"
  >
    <div class="contact-avatar-wrapper">
      <div
          class="contact-avatar"
          :style="{ backgroundImage: 'url(' + contactAvatar + ')' }"
          :title="contact?.name || defaultName"
      ></div>

      <span
          v-if="contact?.id"
          class="contact-id-badge"
          :title="'ID: ' + contact.id"
      >
        {{ contact.id }}
      </span>

      <span
          class="status-dot"
          :class="statusDotClass"
          :title="statusDotTitle"
      ></span>
    </div>

    <div class="contact-info">
      <div class="contact-name-row">
        <span
            class="contact-name"
            :title="contact?.name || defaultName"
        >
          {{ contact?.name || defaultName }}
        </span>
      </div>

      <div class="contact-subline">
        <TalkStreamPresenceStatus
            :text="presencePresentation.text"
            :tone="presencePresentation.tone"
            variant="list"
        />

        <span
            v-if="contact?.main_role"
            class="contact-role-inline"
            :title="contact.main_role"
        >
          {{ contact.main_role }}
        </span>
      </div>
    </div>

    <div class="contact-actions">
      <button
          type="button"
          class="btn"
          :class="'btn-' + action.state"
          :disabled="action.disabled"
          :title="action.title"
          @mousedown.prevent
          @click="handleActionClick"
      >
        <!-- add: плюс -->
        <svg
            v-if="action.state === 'add'"
            class="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>

        <!-- incoming: входящая заявка / принять -->
        <svg
            v-else-if="action.state === 'incoming'"
            class="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>

        <!-- sent: отправлено / часы -->
        <svg
            v-else-if="action.state === 'sent'"
            class="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15.5 14" />
        </svg>

        <!-- friend: в друзьях / галочка -->
        <svg
            v-else
            class="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>

        <span class="btn-text">{{ action.label }}</span>
      </button>

      <span
          v-if="action.hint"
          class="action-hint"
          :class="'action-hint--' + action.state"
          :title="action.hintTitle"
      >
    {{ action.hint }}
  </span>
    </div>
  </li>
</template>

<script setup lang="ts">
import TalkStreamPresenceStatus from '@/modules/TalkStream/Components/TalkStreamPresenceStatus.vue'

import { buildPresenceViewModel } from '@/modules/TalkStream/utils/presenceBuilder'
import { presentPresence } from '@/modules/TalkStream/utils/presencePresenter'
import { presentContactAction } from '@/modules/TalkStream/utils/contactActionPresenter'

import type { Contact } from '@/modules/TalkStream/types'

const props = withDefaults(defineProps<{
  contact: Contact
  isOnline: boolean
  isFriend: boolean
  isSelected: boolean
  hasIncoming: boolean
  hasSent: boolean

  requestCreatedAt?: string | null
  isTyping?: boolean
  timeZone?: string
}>(), {
  requestCreatedAt: null,
  isTyping: false,
  timeZone: 'Asia/Yekaterinburg',
})

const emit = defineEmits<{
  select: [contact: Contact]
  addFriend: [contact: Contact]
  acceptRequest: [contact: Contact]
}>()

const defaultName = 'Без имени'

const contactAvatar = computed<string>(() => {
  return props.contact?.avatar || '/images/avatar-main.png'
})

const computedOnline = computed<boolean>(() => {
  return Boolean(props.isOnline || props.contact?.is_online)
})

const presenceView = computed(() => {
  return buildPresenceViewModel(props.contact, {
    isOnline: computedOnline.value,
    isTyping: props.isTyping,
  })
})

const presencePresentation = computed(() => {
  return presentPresence(presenceView.value, {
    variant: 'list',
    timeZone: props.timeZone,
  })
})

const action = computed(() => {
  return presentContactAction({
    isFriend: props.isFriend,
    hasIncoming: props.hasIncoming,
    hasSent: props.hasSent,
    requestCreatedAt: props.requestCreatedAt,
    timeZone: props.timeZone,
  })
})

const statusDotClass = computed(() => {
  switch (presencePresentation.value.tone) {
    case 'typing':
      return 'status-dot--typing'

    case 'online':
      return 'status-dot--online'

    case 'away':
      return 'status-dot--away'

    case 'dnd':
      return 'status-dot--dnd'

    case 'invisible':
    case 'offline':
    case 'unknown':
    default:
      return 'status-dot--offline'
  }
})

const statusDotTitle = computed<string>(() => {
  return presencePresentation.value.text
})

function handleSelect(): void {
  emit('select', props.contact)
}

function handleAdd(): void {
  emit('addFriend', props.contact)
}

function handleAccept(): void {
  emit('acceptRequest', props.contact)
}

function handleActionClick(): void {
  if (action.value.disabled) {
    return
  }

  if (action.value.state === 'incoming') {
    handleAccept()
    return
  }

  if (action.value.state === 'add') {
    handleAdd()
  }
}
</script>

<style scoped lang="scss">
.contact-item {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.32rem;

  padding: 0.2rem 0.22rem;

  border-bottom: 1px solid #eef1f4;
  cursor: pointer;

  max-width: 100%;
  width: 100%;
  box-sizing: border-box;

  user-select: none;

  /*
   * Критично для стабильности скролла:
   * элемент не должен участвовать в scroll anchoring и не должен
   * влиять на layout соседей при смене класса selected.
   */
  overflow-anchor: none;
  contain: layout paint style;

  /*
   * Никаких transform/height/padding/border изменений при selected.
   * Только paint-эффекты.
   */
  transition:
      background-color 0.18s ease,
      box-shadow 0.18s ease;

  &:hover {
    background-color: #f8fafc;
  }

  &.selectedContact {
    background-color: #e8f3ff !important;
    box-shadow: inset 0 0 0 1px rgba(52, 144, 220, 0.16);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;

      background: linear-gradient(to bottom, #3490dc, #1c7ed6);
      pointer-events: none;
      z-index: 2;
    }

    .contact-name {
      color: #1d4ed8;
    }
  }
}

.contact-avatar-wrapper {
  position: relative;

  width: 28px;
  height: 28px;

  flex-shrink: 0;
}

.contact-avatar {
  width: 28px;
  height: 28px;

  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  overflow: hidden;
  flex-shrink: 0;

  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.28);
}

.contact-id-badge {
  position: absolute;
  top: -2px;
  left: -2px;
  z-index: 2;

  min-width: 11px;
  height: 10px;
  max-width: 22px;
  padding: 0 1px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 3px;
  background: #ffffff;
  border: 1px solid #e2e8f0;

  color: #64748b;
  font-size: 0.35rem;
  font-weight: 700;
  line-height: 8px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.07);
  pointer-events: none;
}

.status-dot {
  position: absolute;
  right: -1px;
  bottom: -1px;
  z-index: 1;

  width: 7px;
  height: 7px;

  border-radius: 50%;
  border: 1px solid #ffffff;

  background: #cbd5e1;

  transition: background-color 0.18s ease, box-shadow 0.18s ease;
}

.status-dot--online {
  background: #16a34a;
}

.status-dot--typing {
  background: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.10);
  animation: contactStatusPulse 1.35s ease-in-out infinite;
}

.status-dot--away {
  background: #d97706;
}

.status-dot--dnd {
  background: #dc2626;
}

.status-dot--offline {
  background: #cbd5e1;
}

@keyframes contactStatusPulse {
  0%,
  100% {
    box-shadow: 0 0 0 1px rgba(22, 163, 74, 0.08);
  }

  50% {
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.13);
  }
}

.contact-info {
  min-width: 0;
  flex: 1 1 auto;

  display: flex;
  flex-direction: column;
  gap: 1px;

  overflow: hidden;
}

.contact-name-row {
  min-width: 0;
  display: flex;
  align-items: center;
}

.contact-name {
  min-width: 0;
  flex: 1 1 auto;

  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.08;
  color: #0f172a;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-subline {
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 0.2rem;

  font-size: 0.58rem;
  line-height: 1.1;
  color: #64748b;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

:deep(.presence-status--list) {
  font-size: 0.58rem;
  line-height: 1.1;
  font-weight: 500;
  color: #64748b;
  max-width: 86px;
}

:deep(.presence-status--online) {
  color: #16a34a;
}

:deep(.presence-status--typing) {
  color: #16a34a;
  font-weight: 600;
}

:deep(.presence-status--away) {
  color: #d97706;
}

:deep(.presence-status--dnd) {
  color: #dc2626;
}

:deep(.presence-status--offline),
:deep(.presence-status--invisible),
:deep(.presence-status--unknown) {
  color: #94a3b8;
}

.contact-role-inline {
  flex-shrink: 0;

  max-width: 54px;

  font-size: 0.52rem;
  font-weight: 500;
  line-height: 1.1;
  color: #94a3b8;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: '·';
    margin-right: 3px;
    color: #cbd5e1;
  }
}

.contact-actions {
  flex-shrink: 0;

  width: 66px;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.btn {
  width: 100%;
  min-height: 20px;

  padding: 3px 3px;

  border: none;
  border-radius: 5px;

  font-size: 0.43rem;
  font-weight: 600;
  line-height: 1.08;

  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;

  overflow: visible;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: normal;
  hyphens: auto;

  touch-action: manipulation;

  transition: background-color 0.18s ease, opacity 0.18s ease;

  &:disabled {
    opacity: 0.72;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid rgba(37, 99, 235, 0.45);
    outline-offset: -2px;
  }
}

.btn-icon {
  width: 9px;
  height: 9px;

  flex-shrink: 0;
  display: block;
}

.btn-text {
  min-width: 0;
  max-width: 100%;

  display: block;
  text-align: center;

  white-space: normal;
  overflow: visible;
  overflow-wrap: break-word;
  word-break: normal;
  hyphens: auto;

  line-height: 1.05;
}

.btn-add {
  background-color: #42b983;
  color: #ffffff;

  &:hover:not(:disabled) {
    background-color: #36a871;
  }
}

.btn-incoming {
  background-color: #3490dc;
  color: #ffffff;

  &:hover:not(:disabled) {
    background-color: #2779bf;
  }
}

.btn-sent {
  background-color: #fff7ed;
  color: #9a3412;
  border: 1px solid #fed7aa;
}

.btn-friend {
  background-color: #ecfdf5;
  color: #166534;
  border: 1px solid #bbf7d0;
}

/*
 * Белый текст на активных цветных кнопках.
 */
.btn-add .btn-text,
.btn-incoming .btn-text {
  color: #ffffff;

  text-shadow:
      0 0 1px rgba(0, 0, 0, 0.38),
      0 1px 1px rgba(0, 0, 0, 0.32),
      0 -1px 0 rgba(0, 0, 0, 0.12),
      1px 0 0 rgba(0, 0, 0, 0.12),
      -1px 0 0 rgba(0, 0, 0, 0.12);
}

/*
 * Отправлено / В друзьях — спокойные состояния,
 * без белого текста и без агрессивной тени.
 */
.btn-sent .btn-text,
.btn-friend .btn-text {
  text-shadow: none;
}

.action-hint {
  max-width: 66px;

  font-size: 0.42rem;
  font-weight: 500;
  line-height: 1.05;
  color: #64748b;

  text-align: right;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.action-hint--incoming {
  color: #2563eb;
}

.action-hint--sent {
  color: #c2410c;
}

.action-hint--friend {
  color: #15803d;
}
</style>
