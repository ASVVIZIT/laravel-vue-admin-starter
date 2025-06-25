<template>
  <div class="talkstream-header">
    <div class="header-left">
      <!-- Кнопка сворачивания панели контактов -->
      <button class="panel-toggle-btn" @click="togglePanel">
        <PanelToggleIcon :class="['toggle-panel-icon', { 'rotated': isPanelCollapsed }]"/>
      </button>

      <!-- Информация о пользователе -->
      <div v-if="contact" class="talkstream-header-line">
        <div class="user-avatar-wrapper">
          <div class="user-avatar" :style="{ backgroundImage: `url(${contact.avatar || '/images/default-avatar.png' })`}"></div>
          <span class="status-indicator">{{ contactIsOnline ? '🟢' : '⚪' }}</span>
        </div>
        <div class="user-id">ID: {{ contact.id || 'нет' }}</div>
        <div class="user-name">{{ contact.name || 'Без имени' }}</div>
      </div>
      <div v-else class="no-contact">
        Выберите контакт из списка слева
      </div>
    </div>

    <!-- Меню режимов -->
    <div class="mode-switcher">
      <button
          class="btn-mode-switcher"
          v-for="mode in ['callAudio', 'callVideo']"
          :key="mode"
          :class="['mode-button', { active: currentMode === mode }]"
          @click="switchMode(mode)"
      >
        {{ mode === 'callAudio' ? '📹' : '📞' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import PanelToggleIcon from '@/modules/TalkStream/Components/Icons/PanelToggleIcon.vue'
import { useUiStore } from '@/modules/TalkStream/stores/uiStore'

const props = defineProps({
  contact: {
    type: Object,
    required: false,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  }
})

const currentMode = 'callAudio'

const uiStore = useUiStore()
const isPanelCollapsed = computed(() => uiStore.isContactsPanelCollapsed)

// Если контакт задан — проверяем по ID
const contactIsOnline = computed(() => {
  if (!props.contact) return false
  return props.isOnline || false
})

const togglePanel = () => {
  uiStore.toggleContactsPanel()
}
</script>

<style scoped lang="scss">
.talkstream-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0.4rem;
  margin-bottom: 0.4rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.panel-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  margin-right: 0.1rem;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-panel-icon {
  stroke: currentColor;
  transition: transform 0.3s ease;
  vertical-align: middle;
  color: #666;
}

.toggle-panel-icon.rotated {
  transform: rotate(180deg);
}

.talkstream-header-line {
  display: inline-flex;
  align-items: center;
  padding: 2px 2px;
}

.user-avatar-wrapper {
  position: relative;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  margin-right: 0.8rem;
}

.user-avatar {
  flex-shrink: 0;
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  box-shadow: inset 0 0 0 0.12rem #b8c4cc;
  margin-right: 1rem;
}

.status-indicator {
  position: absolute;
  bottom: 1px;
  left: 1px;
  font-size: 0.40rem;
  color: #42b983;
  z-index: 1;
  user-select: none;
  pointer-events: none;
}

.user-name {
  font-weight: bold;
  font-size: 0.75rem;
  color: #333;
  margin: 0 auto;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  line-height: 0.75rem;
}

.user-id {
  color: #333;
  font-weight: bold;
  font-size: 1rem;
  text-wrap-mode: nowrap;
  padding-left: 2px;
  margin: 0 auto;
}

.user-role {
  font-size: 0.85rem;
  color: #999;
}

.mode-switcher {
  border-radius: 8px;
  padding: 5px 5px;
}

.btn-mode-switcher {
  background: transparent;
  border: none;
  border-radius: 50%;
  padding: 0.5rem 0.5rem;
  color: white;
  font-size: 1rem;
  margin: 0 2px;

  &:hover {
    background-color: rgba(75, 115, 141, 0.75);
    cursor: pointer;
  }

  &.active {
    background-color: rgba(30, 95, 141, 0.86);
    color: white;
    font-weight: bold;
  }
}
</style>
