<template>
  <el-breadcrumb class="app-breadcrumb" :separator-icon="ArrowRight" ref="breadcrumbRef">
    <transition-group v-if="settings.mainNeedAnimation" name="breadcrumb">
      <el-breadcrumb-item
          v-for="item in visibleItems"
          :key="item.path"
          v-show="item.meta?.title"
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
      >
        <span class="el-breadcrumb__item">
          <span class="el-breadcrumb__inner">...</span>
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
      >
        <span class="el-breadcrumb__item">
          <span class="el-breadcrumb__inner">...</span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { compile } from 'path-to-regexp'
import { ArrowRight } from '@element-plus/icons-vue'
import { useResizeObserver } from '@vueuse/core'
import { appStore } from '@/store/app'
import i18n from "@/utils/i18n"


const { generateTitle } = i18n()
const router = useRouter()
const route = useRoute()
const useAppStore = appStore()

const settings = computed(() => {
  return useAppStore.settings
})

// Оригинальная логика получения levelList
const levelList = ref([])
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

// Новая логика адаптивного отображения
const breadcrumbRef = ref(null)
const containerWidth = ref(0)
const itemWidths = ref({})

const visibleItems = computed(() => {
  if (!levelList.value?.length) return []

  let totalWidth = 0
  const result = []
  const items = [...levelList.value]

  // Всегда показываем первый элемент
  const firstItem = items.shift()
  result.push(firstItem)
  totalWidth += itemWidths.value[firstItem.path] || 0

  // Пытаемся добавить последние элементы
  for(let i = items.length - 1; i >= 0; i--) {
    const width = itemWidths.value[items[i].path] || 0
    if(totalWidth + width + 80 < containerWidth.value) { // 80px для выпадающего меню
      result.unshift(items[i])
      totalWidth += width
    } else {
      break
    }
  }

  return result
})

const hiddenItems = computed(() => {
  const visiblePaths = new Set(visibleItems.value.map(i => i.path))
  return levelList.value.filter(item => !visiblePaths.has(item.path))
})

// Оригинальные функции
const isDashboard = (route) => {
  const name = route?.name?.trim().toLowerCase()
  return name === 'dashboard'
}

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

// Обновление размеров
const updateWidths = () => {
  if (!breadcrumbRef.value?.$el) return

  const items = breadcrumbRef.value.$el.querySelectorAll('.el-breadcrumb__item')
  items.forEach((el, index) => {
    const item = levelList.value[index]
    if (item) {
      itemWidths.value[item.path] = el.offsetWidth
    }
  })
}

useResizeObserver(breadcrumbRef, () => {
  containerWidth.value = breadcrumbRef.value?.$el.offsetWidth || 0
  updateWidths()
})

// Watchers из оригинального кода
watch(() => route.path, getBreadcrumb, { immediate: true })
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;
  max-width: 100%;
  position: relative;
  padding-right: 40px;

  :deep(.el-breadcrumb__item) {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
    display: inline-flex !important;
    align-items: center;

    &:last-child .no-redirect {
      color: #97a8be;
      cursor: text;
    }
  }

  .breadcrumb-dropdown {
    vertical-align: middle;
    margin-left: 8px;

    :deep(.el-breadcrumb__inner) {
      cursor: pointer;
      &:hover { color: var(--el-color-primary); }
    }
  }
}
</style>
