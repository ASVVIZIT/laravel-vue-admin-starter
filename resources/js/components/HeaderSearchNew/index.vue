<template>
    <!-- Осталось без изменений -->
    <div :class="{ 'show': show }" class="header-search">
        <div class="nav-search">
            <icon
                class-name="search"
                class="search-icon"
                @click.stop="click"
            />
        </div>
        <el-select
            ref="headerSearchSelect"
            v-model="search"
            :remote-method="querySearch"
            filterable
            default-first-option
            remote
            placeholder="Поиск"
            class="header-search-select"
            @change="change"
        >
            <el-option
                v-for="item in options"
                :key="item.path"
                :value="item"
                :label="item.title.join(' > ')"
            />
        </el-select>
    </div>
</template>

<script setup>
// Импорты Vue и сторонних библиотек
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Fuse from 'fuse.js'
import { usePermissionRoutesStore } from '@/store/permissionRoutes' // Импорт хранилища Pinia
import { storeToRefs } from 'pinia'

// Инициализация хранилища Pinia
const permissionRoutesStore = usePermissionRoutesStore()
const { permission_routes } = storeToRefs(permissionRoutesStore) // Получаем реактивные routes из хранилища

// Реактивные переменные
const search = ref('')
const options = ref([])
const searchPool = ref([])
const show = ref(false)
const fuse = ref(null)
const headerSearchSelect = ref(null)
const router = useRouter()

// Генерация маршрутов с обработкой пути для браузера
const generateRoutes = (routesList, basePath = '/', prefixTitle = []) => {
    let res = []

    // Функция для безопасного объединения путей в браузере
    const joinPath = (base, routePath) => {
        if (routePath.startsWith('/')) return routePath
        return `${base}/${routePath}`.replace(/\/+/g, '/')
    }

    for (const route of routesList) {
        if (route.hidden) continue

        const data = {
            path: joinPath(basePath, route.path),
            title: [...prefixTitle]
        }

        if (route.meta?.title) {
            data.title.push(route.meta.title)
            if (route.redirect !== 'noRedirect') {
                res.push(data)
            }
        }

        if (route.children) {
            const childRoutes = generateRoutes(
                route.children,
                data.path,
                data.title
            )
            res = res.concat(childRoutes)
        }
    }
    return res
}

// Инициализация поискового движка Fuse.js
const initFuse = (list) => {
    fuse.value = new Fuse(list, {
        shouldSort: true,
        threshold: 0.4,
        location: 0,
        distance: 100,
        minMatchCharLength: 1,
        keys: [
            { name: 'title', weight: 0.7 },
            { name: 'path', weight: 0.3 }
        ]
    })
}

// Поиск по запросу
const querySearch = (query) => {
    options.value = query ? fuse.value.search(query).map(item => item.item) : []
}

// Обработчик клика по иконке поиска
const click = () => {
    show.value = !show.value
    if (show.value) {
        nextTick(() => {
            headerSearchSelect.value?.focus()
        })
    }
}

// Закрытие поиска
const close = () => {
    headerSearchSelect.value?.blur()
    options.value = []
    show.value = false
}

// Обработчик выбора результата
const change = (val) => {
    router.push(val.path)
    search.value = ''
    options.value = []
    nextTick(() => (show.value = false))
}

// Наблюдатели
watch(permission_routes, (newRoutes) => {
    searchPool.value = generateRoutes(newRoutes)
})

watch(searchPool, (newList) => {
    if (newList.length) initFuse(newList)
})

watch(show, (value) => {
    if (value) {
        document.body.addEventListener('click', close)
    } else {
        document.body.removeEventListener('click', close)
    }
})

// Инициализация при монтировании
onMounted(() => {
    searchPool.value = generateRoutes(permission_routes.value)
})
</script>

<style lang="scss" scoped>
/* Стили остаются без изменений */
.header-search {
    font-size: 0 !important;

    .nav-search {
        display: block;
        position: relative;
    }

    .search-icon {
        z-index: 1000;
        cursor: pointer;
        font-size: 18px;
        vertical-align: middle;
        position: absolute;
        top: 6px;
        right: 8px;
    }

    .header-search-select {
        font-size: 18px;
        transition: width 0.2s;
        width: 0;
        overflow: hidden;
        background: transparent;
        border-radius: 0;
        display: inline-block;
        vertical-align: middle;

        :deep(.el-input__inner) {
            border-radius: 0;
            border: 0;
            padding-left: 0;
            padding-right: 0;
            box-shadow: none !important;
            border-bottom: 1px solid #d9d9d9;
            vertical-align: middle;
        }

        :deep(.el-select__wrapper) {
            padding: 4px 28px 4px 8px !important;
        }
    }

    &.show {
        .header-search-select {
            width: 210px;
            margin-left: 10px;
        }
    }
}
</style>
