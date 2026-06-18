<template>
  <div id="main-navbar" class="navbar rowBC reset-el-dropdown">
    <div class="rowSC">
      <hamburger
          id="hamburger-container"
          v-if="settings.showHamburger"
          :is-active="opened"
          class="hamburger-container"
          @toggleClick="toggleSideBar"
          @toggleSidebarLock="toggleSidebarLock"
      />
      <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
    </div>
    <div v-if="settings.ShowDropDown" class="right-menu rowSC">
      <ScreenFull />
      <SizeSelect />
      <LangSelect />
      <el-dropdown trigger="click" size="medium">
        <div class="avatar-wrapper">
          <img
              :src="userAvatar"
              class="user-avatar"
          />
          <CaretBottom style="width: 1em; height: 1em; margin-left: 4px" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/">
              <el-dropdown-item>{{ t('navbar.home')}}</el-dropdown-item>
            </router-link>
            <router-link to="/profile/edit">
              <el-dropdown-item>{{ t('navbar.profile')}}</el-dropdown-item>
            </router-link>
            <a target="_blank" :href="linkGithub">
              <el-dropdown-item>{{ t('navbar.github')}}</el-dropdown-item>
            </a>
            <el-dropdown-item divided @click="handleLogout">
              {{ t('navbar.logout')}}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useRouter, useRoute } from "vue-router"  // ← ИМПОРТ!
import { useI18n } from "vue-i18n"

import Timer from './Timer/Timer.vue'
import { Unlock, Lock, CaretBottom } from '@element-plus/icons-vue'
import HeaderSearch from '@/components/HeaderSearch/HeaderSearch.vue'
import SizeSelect from '@/components/SizeSelect/SizeSelect.vue'
import LangSelect from '@/components/LangSelect/LangSelect.vue'
import ScreenFull from '@/components/ScreenFull/ScreenFull.vue'
import Breadcrumb from './Breadcrumb'
import Hamburger from './Hamburger'

// 🔥 Импорты store'ов
import { appStore } from '@/store/appStore'
import { userStore } from '@/store/userStore'
import { useAuthStore } from '@/store/authStore'  // ← НОВОЕ!

// 🔥 Утилиты для base path
import { getBaseForType } from '@/utils/detectBasePath'

const router = useRouter()
const route = useRoute()
const { t } = useI18n({ useScope: 'global' })

const useUserStore = userStore()
const useAppStore = appStore()
const authStore = useAuthStore()  // ← НОВОЕ!

const linkGithub = `https://github.com/asvvizit/laravel-vue-admin-starter`

const settings = computed(() => useAppStore.settings)
const opened = computed(() => useAppStore.sidebar.opened)

// 🔥 Аватар пользователя
const userAvatar = computed(() => {
  return useUserStore.user?.avatar || 'https://laravel-vue-admin.eu.org/images/avatar.gif'
})

// 🔥 ПРАВИЛЬНЫЙ logout
const handleLogout = async () => {
  console.log('[Navbar] Logout clicked')

  try {
    // Вызываем logout из authStore (не из userStore!)
    await authStore.logout()

    // authStore.logout() уже делает редирект через window.location.href
    // с правильным base path, поэтому router.push здесь не нужен
  } catch (error) {
    console.error('[Navbar] Logout error:', error)
    // В случае ошибки — принудительный редирект
    const basePath = getBaseForType(authStore.loginType || 'user')
    window.location.href = basePath + 'login'
  }
}

const toggleSidebarLock = () => {
  useAppStore.toggleSidebarLock()
}

const toggleSideBar = () => {
  if (!useAppStore.isSidebarLocked) {
    useAppStore.toggleSideBar()
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/core/variables' as *;
.navbar {
  height: $navBarHeight;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.avatar-wrapper {
  margin-top: 5px;
  position: relative;
  cursor: pointer;

  .user-avatar {
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .el-icon-caret-bottom {
    cursor: pointer;
    position: absolute;
    right: -20px;
    top: 25px;
    font-size: 12px;
  }
}

.heardCenterTitle {
  text-align: center;
  position: absolute;
  top: 50%;
  left: 46%;
  font-weight: 600;
  font-size: 20px;
  transform: translate(-50%, -50%);
}

.right-menu {
  cursor: pointer;
  margin-right: 40px;
}
</style>
