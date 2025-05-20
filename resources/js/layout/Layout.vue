<template>
  <div :class="classObj" class="layout-wrapper">
    <!--left side-->
    <Sidebar v-if="settings.showLeftMenu" class="sidebar-container" />
    <!--right container-->
    <div class="main-container">
      <Navbar v-if="settings.showTopNavbar" />
      <TagsView v-if="settings.showTagsView" />
      <AppMain />
      <RightPanel v-if="settings.showSettings">
        <div class="text-center">настройки интерфейса сайта</div>
      </RightPanel>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { appStore } from '@/store/app'
import { AppMain, Navbar, Sidebar, TagsView, RightPanel } from './components'
const useAppStore = appStore()

// Вычисляемые свойства
const opened = computed(() => useAppStore.sidebar.opened)
const settings = computed(() => useAppStore.settings)
const classObj = computed(() => ({
  closeSidebar: !opened.value,
  hideSidebar: !settings.value.showLeftMenu
}))
//import ResizeHook to   listen  page size that   open or close
import ResizeHook from './hook/ResizeHandler'
ResizeHook()

// Обновление размера через action
const updateElementSize = (newSize) => {
  console.log('Обновление размера ElementPlus:', newSize)
  useAppStore.setSize(newSize) // Вызов действия
}

// Реактивность на изменение размера
watch(() => useAppStore.size, (newSize) => {
  console.log('Изменение размера в хранилище:', newSize)
  updateElementSize(newSize)
})

</script>

<style lang="scss" scoped>
@use "@styles/core/variables" as *;
.main-container {
  min-height: 100%;
  transition: margin-left 0.88s;
  margin-left: $sideBarWidth;
  position: relative;
}
.sidebar-container {
  transition: width 0.88s;
  width: $sideBarWidth !important;
  background-color: $menuBg;
  height: 100%;
  position: fixed;
  font-size: 0;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
}
.closeSidebar {
  .sidebar-container {
    width: $sideBarMiniWidth !important;
  }
  .main-container {
    margin-left: $sideBarMiniWidth !important;
  }
}
.hideSidebar {
  .sidebar-container {
    width: 0 !important;
  }
  .main-container {
    margin-left: 0;
  }
}
</style>
