<template>
  <div class="header-tools-container">
    <div
        class="hamburger-wrapper"
        @click="!isLocked && toggleClick()"
    >
      <svg
          :class="{
          'is-active': isActive,
          'is-locked': isLocked
        }"
          class="hamburger-icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
      >
        <path
            d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z"
        />
      </svg>
    </div>

    <div
        class="lock-container"
        @click="toggleSidebarLock"
        :class="{
        'is-locked': isLocked,
        'lock-active': isLocked
      }"
    >
      <el-icon class="lock-icon">
        <transition name="lock-transition" mode="out-in">
          <Lock v-if="isLocked" key="locked" />
          <Unlock v-else key="unlocked" />
        </transition>
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Unlock, Lock } from '@element-plus/icons-vue'
import { appStore } from '@/store/app'

const props = defineProps({
  isActive: Boolean
})

const emit = defineEmits(['toggleClick'])

const useAppStore = appStore()
const isLocked = ref(false)
const lockState = ref('unlocked')

const toggleClick = () => emit('toggleClick')

const toggleSidebarLock = () => {
  lockState.value = 'changing'
  useAppStore.toggleSidebarLock()

  setTimeout(() => {
    lockState.value = useAppStore.isSidebarLocked ? 'locked' : 'unlocked'
  }, 300)
}

watch(
    () => useAppStore.isSidebarLocked,
    (newVal) => {
      isLocked.value = newVal
    },
    { immediate: true }
)
</script>

<style lang="scss" scoped>
.header-tools-container {
  display: flex;
  position: relative;
  align-items: center;
  gap: 2px;
  padding: 8px;
}

.hamburger-wrapper {
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: rgba(0, 0, 0, 0.05);

    .hamburger-icon:not(.is-locked) {
      color: var(--el-color-primary);
    }
  }
}

.hamburger-icon {
  display: block;
  width: 24px;
  height: 24px;
  transition: transform 0.4s ease, color 0.4s ease;

  &.is-active {
    transform: rotate(180deg);
  }

  &.is-locked {
    cursor: not-allowed;
    filter: grayscale(0.2);
    opacity: 0.2;
  }
}

.lock-container {
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 5000;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: all 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  transform: scale(1);

  &.is-locked {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(2.5);
    z-index: 6000;

    .lock-icon {
      color: var(--el-color-danger);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }

    &:hover {
      transform: translate(-50%, -50%) scale(2.7);
      background: rgba(255, 255, 255, 0.9);
    }
  }

  &:not(.is-locked):hover {
    transform: scale(1.2);
    background: rgba(0, 0, 0, 0.08);
  }

  .lock-icon {
    display: flex;
    font-size: 14px;
    width: 16px;
    height: 16px;
    transition: all 0.3s ease;
  }
}

.lock-transition-enter-active,
.lock-transition-leave-active {
  transition: all 0.2s ease;
}

.lock-transition-enter-from,
.lock-transition-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(-15deg);
}

.lock-transition-enter-to,
.lock-transition-leave-from {
  opacity: 1;
  transform: scale(1) rotate(0);
}
</style>
