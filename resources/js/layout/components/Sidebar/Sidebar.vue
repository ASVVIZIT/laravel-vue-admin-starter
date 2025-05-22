<template>
  <div id="Sidebar" class="reset-menu-style" :width="sideBarWidth">
    <!-- Logo -->
    <Logo v-if="settings.sidebarLogo" :collapse="!isCollapse" />
    <!-- Router Navigation -->
    <el-scrollbar>
      <el-menu ref="sidebarMenuEl"
          class="el-menu-vertical"
          :default-active="activeMenu"
          :collapse="!isCollapse"
          :unique-opened="true"
          :collapse-transition="true"
          :background-color="menuBg"
          :text-color="menuText"
          :hover-text-color="menuHoverText"
          :active-text-color="menuActiveText"
          mode="vertical"
      >
        <sidebar-item
            v-for="route in routes"
            :key="route.path"
            :item="route"
            :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { useCssVar } from '@vueuse/core'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Logo from './Logo.vue'
import SidebarItem from './SidebarItem.vue'
import { appStore } from '@/store/app'
import { permissionStore } from '@/store/permission'
import path from 'path-browserify'

// CSS-переменные (более надежный способ)
const sidebarMenuEl = ref(null);
const sideBarWidth = useCssVar('width:--side-bar-width', sidebarMenuEl)
const menuBg = useCssVar('background-color:--el-menu-bg-color', sidebarMenuEl)
const menuText = useCssVar('color:--el-menu-text-color', sidebarMenuEl)
const menuActiveText = useCssVar('color:--el-menu-text-color-hover', sidebarMenuEl)
const menuHoverText = useCssVar('color:--el-menu-text-color-active', sidebarMenuEl)

const route = useRoute()
const useAppStore = appStore()
const usePermissionStore = permissionStore()

// Computed properties
const settings = computed(() => useAppStore.settings)
const routes = computed(() => usePermissionStore.routes)
const isCollapse = computed(() => useAppStore.sidebar.opened)

// Добавляем функцию resolvePath
const resolvePath = (routePath, basePath = '') => {
  if (isExternal(routePath)) return routePath
  return path.resolve(basePath, routePath)
}

// Добавляем проверку внешних ссылок
const isExternal = (path) => {
  return /^(https?:|mailto:|tel:)/.test(path)
}
// Исправляем вычисление активного меню
const activeMenu = computed(() => {
  return route.meta.activeMenu || resolvePath(route.fullPath)
})
</script>

<style lang="scss">
.reset-menu-style {
  .el-menu {
    border-right: none;
  }

  .el-scrollbar__wrap {
    padding-bottom: 10vh;
  }
}

.el-menu-vertical {
  width: var(--side-bar-width); /* Используем CSS-переменную */

  .el-menu-item,
  .el-sub-menu {
    svg {
      margin-right: 16px;
      position: relative;
      fill: currentColor;
      vertical-align: -7px !important;
    }
  }
}
</style>
