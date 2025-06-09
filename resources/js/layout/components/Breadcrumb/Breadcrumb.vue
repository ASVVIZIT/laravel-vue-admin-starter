<template>
  <el-breadcrumb
      class="app-breadcrumb"
      :separator-icon="ArrowRight"
      ref="breadcrumbRef"
  >
    <!-- Группа 1: Dashboard -->
    <el-breadcrumb-item
        v-for="item in group1Items"
        :key="item.path"
        class="group-1"
        :data-path="item.path"
    >
      <a @click.prevent="handleLink(item)">
        {{ generateTitle(item.meta?.title) }}
      </a>
    </el-breadcrumb-item>

    <!-- Группа 2: Родительские элементы -->
    <template v-for="item in group2Items" :key="item.path">
      <el-breadcrumb-item
          class="group-2"
          :data-path="item.path"
      >
        <a @click.prevent="handleLink(item)">
          {{ generateTitle(item.meta?.title) }}
        </a>
      </el-breadcrumb-item>
    </template>

    <!-- Группа 3: Сворачиваемые элементы -->
    <el-dropdown
        v-if="group3Items.length > 0"
        class="group-3"
        placement="bottom"
        trigger="click"
    >
      <el-breadcrumb-item>
        <div class="dropdown-wrapper">
          <el-icon :size="16" class="menu-icon"><MoreFilled /></el-icon>
          <span class="badge">{{ group3Items.length }}</span>
        </div>
      </el-breadcrumb-item>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
              v-for="item in group3Items"
              :key="item.path"
              @click="handleLink(item)"
          >
            {{ generateTitle(item.meta?.title) }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- Группа 4: Активный элемент -->
    <el-breadcrumb-item
        v-if="currentItem?.path"
        class="group-4"
        :data-path="currentItem.path"
    >
      <span class="current-item">
        {{ truncatedCurrentTitle }}
      </span>
    </el-breadcrumb-item>
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

const DEBUG = true
const log = (message, data) => DEBUG && console.log(`[Breadcrumb] ${message}`, data)

// Инициализация зависимостей
const { generateTitle } = i18n()
const router = useRouter()
const route = useRoute()
const useAppStore = appStore()

// Реактивные состояния
const levelList = ref([]) // Основной список элементов крошки
const breadcrumbRef = ref(null) // Ссылка на DOM-элемент хлебных крошек
const containerWidth = ref(0) // Ширина контейнера для адаптивности

// Логика построения корректной иерархии
const getBreadcrumb = () => {
  try {
    // 1. Получаем все совпавшие маршруты с мета-данными
    let matched = route.matched.filter(item => item.meta?.title)

    // 2. Строим строгую иерархию (только прямые родители)
    const hierarchy = []
    let parentPath = '' // Отслеживаем текущий родительский путь
    matched.forEach(item => {
      // Проверяем, что текущий путь начинается с родительского
      // и не равен ему (вложенные маршруты)
      if (item.path.startsWith(parentPath) && item.path !== parentPath) {
        hierarchy.push(item)
        parentPath = item.path // Обновляем родителя для следующей итерации
      }
    })

    // 3. Добавляем Dashboard только если:
    // - Его нет в иерархии
    // - Текущий путь не сам Dashboard
    if (
        !hierarchy.some(item => item.path === '/dashboard') &&
        route.path !== '/dashboard'
    ) {
      hierarchy.unshift({
        path: '/dashboard',
        name: 'Dashboard',
        meta: { title: generateTitle('Dashboard') },
        redirect: 'noRedirect'
      })
    }

    // 4. Фильтрация дубликатов и нежелательных элементов
    const uniquePaths = new Set()
    levelList.value = hierarchy
        .filter(item => {
          const isUnique = !uniquePaths.has(item.path)
          uniquePaths.add(item.path) // Гарантируем уникальность путей
          return (
              isUnique &&
              item.meta?.title &&
              item.meta.breadcrumb !== false // Пропускаем элементы с флагом breadcrumb: false
          )
        })
        .map((item, index, arr) => ({
          ...item,
          isLast: index === arr.length - 1 // Помечаем последний элемент
        }))

    log('Filtered breadcrumb items:', levelList.value)
  } catch (error) {
    console.error('Breadcrumb error:', error)
  }
}

// Группировка элементов
// Группа 1: Только Dashboard (если не последний элемент)
const group1Items = computed(() =>
    levelList.value.filter(item =>
        item.path === '/dashboard' &&
        !item.isLast // Исключаем Dashboard, если он текущая страница
    )
)

// Группа 2: Прямые родители текущего элемента
const group2Items = computed(() => {
  const startIndex = group1Items.value.length > 0 ? 1 : 0 // Пропускаем Dashboard, если он в группе 1
  const lastIndex = levelList.value.findIndex(item => item.isLast) // Индекс текущей страницы
  return lastIndex > 0
      ? levelList.value.slice(startIndex, lastIndex) // От Dashboard (или начала) до текущего элемента
      : []
})

// Группа 3: Элементы для выпадающего меню (если цепочка длиннее 3 элементов)
const group3Items = computed(() =>
    group2Items.value.length > 2
        ? group2Items.value.slice(1, -1) // Берем средние элементы, исключая первый и последний
        : []
)

// Группа 4: Текущий элемент
const currentItem = computed(() =>
    levelList.value[levelList.value.length - 1] || {}
)

// Навигация по клику
const handleLink = (item) => {
  if (!item || item.redirect === 'noRedirect') return

  try {
    // Компиляция динамических путей (например, /user/:id)
    const targetPath = item.redirect || compile(item.path)(route.params)
    router.push(targetPath)
    log('Navigation to:', targetPath)
  } catch (error) {
    console.error('Navigation error:', error)
  }
}

// Адаптивность: обновление размеров при ресайзе
const updateSizes = () => {
  if (!breadcrumbRef.value?.$el) return
  const container = breadcrumbRef.value.$el
  containerWidth.value = container.offsetWidth
  log('Container width:', containerWidth.value)
}

// Следим за изменениями маршрута
watch(() => route.path, getBreadcrumb, { immediate: true })

// Реакция на изменение размеров контейнера
useResizeObserver(breadcrumbRef, () => {
  updateSizes()
  nextTick(updateSizes) // Двойное обновление для точности
})
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 0 8px 0 8px;
  overflow: hidden;
  font-size: 10px;
  :deep(.el-dropdown) {
    &.group-3 {
      position: relative; /* Ключевое исправление */

      .dropdown-wrapper {
        display: inline-flex;
        align-items: center;
        padding: 0 4px;

        &:hover {
          .menu-icon {
            transform: rotate(90deg);
            color: var(--el-color-primary);
          }

          .badge {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        .badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--el-color-primary);
          color: white;
          font-size: 8px;
          min-width: 12px;
          height: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          transition: all 0.2s;
          z-index: 4000;
        }
      }
    }
  }
  :deep(.el-breadcrumb__item) {
    flex-shrink: 0;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;

    &.group-1 {
      background: var(--el-color-primary-light-9);
      border-radius: 4px;
      padding: 4px 8px;

      a {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }

    &.group-2 a {
      color: var(--el-text-color-regular);
      &:hover {
        color: var(--el-color-primary);
        text-decoration: underline;
      }
    }

    &.group-4 .current-item {
      color: var(--el-color-info);
      font-weight: 500;
      opacity: 0.9;
      font-style: italic;
      pointer-events: none;
    }
  }

  :deep(.el-breadcrumb__separator) {
    margin: 2px 2px;
    color: var(--el-text-color-secondary);
  }
}
</style>
