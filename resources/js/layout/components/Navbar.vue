<template>
  <div class="navbar rowBC reset-el-dropdown">
    <div class="rowSC">
      <hamburger
        id="hamburger-container"
        v-if="settings.showHamburger"
        :is-active="opened"
        class="hamburger-container"
        @toggleClick="toggleSideBar"
      />
      <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
    </div>
    <!--nav title-->
    <div v-if="settings.showNavbarTitle" class="heardCenterTitle">{{ settings.showNavbarTitle }}</div>
    <div class="heardCenterTitle">
<!--        <Timer></Timer>-->
    </div>
    <div v-if="settings.ShowDropDown" class="right-menu rowSC">
<!--      <Search id="header-search" />-->
      <ScreenFull />
      <SizeSelect />
      <LangSelect />
      <el-dropdown trigger="click" size="medium">
        <div class="avatar-wrapper">
          <img
            src="https://laravel-vue-admin.eu.org/images/avatar.gif"
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
            <a target="_blank" href="https://github.com/asvvizit/laravel-vue-admin-starter">
              <el-dropdown-item>{{ t('navbar.github')}}</el-dropdown-item>
            </a>
            <el-dropdown-item divided @click="loginOut">{{ t('navbar.logout')}}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import {reactive, toRef} from "vue"
import {useI18n} from "vue-i18n"
const {t} = useI18n({useScope: 'global'})
import Search from '@/components/HeaderSearch/index.vue'
import SizeSelect from '@/components/SizeSelect/index.vue'
import LangSelect from '@/components/LangSelect/index.vue'
import ScreenFull from '@/components/ScreenFull/index.vue'

import { CaretBottom } from '@element-plus/icons-vue'
import Breadcrumb from './Breadcrumb'
import Hamburger from './Hamburger'
import { appStore } from '@/store/app'
import { userStore } from '@/store/user'
import moment from "moment";

const router = useRouter()
const route = useRoute()

const useUserStore = userStore()
const useAppStore = appStore()

const settings = computed(() => {
  return useAppStore.settings
})

const opened = computed(() => {
  return useAppStore.sidebar.opened
})

const toggleSideBar = () => {
  useAppStore.toggleSideBar()
}

const loginOut = async () => {
  await userStore.logout().then(() => {
    router.push(`/login?redirect=/`)
  })
}
</script>

<style lang="scss" scoped>
.navbar {
  height: $navBarHeight;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

//logo
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

//center-title
.heardCenterTitle {
  text-align: center;
  position: absolute;
  top: 50%;
  left: 46%;
  font-weight: 600;
  font-size: 20px;
  transform: translate(-50%, -50%);
}

//drop-down
.right-menu {
  cursor: pointer;
  margin-right: 40px;
}
</style>
