<template>
  <template v-if="!item.hidden">
    <template v-if="showSidebarItem(item.children, item)">
      <Link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !isNest }">
          <item :meta="onlyOneChild.meta || item.meta" />
          <template #title>
            <span class="menu-item-title">
              {{ generateTitle(onlyOneChild.meta?.title) }}
            </span>
          </template>
        </el-menu-item>
      </Link>
    </template>
    <el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
      <template v-if="item.meta" #title>
        <item :meta="item.meta" />
        <span class="sub-menu-title">{{ generateTitle(item.meta.title) }}</span>
      </template>
      <SidebarItem
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </template>
</template>

<script setup>
import Link from './Link.vue'
import Item from '@/components/Item/Item'
import { isExternal } from '@/utils/validate'
import path from 'path'
import i18n from '@/utils/i18n'

const {generateTitle} = i18n()
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  }
})
let onlyOneChild = ref(null)
const showSidebarItem = (children = [], parent) => {
  const showingChildren = children.filter((item) => {
    if (item.hidden) {
      return false
    } else {
      // Temp set(will be used if only has one showing child)
      onlyOneChild.value = item
      return true
    }
  })
  if (showingChildren.length === 1 && !parent?.alwaysShow) {
    return true
  }
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noChildren: true }
    return true
  }
  return false
}
const resolvePath = (routePath) => {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  return path.resolve(props.basePath, routePath)
}
</script>
<style lang="scss" scoped>
/* Добавляем обрезку текста с многоточием */
.menu-item-title,
.sub-menu-title {
  display: inline-block;
  max-width: 210px; /* Фиксированная ширина с учетом отступов */
  overflow: hidden;
  line-height: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  padding-left: 4px;
  padding-right: 18px; /* Место для точек */
}

/* Фикс для вложенных меню */
.el-sub-menu {
  :deep(.el-sub-menu__title) {
    span {
      @extend .sub-menu-title;
      max-width: 180px; /* Уменьшаем ширину для вложенных элементов */
    }
  }
}

/* Гарантируем видимость точек в разных состояниях */
/*.el-menu-item {
  &:hover,
  &.is-active {
    .menu-item-title {
      overflow: visible;
      text-overflow: inherit;
      background: inherit; !* Убираем артефакты *!
    }
  }
}*/

/* Адаптация под свернутое меню */
.el-menu--collapse {
  .menu-item-title,
  .sub-menu-title {
    display: inline-block;
    max-width: 50px; /* Ширина в свернутом состоянии */
    padding-right: 5px;
  }
}
</style>
