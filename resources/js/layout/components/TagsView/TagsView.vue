<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane
        ref="scrollPane"
        class="tags-view-wrapper"
        @scroll="handleScroll"
    >
      <template v-for="tag in filteredTags" :key="tag">
        <router-link
            :ref="(el) => setTagRef(el, tag)"
            :class="['tags-view-item', { active: isActive(tag) }]"
            :to="tag.fullPath"
            :href="tag.fullPath"
            @click.middle="!isAffix(tag) ? closeSelectedTag(tag, $event) : ''"
            @contextmenu.prevent="openMenu(tag, $event)"
        >
          <div class="tag-content-wrapper">
            <span class="tag-title">
              {{ generateTitle(tag.title || 'Untitled') }}
            </span>
            <div class="tag-actions">
              <el-icon v-if="isAffix(tag)" class="lock-icon">
                <Lock />
              </el-icon>
              <el-icon
                  v-else
                  class="close-icon"
                  @click.prevent.stop="closeSelectedTag(tag, $event)"
              >
                <Close />
              </el-icon>
            </div>
          </div>
        </router-link>
      </template>
    </scroll-pane>

    <ul
        v-show="state.visible"
        :style="{ left: state.left + 'px', top: state.top + 'px' }"
        class="context-menu"
    >
      <li @click="refreshSelectedTag(state.selectedTag)">{{ t('tagsView.refresh') }}</li>
      <li
          v-if="state.selectedTag && !isAffix(state.selectedTag)"
          @click="closeSelectedTag(state.selectedTag, $event)"
      >
        {{ t('tagsView.close') }}
      </li>
      <li @click="closeOthersTags">{{ t('tagsView.closeOthers') }}</li>
      <li @click="closeAllTags(state.selectedTag)">{{ t('tagsView.closeAll') }}</li>
    </ul>
  </div>
</template>

<script setup>
import ScrollPane from './ScrollPane.vue'
import { useI18n } from "vue-i18n"
import path from 'path'
import { Close, Lock } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { getCurrentInstance, watch, ref, reactive, onMounted, nextTick, computed } from 'vue'
import { permissionStore } from '@/store/permission'
import { tagsViewStore } from '@/store/tags-view'
import i18n from "@/utils/i18n"

const { t } = useI18n({ useScope: 'global' })
const { generateTitle } = i18n()
const $route = useRoute()
const $router = useRouter()
const { proxy } = getCurrentInstance()

const permission = permissionStore()
const tagsView = tagsViewStore()
const { visitedViews } = storeToRefs(tagsView)
const { routes } = storeToRefs(permission)

const state = reactive({
  visible: false,
  top: 0,
  left: 0,
  selectedTag: null,
  affixTags: []
})

const refTags = ref({})
const scrollPane = ref(null)

const filteredTags = computed(() => {
  return visitedViews.value
      ?.filter(tag => tag?.path && !tag.hidden)
      ?.sort((a, b) => (a.meta?.order || 0) - (b.meta?.order || 0)) || []
})

const setTagRef = (el, tag) => {
  if (el && tag?.path) refTags.value[tag.path] = el
}

watch(visitedViews, (newVal) => {
  nextTick(() => {
    refTags.value = Object.fromEntries(
        newVal
            ?.filter(tag => tag?.path)
            ?.map(tag => [tag.path, refTags.value[tag.path]]) || []
    )
  })
}, { deep: true })

onMounted(() => {
  initAffixTags()
  addCurrentTag()
})

watch(
    () => $route?.path,
    () => {
      addCurrentTag()
      nextTick(scrollToActiveTag)
    }
)

const closeMenu = () => state.visible = false

watch(
    () => state.visible,
    (visible) => {
      visible
          ? document.body.addEventListener('click', closeMenu)
          : document.body.removeEventListener('click', closeMenu)
    }
)

const isActive = (tag) => tag?.path === $route?.path
const isAffix = (tag) => !!tag?.meta?.affix


const scrollToActiveTag = () => {
  const currentRoute = $route
  const currentPath = decodeURIComponent(currentRoute.path) // Декодируем URI
      .split('#')[0]
      .split('?')[0]
      .toLowerCase() // Приводим к нижнему регистру

  console.log('[DEBUG] Ищем тег для пути:', currentPath)

  const activeTag = Object.values(refTags.value)?.find(tag => {
    if (!tag?.$el) return false

    const href = tag.$el.getAttribute('href')
    const tagPath = decodeURIComponent(href) // Декодируем URI
        .split('#')[0]
        .split('?')[0]
        .toLowerCase() // Приводим к нижнему регистру

    console.log('[DEBUG] Сравниваем:', {
      currentPath,
      tagPath,
      href
    })

    return tagPath === currentPath
  })

  if (activeTag && scrollPane.value?.moveToTarget) {
    console.log('[DEBUG] Найден активный тег:', activeTag)
    nextTick(() => scrollPane.value.moveToTarget(activeTag))
  } else {
    console.error('[TagsView] Активный тег не найден. Доступные теги:',
        Object.values(refTags.value).map(t => ({
          text: t?.$el?.innerText,
          path: t?.$el?.getAttribute('href')
        }))
    )
  }
}

