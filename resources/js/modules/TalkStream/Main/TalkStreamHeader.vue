<template>
  <header class="talkstream-header">
    <button
        type="button"
        class="panel-toggle-btn"
        :title="isPanelCollapsed ? 'Развернуть список контактов' : 'Свернуть список контактов'"
        @click="togglePanel"
    >
      <PanelToggleIcon
          :class="['toggle-panel-icon', { rotated: isPanelCollapsed }]"
      />
    </button>

    <div
        v-if="contact"
        class="header-user"
    >
      <div class="user-avatar-wrapper">
        <div
            class="user-avatar"
            :style="{ backgroundImage: `url(${contactAvatar})` }"
            :title="contact.name || defaultName"
        ></div>

        <span
            v-if="contact.id"
            class="user-id-badge"
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

      <div class="user-meta">
        <div class="user-name-row">
          <span
              class="user-name"
              :title="contact.name || defaultName"
          >
            {{ contact.name || defaultName }}
          </span>
        </div>

        <div class="user-subline">
          <TalkStreamPresenceStatus
              :text="presencePresentation.text"
              :tone="presencePresentation.tone"
              variant="list"
          />

          <span
              v-if="showRole && contact?.main_role"
              class="user-role-inline"
              :title="contact.main_role"
          >
            {{ contact.main_role }}
          </span>
        </div>
      </div>
    </div>

    <div
        v-else
        class="header-user header-user--empty"
    >
      <div class="empty-avatar"></div>

      <div class="user-meta">
        <div class="user-name-row">
          <span class="user-name user-name--muted">
            {{ presenceLabels.selectContact }}
          </span>
        </div>

        <div class="user-subline">
          <span class="presence-placeholder">
            {{ presenceLabels.noDialog }}
          </span>
        </div>
      </div>
    </div>

    <div class="header-actions">
      <button
          v-if="showCallActions"
          type="button"
          class="action-btn action-btn--audio"
          :disabled="!contact"
          title="Аудиозвонок"
          aria-label="Аудиозвонок"
          @click="emit('callAudio')"
      >
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </button>

      <button
          v-if="showCallActions"
          type="button"
          class="action-btn action-btn--video"
          :disabled="!contact"
          title="Видеозвонок"
          aria-label="Видеозвонок"
          @click="emit('callVideo')"
      >
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
          <path d="m23 7-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      </button>

      <button
          v-if="showMenuAction"
          type="button"
          class="action-btn action-btn--menu"
          :disabled="!contact"
          title="Меню чата"
          aria-label="Меню чата"
          @click="emit('menu')"
      >
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import PanelToggleIcon from '@/modules/TalkStream/Components/Icons/IconPanelToggle.vue'
import TalkStreamPresenceStatus from '@/modules/TalkStream/Components/Presence/UserPresenceStatus.vue'

import { useUiStore } from '@/modules/TalkStream/Stores/uiStore'
import { presenceLabels } from '@/modules/TalkStream/Config/presenceLabelsConfig'

import { buildPresenceViewModel } from '@/modules/TalkStream/Utils/presenceBuilderUtil'
import { presentPresence } from '@/modules/TalkStream/Utils/presencePresenterUtil'

import type { Contact } from '@/modules/TalkStream/Types/talkStreamType'
import type { PresenceViewModel } from '@/modules/TalkStream/Types/presenceType'

const props = withDefaults(defineProps<{
  contact?: Contact | null
  isOnline?: boolean
  isTyping?: boolean
  presence?: PresenceViewModel | null
  timeZone?: string
  showCallActions?: boolean
  showMenuAction?: boolean
  showRole?: boolean
  defaultName?: string
}>(), {
  contact: null,
  isOnline: false,
  isTyping: false,
  presence: null,
  timeZone: 'Asia/Yekaterinburg',
  showCallActions: true,
  showMenuAction: true,
  showRole: true,
  defaultName: 'Без имени',
})

const emit = defineEmits<{
  callAudio: []
  callVideo: []
  menu: []
}>()

const uiStore = useUiStore()

const isPanelCollapsed = computed<boolean>(() => uiStore.isContactsPanelCollapsed)

const contactAvatar = computed<string>(() => {
  return props.contact?.avatar || '/images/avatar-main.png'
})

const computedOnline = computed<boolean>(() => {
  return Boolean(props.isOnline || props.contact?.is_online)
})

const presenceView = computed<PresenceViewModel | null>(() => {
  if (props.presence) {
    return props.presence
  }

  return buildPresenceViewModel(props.contact ?? null, {
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

function togglePanel(): void {
  uiStore.toggleContactsPanel()
}
</script>

<style scoped lang="scss">
.talkstream-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;

  min-height: 44px;
  padding: 0.35rem 0.55rem;

  background: #ffffff;
  border-bottom: 1px solid #eef1f4;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);

  box-sizing: border-box;
}

.panel-toggle-btn {
  width: 30px;
  height: 30px;
  flex-shrink: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;

  color: #64748b;
  cursor: pointer;

  transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;

  &:hover {
    background: #f1f5f9;
    color: #334155;
  }

  &:active {
    transform: scale(0.96);
  }
}

.toggle-panel-icon {
  width: 18px;
  height: 18px;

  stroke: currentColor;
  transition: transform 0.25s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

.header-user {
  display: flex;
  align-items: center;
  gap: 0.45rem;

  min-width: 0;
  flex: 1 1 auto;
}

.header-user--empty {
  opacity: 0.75;
}

.user-avatar-wrapper {
  position: relative;

  width: 28px;
  height: 28px;

  flex-shrink: 0;
}

.user-avatar {
  width: 28px;
  height: 28px;

  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.28);
  overflow: hidden;
}

.empty-avatar {
  width: 28px;
  height: 28px;

  flex-shrink: 0;
  border-radius: 50%;

  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.25);
}

.user-id-badge {
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
  animation: statusPulse 1.35s ease-in-out infinite;
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

@keyframes statusPulse {
  0%,
  100% {
    box-shadow: 0 0 0 1px rgba(22, 163, 74, 0.08);
  }

  50% {
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.13);
  }
}

.user-meta {
  min-width: 0;
  flex: 1 1 auto;

  display: flex;
  flex-direction: column;
  gap: 1px;

  overflow: hidden;
}

.user-name-row {
  min-width: 0;
  display: flex;
  align-items: center;
}

.user-name {
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

.user-name--muted {
  color: #64748b;
  font-weight: 600;
}

.user-subline {
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
  max-width: 130px;
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

.user-role-inline {
  flex-shrink: 0;

  max-width: 70px;

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

.presence-placeholder {
  font-size: 0.58rem;
  color: #94a3b8;
  line-height: 1.1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;

  flex-shrink: 0;
}

.action-btn {
  width: 30px;
  height: 30px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border: none;
  border-radius: 8px;

  background: transparent;
  color: #64748b;

  cursor: pointer;

  transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease, opacity 0.18s ease;

  svg {
    width: 16px;
    height: 16px;
    display: block;
  }

  &:hover:not(:disabled) {
    background: #f1f5f9;
    color: #334155;
  }

  &:active:not(:disabled) {
    transform: scale(0.96);
  }

  &:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }
}

.action-btn--audio:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.action-btn--video:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.action-btn--menu:hover:not(:disabled) {
  background: #f1f5f9;
  color: #334155;
}
</style>
