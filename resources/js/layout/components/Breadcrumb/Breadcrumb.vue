<template>
  <el-breadcrumb class="app-breadcrumb" :separator-icon="ArrowRight" ref="breadcrumbRef">
    <transition-group v-if="settings.mainNeedAnimation" name="breadcrumb">
      <el-breadcrumb-item
          v-for="item in visibleItems"
          :key="item.path"
          v-show="item.meta?.title"
          :data-path="item.path"
      >
        <span v-if="item.redirect === 'noRedirect' || item.isLast" class="no-redirect">
          {{ generateTitle(item.meta?.title) }}
        </span>
        <a v-else @click.prevent="handleLink(item)">
          {{ generateTitle(item.meta?.title) }}
        </a>
      </el-breadcrumb-item>

      <el-dropdown
          v-if="hiddenItems.length > 0"
          placement="bottom"
          class="breadcrumb-dropdown"
          trigger="click"
      >
        <span>
          <span class="dropdown-trigger">
            <el-icon :size="16"><MoreFilled /></el-icon>
          </span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
                v-for="hiddenItem in hiddenItems"
                :key="hiddenItem.path"
                @click="handleLink(hiddenItem)"
            >
              {{ generateTitle(hiddenItem.meta?.title) }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </transition-group>

    <template v-else>
      <el-breadcrumb-item
          v-for="item in visibleItems"
          :key="item.path"
          v-show="item.meta?.title"
          :data-path="item.path"
      >
        <span v-if="item.redirect === 'noRedirect' || item.isLast" class="no-redirect">
          {{ generateTitle(item.meta?.title) }}
        </span>
        <a v-else @click.prevent="handleLink(item)">
          {{ generateTitle(item.meta?.title) }}
        </a>
      </el-breadcrumb-item>

      <el-dropdown
          v-if="hiddenItems.length > 0"
          placement="bottom"
          class="breadcrumb-dropdown"
          trigger="click"
      >
        <span class="dropdown-trigger">
          <el-icon :size="16"><MoreFilled /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
                v-for="hiddenItem in hiddenItems"
                :key="hiddenItem.path"
                @click="handleLink(hiddenItem)"
            >
              {{ generateTitle(hiddenItem.meta?.title) }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
  </el-breadcrumb>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { compile } from 'path-to-regexp'
import { ArrowRight, MoreFilled } from '@element-plus/icons-vue'
import { useResizeObserver } from '@vueuse/core'
import { appStore } from '@/store/app'
import i18n from "@/utils/i18n"

const { generateTitle } = i18n()
const router = useRouter()
const route = useRoute()
const useAppStore = appStore()

const settings = computed(() => useAppStore.settings)
const levelList = ref([])
const breadcrumbRef = ref(null)
const containerWidth = ref(0)
const itemWidths = ref({})
const maxLines = 2

// Функции должны быть объявлены перед использованием
const isDashboard = (route) => {
  const name = route?.name?.trim().toLowerCase()
  return name === 'dashboard'
}

const getBreadcrumb = () => {
  let matched = route.matched.filter(item => item.meta?.title)
  const first = matched[0]

  if (!isDashboard(first)) {
    matched = [{
      path: '/dashboard',
      meta: { title: generateTitle('dashboard') },
      redirect: 'noRedirect'
    }].concat(matched)
  }

  levelList.value = matched
      .filter(item => item.meta?.title && item.meta.breadcrumb !== false)
      .map((item, index, arr) => ({
        ...item,
        isLast: index === arr.length - 1
      }))
}

const updateSizes = () => {
  if (!breadcrumbRef.value?.$el) return

  const container = breadcrumbRef.value.$el
  containerWidth.value = container.offsetWidth

  const items = container.querySelectorAll('.el-breadcrumb__item:not(.breadcrumb-dropdown)')
  items.forEach(el => {
    const path = el.dataset.path
    if (path) {
      const styles = window.getComputedStyle(el)
      itemWidths.value[path] =
          el.offsetWidth +
          parseFloat(styles.marginLeft) +
          parseFloat(styles.marginRight)
    }
  })
}

useResizeObserver(breadcrumbRef, () => {
  updateSizes()
  nextTick(updateSizes)
})

const visibleItems = computed(() => {
  if (!levelList.value?.length) return []

  let totalWidth = 0
  const result = []
  const availableWidth = containerWidth.value * maxLines

  for (const item of levelList.value) {
    const itemWidth = itemWidths.value[item.path] || 0
    if (totalWidth + itemWidth > availableWidth) break
    result.push(item)
    totalWidth += itemWidth
  }

  return result
})

const hiddenItems = computed(() =>
    levelList.value.filter(item => !visibleItems.value.includes(item))
)

const pathCompile = (path) => {
  try {
    const toPath = compile(path)
    return toPath(route.params)
  } catch (e) {
    console.error('Path compile error:', e)
    return path
  }
}

const handleLink = (item) => {
  if (!item) return

  const { redirect, path } = item
  try {
    if (redirect) {
      router.push(redirect)
    } else if (path) {
      const compiledPath = pathCompile(path)
      router.push(compiledPath)
    }
  } catch (e) {
    console.error('Breadcrumb navigation error:', e)
  }
}

watch(() => route.path, getBreadcrumb, { immediate: true })
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  align-items: center;
  gap: 2px;
  line-height: 12px;
  padding: 0 6px;
  max-width: 100%;
  overflow: hidden;

  :deep(.el-breadcrumb__item) {
    flex-shrink: 0;
    max-width: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    position: relative;
    margin: 2px 0;

    .no-redirect {
      color: var(--el-text-color-regular);
      cursor: default;
    }

    a {
      color: var(--el-text-color-regular);
      transition: color 0.2s;

      &:hover {
        color: var(--el-color-primary);
        text-decoration: underline;
      }
    }
  }

  .breadcrumb-dropdown {
    flex-shrink: 0;
    margin-left: 4px;

    .dropdown-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 24px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      .el-icon {
        transform: rotate(90deg);
      }
    }
  }
}
</style>