const initAffixTags = () => {
  const filterAffix = (routes, basePath = '/') => {
    return routes?.flatMap(route => {
      const children = route?.children ? filterAffix(route.children, route.path) : []
      if (route?.meta?.affix) {
        return [{
          ...route,
          path: path.resolve(basePath, route.path),
          fullPath: path.resolve(basePath, route.path)
        }, ...children]
      }
      return children
    }) || []
  }

  state.affixTags = filterAffix(routes.value)
  state.affixTags?.forEach(tag => tagsView.addVisitedView(tag))
}

const addCurrentTag = () => {
  if ($route?.name && !visitedViews.value.some(v => v.path === $route.path)) {
    tagsView.addView($route)
  }
}

const openMenu = (tag, e) => {
  if (!tag || !proxy?.$el || !e) return
  const menuWidth = 120
  const containerRect = proxy.$el.getBoundingClientRect()
  state.left = Math.min(e.clientX - containerRect.left + 15, containerRect.width - menuWidth)
  state.top = e.clientY - 30
  state.visible = true
  state.selectedTag = tag
}

const refreshSelectedTag = (view) => {
  if (!view?.fullPath) return
  $router.replace({ path: '/redirect' + view.fullPath }).catch(() => {})
}

const closeSelectedTag = async (view, e) => {
  if (!view?.path || !e) return
  await tagsView.delView(view)
  if (isActive(view)) toLastView()
  nextTick(() => {
    const remainingTags = Object.values(refTags.value)
    if (remainingTags?.length) scrollPane.value?.moveToTarget?.(remainingTags.at(-1))
  })
}

const closeOthersTags = () => {
  if (!state.selectedTag?.path) return
  $router.push(state.selectedTag).catch(() => {})
  tagsView.delOthersViews(state.selectedTag)
}

const closeAllTags = async (view) => {
  if (!view?.path) return
  await tagsView.delAllViews()
  if (!state.affixTags?.some(tag => tag.path === view.path)) toLastView()
}

const toLastView = () => {
  const latestView = tagsView.visitedViews?.slice(-1)[0]
  latestView?.fullPath
      ? $router.push(latestView.fullPath).catch(() => {})
      : $router.push('/').catch(() => {})
}

const handleScroll = () => state.visible = false
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 40px;
  background: #ffffff;
  border-bottom: 1px solid #e6ebf5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  position: relative;

  .tags-view-wrapper {
    height: 100%;

    :deep(.el-scrollbar__view) {
      overflow-x: auto !important; // Включить горизонтальную прокрутку
      flex-wrap: nowrap;
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 10px;
    }
  }

  .tags-view-item {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 4px 0px 8px;
    margin-right: 2px;
    font-size: 11px;
    color: #606266;
    background: #f0f2f5;
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    cursor: pointer;

    &:hover {
      background: #e4e7ed;
      transform: translateY(-2px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(100, 118, 161, 0.89);
    }

    &.active {
      background: #409eff;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(32, 160, 255, 0.3);

      .lock-icon {
        color: #f56c6c;
      }

      .tag-title {
        font-weight: 500;
      }
    }

    .tag-content-wrapper {
      display: flex;
      align-items: center;
      gap: 2px;
      height: 100%;
    }

    .tag-title {
      white-space: nowrap;
      line-height: 1;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tag-actions {
      display: flex;
      align-items: center;
      margin-left: 4px;

      .el-icon {
        width: 14px;
        height: 14px;
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.2);
        }
      }
      .lock-icon {
        color: #606266;
      }
      .close-icon:hover {
        color: #f56c6c;
      }

      .lock-icon:hover {
        color: #f56c6c;
      }
    }
  }

  .context-menu {
    position: absolute;
    z-index: 3000;
    margin: 0;
    padding: 6px 0;
    background: #fdfdfd;
    border-radius: 4px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
    list-style: none;
    min-width: 100px;
    max-width: 150px;

    li {
      padding: 2px 8px;
      font-size: 13px;
      color: #606266;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(24, 144, 255, 0.90);
        color: #ebf5ff;
      }

      &:active {
        background: rgba(24, 186, 255, 0.7);
      }
    }
  }
}
</style>
